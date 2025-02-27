import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz bulunmamaktadır" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Resim dosyası bulunamadı" },
        { status: 400 }
      );
    }

    // Dosya boyutunu kontrol et (2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Dosya boyutu 2MB'dan büyük olamaz" },
        { status: 400 }
      );
    }

    // Dosya tipini kontrol et
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Geçersiz dosya tipi. Sadece JPEG, PNG, GIF ve WEBP formatları desteklenmektedir" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Dosya adını oluştur
    const fileExt = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const publicDir = join(process.cwd(), "public");
    const uploadDir = join(publicDir, "uploads");
    const filePath = join(uploadDir, fileName);
    const relativePath = `/uploads/${fileName}`;

    // Dosyayı kaydet
    await writeFile(filePath, buffer);

    return NextResponse.json({ url: relativePath });
  } catch (error) {
    console.error("Resim yüklenirken hata:", error);
    return NextResponse.json(
      { error: "Resim yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 