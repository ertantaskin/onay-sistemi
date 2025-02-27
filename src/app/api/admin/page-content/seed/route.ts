import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Sayfa içerikleri
const pageContents = [
  {
    pageKey: "home",
    title: "Ana Sayfa",
    description: "Microsoft Onay Sistemi ana sayfası",
    metaTitle: "Microsoft Onay Sistemi - Hızlı ve Güvenli Onay Alın",
    metaDesc: "Microsoft ürünleriniz için hızlı ve güvenli onay alın. 7/24 destek ve uygun fiyatlar.",
    content: {
      hero: {
        title: "Microsoft Onay Sistemi",
        description: "Hızlı ve güvenli bir şekilde Microsoft ürünleriniz için onay alın",
        buttonText: "Hemen Başla",
        imageUrl: "/images/hero-bg.jpg"
      },
      features: [
        {
          title: "Hızlı İşlem",
          description: "Saniyeler içinde onay numaranızı alın",
          icon: "zap"
        },
        {
          title: "Güvenli Ödeme",
          description: "SSL korumalı güvenli ödeme altyapısı",
          icon: "shield"
        },
        {
          title: "7/24 Destek",
          description: "Teknik ekibimiz her zaman yanınızda",
          icon: "headphones"
        }
      ],
      stats: [
        { value: "50,000+", label: "Mutlu Müşteri" },
        { value: "99.9%", label: "Başarı Oranı" },
        { value: "24/7", label: "Müşteri Desteği" }
      ],
      testimonials: [
        {
          name: "Ahmet Yılmaz",
          role: "Yazılım Geliştirici",
          content: "Çok hızlı ve sorunsuz bir şekilde onay alabildim. Kesinlikle tavsiye ederim.",
          avatar: "/images/testimonials/avatar1.jpg"
        },
        {
          name: "Ayşe Demir",
          role: "Grafik Tasarımcı",
          content: "Profesyonel hizmet ve uygun fiyatlar. Teşekkürler!",
          avatar: "/images/testimonials/avatar2.jpg"
        }
      ],
      cta: {
        title: "Hemen Başlayın",
        description: "Microsoft ürünleriniz için hızlı ve güvenli onay alın",
        buttonText: "Onay Al",
        buttonUrl: "/onay"
      }
    },
    isActive: true
  },
  {
    pageKey: "store",
    title: "Mağaza",
    description: "Microsoft Onay Sistemi mağaza sayfası",
    metaTitle: "Mağaza - Microsoft Onay Sistemi",
    metaDesc: "Microsoft Onay Sistemi mağazasında ürünlerimizi keşfedin ve hemen satın alın.",
    content: {
      hero: {
        title: "Ürün Mağazamız",
        description: "Microsoft ürünleri ve onay hizmetlerimizi keşfedin",
        buttonText: "Ürünleri Keşfet",
        imageUrl: "/images/store-hero.jpg"
      },
      categories: {
        title: "Ürün Kategorileri",
        description: "İhtiyacınıza uygun ürünleri bulun",
        items: [
          {
            title: "Office Ürünleri",
            description: "Microsoft Office ürünleri için onay hizmetleri",
            icon: "file-text"
          },
          {
            title: "Windows",
            description: "Windows işletim sistemleri için onay hizmetleri",
            icon: "monitor"
          },
          {
            title: "Sunucu Ürünleri",
            description: "Microsoft Server ürünleri için onay hizmetleri",
            icon: "server"
          }
        ]
      },
      features: [
        {
          title: "Hızlı Teslimat",
          description: "Anında e-posta ile teslimat",
          icon: "send"
        },
        {
          title: "Güvenli Ödeme",
          description: "128-bit SSL şifrelemeli güvenli ödeme",
          icon: "lock"
        },
        {
          title: "7/24 Destek",
          description: "Satış öncesi ve sonrası destek",
          icon: "headphones"
        }
      ]
    },
    isActive: true
  },
  {
    pageKey: "dashboard",
    title: "Kontrol Paneli",
    description: "Kullanıcı kontrol paneli sayfası",
    metaTitle: "Kontrol Paneli - Microsoft Onay Sistemi",
    metaDesc: "Microsoft Onay Sistemi kullanıcı kontrol paneli. Kredi bakiyenizi görüntüleyin ve onay işlemlerinizi takip edin.",
    content: {
      hero: {
        title: "Kontrol Paneli",
        description: "Hoş geldiniz! Kredi bakiyenizi görüntüleyin ve onay işlemlerinizi takip edin.",
        imageUrl: "/images/dashboard-hero.jpg"
      },
      quickStats: [
        {
          title: "Kredi Bakiyesi",
          icon: "credit-card"
        },
        {
          title: "Toplam Onay",
          icon: "check-circle"
        },
        {
          title: "Son İşlem",
          icon: "clock"
        }
      ],
      features: [
        {
          title: "Hızlı Onay",
          description: "Saniyeler içinde onay numaranızı alın",
          icon: "zap"
        },
        {
          title: "Güvenli İşlem",
          description: "Tüm işlemleriniz güvenle saklanır",
          icon: "shield"
        },
        {
          title: "7/24 Destek",
          description: "Teknik ekibimiz her zaman yanınızda",
          icon: "headphones"
        }
      ]
    },
    isActive: true
  },
  {
    pageKey: "account-orders",
    title: "Siparişlerim",
    description: "Kullanıcı siparişleri sayfası",
    metaTitle: "Siparişlerim - Microsoft Onay Sistemi",
    metaDesc: "Microsoft Onay Sistemi siparişlerinizi görüntüleyin ve takip edin.",
    content: {
      hero: {
        title: "Siparişlerim",
        description: "Tüm siparişlerinizi görüntüleyin ve takip edin",
        imageUrl: "/images/orders-hero.jpg"
      },
      orderStatus: {
        title: "Sipariş Durumu",
        statuses: [
          {
            status: "pending",
            label: "Beklemede",
            description: "Siparişiniz işleme alındı, ödeme bekleniyor"
          },
          {
            status: "processing",
            label: "İşleniyor",
            description: "Siparişiniz işleniyor"
          },
          {
            status: "completed",
            label: "Tamamlandı",
            description: "Siparişiniz tamamlandı"
          },
          {
            status: "cancelled",
            label: "İptal Edildi",
            description: "Siparişiniz iptal edildi"
          }
        ]
      },
      features: [
        {
          title: "Sipariş Takibi",
          description: "Siparişlerinizi anlık olarak takip edin",
          icon: "eye"
        },
        {
          title: "Sipariş Geçmişi",
          description: "Tüm sipariş geçmişinize erişin",
          icon: "clock"
        },
        {
          title: "Fatura İndirme",
          description: "Faturalarınızı kolayca indirin",
          icon: "file-text"
        }
      ]
    },
    isActive: true
  },
  {
    pageKey: "login",
    title: "Giriş Yap",
    description: "Kullanıcı giriş sayfası",
    metaTitle: "Giriş Yap - Microsoft Onay Sistemi",
    metaDesc: "Microsoft Onay Sistemi'ne giriş yapın ve hizmetlerimizden yararlanın.",
    content: {
      hero: {
        title: "Hesabınıza Giriş Yapın",
        description: "Microsoft Onay Sistemi'ne hoş geldiniz",
        imageUrl: "/images/login-hero.jpg"
      },
      features: [
        {
          title: "Güvenli Giriş",
          description: "SSL korumalı güvenli giriş",
          icon: "lock"
        },
        {
          title: "Hızlı Erişim",
          description: "Hesabınıza hızlı erişim sağlayın",
          icon: "zap"
        },
        {
          title: "Şifremi Unuttum",
          description: "Şifrenizi kolayca sıfırlayın",
          icon: "key"
        }
      ]
    },
    isActive: true
  },
  {
    pageKey: "register",
    title: "Kayıt Ol",
    description: "Kullanıcı kayıt sayfası",
    metaTitle: "Kayıt Ol - Microsoft Onay Sistemi",
    metaDesc: "Microsoft Onay Sistemi'ne kayıt olun ve hizmetlerimizden yararlanın.",
    content: {
      hero: {
        title: "Hemen Kayıt Olun",
        description: "Microsoft Onay Sistemi'ne üye olarak avantajlardan yararlanın",
        imageUrl: "/images/register-hero.jpg"
      },
      features: [
        {
          title: "Hızlı Kayıt",
          description: "Birkaç adımda hesabınızı oluşturun",
          icon: "user-plus"
        },
        {
          title: "Güvenli Hesap",
          description: "Güvenli ve korumalı hesap",
          icon: "shield"
        },
        {
          title: "Özel Teklifler",
          description: "Üyelere özel kampanya ve indirimler",
          icon: "gift"
        }
      ]
    },
    isActive: true
  },
  {
    pageKey: "ornek-sayfa",
    title: "Örnek Sayfa",
    description: "Sayfa içeriği kullanımı için örnek sayfa",
    metaTitle: "Örnek Sayfa - Microsoft Onay Sistemi",
    metaDesc: "Bu bir örnek sayfadır. Sayfa içeriği yönetim sistemini test etmek için kullanılabilir.",
    content: {
      hero: {
        title: "Örnek Sayfa",
        description: "Bu bir örnek sayfadır",
        buttonText: "Daha Fazla Bilgi",
        imageUrl: "/images/example-hero.jpg"
      },
      features: [
        {
          title: "Özellik 1",
          description: "Örnek özellik açıklaması",
          icon: "star"
        },
        {
          title: "Özellik 2",
          description: "Örnek özellik açıklaması",
          icon: "heart"
        },
        {
          title: "Özellik 3",
          description: "Örnek özellik açıklaması",
          icon: "thumbs-up"
        }
      ]
    },
    isActive: true
  }
];

