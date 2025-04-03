import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Admin yetkisi kontrolü
async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return false;
  }
  return true;
}

// Tüm ürünleri sıralama bilgisiyle getir
export async function GET() {
  try {
    // Admin yetkisi kontrolü
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz bulunmamaktadır" },
        { status: 403 }
      );
    }
    
    // Tüm ürünleri getir (aktif/pasif hepsi)
    const products = await prisma.product.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    // Sıralama bilgilerini getir
    const featuredProductOrders = await prisma.featuredProductOrder.findMany();
    
    // Ürünleri ve sıralama bilgilerini birleştir
    const combinedProducts = products.map(product => {
      const order = featuredProductOrders.find(order => order.productId === product.id);
      return {
        ...product,
        featuredProductOrder: order || null
      };
    });
    
    // İlk öne çıkan ürünleri, sonra diğer ürünleri göster
    const sortedProducts = [...combinedProducts].sort((a, b) => {
      // Önce öne çıkan ürünleri göster
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      
      // Öne çıkan ürünler arasında sıralama numarasına göre
      if (a.isFeatured && b.isFeatured) {
        if (a.featuredProductOrder && b.featuredProductOrder) {
          return a.featuredProductOrder.displayOrder - b.featuredProductOrder.displayOrder;
        }
        if (a.featuredProductOrder && !b.featuredProductOrder) return -1;
        if (!a.featuredProductOrder && b.featuredProductOrder) return 1;
      }
      
      // Son olarak isme göre
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json(sortedProducts);
  } catch (error) {
    console.error("Ürünler listelenirken hata:", error);
    return NextResponse.json(
      { error: "Ürünler listelenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Ürünlerin öne çıkarma özelliğini ve sıralama değerlerini güncelle
export async function PUT(request: NextRequest) {
  try {
    // Admin yetkisi kontrolü
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz bulunmamaktadır" },
        { status: 403 }
      );
    }

    const data = await request.json();
    
    if (!Array.isArray(data.products)) {
      return NextResponse.json(
        { error: "Geçersiz veri formatı" },
        { status: 400 }
      );
    }
    
    // Önce tüm FeaturedProductOrder kayıtlarını sil
    await prisma.featuredProductOrder.deleteMany({});
    
    // Sonra her ürün için öne çıkarma durumunu güncelle ve sıralama bilgisi ekle
    for (const item of data.products) {
      // Ürünün öne çıkarma durumunu güncelle
      await prisma.product.update({
        where: { id: item.id },
        data: { isFeatured: item.isFeatured }
      });
      
      // Eğer öne çıkan ürünse ve sıralama bilgisi varsa
      if (item.isFeatured && item.displayOrder !== undefined && item.displayOrder !== null) {
        // Sıralama bilgisi ekle
        await prisma.featuredProductOrder.create({
          data: {
            productId: item.id,
            displayOrder: item.displayOrder
          }
        });
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Öne çıkan ürünler güncellenirken hata:", error);
    return NextResponse.json(
      { error: "Öne çıkan ürünler güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 