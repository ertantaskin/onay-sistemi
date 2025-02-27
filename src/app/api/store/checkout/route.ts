import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // Oturum kontrolü
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Bu işlem için giriş yapmanız gerekmektedir." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { cartId, paymentMethodId } = body;

    if (!cartId) {
      return NextResponse.json(
        { error: "Sepet ID'si gereklidir." },
        { status: 400 }
      );
    }

    // Sepeti kontrol et
    const cart = await prisma.order.findUnique({
      where: { 
        id: cartId,
        userId: session.user.id,
        status: "pending" 
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      return NextResponse.json(
        { error: "Geçerli bir sepet bulunamadı." },
        { status: 404 }
      );
    }

    if (cart.items.length === 0) {
      return NextResponse.json(
        { error: "Sepetinizde ürün bulunmamaktadır." },
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

        // Kredi işlemi kaydı oluştur
        await tx.creditTransaction.create({
          data: {
            userId: session.user.id,
            type: "PURCHASE",
            amount: -cart.totalPrice,
            note: `Sipariş: ${cartId} - Mağaza alışverişi`
          }
        });

        // Stok miktarlarını güncelle
        for (const item of cart.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }

        // Siparişi tamamlandı olarak işaretle - paymentMethodId alanını null olarak bırak
        const updatedOrder = await tx.order.update({
          where: { id: cartId },
          data: { 
            status: "completed",
            // Kredi ile ödeme için paymentMethodId null olarak bırakılıyor
            paymentMethodId: null
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

      return NextResponse.json({
        ...order,
        success: true,
        message: "Ödeme başarıyla tamamlandı",
        paymentMethod: "credit"
      });
    } else {
      // Harici ödeme yöntemi (örn. kredi kartı, havale, vb.)
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
            status: "processing",
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
      
      if (paymentMethod.provider) {
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
      } else {
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