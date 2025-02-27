"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2, ShoppingCart, ArrowLeft, Package, AlertCircle, CheckCircle, Clock, Shield } from "lucide-react";
import { useTheme } from "@/app/ThemeContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";
import { useCartStore } from '@/store/cartStore';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  stock: number;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
}

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;
  const { theme } = useTheme();

  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const { updateCartItemCount } = useCartStore();

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      try {
        // Kategori bilgilerini al
        const categoryResponse = await fetch(`/api/store/categories/${categoryId}`);
        if (!categoryResponse.ok) {
          throw new Error("Kategori bilgileri yüklenirken bir hata oluştu");
        }
        const categoryData = await categoryResponse.json();
        setCategory(categoryData);

        // Ürünleri al
        const productsResponse = await fetch(`/api/store/categories/${categoryId}/products`);
        if (!productsResponse.ok) {
          throw new Error("Ürünler yüklenirken bir hata oluştu");
        }
        const productsData = await productsResponse.json();
        setProducts(productsData);
      } catch (error) {
        console.error("Veri yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchCategoryAndProducts();
    }
  }, [categoryId]);

  const handleAddToCart = async (productId: string) => {
    setAddingToCart(productId);
    try {
      const response = await fetch("/api/store/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Ürün sepete eklenirken bir hata oluştu");
      }

      // Sepet sayısını güncelle
      updateCartItemCount();

      // Başarılı ekleme sonrası kullanıcıya bildirim göster
      const notification = document.createElement('div');
      notification.className = `fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-up`;
      notification.textContent = "✓ Ürün sepete eklendi!";
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.classList.add('animate-fade-out');
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 300);
      }, 3000);
      
    } catch (error) {
      console.error("Sepete eklerken hata:", error);
      alert("Ürün sepete eklenirken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setAddingToCart(null);
    }
  };

  // Kategori adına göre arka plan rengini belirle
  const getCategoryGradient = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('windows')) {
      return 'from-blue-600 to-blue-800';
    } else if (name.includes('office')) {
      return 'from-orange-500 to-red-600';
    } else if (name.includes('epin') || name.includes('gift')) {
      return 'from-green-600 to-green-800';
    } else if (name.includes('server')) {
      return 'from-purple-600 to-purple-800';
    } else {
      return 'from-blue-600 to-indigo-700';
    }
  };

  // Kategori adına göre ikon belirle
  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('windows')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/>
        </svg>
      );
    } else if (name.includes('office')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23 1.5q.41 0 .7.3.3.29.3.7v19q0 .41-.3.7-.29.3-.7.3H7q-.41 0-.7-.3-.3-.29-.3-.7V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h5V2.5q0-.41.3-.7.29-.3.7-.3zM6 13.28l1.42 2.66h2.14l-1.74-3.48 1.74-3.6H7.46L6 11.38l-.46-2.52H3.4l-.9 3.6L1.6 15.94h2.04zM14.25 22.5v-19h-7.5v5H9v9h-2.5v5z"/>
        </svg>
      );
    } else if (name.includes('epin') || name.includes('gift')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      );
    } else {
      return <Package className="h-10 w-10 text-white" />;
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <Header />
        <div className="pt-20 flex justify-center items-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-lg">Yükleniyor...</p>
          </div>
        </div>
        <Footer />
        <Toaster 
          position="top-right"
          toastOptions={{
            className: theme === 'dark' ? '!bg-gray-800 !text-white' : '',
          }}
        />
      </div>
    );
  }

  if (!category) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <Header />
        <div className="pt-20 container mx-auto px-4 py-16 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Kategori Bulunamadı</h1>
          <p className="text-lg mb-8 max-w-md mx-auto">Aradığınız kategori bulunamadı veya kaldırılmış olabilir.</p>
          <Link 
            href="/store" 
            className={`inline-flex items-center px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 ${
              theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Mağazaya Dön
          </Link>
        </div>
        <Footer />
        <Toaster 
          position="top-right"
          toastOptions={{
            className: theme === 'dark' ? '!bg-gray-800 !text-white' : '',
          }}
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Header />
      <div className="pt-20">
        {/* Kategori Banner */}
        <div className={`bg-gradient-to-r ${getCategoryGradient(category.name)} relative overflow-hidden`}>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] bg-center"></div>
          </div>
          <div className="container mx-auto px-4 py-12 relative z-10">
            <Link 
              href="/store" 
              className="inline-flex items-center text-white/80 hover:text-white mb-4 group transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
              <span>Tüm Kategoriler</span>
            </Link>
            
            <div className="flex items-center">
              <div className="mr-4 bg-white/10 backdrop-blur-sm p-3 rounded-full">
                {getCategoryIcon(category.name)}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">{category.name}</h1>
                {category.description && (
                  <p className="text-white/80 mt-2 text-lg max-w-2xl">{category.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Ürün Özellikleri */}
          <div className="mb-12 mt-8">
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <div className="flex items-start">
                <div className="mr-3 mt-1">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">%100 Orijinal Ürünler</h3>
                  <p className="text-sm opacity-80">Tüm ürünlerimiz orijinal Microsoft lisanslarıdır.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mr-3 mt-1">
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Anında Teslimat</h3>
                  <p className="text-sm opacity-80">Ödemeniz onaylandıktan sonra anında teslim edilir.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mr-3 mt-1">
                  <Shield className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Ömür Boyu Garanti</h3>
                  <p className="text-sm opacity-80">Tüm lisanslarımız ömür boyu garantilidir.</p>
                </div>
              </div>
            </div>
          </div>

          {products.length === 0 ? (
            <div className={`text-center py-16 px-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-xl font-medium mb-4">Bu kategoride henüz ürün bulunmamaktadır</p>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Lütfen daha sonra tekrar kontrol ediniz veya diğer kategorilere göz atınız.
              </p>
              <Link 
                href="/store" 
                className={`inline-flex items-center px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 ${
                  theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Diğer Kategorilere Göz At
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <div 
                  key={product.id} 
                  className={`rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                    theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'
                  }`}
                >
                  <div className="relative">
                    {product.imageUrl ? (
                      <div className="relative h-48 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-contain p-2"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center">
                        {category.name.toLowerCase().includes('windows') ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/>
                          </svg>
                        ) : category.name.toLowerCase().includes('office') ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23 1.5q.41 0 .7.3.3.29.3.7v19q0 .41-.3.7-.29.3-.7.3H7q-.41 0-.7-.3-.3-.29-.3-.7V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h5V2.5q0-.41.3-.7.29-.3.7-.3zM6 13.28l1.42 2.66h2.14l-1.74-3.48 1.74-3.6H7.46L6 11.38l-.46-2.52H3.4l-.9 3.6L1.6 15.94h2.04zM14.25 22.5v-19h-7.5v5H9v9h-2.5v5z"/>
                          </svg>
                        ) : (
                          <Package className="h-20 w-20 text-white" />
                        )}
                      </div>
                    )}
                    
                    {/* Stok durumu etiketi */}
                    {product.stock <= 5 && (
                      <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        <span>Son {product.stock} ürün!</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-2">{product.name}</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{product.description}</p>
                    
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-auto">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          {product.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                        </span>
                        <button
                          onClick={() => handleAddToCart(product.id)}
                          disabled={product.stock <= 0 || addingToCart === product.id}
                          className={`flex items-center space-x-1 py-2 px-4 rounded-lg transition-all duration-200 ${
                            product.stock > 0
                              ? addingToCart === product.id
                                ? "bg-blue-700 text-white cursor-wait"
                                : "bg-blue-600 hover:bg-blue-700 text-white transform hover:-translate-y-1 hover:shadow-md"
                              : "bg-gray-400 cursor-not-allowed text-gray-200"
                          }`}
                        >
                          {addingToCart === product.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <ShoppingCart className="h-4 w-4 mr-1" />
                          )}
                          <span>{product.stock > 0 ? "Sepete Ekle" : "Stokta Yok"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
      <Toaster 
        position="top-right"
        toastOptions={{
          className: theme === 'dark' ? '!bg-gray-800 !text-white' : '',
        }}
      />
    </div>
  );
}

// CSS animasyonları için global.css'e eklenecek stiller:
// @keyframes fadeInUp {
//   from {
//     opacity: 0;
//     transform: translateY(20px);
//   }
//   to {
//     opacity: 1;
//     transform: translateY(0);
//   }
// }
// 
// @keyframes fadeOut {
//   from {
//     opacity: 1;
//   }
//   to {
//     opacity: 0;
//   }
// }
// 
// .animate-fade-in-up {
//   animation: fadeInUp 0.3s ease-out forwards;
// }
// 
// .animate-fade-out {
//   animation: fadeOut 0.3s ease-out forwards;
// } 