export async function GET(request: NextRequest) {
  try {
    // Kullanıcı oturumunu kontrol et
    const session = await getServerSession(authOptions);
    
    // Kullanıcı giriş yapmamışsa veya admin değilse hata döndür
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }
    
    const results = {
      created: 0,
      updated: 0,
      errors: 0,
      details: [] as string[]
    };
    
    // Tüm sayfa içeriklerini ekle veya güncelle
    for (const content of pageContents) {
      try {
        // Önce bu pageKey ile içerik var mı kontrol et
        const existingContent = await prisma.pageContent.findUnique({
          where: {
            pageKey: content.pageKey
          }
        });
        
        if (existingContent) {
          // Mevcut içeriği güncelle
          await prisma.pageContent.update({
            where: {
              id: existingContent.id
            },
            data: {
              title: content.title,
              description: content.description,
              metaTitle: content.metaTitle,
              metaDesc: content.metaDesc,
              content: content.content,
              isActive: content.isActive
            }
          });
          
          results.updated++;
          results.details.push(`"${content.pageKey}" içeriği güncellendi.`);
        } else {
          // Yeni içerik oluştur
          await prisma.pageContent.create({
            data: content
          });
          
          results.created++;
          results.details.push(`"${content.pageKey}" içeriği oluşturuldu.`);
        }
      } catch (error) {
        results.errors++;
        results.details.push(`"${content.pageKey}" içeriği işlenirken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `İşlem tamamlandı. ${results.created} içerik oluşturuldu, ${results.updated} içerik güncellendi, ${results.errors} hata oluştu.`,
      results
    });
  } catch (error) {
    console.error('Sayfa içerikleri oluşturulurken hata:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Sayfa içerikleri oluşturulurken bir hata oluştu',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
} 