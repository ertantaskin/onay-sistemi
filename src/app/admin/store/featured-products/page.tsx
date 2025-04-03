"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  HiOutlineExclamation,
  HiOutlinePhotograph,
  HiOutlineEye,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineRefresh,
  HiOutlineSave,
  HiOutlineArrowUp,
  HiOutlineArrowDown
} from "react-icons/hi";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  categoryId: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  category: {
    id: string;
    name: string;
  };
  featuredProductOrder?: {
    id: string;
    displayOrder: number;
  } | null;
}

interface ProductItemProps {
  product: Product;
  onToggleFeatured: (id: string, featured: boolean) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  index: number;
  isFirst: boolean;
  isLast: boolean;
}

// Ürün öğesi bileşeni (liste öğesi olarak)
function ProductItem({ product, onToggleFeatured, onMoveUp, onMoveDown, index, isFirst, isLast }: ProductItemProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border mb-3 ${product.isFeatured ? 'border-blue-400 dark:border-blue-600' : 'border-gray-200 dark:border-gray-700'}`}
    >
      <div className="flex flex-col md:flex-row">
        {/* Sıralama bilgisi ve butonları (sadece öne çıkan ürünlerde gösterilir) */}
        {product.isFeatured && (
          <div className="flex items-center justify-center md:w-16 bg-blue-50 dark:bg-blue-900/20 p-2 md:py-4">
            <div className="flex flex-col items-center">
              <span className="text-blue-600 dark:text-blue-400 font-bold text-lg mb-2">{index + 1}</span>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => onMoveUp(product.id)}
                  disabled={isFirst}
                  className={`p-1.5 rounded-md ${
                    isFirst
                      ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-800/50 dark:text-blue-300 dark:hover:bg-blue-700/60'
                  }`}
                  title="Yukarı Taşı"
                >
                  <HiOutlineArrowUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onMoveDown(product.id)}
                  disabled={isLast}
                  className={`p-1.5 rounded-md ${
                    isLast
                      ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-800/50 dark:text-blue-300 dark:hover:bg-blue-700/60'
                  }`}
                  title="Aşağı Taşı"
                >
                  <HiOutlineArrowDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Ürün resmi */}
        <div className="md:w-24 h-24 relative bg-gray-100 dark:bg-gray-700 flex-shrink-0">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              layout="fill"
              objectFit="contain"
              className="p-2"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <HiOutlinePhotograph className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Ürün bilgileri */}
        <div className="p-4 flex-grow">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-blue-600 dark:text-blue-400 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 rounded-full">{product.category?.name}</span>
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  product.isActive 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {product.isActive ? "Aktif" : "Pasif"}
                </span>
              </div>
              <h3 className="font-medium text-base mb-1">{product.name}</h3>
              <div className="flex items-center gap-4 text-sm">
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(product.price)}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  Stok: {product.stock}
                </span>
              </div>
            </div>

            {/* Öne çıkarma ve görüntüleme kontrolleri */}
            <div className="flex items-center gap-2">
              <Link 
                href={`/store/product/${product.id}`} 
                target="_blank"
                className="flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-xs"
              >
                <HiOutlineEye className="w-3.5 h-3.5" />
                <span>Görüntüle</span>
              </Link>
              
              <button
                onClick={() => onToggleFeatured(product.id, !product.isFeatured)}
                className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-xs ${
                  product.isFeatured
                    ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-800/50'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-800/50'
                }`}
              >
                {product.isFeatured ? (
                  <>
                    <HiOutlineX className="w-3.5 h-3.5" />
                    <span>Kaldır</span>
                  </>
                ) : (
                  <>
                    <HiOutlineCheck className="w-3.5 h-3.5" />
                    <span>Ekle</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md"
                title={expanded ? "Detayları Gizle" : "Detayları Göster"}
              >
                {expanded ? <HiOutlineChevronUp className="w-4 h-4" /> : <HiOutlineChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          {/* Genişletilmiş içerik - Ürün açıklaması */}
          {expanded && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FeaturedProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'all' | 'featured' | 'notFeatured'>('all');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/store/featured-products");
      if (!response.ok) {
        throw new Error("Ürünler yüklenirken bir hata oluştu");
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Ürünler yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // Filtreleme işlemi
    let filtered = [...products];
    
    // Arama terimine göre filtrele
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchLower) || 
        product.description.toLowerCase().includes(searchLower) ||
        product.category?.name.toLowerCase().includes(searchLower)
      );
    }
    
    // Görüntüleme moduna göre filtrele
    if (viewMode === 'featured') {
      filtered = filtered.filter(product => product.isFeatured);
    } else if (viewMode === 'notFeatured') {
      filtered = filtered.filter(product => !product.isFeatured);
    }
    
    // Sonuçları görüntüleme moduna göre sırala
    if (viewMode === 'featured' || viewMode === 'all') {
      // Öne çıkan ürünleri ilk önce göster
      filtered.sort((a, b) => {
        // Öne çıkan ürünleri önce göster
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        
        // Öne çıkan ürünler arasında sıralama
        if (a.isFeatured && b.isFeatured) {
          // Sıralama bilgisi varsa ona göre
          if (a.featuredProductOrder && b.featuredProductOrder) {
            return a.featuredProductOrder.displayOrder - b.featuredProductOrder.displayOrder;
          }
          if (a.featuredProductOrder && !b.featuredProductOrder) return -1;
          if (!a.featuredProductOrder && b.featuredProductOrder) return 1;
        }
        
        // Son olarak isme göre
        return a.name.localeCompare(b.name);
      });
    } else {
      // Diğer durumda isimlere göre sırala
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    setFilteredProducts(filtered);
  }, [products, searchTerm, viewMode]);

  const handleToggleFeatured = (id: string, featured: boolean) => {
    setProducts(prevProducts => {
      const updatedProducts = prevProducts.map(product => 
        product.id === id 
          ? { 
              ...product, 
              isFeatured: featured,
              // Eğer öne çıkan yapılıyorsa ve önceden sıralama bilgisi yoksa, en üste ekle
              featuredProductOrder: featured && !product.featuredProductOrder 
                ? { 
                    id: 'temp', 
                    displayOrder: 1
                  } 
                : product.featuredProductOrder
            } 
          : product
      );
      
      // Yeni eklenen ürün için tüm mevcut öne çıkan ürünlerin sıralamasını güncelle
      if (featured) {
        // Tüm diğer öne çıkan ürünlerin sırasını bir artır
        return updatedProducts.map(product => {
          if (product.id !== id && product.isFeatured && product.featuredProductOrder) {
            return {
              ...product,
              featuredProductOrder: {
                ...product.featuredProductOrder,
                displayOrder: product.featuredProductOrder.displayOrder + 1
              }
            };
          }
          return product;
        });
      }
      
      // Öne çıkarması kaldırıldıysa
      if (!featured) {
        // Kaldırılan ürünün sıralama numarasını bul
        const removedProduct = prevProducts.find(p => p.id === id);
        const removedOrder = removedProduct?.featuredProductOrder?.displayOrder;
        
        if (removedOrder) {
          // Bu sıradan sonraki tüm ürünlerin sırasını bir azalt
          return updatedProducts.map(product => {
            if (product.isFeatured && product.featuredProductOrder && product.featuredProductOrder.displayOrder > removedOrder) {
              return {
                ...product,
                featuredProductOrder: {
                  ...product.featuredProductOrder,
                  displayOrder: product.featuredProductOrder.displayOrder - 1
                }
              };
            }
            return product;
          });
        }
      }
      
      return updatedProducts;
    });
  };

  // Ürünü yukarı taşı (sırasını bir azalt)
  const handleMoveUp = (id: string) => {
    setProducts(prevProducts => {
      const product = prevProducts.find(p => p.id === id);
      if (!product || !product.isFeatured || !product.featuredProductOrder) return prevProducts;
      
      const currentOrder = product.featuredProductOrder.displayOrder;
      if (currentOrder <= 1) return prevProducts; // Zaten en üstte
      
      // Bir üstteki ürünü bul
      const swapProduct = prevProducts.find(p => 
        p.isFeatured && 
        p.featuredProductOrder && 
        p.featuredProductOrder.displayOrder === currentOrder - 1
      );
      
      if (!swapProduct) return prevProducts;
      
      // Ürünlerin yerini değiştir
      return prevProducts.map(p => {
        if (p.id === id && p.featuredProductOrder) {
          return {
            ...p,
            featuredProductOrder: {
              ...p.featuredProductOrder,
              displayOrder: currentOrder - 1
            }
          };
        }
        if (p.id === swapProduct.id && p.featuredProductOrder) {
          return {
            ...p,
            featuredProductOrder: {
              ...p.featuredProductOrder,
              displayOrder: currentOrder
            }
          };
        }
        return p;
      });
    });
  };
  
  // Ürünü aşağı taşı (sırasını bir artır)
  const handleMoveDown = (id: string) => {
    setProducts(prevProducts => {
      const product = prevProducts.find(p => p.id === id);
      if (!product || !product.isFeatured || !product.featuredProductOrder) return prevProducts;
      
      const currentOrder = product.featuredProductOrder.displayOrder;
      const maxOrder = prevProducts.filter(p => p.isFeatured).length;
      if (currentOrder >= maxOrder) return prevProducts; // Zaten en altta
      
      // Bir alttaki ürünü bul
      const swapProduct = prevProducts.find(p => 
        p.isFeatured && 
        p.featuredProductOrder && 
        p.featuredProductOrder.displayOrder === currentOrder + 1
      );
      
      if (!swapProduct) return prevProducts;
      
      // Ürünlerin yerini değiştir
      return prevProducts.map(p => {
        if (p.id === id && p.featuredProductOrder) {
          return {
            ...p,
            featuredProductOrder: {
              ...p.featuredProductOrder,
              displayOrder: currentOrder + 1
            }
          };
        }
        if (p.id === swapProduct.id && p.featuredProductOrder) {
          return {
            ...p,
            featuredProductOrder: {
              ...p.featuredProductOrder,
              displayOrder: currentOrder
            }
          };
        }
        return p;
      });
    });
  };

  const saveChanges = async () => {
    try {
      setSaving(true);
      
      // Ürünleri sıralama bilgisiyle birlikte gönder
      const productsData = products.map(product => ({
        id: product.id,
        isFeatured: product.isFeatured,
        displayOrder: product.isFeatured && product.featuredProductOrder 
          ? product.featuredProductOrder.displayOrder 
          : null
      }));
      
      const response = await fetch("/api/admin/store/featured-products", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ products: productsData }),
      });

      if (!response.ok) {
        throw new Error("Değişiklikler kaydedilirken bir hata oluştu");
      }
      
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error("Değişiklikler kaydedilirken hata:", error);
      alert("Değişiklikler kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Öne Çıkan Ürünler Yönetimi</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Mağaza ana sayfasında gösterilecek öne çıkan ürünleri seçin ve sıralayın
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={fetchProducts}
            disabled={loading}
            className="flex items-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm"
            title="Listeyi Yenile"
          >
            <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Yenile</span>
          </button>
          
          <button
            onClick={saveChanges}
            disabled={saving}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-white ${
              saveSuccess
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {saving ? (
              <>
                <HiOutlineRefresh className="w-4 h-4 animate-spin" />
                <span>Kaydediliyor...</span>
              </>
            ) : saveSuccess ? (
              <>
                <HiOutlineCheck className="w-4 h-4" />
                <span>Kaydedildi!</span>
              </>
            ) : (
              <>
                <HiOutlineSave className="w-4 h-4" />
                <span>Değişiklikleri Kaydet</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Ürün adı, açıklama veya kategori ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </div>
        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('all')}
            className={`px-4 py-2 text-sm ${
              viewMode === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            Tümü
          </button>
          <button
            onClick={() => setViewMode('featured')}
            className={`px-4 py-2 text-sm ${
              viewMode === 'featured' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            Öne Çıkanlar
          </button>
          <button
            onClick={() => setViewMode('notFeatured')}
            className={`px-4 py-2 text-sm ${
              viewMode === 'notFeatured' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            Diğer Ürünler
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          {filteredProducts.map((product, index) => {
            // Öne çıkan ürünler listesini oluştur
            const featuredProducts = filteredProducts.filter(p => p.isFeatured);
            
            // Öne çıkan ürünler arasında doğru sıralama pozisyonunu hesapla
            const featuredIndex = product.isFeatured 
              ? featuredProducts.findIndex(p => p.id === product.id)
              : -1;
            
            const isFirst = featuredIndex === 0;
            const isLast = featuredIndex === featuredProducts.length - 1;
            
            return (
              <ProductItem
                key={product.id}
                product={product}
                onToggleFeatured={handleToggleFeatured}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                index={product.featuredProductOrder?.displayOrder 
                  ? product.featuredProductOrder.displayOrder - 1 
                  : featuredIndex}
                isFirst={isFirst}
                isLast={isLast}
              />
            );
          })}
          
          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <HiOutlineExclamation className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Ürün bulunamadı</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                {searchTerm 
                  ? "Arama kriterlerinize uygun ürün bulunamadı. Lütfen farklı bir arama terimi deneyin."
                  : "Henüz ürün bulunmamaktadır. Ürün eklemek için Ürünler sayfasını ziyaret edin."}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/50"
                >
                  Aramayı Temizle
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 