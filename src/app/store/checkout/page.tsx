"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, CreditCard, Wallet, ShoppingCart, Shield, CheckCircle2, Clock, AlertCircle, User, Lock, Mail, UserPlus, CheckCircle, KeyRound, BadgeCheck, LogIn, Store, Users, CreditCard as CreditCardIcon, Home, ExternalLink, UserCheck, TabletSmartphone, LayoutGrid, Eye, EyeOff, Edit, MapPin, Phone, X } from "lucide-react";
import { useSession, signIn } from "next-auth/react";
import { useTheme } from "@/app/ThemeContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toaster, toast } from "react-hot-toast";
import { useCartStore } from '@/store/cartStore';

interface Product {
  id: string;
  name: string;
  imageUrl?: string;
  stock: number;
}

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: Product;
}

interface Cart {
  id: string | null;
  totalPrice: number;
  items: CartItem[];
  isGuestCart?: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  provider?: string;
}

// Fatura detayları için interface
interface BillingDetails {
  fullName: string;
  country: string;
  city: string;
  phone: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { theme } = useTheme();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingCheckout, setProcessingCheckout] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [userCredits, setUserCredits] = useState<number>(0);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);
  const { updateCartItemCount } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Fatura detayları için state'ler
  const [billingDetails, setBillingDetails] = useState<BillingDetails>({
    fullName: "",
    country: "",
    city: "",
    phone: ""
  });
  const [showBillingForm, setShowBillingForm] = useState(false);
  const [isEditingBilling, setIsEditingBilling] = useState(false);
  const [highlightBilling, setHighlightBilling] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  
  // Ülke listesi
  const countries = [
    { code: "TR", name: "Türkiye" },
    { code: "US", name: "Amerika Birleşik Devletleri" },
    { code: "GB", name: "Birleşik Krallık" },
    { code: "DE", name: "Almanya" },
    { code: "FR", name: "Fransa" },
    { code: "IT", name: "İtalya" },
    { code: "ES", name: "İspanya" },
    { code: "NL", name: "Hollanda" },
    { code: "BE", name: "Belçika" },
    { code: "AT", name: "Avusturya" },
    { code: "CH", name: "İsviçre" },
    { code: "SE", name: "İsveç" },
    { code: "NO", name: "Norveç" },
    { code: "DK", name: "Danimarka" },
    { code: "FI", name: "Finlandiya" },
    { code: "PL", name: "Polonya" },
    { code: "CZ", name: "Çek Cumhuriyeti" },
    { code: "SK", name: "Slovakya" },
    { code: "HU", name: "Macaristan" },
    { code: "RO", name: "Romanya" },
    { code: "BG", name: "Bulgaristan" },
    { code: "GR", name: "Yunanistan" },
    { code: "PT", name: "Portekiz" },
    { code: "IE", name: "İrlanda" },
    { code: "LU", name: "Lüksemburg" },
    { code: "MT", name: "Malta" },
    { code: "CY", name: "Kıbrıs" },
    { code: "EE", name: "Estonya" },
    { code: "LV", name: "Letonya" },
    { code: "LT", name: "Litvanya" },
    { code: "SI", name: "Slovenya" },
    { code: "HR", name: "Hırvatistan" },
    { code: "UA", name: "Ukrayna" },
    { code: "RU", name: "Rusya" },
    { code: "BY", name: "Belarus" },
    { code: "MD", name: "Moldova" },
    { code: "AL", name: "Arnavutluk" },
    { code: "MK", name: "Kuzey Makedonya" },
    { code: "ME", name: "Karadağ" },
    { code: "RS", name: "Sırbistan" },
    { code: "BA", name: "Bosna Hersek" },
    { code: "XK", name: "Kosova" },
    { code: "CA", name: "Kanada" },
    { code: "AU", name: "Avustralya" },
    { code: "NZ", name: "Yeni Zelanda" },
    { code: "JP", name: "Japonya" },
    { code: "CN", name: "Çin" },
    { code: "KR", name: "Güney Kore" },
    { code: "IN", name: "Hindistan" },
    { code: "BR", name: "Brezilya" },
    { code: "ZA", name: "Güney Afrika" },
    { code: "AE", name: "Birleşik Arap Emirlikleri" },
    { code: "SA", name: "Suudi Arabistan" },
    { code: "QA", name: "Katar" },
    { code: "KW", name: "Kuveyt" },
    { code: "BH", name: "Bahreyn" },
    { code: "OM", name: "Umman" },
    { code: "IL", name: "İsrail" },
    { code: "LB", name: "Lübnan" },
    { code: "JO", name: "Ürdün" },
    { code: "IQ", name: "Irak" },
    { code: "SY", name: "Suriye" },
    { code: "EG", name: "Mısır" },
    { code: "MA", name: "Fas" },
    { code: "TN", name: "Tunus" },
    { code: "DZ", name: "Cezayir" },
    { code: "LY", name: "Libya" },
    { code: "SD", name: "Sudan" },
    { code: "ET", name: "Etiyopya" },
    { code: "KE", name: "Kenya" },
    { code: "NG", name: "Nijerya" },
    { code: "GH", name: "Gana" },
    { code: "CI", name: "Fildişi Sahili" },
    { code: "SN", name: "Senegal" },
    { code: "CM", name: "Kamerun" },
    { code: "AR", name: "Arjantin" },
    { code: "CL", name: "Şili" },
    { code: "CO", name: "Kolombiya" },
    { code: "PE", name: "Peru" },
    { code: "MX", name: "Meksika" },
    { code: "SG", name: "Singapur" },
    { code: "MY", name: "Malezya" },
    { code: "TH", name: "Tayland" },
    { code: "VN", name: "Vietnam" },
    { code: "ID", name: "Endonezya" },
    { code: "PH", name: "Filipinler" }
  ];
  
  // Başarı ve hata mesajları için state'ler
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Kullanıcı kaydı için state'ler
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [authProcessing, setAuthProcessing] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    // Sayfa yüklendiğinde sepeti getir
    fetchCart();
    
    // Oturum durumu değiştiğinde diğer verileri yükle
    if (status === "authenticated") {
      fetchUserCredits();
      fetchPaymentMethods();
      fetchBillingDetails();
      
      // Başarı mesajı varsa göster
      if (successMessage) {
        toast.success(successMessage);
        setSuccessMessage(null);
      }
    }
    
    // Hata mesajı varsa göster
    if (errorMessage) {
      toast.error(errorMessage);
      setErrorMessage(null);
    }
  }, [status, successMessage, errorMessage]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      // API'ye timestamp ekleyerek cache'i atlayalım
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/store/cart?includeGuest=true&t=${timestamp}`);
      
      if (!response.ok) {
        throw new Error("Sepet yüklenirken bir hata oluştu");
      }
      
      const data = await response.json();
      
      // Debug amacıyla sepet yapısını inceleyelim
      console.log("Alınan sepet verisi:", data);
      
      // Sepet boşsa, sadece uyarı gösterelim ama yönlendirmeyelim
      if (!data || !data.items || data.items.length === 0) {
        // Misafir kullanıcı için farklı bir yaklaşım uygulayalım
        if (status === "unauthenticated") {
          toast.error("Sepetiniz boş görünüyor. Lütfen sepetinize ürün ekleyin veya giriş yapın.");
          // Misafir için boş bir sepet oluşturalım ki sayfa çalışmaya devam etsin
          setCart({
            id: "guest-cart",
            totalPrice: 0,
            items: []
          });
        } else {
          // Giriş yapmış kullanıcılar için uyarı gösterelim
          toast.error("Sepetiniz boş. Alışverişe devam etmek için mağazaya gidebilirsiniz.");
          // Boş sepeti set edelim
          setCart({
            id: data.id || null,
            totalPrice: 0,
            items: []
          });
        }
      } else {
        // Sepet verisi var, state'i güncelleyelim
      setCart(data);
        // Sepetteki ürün sayısını global state'e kaydet
        updateCartItemCount(data.items.reduce((total: number, item: CartItem) => total + item.quantity, 0));
        
        // Misafir sepet ise ve kullanıcı oturum açmışsa, sepet birleştirme işlemini başlat
        if (data.isGuestCart && status === "authenticated") {
          // Sepet birleştirme işlemini başlat
          try {
            await fetch("/api/store/cart/merge", {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            
            // Kısa bir bekleme süresi sonrası sepeti tekrar yükle
            setTimeout(async () => {
              try {
                const newTimestamp = new Date().getTime();
                const refreshResponse = await fetch(`/api/store/cart?t=${newTimestamp}`);
                if (refreshResponse.ok) {
                  const refreshData = await refreshResponse.json();
                  console.log("Sepet birleştirme sonrası güncel sepet:", refreshData);
                  
                  if (refreshData && refreshData.items && refreshData.items.length > 0) {
                    setCart(refreshData);
                    updateCartItemCount(refreshData.items.reduce((total: number, item: CartItem) => total + item.quantity, 0));
                    toast.success("Sepetiniz başarıyla güncellendi!");
                  }
                }
              } catch (refreshError) {
                console.error("Sepet yenileme hatası:", refreshError);
              }
            }, 1000);
          } catch (mergeError) {
            console.error("Otomatik sepet birleştirme hatası:", mergeError);
          }
        }
      }
    } catch (error) {
      console.error("Sepet yüklenirken hata:", error);
      
      // Bağlantı hatası durumunda da misafir kullanıcılar için login formunu gösterelim
      if (status === "unauthenticated") {
        toast.error("Sepet bilgilerinize erişilemiyor. Lütfen giriş yapın veya yeni bir hesap oluşturun.");
        // Misafir için boş bir sepet oluşturalım
        setCart({
          id: "guest-cart",
          totalPrice: 0,
          items: []
        });
      } else {
        setErrorMessage("Sepet bilgileri yüklenirken bir hata oluştu.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCredits = async () => {
    try {
      const response = await fetch("/api/user/credits");
      
      if (!response.ok) {
        throw new Error("Kullanıcı kredileri yüklenirken bir hata oluştu");
      }
      
      const data = await response.json();
      setUserCredits(data.credits);
    } catch (error) {
      console.error("Kullanıcı kredileri yüklenirken hata:", error);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      setLoadingPaymentMethods(true);
      // API yolunu düzeltiyorum - doğru endpoint'in bu olduğunu varsayıyorum
      const response = await fetch("/api/payment-methods");
      
      if (!response.ok) {
        // İlgili endpointe ulaşamama durumunda alternatif yolu deneyelim
        const altResponse = await fetch("/api/store/payment-methods");
        
        if (!altResponse.ok) {
          throw new Error("Ödeme yöntemleri yüklenirken bir hata oluştu");
        }
        
        const data = await altResponse.json();
        setPaymentMethods(data);
        
        // Veri boş değilse varsayılan olarak ilk ödeme yöntemini seç
        if (data.length > 0) {
          setSelectedPaymentMethod(data[0].id);
        }
        return;
      }
      
      const data = await response.json();
      setPaymentMethods(data);
      
      // Varsayılan olarak ilk ödeme yöntemini seç
      if (data.length > 0) {
        setSelectedPaymentMethod(data[0].id);
      }
    } catch (error) {
      console.error("Ödeme yöntemleri yüklenirken hata:", error);
      // Kullanıcıya bilgi verelim
      toast.error("Ödeme yöntemleri yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.");
      
      // Hata durumunda boş bir array ile devam edelim
      setPaymentMethods([]);
    } finally {
      setLoadingPaymentMethods(false);
    }
  };

  const fetchBillingDetails = async () => {
    try {
      // Kullanıcının giriş yapmış olduğundan emin olalım
      if (status !== "authenticated") {
        console.log("Kullanıcı giriş yapmamış, fatura detayları getirilemiyor");
        return;
      }

      const response = await fetch("/api/user/billing-details");
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Fatura detayları yüklenirken bir hata oluştu");
      }
      
      const data = await response.json();
      console.log("Alınan fatura detayları:", data);
      
      // Gelen veriyi set edelim
      setBillingDetails({
        fullName: data.fullName || "",
        country: data.country || "",
        city: data.city || "",
        phone: data.phone || ""
      });
      
    } catch (error) {
      console.error("Fatura detayları yüklenirken hata:", error);
      toast.error(error instanceof Error ? error.message : "Fatura detayları yüklenirken bir hata oluştu");
    }
  };

  const handleSaveBillingDetails = async () => {
    try {
      // Boş alanları kontrol et
      if (!billingDetails.fullName || !billingDetails.country || !billingDetails.city || !billingDetails.phone) {
        toast.error("Lütfen tüm fatura alanlarını doldurun");
        return;
      }

      // API isteği göndermeden önce kullanıcı durumunu kontrol et
      if (status !== "authenticated") {
        toast.error("Fatura detayları kaydetmek için giriş yapmalısınız");
        return;
      }

      // Loglama ekleyelim
      console.log("Gönderilecek fatura detayları:", billingDetails);

      const response = await fetch("/api/user/billing-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: billingDetails.fullName,
          country: billingDetails.country,
          city: billingDetails.city,
          phone: billingDetails.phone
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Fatura detayları kaydedilirken bir hata oluştu");
      }

      setShowBillingForm(false);
      setIsEditingBilling(false);
      setHighlightBilling(false);
      toast.success("Fatura detayları başarıyla kaydedildi");
      
      // Fatura detaylarını güncelle
      setBillingDetails({
        fullName: data.fullName,
        country: data.country,
        city: data.city,
        phone: data.phone
      });
      
    } catch (error) {
      console.error("Fatura detayları kaydetme hatası:", error);
      toast.error(error instanceof Error ? error.message : "Fatura detayları kaydedilirken bir hata oluştu");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Lütfen tüm alanları doldurun");
      return;
    }
    
    try {
      setAuthProcessing(true);
      setIsProcessing(true);
      
      // Kullanıcı girişi yap
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password
      });
      
      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          setErrorMessage("E-posta veya şifre hatalı. Lütfen tekrar deneyin.");
        } else {
          setErrorMessage("Giriş başarısız. Lütfen bilgilerinizi kontrol edin: " + result.error);
        }
        setIsProcessing(false);
      } else {
        // Giriş başarılı, sepet işlemlerini başlat
        toast.success("Giriş başarılı! Sepetiniz hazırlanıyor...");
        
        // Session'ın güncellenmesi için çok kısa bir bekle
        setTimeout(async () => {
          try {
            // Sepet birleştirme işlemini yap
            await fetch("/api/store/cart/merge", {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            
            // Sepeti yeniden yükle
            await fetchCart();
            
            // İşlem tamamlandı
            setIsProcessing(false);
            setSuccessMessage("Giriş başarılı ve sepetiniz güncellendi!");
          } catch (error) {
            console.error("Sepet işlemleri hatası:", error);
            setErrorMessage("Sepet güncelleme sırasında bir hata oluştu.");
            setIsProcessing(false);
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Giriş hatası:", error);
      setErrorMessage("Giriş sırasında bir hata oluştu");
      setIsProcessing(false);
    } finally {
      setAuthProcessing(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      toast.error("Lütfen tüm alanları doldurun");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Şifreniz en az 6 karakter olmalıdır");
      return;
    }
    
    try {
      setAuthProcessing(true);
      setIsProcessing(true);
      
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 409) {
          setErrorMessage("Bu e-posta adresi zaten kullanılıyor. Lütfen giriş yapın.");
          setIsLoginMode(true);
          setIsProcessing(false);
          setAuthProcessing(false);
          return;
        }
        throw new Error(data.error || "Kayıt sırasında bir hata oluştu");
      }
      
      toast.success("Kayıt başarılı! Giriş yapılıyor...");
      
      // Kayıt başarılıysa otomatik giriş yap
      const loginResult = await signIn("credentials", {
        redirect: false,
        email,
        password
      });
      
      if (loginResult?.error) {
        setErrorMessage("Otomatik giriş başarısız. Lütfen manuel olarak giriş yapın.");
        setIsLoginMode(true);
        setIsProcessing(false);
      } else {
        // Giriş başarılı, sepet işlemlerini başlat
        toast.success("Hesabınız oluşturuldu! Sepetiniz hazırlanıyor...");
        
        // Session'ın güncellenmesi için kısa bir bekle
        setTimeout(async () => {
          try {
            // Sepet birleştirme işlemini yap
            await fetch("/api/store/cart/merge", {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            
            // Sepeti yeniden yükle
            await fetchCart();
            
            // İşlem tamamlandı
            setIsProcessing(false);
            setSuccessMessage("Hesabınız oluşturuldu ve sepetiniz güncellendi!");
          } catch (error) {
            console.error("Sepet işlemleri hatası:", error);
            setErrorMessage("Sepet güncelleme sırasında bir hata oluştu.");
            setIsProcessing(false);
          }
        }, 1000);
      }
    } catch (error: any) {
      console.error("Kayıt hatası:", error);
      setErrorMessage(error.message || "Kayıt sırasında bir hata oluştu");
      setIsProcessing(false);
    } finally {
      setAuthProcessing(false);
    }
  };

  const handleCheckout = async () => {
    if (!session) {
      toast.error("Ödeme yapmak için giriş yapmanız gerekmektedir.");
      return;
    }
    
    if (!selectedPaymentMethod) {
      toast.error("Lütfen bir ödeme yöntemi seçin.");
      return;
    }

    // Fatura detayları kontrolü
    if (!billingDetails.fullName || !billingDetails.country || !billingDetails.city || !billingDetails.phone) {
      toast.error("Lütfen fatura detaylarınızı doldurun.");
      setShowBillingForm(true);
      setHighlightBilling(true);
      
      // Fatura detayları alanına scroll
      const billingSection = document.getElementById('billing-details-section');
      if (billingSection) {
        billingSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      // 3 saniye sonra highlight'ı kaldır
      setTimeout(() => {
        setHighlightBilling(false);
      }, 3000);
      
      return;
    }
    
    // Sepet kontrolü
    if (!cart || !cart.items || cart.items.length === 0) {
      toast.error("Sepetiniz boş. Lütfen sepetinize ürün ekleyin.");
      return;
    }

    // Modal'ı göster
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async () => {
    try {
      setIsConfirmingPayment(true);
      setProcessingCheckout(true);
      
      // Seçilen ödeme yöntemini kontrol et
      const paymentMethod = paymentMethods.find(pm => pm.id === selectedPaymentMethod);
      
      // Kredi ile ödeme yapılıyorsa ve yeterli kredi yoksa
      if (paymentMethod?.type === "CREDIT" && userCredits < (cart?.totalPrice || 0)) {
        toast.error("Yeterli krediniz bulunmamaktadır. Lütfen başka bir ödeme yöntemi seçin veya kredinizi yükleyin.");
        setShowPaymentModal(false);
        setIsConfirmingPayment(false);
        setProcessingCheckout(false);
        return;
      }
      
      // API isteği için body oluştur
      const requestBody = {
        paymentMethodId: selectedPaymentMethod,
        cartId: cart?.id
      };
      
      const response = await fetch("/api/store/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ödeme işlemi sırasında bir hata oluştu");
      }
      
      toast.success("Ödeme başarılı! Siparişiniz alındı.");
      
      // Sepet sayısını güncelle
      updateCartItemCount(0);
      
      // Modal'ı kapat
      setShowPaymentModal(false);
      
      // Sipariş tamamlandı sayfasına yönlendir
      setTimeout(() => {
        router.push(`/store/order-complete?orderId=${data.id}`);
      }, 2000);
      
    } catch (error: any) {
      console.error("Ödeme hatası:", error);
      toast.error(error.message || "Ödeme sırasında bir hata oluştu");
      setShowPaymentModal(false);
    } finally {
      setIsConfirmingPayment(false);
      setProcessingCheckout(false);
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });
  };

  // Seçilen ödeme yöntemini bul - hata durumuna karşı kontrol ekleyelim
  const selectedPaymentMethodObj = paymentMethods.find(pm => pm.id === selectedPaymentMethod);
  
  // Kredi ile ödeme yapılıp yapılamayacağını kontrol et
  const isCreditPayment = selectedPaymentMethodObj?.type === "CREDIT";
  const hasEnoughCredits = userCredits >= (cart?.totalPrice || 0);
  const isPaymentDisabled = isCreditPayment && !hasEnoughCredits;

  // Ödeme yöntemi ikonunu belirle
  const getPaymentMethodIcon = (type: string, provider: string | undefined) => {
    if (type === "CREDIT") {
      return <Wallet className="h-5 w-5 text-green-500" />;
    } else if (provider && (provider.toLowerCase().includes("credit") || provider.toLowerCase().includes("card"))) {
      return <CreditCard className="h-5 w-5 text-blue-500" />;
    } else {
      return <CreditCard className="h-5 w-5 text-purple-500" />;
    }
  };

  if (status === "loading" || loading || isProcessing) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <Header />
        <div className="pt-20 flex justify-center items-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-lg">
              {isProcessing 
                ? "Sepetiniz hazırlanıyor, lütfen bekleyin..." 
                : "Yükleniyor..."}
            </p>
            {isProcessing && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Bu işlem birkaç saniye sürebilir.
              </p>
            )}
          </div>
        </div>
        <Footer />
        <Toaster position="top-center" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Header />
      <Toaster position="top-center" />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Üst Navigasyon */}
        <div className="flex flex-col space-y-6 mb-8">
          <div className="flex items-center justify-between">
            <Link 
              href="/store/cart" 
              className={`flex items-center text-sm font-medium ${
                theme === 'dark' 
                  ? 'text-blue-400 hover:text-blue-300' 
                  : 'text-blue-600 hover:text-blue-500'
              } transition-colors duration-200`}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Sepete Dön
            </Link>
            
            {/* İlerleme Çubuğu */}
            <div className="hidden md:flex items-center space-x-4">
              <div className={`flex items-center ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  theme === 'dark' ? 'bg-blue-900/50' : 'bg-blue-100'
                }`}>
                  <ShoppingCart className="h-4 w-4" />
                </div>
                <span className="ml-2 text-sm font-medium">Sepet</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
              <div className={`flex items-center ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  theme === 'dark' ? 'bg-blue-900/50' : 'bg-blue-100'
                }`}>
                  <CreditCard className="h-4 w-4" />
                </div>
                <span className="ml-2 text-sm font-medium">Ödeme</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
              <div className={`flex items-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span className="ml-2 text-sm font-medium">Tamamlandı</span>
              </div>
            </div>
          </div>

          {/* Kullanıcı Bilgileri ve Durum */}
          {session ? (
            <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } shadow-sm`}>
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${
                  theme === 'dark' ? 'bg-blue-900/50' : 'bg-blue-100'
                }`}>
                  <User className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {session.user?.name}
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {session.user?.email}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className={`flex items-center px-3 py-1.5 rounded-full text-sm ${
                  theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                }`}>
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  Giriş Yapıldı
                </div>
                {userCredits > 0 && (
                  <div className={`flex items-center px-3 py-1.5 rounded-full text-sm ${
                    theme === 'dark' ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
                  }`}>
                    <Wallet className="h-4 w-4 mr-1.5" />
                    {formatPrice(userCredits)}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } shadow-sm`}>
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${
                  theme === 'dark' ? 'bg-yellow-900/50' : 'bg-yellow-100'
                }`}>
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Misafir Kullanıcı
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Ödeme yapmak için giriş yapın veya hesap oluşturun
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <h1 className={`text-3xl font-bold mb-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Ödeme İşlemi
        </h1>
        
        {/* Ana Grid Yapısı */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Sol Kolon - Sipariş Özeti ve Ödeme Yöntemleri */}
          <div className="lg:col-span-7 space-y-6">
            {/* Sipariş Özeti Kartı */}
            <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl`}>
              <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} flex items-center`}>
                  <ShoppingCart className="h-5 w-5 mr-2 text-blue-500" />
                  Sipariş Özeti
                </h2>
              </div>
              
              <div className="p-6">
                {/* Ürün Listesi */}
                <div className="space-y-4 mb-6">
                  {cart?.items && cart.items.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                      {cart.items.map((item) => (
                        <div 
                          key={item.id} 
                          className={`flex items-center p-4 rounded-lg ${
                            theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                          } transition-all duration-200 hover:shadow-md`}
                        >
                          {item.product.imageUrl && (
                            <div className="w-16 h-16 relative mr-4 flex-shrink-0 rounded-lg overflow-hidden">
                              <Image 
                                src={item.product.imageUrl} 
                                alt={item.product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                              {item.product.name}
                            </p>
                            <div className="flex items-center mt-1">
                              <span className={`text-xs ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                {formatPrice(item.price)} x {item.quantity}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`font-medium ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={`p-4 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                    } text-center`}>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Sepetinizde ürün bulunmuyor
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Toplam Fiyat */}
                <div className={`pt-4 border-t ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                } space-y-4`}>
                  <div className="flex justify-between">
                    <span className={`${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Ara Toplam
                    </span>
                    <span className={`${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {formatPrice(cart?.totalPrice || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg">
                    <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                      Toplam
                    </span>
                    <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                      {formatPrice(cart?.totalPrice || 0)}
                    </span>
                  </div>
                </div>

                {/* Misafir Kullanıcı Uyarısı */}
                {!session && cart?.items && cart.items.length > 0 && (
                  <div className={`mt-6 p-4 rounded-xl ${
                    theme === 'dark' 
                      ? 'bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-800/30' 
                      : 'bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200'
                  }`}>
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        theme === 'dark' ? 'bg-blue-800/50' : 'bg-blue-100'
                      }`}>
                        <AlertCircle className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <h3 className={`font-medium mb-1 ${
                          theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                        }`}>
                          Ödeme için Giriş Yapın
                        </h3>
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-blue-300/80' : 'text-blue-600/90'
                        }`}>
                          Ödeme yapabilmek için mevcut hesabınız varsa giriş yapın, yoksa yeni hesap oluşturun.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Misafir Kullanıcı Ödeme Butonu */}
            {!session && cart?.items && cart.items.length > 0 && (
              <div className="mt-4">
                <button
                  onClick={() => {
                    const loginSection = document.querySelector('.rounded-xl.shadow-lg.overflow-hidden.transition-all.duration-300.hover\\:shadow-xl.w-full');
                    if (loginSection) {
                      loginSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      // Vurgulama efekti için geçici bir sınıf ekleyelim
                      loginSection.classList.add('animate-pulse', 'ring-2', 'ring-blue-500');
                      setTimeout(() => {
                        loginSection.classList.remove('animate-pulse', 'ring-2', 'ring-blue-500');
                      }, 2000);
                    }
                  }}
                  className={`w-full py-4 px-6 rounded-xl ${
                    theme === 'dark' 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800' 
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                  } text-white font-medium transition-all duration-300 flex items-center justify-center text-lg shadow-lg hover:shadow-xl group`}
                >
                  <User className="h-6 w-6 mr-2 group-hover:scale-110 transition-transform duration-200" />
                  Ödeme için Giriş Yapın
                </button>
              </div>
            )}

            {/* Ödeme Yöntemleri Kartı */}
            {session && (
              <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl`}>
                <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} flex items-center`}>
                    <CreditCardIcon className="h-5 w-5 mr-2 text-blue-500" />
                    Ödeme Yöntemi
                  </h2>
                </div>
                
                <div className="p-6">
                  {paymentMethods.length > 0 ? (
                    <div className="space-y-4">
                      {paymentMethods.map((method) => (
                        <div 
                          key={method.id} 
                          className={`flex items-center p-4 rounded-lg cursor-pointer border-2 transition-all duration-300 transform ${
                            selectedPaymentMethod === method.id 
                              ? theme === 'dark' 
                                ? 'border-blue-500 bg-blue-900/30 scale-102 shadow-xl z-10' 
                                : 'border-blue-500 bg-blue-50 scale-102 shadow-xl z-10' 
                              : theme === 'dark' 
                                ? 'border-gray-700 hover:border-gray-500 hover:bg-gray-700/80 hover:scale-101' 
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-100/80 hover:scale-101'
                          }`} 
                          onClick={() => setSelectedPaymentMethod(method.id)}
                        >
                          <div className="flex-shrink-0 mr-4">
                            <input 
                              type="radio" 
                              name="paymentMethod" 
                              id={`payment-${method.id}`} 
                              value={method.id}
                              checked={selectedPaymentMethod === method.id}
                              onChange={() => setSelectedPaymentMethod(method.id)}
                              className="h-5 w-5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          </div>
                          
                          <label htmlFor={`payment-${method.id}`} className="flex flex-1 cursor-pointer">
                            <div className="flex items-center flex-1">
                              <div className={`p-3 rounded-full ${
                                method.type === "CREDIT" 
                                  ? 'bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/20' 
                                  : 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/20'
                              } mr-4 shadow-sm`}>
                                {getPaymentMethodIcon(method.type, method.provider)}
                              </div>
                              
                              <div className="flex-1">
                                <p className={`font-semibold text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {method.name}
                                </p>
                                
                                {method.provider && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Sağlayıcı: {method.provider}
                                  </p>
                                )}
                                
                                {method.type === "CREDIT" && (
                                  <div className="mt-3">
                                    <div className="flex justify-between items-center">
                                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Bakiye Durumu:
                                      </span>
                                      <span className={`text-sm font-medium ${hasEnoughCredits ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {formatPrice(userCredits)}
                                      </span>
                                    </div>
                                    
                                    {cart?.totalPrice && cart.totalPrice > 0 && (
                                      <>
                                        <div className="mt-2 h-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                          <div 
                                            className={`h-full ${hasEnoughCredits ? 'bg-green-500' : 'bg-red-500'}`}
                                            style={{ width: `${Math.min(100, (userCredits / cart.totalPrice) * 100)}%` }}
                                          ></div>
                                        </div>
                                        
                                        <div className="flex justify-between mt-1">
                                          <span className="text-xs text-gray-500 dark:text-gray-400">
                                            Sipariş: {formatPrice(cart.totalPrice)}
                                          </span>
                                          {!hasEnoughCredits && (
                                            <span className="text-xs text-red-500 dark:text-red-400">
                                              Eksik: {formatPrice((cart.totalPrice - userCredits))}
                                            </span>
                                          )}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={`p-6 rounded-lg border-2 ${
                      theme === 'dark' ? 'border-yellow-500/30 bg-yellow-900/10' : 'border-yellow-200 bg-yellow-50'
                    } flex flex-col items-center text-center`}>
                      <AlertCircle className="h-12 w-12 text-yellow-500 mb-3" />
                      <h3 className={`font-bold text-lg mb-2 ${
                        theme === 'dark' ? 'text-yellow-200' : 'text-yellow-800'
                      }`}>
                        Ödeme yöntemi bulunamadı
                      </h3>
                      <p className={`text-sm mb-4 ${
                        theme === 'dark' ? 'text-yellow-300/80' : 'text-yellow-700'
                      }`}>
                        Hesabınıza henüz ödeme yöntemi eklenmemiş görünüyor.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sağ Kolon - Fatura Detayları ve Kullanıcı Bilgileri */}
          <div className="lg:col-span-5 space-y-6">
            {/* Fatura Detayları Kartı */}
            {session && (
              <div 
                id="billing-details-section"
                className={`rounded-xl ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                } shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl sticky top-24 ${
                  highlightBilling ? 'animate-pulse border-2 border-red-500' : ''
                }`}
              >
                <div className={`px-6 py-4 border-b ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                } ${highlightBilling ? 'bg-red-500/10' : ''}`}>
                  <div className="flex items-center justify-between">
                    <h2 className={`text-lg font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    } flex items-center`}>
                      <CreditCard className="h-5 w-5 mr-2 text-blue-500" />
                      Fatura Detayları
                    </h2>
                    {!showBillingForm && billingDetails.fullName && (
                      <button
                        onClick={() => {
                          setShowBillingForm(true);
                          setIsEditingBilling(true);
                        }}
                        className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${
                          theme === 'dark'
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                        } transition-colors duration-200`}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Düzenle
                      </button>
                    )}
                  </div>
                </div>
                
                <div className={`p-6 ${highlightBilling ? 'bg-red-500/5' : ''}`}>
                  {!showBillingForm && billingDetails.fullName ? (
                    <div className="space-y-4">
                      <div className={`p-4 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                      }`}>
                        <div className="flex items-center mb-3">
                          <User className="h-5 w-5 mr-2 text-blue-500" />
                          <span className={`font-medium ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {billingDetails.fullName}
                          </span>
                        </div>
                        <div className="flex items-center mb-3">
                          <MapPin className="h-5 w-5 mr-2 text-blue-500" />
                          <span className={`${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            {billingDetails.city}, {billingDetails.country}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-5 w-5 mr-2 text-blue-500" />
                          <span className={`${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            {billingDetails.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form className="space-y-4">
                      <div>
                        <label className={`block mb-2 text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Ad Soyad
                        </label>
                        <input
                          type="text"
                          value={billingDetails.fullName}
                          onChange={(e) => setBillingDetails({ ...billingDetails, fullName: e.target.value })}
                          className={`w-full p-3 rounded-md ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50'
                              : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30'
                          } border transition-all duration-200`}
                          placeholder="Adınız Soyadınız"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className={`block mb-2 text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Ülke
                        </label>
                        <select
                          value={billingDetails.country}
                          onChange={(e) => setBillingDetails({ ...billingDetails, country: e.target.value })}
                          className={`w-full p-3 rounded-md ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50'
                              : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30'
                          } border transition-all duration-200`}
                          required
                        >
                          <option value="">Ülke Seçin</option>
                          {countries.map((country) => (
                            <option key={country.code} value={country.name}>
                              {country.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className={`block mb-2 text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Şehir
                        </label>
                        <input
                          type="text"
                          value={billingDetails.city}
                          onChange={(e) => setBillingDetails({ ...billingDetails, city: e.target.value })}
                          className={`w-full p-3 rounded-md ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50'
                              : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30'
                          } border transition-all duration-200`}
                          placeholder="Şehir"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className={`block mb-2 text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Telefon
                        </label>
                        <input
                          type="tel"
                          value={billingDetails.phone}
                          onChange={(e) => setBillingDetails({ ...billingDetails, phone: e.target.value })}
                          className={`w-full p-3 rounded-md ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50'
                              : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30'
                          } border transition-all duration-200`}
                          placeholder="+90 5XX XXX XX XX"
                          required
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-3">
                        {isEditingBilling && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowBillingForm(false);
                              setIsEditingBilling(false);
                              setHighlightBilling(false);
                            }}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${
                              theme === 'dark'
                                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            } transition-colors duration-200`}
                          >
                            İptal
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleSaveBillingDetails}
                          className={`px-4 py-2 rounded-md text-sm font-medium ${
                            theme === 'dark'
                              ? 'bg-blue-600 hover:bg-blue-700 text-white'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          } transition-colors duration-200`}
                        >
                          Kaydet
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* Giriş/Kayıt Formu */}
            {!session && (
              <div className={`rounded-xl ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              } shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl w-full`}>
                <div className={`px-6 py-4 border-b ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 sm:justify-between sm:items-center">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-xl ${
                        theme === 'dark' 
                          ? 'bg-gradient-to-br from-blue-900/50 to-blue-800/30' 
                          : 'bg-gradient-to-br from-blue-100 to-blue-50'
                      } shadow-sm`}>
                        {isLoginMode ? (
                          <LogIn className="h-5 w-5 text-blue-500" />
                        ) : (
                          <UserPlus className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                      <div>
                        <h2 className={`text-lg font-semibold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {isLoginMode ? "Giriş Yap" : "Kayıt Ol"}
                        </h2>
                        <p className={`text-xs ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {isLoginMode ? "Hesabınıza giriş yapın" : "Yeni hesap oluşturun"}
                        </p>
                      </div>
                    </div>
                    
                    <div className={`flex ${
                      theme === 'dark' 
                        ? 'bg-white/5 backdrop-blur-sm' 
                        : 'bg-gray-50'
                    } rounded-xl p-1 w-full sm:w-auto shadow-sm`}>
                      <button
                        onClick={() => setIsLoginMode(false)}
                        className={`flex flex-1 sm:flex-initial items-center justify-center text-sm font-medium py-1.5 px-4 rounded-lg transition-all duration-200 ${
                          !isLoginMode
                            ? theme === 'dark'
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-blue-600 text-white shadow-md'
                            : theme === 'dark'
                              ? 'text-gray-300 hover:bg-white/5'
                              : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <UserPlus className={`h-4 w-4 mr-1.5 ${
                          !isLoginMode
                            ? 'text-white'
                            : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                        Kayıt
                      </button>
                      <button
                        onClick={() => setIsLoginMode(true)}
                        className={`flex flex-1 sm:flex-initial items-center justify-center text-sm font-medium py-1.5 px-4 rounded-lg transition-all duration-200 ${
                          isLoginMode
                            ? theme === 'dark'
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-blue-600 text-white shadow-md'
                            : theme === 'dark'
                              ? 'text-gray-300 hover:bg-white/5'
                              : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <LogIn className={`h-4 w-4 mr-1.5 ${
                          isLoginMode
                            ? 'text-white'
                            : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                        Giriş
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  {/* Bilgi Kartı */}
                  <div className={`p-5 mb-6 rounded-xl border ${
                    theme === 'dark' 
                      ? 'bg-gradient-to-br from-blue-900/30 to-blue-900/10 border-blue-800/30' 
                      : 'bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200'
                  } shadow-sm`}>
                    <div className="flex items-start">
                      <div className={`${
                        theme === 'dark' 
                          ? 'bg-blue-800/50 text-blue-300' 
                          : 'bg-blue-100 text-blue-600'
                      } p-3 rounded-xl mr-4 shadow-sm`}>
                        {isLoginMode ? (
                          <LogIn className="h-7 w-7" />
                        ) : (
                          <UserPlus className="h-7 w-7" />
                        )}
                      </div>
                      <div>
                        <h3 className={`font-bold text-lg mb-1 ${
                          theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                        }`}>
                          {isLoginMode ? "Hesabınıza Giriş Yapın" : "Yeni Hesap Oluşturun"}
                        </h3>
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-blue-300/80' : 'text-blue-600/90'
                        }`}>
                          {isLoginMode 
                            ? "Mevcut hesabınıza giriş yaparak ödeme işlemine devam edebilirsiniz." 
                            : "Hesap oluşturarak siparişlerinizi takip edebilir ve daha hızlı alışveriş yapabilirsiniz."}
                        </p>
                        {!isLoginMode && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium ${
                              theme === 'dark'
                                ? 'bg-green-800/40 text-green-300'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              <CheckCircle className="h-4 w-4 mr-1.5" />
                              Siparişlerinizi Takip Edin
                            </span>
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium ${
                              theme === 'dark'
                                ? 'bg-green-800/40 text-green-300'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              <CheckCircle className="h-4 w-4 mr-1.5" />
                              Daha Hızlı Ödeme
                            </span>
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium ${
                              theme === 'dark'
                                ? 'bg-green-800/40 text-green-300'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              <CheckCircle className="h-4 w-4 mr-1.5" />
                              Özel Fırsatlar
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="transition-all duration-500 ease-in-out">
                    {isLoginMode ? (
                      <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                          <label className={`block mb-2 text-sm font-medium ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          } flex items-center`}>
                            <Mail className="inline-block h-4 w-4 mr-2 text-blue-500" />
                            E-posta
                          </label>
                          <div className="relative">
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className={`w-full p-3 pl-10 rounded-md ${
                                theme === 'dark'
                                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50'
                                  : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30'
                              } border transition-all duration-200`}
                              placeholder="ornek@mail.com"
                              required
                            />
                            <Mail className="absolute top-3.5 left-3 h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                        <div className="mb-2">
                          <label className={`block mb-2 text-sm font-medium ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          } flex items-center`}>
                            <Lock className="inline-block h-4 w-4 mr-2 text-blue-500" />
                            Şifre
                          </label>
                          <div className="relative">
                            <input
                              type={passwordVisible ? "text" : "password"}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className={`w-full p-3 pl-10 rounded-md ${
                                theme === 'dark'
                                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50'
                                  : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30'
                              } border transition-all duration-200`}
                              placeholder="••••••••"
                              required
                            />
                            <Lock className="absolute top-3.5 left-3 h-4 w-4 text-gray-400" />
                            <button 
                              type="button"
                              onClick={() => setPasswordVisible(!passwordVisible)}
                              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                            >
                              {passwordVisible ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                          <div className="mt-2 text-right">
                            <Link href="/auth/forgot-password" className={`text-xs font-medium ${
                              theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
                            } transition-colors duration-200`}>
                              Şifremi unuttum
                            </Link>
                          </div>
                        </div>

                        <div className="flex items-center mb-2 mt-4">
                          <input
                            id="remember-me"
                            name="remember-me"
                            type="checkbox"
                            className={`h-4 w-4 rounded border-gray-300 ${
                              theme === 'dark' ? 'bg-gray-700 text-blue-500' : 'bg-white text-blue-600'
                            } focus:ring-blue-500`}
                          />
                          <label htmlFor="remember-me" className={`ml-2 block text-sm ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Beni hatırla
                          </label>
                        </div>

                        <button
                          type="submit"
                          disabled={authProcessing}
                          className={`w-full py-3.5 px-4 rounded-md ${
                            authProcessing
                              ? 'bg-gray-400 cursor-not-allowed'
                              : theme === 'dark' 
                                ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20' 
                                : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20'
                          } text-white font-medium transition-all duration-300 flex items-center justify-center text-base`}
                        >
                          {authProcessing ? (
                            <>
                              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                              Giriş Yapılıyor...
                            </>
                          ) : (
                            <>
                              <LogIn className="h-5 w-5 mr-2" />
                              Giriş Yap ve Devam Et
                            </>
                          )}
                        </button>
                            
                        <div className="text-center mt-5">
                          <p className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Henüz hesabınız yok mu?{" "}
                            <button 
                              type="button" 
                              onClick={() => setIsLoginMode(false)}
                              className={`font-semibold ${
                                theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
                              } transition-colors duration-200`}
                            >
                              Hemen Kaydolun →
                            </button>
                          </p>
                        </div>
                      </form>
                    ) : (
                      <form onSubmit={handleRegister} className="space-y-5">
                        <div>
                          <label className={`block mb-2 text-sm font-medium ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          } flex items-center`}>
                            <User className="inline-block h-4 w-4 mr-2 text-blue-500" />
                            Adınız
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className={`w-full p-3 pl-10 rounded-md ${
                                theme === 'dark'
                                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50'
                                  : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30'
                              } border transition-all duration-200`}
                              placeholder="Adınız Soyadınız"
                              required
                            />
                            <User className="absolute top-3.5 left-3 h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                        <div>
                          <label className={`block mb-2 text-sm font-medium ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          } flex items-center`}>
                            <Mail className="inline-block h-4 w-4 mr-2 text-blue-500" />
                            E-posta
                          </label>
                          <div className="relative">
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className={`w-full p-3 pl-10 rounded-md ${
                                theme === 'dark'
                                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50'
                                  : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30'
                              } border transition-all duration-200`}
                              placeholder="ornek@mail.com"
                              required
                            />
                            <Mail className="absolute top-3.5 left-3 h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                        <div className="mb-2">
                          <label className={`block mb-2 text-sm font-medium ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          } flex items-center`}>
                            <Lock className="inline-block h-4 w-4 mr-2 text-blue-500" />
                            Şifre
                          </label>
                          <div className="relative">
                            <input
                              type={passwordVisible ? "text" : "password"}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className={`w-full p-3 pl-10 rounded-md ${
                                theme === 'dark'
                                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50'
                                  : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30'
                              } border transition-all duration-200`}
                              placeholder="••••••••"
                              required
                              minLength={6}
                            />
                            <Lock className="absolute top-3.5 left-3 h-4 w-4 text-gray-400" />
                            <button
                              type="button"
                              onClick={() => setPasswordVisible(!passwordVisible)}
                              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                            >
                              {passwordVisible ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Şifreniz en az 6 karakter olmalıdır
                          </p>
                        </div>
                   
                        <button
                          type="submit"
                          disabled={authProcessing}
                          className={`w-full py-3.5 px-4 rounded-md ${
                            authProcessing
                              ? 'bg-gray-400 cursor-not-allowed'
                              : theme === 'dark' 
                                ? 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20' 
                                : 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20'
                          } text-white font-medium transition-all duration-300 flex items-center justify-center text-base`}
                        >
                          {authProcessing ? (
                            <>
                              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                              Kayıt Yapılıyor...
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-5 w-5 mr-2" />
                              Hesap Oluştur ve Devam Et
                            </>
                          )}
                        </button>
                   
                        <div className="text-center mt-5">
                          <p className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Zaten hesabınız var mı?{" "}
                            <button 
                              type="button" 
                              onClick={() => setIsLoginMode(true)}
                              className={`font-semibold ${
                                theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
                              } transition-colors duration-200`}
                            >
                              Giriş Yapın →
                            </button>
                          </p>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
                
                <div className={`px-6 py-4 border-t ${
                  theme === 'dark' ? 'border-gray-700 bg-gray-800/80' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                    <div className={`flex items-center p-3 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700/50' : 'bg-white'
                    } shadow-sm flex-1`}>
                      <Shield className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Güvenli Ödeme İşlemleri
                      </span>
                    </div>
                    <div className={`flex items-center p-3 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700/50' : 'bg-white'
                    } shadow-sm flex-1`}>
                      <Lock className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                      <span className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        SSL Şifreleme Koruması
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ödeme Butonu */}
        <div className="mt-8">
          <button
            onClick={handleCheckout}
            disabled={!session || processingCheckout || !cart?.items?.length || paymentMethods.length === 0 || (!selectedPaymentMethod && !!session) || (isPaymentDisabled && !!session)}
            className={`w-full py-4 px-6 rounded-md ${
              !session || processingCheckout || !cart?.items?.length || (paymentMethods.length === 0 && !!session) || (!selectedPaymentMethod && !!session) || (isPaymentDisabled && !!session)
                ? 'bg-gray-400 cursor-not-allowed'
                : theme === 'dark' ? 'bg-green-600 hover:bg-green-700' : 'bg-green-600 hover:bg-green-700'
            } text-white font-medium transition-colors flex items-center justify-center text-lg shadow-md hover:shadow-lg`}
          >
            {processingCheckout ? (
              <>
                <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                İşleniyor...
              </>
            ) : !session ? (
              <>
                <User className="h-6 w-6 mr-2" />
                Ödeme için giriş yapın
              </>
            ) : !cart?.items?.length ? (
              <>
                <ShoppingCart className="h-6 w-6 mr-2" />
                Sepetiniz Boş
              </>
            ) : paymentMethods.length === 0 ? (
              <>
                <AlertCircle className="h-6 w-6 mr-2" />
                Ödeme yöntemi bulunamadı
              </>
            ) : !selectedPaymentMethod ? (
              <>
                <CreditCard className="h-6 w-6 mr-2" />
                Ödeme yöntemi seçin
              </>
            ) : isPaymentDisabled ? (
              <>
                <Wallet className="h-6 w-6 mr-2" />
                Yetersiz bakiye
              </>
            ) : (
              <>
                <CreditCard className="h-6 w-6 mr-2" />
                Ödemeyi Tamamla
              </>
            )}
          </button>
        </div>

        {/* Kullanıcıya yardımcı bilgiler */}
        {!!session && isCreditPayment && !hasEnoughCredits && (
          <div className="mt-4 text-center p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-md border border-yellow-200 dark:border-yellow-800/50">
            <p className="mb-2 text-yellow-700 dark:text-yellow-300 text-sm font-medium">Yetersiz bakiye</p>
            <Link 
              href="/dashboard/credits/add" 
              className={`inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm`}
            >
              <Wallet className="h-4 w-4 mr-2" />
              Kredi Yükle ({formatPrice((cart?.totalPrice || 0) - userCredits)} daha gerekli)
            </Link>
          </div>
        )}
        
        <div className={`mt-6 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          <div className="flex items-center mb-2">
            <Shield className="h-4 w-4 mr-2 text-blue-500" />
            <span>Güvenli ödeme işlemi</span>
          </div>
          <div className="flex items-center mb-2">
            <Clock className="h-4 w-4 mr-2 text-purple-500" />
            <span>Hızlı teslimat</span>
          </div>
          <div className="flex items-center">
            <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
            <span>%100 Orijinal ürün garantisi</span>
          </div>
        </div>
      </div>
      
      <Footer />

      {/* Ödeme Onay Modalı */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } shadow-2xl transform transition-all`}>
            <div className={`px-6 py-4 border-b ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            } flex items-center justify-between`}>
              <h3 className={`text-lg font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              } flex items-center`}>
                <CreditCard className="h-5 w-5 mr-2 text-blue-500" />
                Ödeme Onayı
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className={`p-1 rounded-lg ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                } transition-colors`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {/* Uyarı ve Bilgilendirme Bölümü */}
                <div className={`p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-yellow-900/30 border-yellow-800/50' : 'bg-yellow-50 border-yellow-200'
                } border`}>
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className={`font-medium mb-2 ${
                        theme === 'dark' ? 'text-yellow-200' : 'text-yellow-800'
                      }`}>
                        Önemli Bilgilendirme
                      </h4>
                      <ul className={`space-y-2 text-sm ${
                        theme === 'dark' ? 'text-yellow-300/90' : 'text-yellow-700'
                      }`}>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          Lütfen siparişinizi ve ödeme bilgilerinizi dikkatle kontrol edin.
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          Dijital kod ürünlerinde iade, değişim ve iptal işlemi yapılmamaktadır.
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          Satın aldığınız ürünlerin kullanım koşullarını ve lisans bilgilerini kontrol edin.
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          Ödeme işlemi tamamlandıktan sonra işlem geri alınamaz.
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          Satın aldığınız ürünlerin kullanım süreleri ve geçerlilik tarihleri ürün detaylarında belirtilmiştir.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Sipariş Özeti */}
                <div>
                  <h4 className={`text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Sipariş Özeti
                  </h4>
                  <div className={`space-y-2 ${
                    theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                  } p-4 rounded-lg`}>
                    {cart?.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <span className={`text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {item.product.name} x {item.quantity}
                        </span>
                        <span className={`font-medium ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                    <div className={`pt-2 border-t ${
                      theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className={`font-medium ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          Toplam
                        </span>
                        <span className={`text-lg font-bold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {formatPrice(cart?.totalPrice || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className={`text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Ödeme Yöntemi
                  </h4>
                  <div className={`p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                  } flex items-center`}>
                    <div className={`p-2 rounded-lg ${
                      theme === 'dark' ? 'bg-blue-900/50' : 'bg-blue-100'
                    } mr-3`}>
                      {getPaymentMethodIcon(selectedPaymentMethodObj?.type || '', selectedPaymentMethodObj?.provider)}
                    </div>
                    <div>
                      <p className={`font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {selectedPaymentMethodObj?.name}
                      </p>
                      {selectedPaymentMethodObj?.provider && (
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {selectedPaymentMethodObj.provider}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {isCreditPayment && (
                  <div>
                    <h4 className={`text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Kredi Durumu
                    </h4>
                    <div className={`p-4 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                    }`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          Mevcut Bakiye
                        </span>
                        <span className={`font-medium ${
                          hasEnoughCredits ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {formatPrice(userCredits)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          Ödenecek Tutar
                        </span>
                        <span className={`font-medium ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {formatPrice(cart?.totalPrice || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className={`px-6 py-4 border-t ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            } flex justify-end space-x-3`}>
              <button
                onClick={() => setShowPaymentModal(false)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                } transition-colors`}
              >
                İptal
              </button>
              <button
                onClick={handleConfirmPayment}
                disabled={isConfirmingPayment}
                className={`px-6 py-2 rounded-lg text-sm font-medium ${
                  isConfirmingPayment
                    ? 'bg-gray-400 cursor-not-allowed'
                    : theme === 'dark'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                } transition-colors flex items-center`}
              >
                {isConfirmingPayment ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    İşleniyor...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Ödemeyi Onayla
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 