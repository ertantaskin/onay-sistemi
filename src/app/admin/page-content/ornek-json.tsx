"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";

// Örnek JSON yapıları
const ornekJsonYapilari = [
  {
    baslik: "Anasayfa İçeriği",
    key: "home",
    json: {
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
    }
  },
  {
    baslik: "Hakkımızda Sayfası",
    key: "about",
    json: {
      hero: {
        title: "Hakkımızda",
        description: "Microsoft onay sistemleri konusunda uzman ekibimizle hizmetinizdeyiz",
        imageUrl: "/images/about-hero.jpg"
      },
      mission: {
        title: "Misyonumuz",
        description: "Müşterilerimize en hızlı ve güvenilir Microsoft onay hizmetini sunmak"
      },
      vision: {
        title: "Vizyonumuz",
        description: "Dijital lisanslama alanında Türkiye'nin lider platformu olmak"
      },
      team: [
        {
          name: "Mehmet Kaya",
          role: "Kurucu & CEO",
          bio: "10+ yıl Microsoft lisanslama deneyimi",
          avatar: "/images/team/ceo.jpg"
        },
        {
          name: "Zeynep Şahin",
          role: "Teknik Direktör",
          bio: "Microsoft sertifikalı uzman",
          avatar: "/images/team/cto.jpg"
        },
        {
          name: "Ali Yıldız",
          role: "Müşteri Hizmetleri Müdürü",
          bio: "7+ yıl müşteri deneyimi yönetimi",
          avatar: "/images/team/customer-service.jpg"
        }
      ],
      history: {
        title: "Tarihçemiz",
        timeline: [
          { year: "2015", event: "Şirketimizin kuruluşu" },
          { year: "2017", event: "Microsoft Silver Partner statüsü" },
          { year: "2019", event: "Online platform lansmanı" },
          { year: "2021", event: "10,000+ müşteri sayısına ulaşma" },
          { year: "2023", event: "Microsoft Gold Partner statüsü" }
        ]
      }
    }
  },
  {
    baslik: "SSS Sayfası",
    key: "faq",
    json: {
      hero: {
        title: "Sıkça Sorulan Sorular",
        description: "Microsoft onay sistemi hakkında merak edilenler"
      },
      categories: [
        {
          title: "Genel Sorular",
          questions: [
            {
              question: "Microsoft onay sistemi nedir?",
              answer: "Microsoft onay sistemi, Microsoft ürünlerinin lisanslarını doğrulamak için kullanılan bir sistemdir."
            },
            {
              question: "Onay işlemi ne kadar sürer?",
              answer: "Onay işlemi genellikle birkaç dakika içinde tamamlanır."
            },
            {
              question: "Hangi ödeme yöntemlerini kabul ediyorsunuz?",
              answer: "Kredi kartı, banka havalesi ve online ödeme sistemlerini kabul ediyoruz."
            }
          ]
        },
        {
          title: "Teknik Sorular",
          questions: [
            {
              question: "IID numarası nedir?",
              answer: "IID (Installation ID) numarası, Microsoft ürününüzün kurulumu sırasında oluşturulan benzersiz bir tanımlayıcıdır."
            },
            {
              question: "Onay numarasını nasıl kullanırım?",
              answer: "Onay numarasını Microsoft ürününüzün aktivasyon ekranında ilgili alana girmeniz yeterlidir."
            },
            {
              question: "Onay numarası kaç kez kullanılabilir?",
              answer: "Her onay numarası yalnızca bir kez ve belirli bir IID numarası için kullanılabilir."
            }
          ]
        }
      ]
    }
  },
  {
    baslik: "İletişim Sayfası",
    key: "contact",
    json: {
      hero: {
        title: "İletişim",
        description: "Sorularınız için bizimle iletişime geçin"
      },
      contactInfo: {
        email: "info@onaysistemi.com",
        phone: "+90 212 123 4567",
        address: "Merkez Mah. Teknoloji Cad. No:1, İstanbul"
      },
      workingHours: {
        weekdays: "09:00 - 18:00",
        saturday: "10:00 - 14:00",
        sunday: "Kapalı"
      },
      socialMedia: {
        twitter: "https://twitter.com/onaysistemi",
        facebook: "https://facebook.com/onaysistemi",
        instagram: "https://instagram.com/onaysistemi"
      },
      mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!..."
    }
  }
];

export default function OrnekJsonYapilari() {
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleCopyJson = (index: number) => {
    const jsonString = JSON.stringify(ornekJsonYapilari[index].json, null, 2);
    navigator.clipboard.writeText(jsonString);
    toast.success("JSON kopyalandı!");
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri Dön
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
        <h1 className="text-2xl font-bold mb-6">Örnek JSON Yapıları</h1>
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          Aşağıdaki örnek JSON yapılarını sayfa içeriklerinizi oluştururken kullanabilirsiniz. 
          İstediğiniz yapıyı kopyalayıp, sayfa içeriği düzenleme sayfasındaki JSON editörüne yapıştırabilirsiniz.
        </p>

        <div className="space-y-4">
          {ornekJsonYapilari.map((ornek, index) => (
            <div 
              key={index} 
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              <div 
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 cursor-pointer"
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              >
                <div>
                  <h3 className="font-medium">{ornek.baslik}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Sayfa Anahtarı: {ornek.key}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyJson(index);
                    }}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-xs font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Copy className="mr-1 h-3 w-3" />
                    Kopyala
                  </button>
                  {expandedIndex === index ? (
                    <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  )}
                </div>
              </div>
              
              {expandedIndex === index && (
                <div className="p-4 bg-gray-100 dark:bg-gray-800 overflow-auto">
                  <pre className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {JSON.stringify(ornek.json, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 