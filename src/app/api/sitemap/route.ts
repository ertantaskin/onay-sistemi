import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Tüm SEO ayarları olan sayfaları bul
    const seoSettings = await prisma.seoSettings.findMany({
      where: { isActive: true },
      orderBy: { updatedAt: "desc" },
    });

    // XML başlık ve içerik
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${seoSettings
  .map(
    (page) => `  <url>
    <loc>${process.env.NEXT_PUBLIC_SITE_URL}${page.pageUrl}</loc>
    <lastmod>${new Date(page.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page.pageType === "page" ? "0.8" : page.pageType === "product" ? "0.9" : "0.7"}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

    // XML yanıtını döndür
    return new NextResponse(xmlContent, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Sitemap oluşturma hatası:", error);
    return NextResponse.json(
      { error: "Sitemap oluşturulurken bir hata oluştu" },
      { status: 500 }
    );
  }
} 