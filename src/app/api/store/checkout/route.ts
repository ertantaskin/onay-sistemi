import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    // Oturum kontrolü
    const session = await getServerSession(authOptions);
    // cookies fonksiyonunu await ile kullanmak için düzeltme
    const cookieStore = await cookies();
    const guestCartId = cookieStore.get('guestCartId')?.value;
    
    const body = await req.json();
    let { cartId, paymentMethodId } = body;

    // Hata ayıklama için loglama
    console.log("Ödeme isteği alındı:", { cartId, paymentMethodId, userID: session?.user?.id });

    // Misafir kullanıcı kontrolü
    if (!session) {
      // Misafir kullanıcılar için ödeme işlemi
      if (!guestCartId) {
        return NextResponse.json(
          { error: "Geçerli bir sepet bulunamadı." },
          { status: 404 }
        );
      }

      // Misafir kullanıcılar için ödeme sayfasına yönlendirme
      return NextResponse.json({
        success: false,
        message: "Ödeme işlemi için giriş yapmanız gerekmektedir.",
        redirectToLogin: true
      });
    }

    // Sepet ID'si yoksa kullanıcının bekleyen siparişini bulalım
    if (!cartId && session && session.user) {
      try {
        console.log("Sepet ID'si bulunamadı, kullanıcının bekleyen siparişi aranıyor...");
        // Hem küçük hem büyük harfli status değerlerini kontrol edelim
        const pendingOrder = await prisma.order.findFirst({
          where: {
            userId: session.user.id,
            status: {
              in: ["pending", "PENDING"]
            }
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });

        if (pendingOrder) {
          console.log("Kullanıcının bekleyen siparişi bulundu:", pendingOrder.id, "Status:", pendingOrder.status);
          
          // Sepet boş mu kontrol et
          if (!pendingOrder.items || pendingOrder.items.length === 0) {
            console.log("Bulunan sepet boş, siparişte ürün yok");
            return NextResponse.json(
              { error: "Sepetinizde ürün bulunmuyor. Lütfen önce sepetinize ürün ekleyin." },
              { status: 400 }
            );
          }
          
          cartId = pendingOrder.id;
        } else {
          console.log("Kullanıcı için bekleyen sipariş bulunamadı:", session.user.id);
          return NextResponse.json(
            { error: "Geçerli bir sepet bulunamadı. Lütfen önce sepetinize ürün ekleyin." },
            { status: 404 }
          );
        }
      } catch (error) {
        console.error("Bekleyen sipariş aranırken hata:", error);
        return NextResponse.json(
          { error: "Sepet bilgileri alınırken bir hata oluştu." },
          { status: 500 }
        );
      }
    }

    if (!cartId) {
      console.log("Sepet ID'si bulunamadı ve kullanıcının bekleyen siparişi yok");
      return NextResponse.json(
        { error: "Sepet ID'si gereklidir. Lütfen sepetinizi kontrol edin ve tekrar deneyin." },
        { status: 400 }
      );
    }

    // Sepeti kontrol et
    const cart = await prisma.order.findFirst({
      where: { 
        id: cartId,
        userId: session.user.id,
        status: {
          in: ["pending", "PENDING"]
        }
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Debug için sepet bulma durumu
    console.log("Sepet bulma sonucu:", cart ? "Sepet bulundu" : "Sepet bulunamadı", "ID:", cartId);

    if (!cart) {
      console.log("Sepet bulunamadı veya kullanıcıya ait değil:", cartId, session.user.id);
      return NextResponse.json(
        { error: "Geçerli bir sepet bulunamadı. Sepetinizi yenileyip tekrar deneyin." },
        { status: 404 }
      );
    }

    if (cart.items.length === 0) {
      console.log("Bulunan sepet boş:", cartId);
      return NextResponse.json(
        { error: "Sepetinizde ürün bulunmamaktadır. Lütfen sepetinize ürün ekleyip tekrar deneyin." },
        { status: 400 }
      );
    }

    // Stok kontrolü
    for (const item of cart.items) {
      if (item.quantity > item.product.stock) {
        return NextResponse.json(
          { 
            error: `"${item.product.name}" ürünü için yeterli stok bulunmamaktadır. Mevcut stok: ${item.product.stock}` 
          },
          { status: 400 }
        );
      }
    }

    // Kullanıcı bilgilerini getir
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı." },
        { status: 404 }
      );
    }

    // Ödeme yöntemi kontrolü
    if (!paymentMethodId) {
      return NextResponse.json(
        { error: "Ödeme yöntemi seçilmelidir." },
        { status: 400 }
      );
    }

    // Kredi ile ödeme için özel durum
    if (paymentMethodId === 'credit') {
      // Kredi ile ödeme
      if (user.credits < cart.totalPrice) {
        return NextResponse.json(
          { 
            error: "Yeterli krediniz bulunmamaktadır.", 
            requiredCredits: cart.totalPrice,
            currentCredits: user.credits
          },
          { status: 400 }
        );
      }

      // Kredi ile ödeme işlemi
      const order = await prisma.$transaction(async (tx) => {
        // Kullanıcı kredisini düş
        await tx.user.update({
          where: { id: session.user.id },
          data: { credits: { decrement: cart.totalPrice } },
        });

        // Stok miktarlarını güncelle
        for (const item of cart.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }

        // Siparişi tamamlandı olarak işaretle
        const updatedOrder = await tx.order.update({
          where: { id: cartId },
          data: { 
            status: "COMPLETED",
            paymentMethodId: null // Özel kredi ödeme yöntemi için null bırakıyoruz
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });

        // Kredi işlem kaydı oluştur
        await tx.creditTransaction.create({
          data: {
            userId: session.user.id,
            type: "PURCHASE",
            amount: -cart.totalPrice,
            note: `Sipariş #${updatedOrder.id} için ödeme`
          }
        });

        return updatedOrder;
      });

      return NextResponse.json(order);
    }

    // Normal ödeme yöntemi kontrolü
    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { 
        id: paymentMethodId,
        isActive: true
      }
    });

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Geçerli bir ödeme yöntemi seçilmelidir." },
        { status: 400 }
      );
    }

    // Ödeme yöntemine göre işlem yap
    if (paymentMethod.type === "CREDIT") {
      // Kredi ile ödeme
      if (user.credits < cart.totalPrice) {
        return NextResponse.json(
          { 
            error: "Yeterli krediniz bulunmamaktadır.", 
            requiredCredits: cart.totalPrice,
            currentCredits: user.credits
          },
          { status: 400 }
        );
      }

      // Kredi ile ödeme işlemi
      const order = await prisma.$transaction(async (tx) => {
        // Kullanıcı kredisini düş
        await tx.user.update({
          where: { id: session.user.id },
          data: { credits: { decrement: cart.totalPrice } },
        });

        // Stok miktarlarını güncelle
        for (const item of cart.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }

        // Siparişi tamamlandı olarak işaretle
        const updatedOrder = await tx.order.update({
          where: { id: cartId },
          data: { 
            status: "COMPLETED",
            paymentMethodId: paymentMethod.id
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });

        return updatedOrder;
      });

      return NextResponse.json(order);
    } else {
      // Harici ödeme yöntemi (örn. kredi kartı, havale, vb.)
      
      // Siparişi işleniyor durumuna getir
      const order = await prisma.$transaction(async (tx) => {
        // Stok miktarlarını güncelle
        for (const item of cart.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }

        // Siparişi işleniyor olarak işaretle
        const updatedOrder = await tx.order.update({
          where: { id: cartId },
          data: { 
            status: "PROCESSING",
            paymentMethodId: paymentMethod.id
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });

        return updatedOrder;
      });

      // Ödeme yöntemine göre yönlendirme URL'i oluştur
      let paymentUrl = "";
      
      switch (paymentMethod.provider) {
        case "IYZICO":
          paymentUrl = `/payment/iyzico/${order.id}`;
          break;
        case "PAYTR":
          paymentUrl = `/payment/paytr/${order.id}`;
          break;
        case "STRIPE":
          paymentUrl = `/payment/stripe/${order.id}`;
          break;
        default:
          paymentUrl = `/payment/external/${order.id}`;
      }

      return NextResponse.json({
        ...order,
        paymentUrl
      });
    }
  } catch (error) {
    console.error("Ödeme işlemi sırasında hata oluştu:", error);
    return NextResponse.json(
      { error: "Ödeme işlemi sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
} 