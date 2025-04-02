"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2, ShoppingCart, ArrowLeft, Package, AlertCircle, CheckCircle, Clock, Shield, ChevronDown, Heart, Star, Eye } from "lucide-react";
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
  isOnSale: boolean;
  originalPrice?: number;
  brand?: string;
  reviewCount?: number;
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
  const [sortOption, setSortOption] = useState("");
  const [filterOption, setFilterOption] = useState("");

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

          {/* Ürün listesi */}
          <div className="mt-8">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="text-center">
                  <Loader2 className="h-10 w-10 animate-spin text-blue-500 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Ürünler yükleniyor...</p>
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className={`text-center py-16 px-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                </div>
                <h3 className="text-lg font-bold mb-2">Bu kategoride henüz ürün bulunmamaktadır</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md mx-auto">
                  Ürünler yakında eklenecektir. Lütfen daha sonra tekrar kontrol ediniz.
                </p>
                <Link 
                  href="/store" 
                  className="mt-6 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Mağazaya Dön
                </Link>
              </div>
            ) : (
              <>
                {/* Ürün filtreleme ve sıralama seçenekleri */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">{products.length} ürün bulundu</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <div className="relative">
                      <select 
                        value={sortOption} 
                        onChange={(e) => setSortOption(e.target.value)}
                        className={`pl-3 pr-8 py-2 text-sm rounded-lg border ${
                          theme === 'dark' 
                            ? 'bg-gray-800 border-gray-700 text-gray-200' 
                            : 'bg-white border-gray-300 text-gray-700'
                        } appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="">Sıralama</option>
                        <option value="price-asc">Fiyat (Düşükten Yükseğe)</option>
                        <option value="price-desc">Fiyat (Yüksekten Düşüğe)</option>
                        <option value="name-asc">İsim (A-Z)</option>
                        <option value="name-desc">İsim (Z-A)</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="relative">
                      <select 
                        value={filterOption} 
                        onChange={(e) => setFilterOption(e.target.value)}
                        className={`pl-3 pr-8 py-2 text-sm rounded-lg border ${
                          theme === 'dark' 
                            ? 'bg-gray-800 border-gray-700 text-gray-200' 
                            : 'bg-white border-gray-300 text-gray-700'
                        } appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="">Filtrele</option>
                        <option value="in-stock">Stokta Var</option>
                        <option value="on-sale">İndirimde</option>
                        <option value="new">Yeni Ürünler</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Ürün grid görünümü - Mobil uyumlu */}
                <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                  {products.map((product) => (
                    <div 
                      key={product.id} 
                      className={`group relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ${
                        theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                      }`}
                    >
                      <div className="relative h-36 xs:h-40 md:h-48 overflow-hidden bg-gray-100 dark:bg-gray-900">
                        {product.isOnSale && (
                          <div className="absolute top-2 left-2 z-10">
                            <div className="bg-red-600 text-white text-[10px] xs:text-xs px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full font-medium">İndirimde</div>
                          </div>
                        )}
                        <div className="absolute top-2 right-2 z-10">
                          <button className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 flex items-center justify-center">
                            <Heart className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4 text-gray-400 hover:text-red-500" />
                          </button>
                        </div>
                        <Image
                          src={product.imageUrl || "/images/product-placeholder.png"}
                          alt={product.name}
                          className="object-contain w-full h-full p-4 transition-transform duration-300 group-hover:scale-105"
                          width={300}
                          height={300}
                          onError={(e) => {
                            e.currentTarget.src = "/images/product-placeholder.png";
                          }}
                        />
                      </div>
                      <div className="p-2 xs:p-3 sm:p-4">
                        <div className="mb-1 xs:mb-2 flex justify-between items-start">
                          <div>
                            <span className="text-[10px] xs:text-xs font-medium text-blue-600 dark:text-blue-400 mb-0.5 block">{product.brand || "Microsoft"}</span>
                            <h3 className="font-medium text-xs sm:text-sm">{product.name}</h3>
                          </div>
                          <div className="flex flex-col items-end">
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-[10px] xs:text-xs line-through text-gray-500">₺{product.originalPrice}</span>
                            )}
                            <span className="text-sm xs:text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">₺{product.price}</span>
                          </div>
                        </div>
                        <div className="flex items-center text-amber-500 mb-1 xs:mb-2">
                          <Star className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-3.5 sm:w-3.5 fill-current" />
                          <Star className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-3.5 sm:w-3.5 fill-current" />
                          <Star className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-3.5 sm:w-3.5 fill-current" />
                          <Star className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-3.5 sm:w-3.5 fill-current" />
                          <Star className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-3.5 sm:w-3.5 fill-current" />
                          <span className="text-[10px] xs:text-xs text-gray-500 dark:text-gray-400 ml-1">({product.reviewCount || "0"})</span>
                        </div>
                        <p className="text-[10px] xs:text-xs text-gray-600 dark:text-gray-400 mb-2 xs:mb-3 sm:mb-4 line-clamp-2">
                          {product.description || "Orijinal lisans, e-posta ile anında teslimat."}
                        </p>
                        <div className="flex space-x-1 xs:space-x-2">
                          <button 
                            onClick={() => handleAddToCart(product.id)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1 xs:py-1.5 sm:py-2 px-2 xs:px-3 sm:px-4 rounded-md flex items-center justify-center transition-colors text-[10px] xs:text-xs sm:text-sm"
                          >
                            <ShoppingCart className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4 mr-1 xs:mr-1.5 sm:mr-2" />
                            Sepete Ekle
                          </button>
                          <Link href={`/store/product/${product.id}`}>
                            <button className="flex-shrink-0 border rounded-md p-1 xs:p-1.5 sm:p-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                              <Eye className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4 text-gray-700 dark:text-gray-300" />
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
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