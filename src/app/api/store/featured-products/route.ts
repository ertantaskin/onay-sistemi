import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Önce öne çıkan ürünleri getir
    const featuredProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    // Sonra bu ürünlerin sıralama bilgilerini ayrı getir
    const featuredProductOrders = await prisma.featuredProductOrder.findMany({
      where: {
        productId: {
          in: featuredProducts.map(product => product.id)
        }
      }
    });
    
    // Ürünleri ve sıralama bilgilerini birleştir
    const combinedProducts = featuredProducts.map(product => {
      const order = featuredProductOrders.find(order => order.productId === product.id);
      return {
        ...product,
        featuredProductOrder: order || null
      };
    });
    
    // Sıralama bilgisine göre sırala
    const sortedProducts = [...combinedProducts].sort((a, b) => {
      // Önce sıralama numarasına göre
      if (a.featuredProductOrder && b.featuredProductOrder) {
        return a.featuredProductOrder.displayOrder - b.featuredProductOrder.displayOrder;
      }
      
      // Sıralama bilgisi olmayan ürünler en sona
      if (a.featuredProductOrder && !b.featuredProductOrder) return -1;
      if (!a.featuredProductOrder && b.featuredProductOrder) return 1;
      
      // Son olarak isme göre
      return a.name.localeCompare(b.name);
    });
    
    // En fazla 8 ürün göster
    const limitedFeaturedProducts = sortedProducts.slice(0, 8);

    return NextResponse.json(limitedFeaturedProducts);
  } catch (error) {
    console.error("Öne çıkan ürünler alınırken hata:", error);
    return NextResponse.json(
      { error: "Öne çıkan ürünler alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
} 