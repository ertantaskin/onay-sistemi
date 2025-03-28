import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// BillingDetails için tip tanımı
interface BillingDetails {
  fullName: string;
  country: string;
  city: string;
  phone: string;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekmektedir" },
        { status: 401 }
      );
    }

    // Sadece billingDetails sütununu seçelim
    const user = await prisma.$queryRaw`
      SELECT "billingDetails" FROM "User" WHERE "email" = ${session.user.email}
    `;

    if (!user || !Array.isArray(user) || user.length === 0) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    // Varsayılan boş değerler
    const defaultBillingDetails: BillingDetails = {
      fullName: "",
      country: "",
      city: "",
      phone: ""
    };

    // billingDetails alanını JSON olarak parse et
    let billingDetails = defaultBillingDetails;
    try {
      const userBillingDetails = user[0]?.billingDetails;
      
      if (userBillingDetails && userBillingDetails !== '{}') {
        // Zaten JSON olarak parse edilmiş olabilir
        const parsedDetails = typeof userBillingDetails === 'string'
          ? JSON.parse(userBillingDetails)
          : userBillingDetails;
        
        // Gerekli tüm alanların olduğundan emin ol
        billingDetails = {
          fullName: parsedDetails.fullName || "",
          country: parsedDetails.country || "",
          city: parsedDetails.city || "",
          phone: parsedDetails.phone || ""
        };
      }
    } catch (e) {
      console.error("JSON parse hatası:", e);
      // Hata durumunda varsayılan değerleri kullan
    }

    return NextResponse.json(billingDetails);
  } catch (error) {
    console.error("Fatura detayları getirme hatası:", error);
    return NextResponse.json(
      { error: "Fatura detayları alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekmektedir" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { fullName, country, city, phone } = body;

    // Validasyon
    if (!fullName || !country || !city || !phone) {
      return NextResponse.json(
        { error: "Tüm alanları doldurunuz" },
        { status: 400 }
      );
    }

    // Fatura detaylarını JSON formatında hazırla
    const billingDetails: BillingDetails = { fullName, country, city, phone };
    const billingDetailsString = JSON.stringify(billingDetails);

    // SQL ile doğrudan güncelleme yapalım
    await prisma.$executeRaw`
      UPDATE "User" 
      SET "billingDetails" = ${billingDetailsString}::jsonb
      WHERE "email" = ${session.user.email}
    `;

    // Yanıtı hazırla
    return NextResponse.json(billingDetails);
  } catch (error) {
    console.error("Fatura detayları güncelleme hatası:", error);
    return NextResponse.json(
      { error: "Fatura detayları güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 