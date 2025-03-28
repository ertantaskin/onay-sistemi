import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from 'uuid';

// Kullanıcının sepetini getir
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const cookieStore = await cookies();
    const guestCartId = (await cookieStore.get('guestCartId'))?.value;
    
    // URL'den includeGuest parametresini al
    const includeGuest = request.nextUrl.searchParams.get('includeGuest') === 'true';
    
    // Cache'i atlamak için timestamp parametresi var mı diye kontrol edelim
    const timestamp = request.nextUrl.searchParams.get('t');

    // Kullanıcı giriş yapmışsa
    if (session && session.user) {
      // Kullanıcının bekleyen (pending) siparişini bul
      const pendingOrder = await prisma.order.findFirst({
        where: {
          userId: session.user.id,
          status: "pending",
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true,
                  stock: true,
                },
              },
            },
          },
        },
      });

      // Kullanıcının sepeti yoksa veya boşsa ve misafir sepeti varsa, sepet birleştirme işlemi başlatalım
      if ((!pendingOrder || !pendingOrder.items || pendingOrder.items.length === 0) && guestCartId && includeGuest) {
        // Misafir sepetini kontrol edelim
        const guestCart = await prisma.guestCart.findUnique({
          where: {
            id: guestCartId,
          },
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    imageUrl: true,
                    stock: true,
                  },
                },
              },
            },
          },
        });
        
        // Misafir sepeti varsa ve içinde ürün varsa, kullanıcı sepetine aktaralım
        if (guestCart && guestCart.items && guestCart.items.length > 0) {
          // Kullanıcının sepeti yoksa oluşturalım
          let userCart = pendingOrder;
          
          if (!userCart) {
            userCart = await prisma.order.create({
              data: {
                userId: session.user.id,
                status: "pending",
                totalPrice: 0,
              },
              include: {
                items: {
                  include: {
                    product: true,
                  },
                },
              },
            });
          }
          
          // Misafir sepetindeki ürünleri kullanıcı sepetine ekleyelim
          for (const item of guestCart.items) {
            // Kullanıcı sepetinde aynı ürün var mı kontrol edelim
            const existingItem = userCart.items.find(
              (i) => i.productId === item.productId
            );
            
            if (existingItem) {
              // Varsa miktarını artıralım
              await prisma.orderItem.update({
                where: {
                  id: existingItem.id,
                },
                data: {
                  quantity: existingItem.quantity + item.quantity,
                  price: item.price,
                },
              });
            } else {
              // Yoksa yeni ekleyelim
              await prisma.orderItem.create({
                data: {
                  orderId: userCart.id,
                  productId: item.productId,
                  quantity: item.quantity,
                  price: item.price,
                },
              });
            }
          }
          
          // Toplam fiyatı güncelleyelim
          const updatedItems = await prisma.orderItem.findMany({
            where: {
              orderId: userCart.id,
            },
            include: {
              product: true,
            },
          });
          
          const totalPrice = updatedItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );
          
          await prisma.order.update({
            where: {
              id: userCart.id,
            },
            data: {
              totalPrice,
            },
          });
          
          // Misafir sepetini temizleyelim
          await prisma.guestCartItem.deleteMany({
            where: {
              guestCartId: guestCart.id,
            },
          });
          
          // Güncellenmiş sepeti alalım
          const updatedCart = await prisma.order.findUnique({
            where: {
              id: userCart.id,
            },
            include: {
              items: {
                include: {
                  product: {
                    select: {
                      id: true,
                      name: true,
                      imageUrl: true,
                      stock: true,
                    },
                  },
                },
              },
            },
          });
          
          return NextResponse.json(updatedCart);
        }
      }

      // Eğer bekleyen sipariş yoksa boş bir sepet döndür
      if (!pendingOrder) {
        return NextResponse.json({
          id: null,
          totalPrice: 0,
          items: [],
        });
      }

      return NextResponse.json(pendingOrder);
    } 
    
    // Kullanıcı giriş yapmamışsa ve misafir sepeti varsa
    if (!session && guestCartId) {
      // Misafir sepetini bul
      const guestCart = await prisma.guestCart.findUnique({
        where: {
          id: guestCartId,
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true,
                  stock: true,
                },
              },
            },
          },
        },
      });

      if (!guestCart) {
        // Misafir sepeti bulunamadıysa yeni bir tane oluştur
        const newGuestCart = await prisma.guestCart.create({
          data: {
            id: guestCartId,
            totalPrice: 0,
          },
        });

        return NextResponse.json({
          id: newGuestCart.id,
          totalPrice: 0,
          items: [],
        });
      }

      return NextResponse.json(guestCart);
    }

    // Kullanıcı giriş yapmamış ve misafir sepeti de yoksa boş bir sepet döndür
    return NextResponse.json({
      id: null,
      totalPrice: 0,
      items: [],
    });
  } catch (error) {
    console.error("Sepet bilgilerini alırken hata:", error);
    return NextResponse.json(
      { error: "Sepet bilgileri yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const cookieStore = await cookies();
    let guestCartId = (await cookieStore.get('guestCartId'))?.value;
    
    const { productId, quantity } = await request.json();

    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: "Geçersiz ürün veya miktar" },
        { status: 400 }
      );
    }

    // Ürünün var olup olmadığını ve stokta olup olmadığını kontrol et
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
        isActive: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Ürün bulunamadı" },
        { status: 404 }
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { error: "Yeterli stok bulunmamaktadır" },
        { status: 400 }
      );
    }

    // Kullanıcı giriş yapmışsa
    if (session && session.user) {
      // Kullanıcının mevcut bir siparişi var mı kontrol et
      let order = await prisma.order.findFirst({
        where: {
          userId: session.user.id,
          status: "pending",
        },
        include: {
          items: true,
        },
      });

      // Eğer sipariş yoksa yeni bir sipariş oluştur
      if (!order) {
        order = await prisma.order.create({
          data: {
            userId: session.user.id,
            status: "pending",
            totalPrice: product.price * quantity,
            items: {
              create: {
                productId: product.id,
                quantity: quantity,
                price: product.price,
              },
            },
          },
          include: {
            items: true,
          },
        });
      } else {
        // Sipariş varsa, ürün zaten sepette mi kontrol et
        const existingItem = order.items.find((item: any) => item.productId === productId);

        if (existingItem) {
          // Ürün zaten sepette, miktarı güncelle
          await prisma.orderItem.update({
            where: {
              id: existingItem.id,
            },
            data: {
              quantity: existingItem.quantity + quantity,
            },
          });
        } else {
          // Ürün sepette değil, yeni bir öğe ekle
          await prisma.orderItem.create({
            data: {
              orderId: order.id,
              productId: product.id,
              quantity: quantity,
              price: product.price,
            },
          });
        }

        // Toplam fiyatı güncelle
        const updatedItems = await prisma.orderItem.findMany({
          where: {
            orderId: order.id,
          },
          include: {
            product: true,
          },
        });

        const newTotalPrice = updatedItems.reduce(
          (total: number, item: any) => total + item.price * item.quantity,
          0
        );

        await prisma.order.update({
          where: {
            id: order.id,
          },
          data: {
            totalPrice: newTotalPrice,
          },
        });
      }
    } 
    // Misafir kullanıcı için
    else {
      // Misafir sepeti yoksa oluştur
      if (!guestCartId) {
        const newGuestCartId = uuidv4();
        guestCartId = newGuestCartId;
        
        // Cookie'ye kaydet (7 gün geçerli)
        cookieStore.set('guestCartId', newGuestCartId, { 
          maxAge: 60 * 60 * 24 * 7,
          path: '/',
          httpOnly: true,
          sameSite: 'strict'
        });
        
        // Yeni misafir sepeti oluştur
        await prisma.guestCart.create({
          data: {
            id: newGuestCartId,
            totalPrice: product.price * quantity,
            items: {
              create: {
                productId: product.id,
                quantity: quantity,
                price: product.price,
              },
            },
          },
        });
      } else {
        // Mevcut misafir sepetini bul
        const guestCart = await prisma.guestCart.findUnique({
          where: {
            id: guestCartId,
          },
          include: {
            items: true,
          },
        });

        if (guestCart) {
          // Ürün zaten sepette mi kontrol et
          const existingItem = guestCart.items.find((item: any) => item.productId === productId);

          if (existingItem) {
            // Ürün zaten sepette, miktarı güncelle
            await prisma.guestCartItem.update({
              where: {
                id: existingItem.id,
              },
              data: {
                quantity: existingItem.quantity + quantity,
              },
            });
          } else {
            // Ürün sepette değil, yeni bir öğe ekle
            await prisma.guestCartItem.create({
              data: {
                guestCartId: guestCartId,
                productId: product.id,
                quantity: quantity,
                price: product.price,
              },
            });
          }

          // Toplam fiyatı güncelle
          const updatedItems = await prisma.guestCartItem.findMany({
            where: {
              guestCartId: guestCartId,
            },
            include: {
              product: true,
            },
          });

          const newTotalPrice = updatedItems.reduce(
            (total: number, item: any) => total + item.price * item.quantity,
            0
          );

          await prisma.guestCart.update({
            where: {
              id: guestCartId,
            },
            data: {
              totalPrice: newTotalPrice,
            },
          });
        } else {
          // Sepet bulunamadıysa yeni bir sepet oluştur
          await prisma.guestCart.create({
            data: {
              id: guestCartId,
              totalPrice: product.price * quantity,
              items: {
                create: {
                  productId: product.id,
                  quantity: quantity,
                  price: product.price,
                },
              },
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sepete eklerken hata:", error);
    return NextResponse.json(
      { error: "Sepete eklerken bir hata oluştu" },
      { status: 500 }
    );
  }
} 