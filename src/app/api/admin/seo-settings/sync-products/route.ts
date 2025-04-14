import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    // SEO-sync API'sine POST isteği yapıyoruz
    const url = new URL('/api/admin/seo-sync', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': req.headers.get('cookie') || ''  // Oturum çerezlerini aktarıyoruz
      },
      body: JSON.stringify({ type: 'products' }),
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("SEO-sync API yanıt hatası:", errorData);
      return NextResponse.json(
        { error: "Ürün SEO senkronizasyonu sırasında bir hata oluştu" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Ürün SEO senkronizasyon hatası:", error);
    return NextResponse.json(
      { error: "Ürün SEO senkronizasyonu sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
} 