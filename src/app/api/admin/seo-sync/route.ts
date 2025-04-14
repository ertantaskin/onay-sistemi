import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * Bu API, kategori ve ürün sayfaları için SEO verilerini otomatik oluşturur veya günceller.
 * Admin panelinden bu API'ye istek yapıldığında, veritabanındaki tüm kategoriler ve ürünler için
 * SEO kayıtları oluşturulur veya güncellenir.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { type } = await req.json();
    
    if (type === 'categories') {
      return await syncCategoriesSeo();
    } else if (type === 'products') {
      return await syncProductsSeo();
    } else {
      return NextResponse.json({ error: "Geçersiz senkronizasyon tipi" }, { status: 400 });
    }
  } catch (error) {
    console.error("SEO senkronizasyon hatası:", error);
    return NextResponse.json(
      { error: "SEO senkronizasyonu sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
}

/**
 * Tüm kategoriler için SEO kayıtlarını senkronize eder
 */
async function syncCategoriesSeo() {
  try {
    // @ts-ignore - Prisma client'ın SeoSettings ve category modellerini TypeScript'te tanımıyor
    const categories = await prisma.productCategory.findMany({
      where: {
        isActive: true
      }
    });
    
    console.log(`[SEO-SYNC] ${categories.length} aktif kategori bulundu`);
    
    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0
    };
    
    for (const category of categories) {
      try {
        // Kategori slug'ı null ise ID kullan
        const categorySlug = category.slug || category.id;
        
        // /store/category/{slug} URL'si için SEO kaydı
        const storeCategoryUrl = `/store/category/${categorySlug}`;
        
        // /kategori/{slug} URL'si için SEO kaydı
        const kategoriUrl = `/kategori/${categorySlug}`;
        
        // Önce /store/category/{slug} URL'si için SEO kaydı
        // @ts-ignore
        const existingStoreCategory = await prisma.seoSettings.findUnique({
          where: { pageUrl: storeCategoryUrl }
        });
        
        // /kategori/{slug} URL'si için SEO kaydı
        // @ts-ignore
        const existingKategori = await prisma.seoSettings.findUnique({
          where: { pageUrl: kategoriUrl }
        });
        
        const categoryTitle = `${category.name} - Microsoft Lisans Mağazası`;
        const categoryDesc = category.description || `Microsoft ${category.name} lisansları ve ürünleri - Microsoft Onay Sistemi'nde uygun fiyatlarla satın alın.`;
        const categoryKeywords = `microsoft,lisans,${category.name.toLowerCase()},onay sistemi`;
        
        // /store/category/{slug} URL'si için SEO kaydı güncelleme/oluşturma
        if (existingStoreCategory) {
          // Mevcut kaydı güncelle
          // @ts-ignore
          await prisma.seoSettings.update({
            where: { id: existingStoreCategory.id },
            data: {
              title: categoryTitle,
              description: categoryDesc,
              keywords: categoryKeywords,
              isActive: true,
              updatedAt: new Date()
            }
          });
          
          results.updated++;
          console.log(`[SEO-SYNC] ✅ Kategori SEO güncellendi: ${storeCategoryUrl}`);
        } else {
          // Yeni kayıt oluştur
          // @ts-ignore
          await prisma.seoSettings.create({
            data: {
              pageUrl: storeCategoryUrl,
              pageType: 'category',
              title: categoryTitle,
              description: categoryDesc,
              keywords: categoryKeywords,
              robots: 'index, follow',
              isActive: true
            }
          });
          
          results.created++;
          console.log(`[SEO-SYNC] ✅ Kategori için yeni SEO kaydı oluşturuldu: ${storeCategoryUrl}`);
        }
        
        // /kategori/{slug} URL'si için SEO kaydı güncelleme/oluşturma
        if (existingKategori) {
          // Mevcut kaydı güncelle
          // @ts-ignore
          await prisma.seoSettings.update({
            where: { id: existingKategori.id },
            data: {
              title: categoryTitle,
              description: categoryDesc,
              keywords: categoryKeywords,
              isActive: true,
              updatedAt: new Date()
            }
          });
          
          results.updated++;
          console.log(`[SEO-SYNC] ✅ Kategori SEO güncellendi: ${kategoriUrl}`);
        } else {
          // Yeni kayıt oluştur
          // @ts-ignore
          await prisma.seoSettings.create({
            data: {
              pageUrl: kategoriUrl,
              pageType: 'category',
              title: categoryTitle,
              description: categoryDesc,
              keywords: categoryKeywords,
              robots: 'index, follow',
              isActive: true
            }
          });
          
          results.created++;
          console.log(`[SEO-SYNC] ✅ Kategori için yeni SEO kaydı oluşturuldu: ${kategoriUrl}`);
        }
      } catch (error) {
        console.error(`[SEO-SYNC] ❌ Kategori SEO senkronizasyon hatası (${category.name}):`, error);
        results.errors++;
      }
    }
    
    return NextResponse.json({
      message: "Kategori SEO senkronizasyonu tamamlandı",
      results
    });
  } catch (error) {
    console.error("[SEO-SYNC] ❌ Kategori SEO senkronizasyonu genel hatası:", error);
    return NextResponse.json(
      { error: "Kategori SEO senkronizasyonu sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
}

/**
 * Tüm ürünler için SEO kayıtlarını senkronize eder
 */
async function syncProductsSeo() {
  try {
    // @ts-ignore - Prisma client'ın product modelini TypeScript'te tanımıyor
    const products = await prisma.product.findMany({
      where: {
        isActive: true
      },
      include: {
        category: true
      }
    });
    
    console.log(`[SEO-SYNC] ${products.length} aktif ürün bulundu`);
    
    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0
    };
    
    for (const product of products) {
      try {
        // Ürün URL'si oluştur
        // @ts-ignore - Product modelindeki slug özelliğine erişim hatası
        const productUrl = `/store/product/${product.slug || product.id}`;
        
        // Bu URL için mevcut SEO kaydını kontrol et
        // @ts-ignore
        const existingSeo = await prisma.seoSettings.findUnique({
          where: { pageUrl: productUrl }
        });
        
        // Ürün kategorisi adını al
        const categoryName = product.category?.name || 'Microsoft Ürünleri';
        
        if (existingSeo) {
          // Mevcut kaydı güncelle
          // @ts-ignore
          await prisma.seoSettings.update({
            where: { id: existingSeo.id },
            data: {
              title: `${product.name} - Microsoft Lisans | ${categoryName}`,
              description: product.description || `${product.name} - Microsoft lisansınızı hemen satın alın. Orijinal ve garantili ${categoryName} ürünleri.`,
              keywords: `microsoft,lisans,${product.name.toLowerCase()},${categoryName.toLowerCase()},satın al`,
              isActive: true,
              updatedAt: new Date()
            }
          });
          
          results.updated++;
          console.log(`[SEO-SYNC] ✅ Ürün SEO güncellendi: ${productUrl}`);
        } else {
          // Yeni kayıt oluştur
          // @ts-ignore
          await prisma.seoSettings.create({
            data: {
              pageUrl: productUrl,
              pageType: 'product',
              title: `${product.name} - Microsoft Lisans | ${categoryName}`,
              description: product.description || `${product.name} - Microsoft lisansınızı hemen satın alın. Orijinal ve garantili ${categoryName} ürünleri.`,
              keywords: `microsoft,lisans,${product.name.toLowerCase()},${categoryName.toLowerCase()},satın al`,
              robots: 'index, follow',
              isActive: true
            }
          });
          
          results.created++;
          console.log(`[SEO-SYNC] ✅ Ürün için yeni SEO kaydı oluşturuldu: ${productUrl}`);
        }
      } catch (error) {
        console.error(`[SEO-SYNC] ❌ Ürün SEO senkronizasyon hatası (${product.name}):`, error);
        results.errors++;
      }
    }
    
    return NextResponse.json({
      message: "Ürün SEO senkronizasyonu tamamlandı",
      results
    });
  } catch (error) {
    console.error("[SEO-SYNC] ❌ Ürün SEO senkronizasyonu genel hatası:", error);
    return NextResponse.json(
      { error: "Ürün SEO senkronizasyonu sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
} 