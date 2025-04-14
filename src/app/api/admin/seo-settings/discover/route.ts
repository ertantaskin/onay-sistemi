import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";

// GET - Sistemdeki sayfaları keşfet
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    // 1. Statik sayfaları bul (Next.js app directory'sinden)
    const appDir = path.join(process.cwd(), "src/app");
    let staticPages: string[] = [];
    
    try {
      staticPages = findStaticPages(appDir, "");
      console.log(`${staticPages.length} statik sayfa bulundu`);
    } catch (error) {
      console.error("Statik sayfalar taranırken hata:", error);
      staticPages = []; // Hata durumunda boş dizi kullan
    }

    // 2. Ürün sayfalarını veritabanından bul
    let productPages: string[] = [];
    try {
      const products = await prisma.product.findMany({
        where: { isActive: true },
        select: { id: true },
      });
      productPages = products.map((product) => `/urun/${product.id}`);
      console.log(`${productPages.length} ürün sayfası bulundu`);
    } catch (error) {
      console.error("Ürün sayfaları alınırken hata:", error);
      productPages = []; // Hata durumunda boş dizi kullan
    }

    // 3. Kategori sayfalarını veritabanından bul
    let categoryPages: string[] = [];
    try {
      const categories = await prisma.productCategory.findMany({
        where: { isActive: true },
        select: { slug: true },
      });
      categoryPages = categories.map((category) => `/kategori/${category.slug}`);
      console.log(`${categoryPages.length} kategori sayfası bulundu`);
    } catch (error) {
      console.error("Kategori sayfaları alınırken hata:", error);
      categoryPages = []; // Hata durumunda boş dizi kullan
    }

    // 4. Mevcut SEO ayarları olan sayfaları bul
    let existingUrls = new Set<string>();
    try {
      // Prisma client türünü "as any" kullanarak belirtiyoruz
      const existingSeoSettings = await (prisma as any).seoSettings.findMany({
        select: { pageUrl: true },
      });
      
      existingUrls = new Set(existingSeoSettings.map((seo: { pageUrl: string }) => seo.pageUrl));
      console.log(`${existingUrls.size} mevcut SEO ayarı bulundu`);
    } catch (error) {
      console.error("Mevcut SEO ayarları alınırken hata:", error);
      existingUrls = new Set(); // Hata durumunda boş set kullan
    }

    // 5. Tüm sayfaları birleştir ve mevcut SEO ayarları olmayanları filtrele
    const allPages = [...staticPages, ...productPages, ...categoryPages];
    const newPages = allPages.filter((page) => !existingUrls.has(page));

    console.log(`Toplam ${newPages.length} yeni sayfa keşfedildi`);
    
    return NextResponse.json({
      total: newPages.length,
      pages: newPages,
    });
  } catch (error) {
    console.error("Sayfa keşfetme hatası:", error);
    return NextResponse.json(
      { error: "Sayfalar keşfedilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Statik sayfaları rekursif olarak bul (senkron versiyon)
function findStaticPages(dir: string, basePath: string): string[] {
  const pages: string[] = [];
  const ignored = ["api", "admin", "_components", "_utils", "node_modules"];
  
  try {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      // İstenmeyen dizinleri atla
      if (ignored.includes(file)) continue;

      try {
        const fullPath = path.join(dir, file);
        const relativePath = path.join(basePath, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          // Eğer dizinse ve özel isimli değilse (dynamic route veya layout değilse)
          if (!file.startsWith("[") && !file.startsWith("_") && file !== "components" && file !== "page-content") {
            // Alt dizindeki sayfaları bul
            const nestedPages = findStaticPages(fullPath, relativePath);
            pages.push(...nestedPages);
          }
        } else if (file === "page.tsx" || file === "page.jsx" || file === "page.js") {
          // Eğer sayfa dosyasıysa, URL'yi ekle
          const pageUrl = basePath === "" ? "/" : `/${basePath}`;
          pages.push(pageUrl);
        }
      } catch (statError) {
        console.error(`Dosya erişim hatası (${file}):`, statError);
        // Tek bir dosya/dizin hatasının tüm işlemi kesmesine izin verme
        continue;
      }
    }
  } catch (readError) {
    console.error(`Dizin okuma hatası (${dir}):`, readError);
    // Hata logla ama boş dizi döndür
    return [];
  }

  return pages;
} 