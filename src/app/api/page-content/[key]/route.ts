import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Belirli bir sayfa içeriğini getir (public API)
export async function GET(
  req: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    // Next.js 15'te params'ı await ile bekletmemiz gerekiyor
    const resolvedParams = await params;
    const key = resolvedParams.key;

    const pageContent = await prisma.pageContent.findUnique({
      where: {
        pageKey: key,
        isActive: true,
      },
    });

    if (!pageContent) {
      return NextResponse.json(
        { error: "Sayfa içeriği bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(pageContent);
  } catch (error) {
    console.error("Sayfa içeriği getirilirken hata oluştu:", error);
    return NextResponse.json(
      { error: "Sayfa içeriği getirilirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 