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
        status: "PENDING" 
      },
      include: {
        orderItems: {
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

    if (cart.orderItems.length === 0) {
      return NextResponse.json(
        { error: "Sepetinizde ürün bulunmamaktadır." },
        { status: 400 }
      );
    }

    // Stok kontrolü
    for (const item of cart.orderItems) {
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
        for (const item of cart.orderItems) {
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
            orderItems: {
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
        for (const item of cart.orderItems) {
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
            orderItems: {
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
        for (const item of cart.orderItems) {
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
            orderItems: {
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