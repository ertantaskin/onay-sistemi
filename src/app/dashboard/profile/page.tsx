'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/ThemeContext';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toaster, toast } from "react-hot-toast";
import { User, Mail, CreditCard, Edit, Save, X, Plus, Loader2, Key, Eye, EyeOff, CheckCircle2, UserCircle, Lock, GlobeIcon, MapPin, Phone, Globe2, ChevronRight, LogOut, Settings, History, HelpCircle, Bell, Shield } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

interface ProfileData {
  name: string;
  email: string;
}

interface BillingDetails {
  fullName: string;
  country: string;
  city: string;
  phone: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileData>({
    name: '',
    email: '',
  });
  const [billingDetails, setBillingDetails] = useState<BillingDetails>({
    fullName: "",
    country: "",
    city: "",
    phone: ""
  });
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || '',
        email: session.user.email || '',
      });
    }
  }, [session]);

  useEffect(() => {
    if (session?.user) {
      fetchBillingDetails();
    }
  }, [session]);

  const fetchBillingDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/billing-details");
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Fatura detayları yüklenirken bir hata oluştu");
      }
      
      const data = await response.json();
      console.log("Alınan fatura detayları:", data);
      
      setBillingDetails({
        fullName: data.fullName || "",
        country: data.country || "",
        city: data.city || "",
        phone: data.phone || ""
      });
    } catch (error) {
      console.error("Fatura detayları yüklenirken hata:", error);
      toast.error(error instanceof Error ? error.message : "Fatura detayları yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBillingDetails = async () => {
    try {
      if (!billingDetails.fullName || !billingDetails.country || !billingDetails.city || !billingDetails.phone) {
        toast.error("Lütfen tüm fatura alanlarını doldurun");
        return;
      }

      setLoading(true);
      const response = await fetch("/api/user/billing-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(billingDetails),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Fatura detayları kaydedilirken bir hata oluştu");
      }

      setIsEditing(false);
      toast.success("Fatura detayları başarıyla kaydedildi");
    } catch (error) {
      console.error("Fatura detayları kaydetme hatası:", error);
      toast.error(error instanceof Error ? error.message : "Fatura detayları kaydedilirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Profil bilgilerini güncelleme
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form doğrulama
    if (!formData.name || !formData.email) {
      toast.error("Lütfen tüm alanları doldurun");
      return;
    }
    
    // Email formatı doğrulama
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Geçerli bir e-posta adresi girin");
      return;
    }
    
    setLoadingProfile(true);
    
    try {
      const response = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Profil güncelleme başarısız oldu');
      }

      // Session'ı güncelle
      await update({
        ...session,
        user: {
          ...session?.user,
          name: formData.name,
          email: formData.email,
        },
      });

      toast.success('Profil bilgileriniz başarıyla güncellendi');
      setIsEditingProfile(false);
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu');
    } finally {
      setLoadingProfile(false);
    }
  };
  
  // Şifre değiştirme işlemi
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form doğrulama
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("Lütfen tüm alanları doldurun");
      return;
    }
    
    // Yeni şifre ve onay şifresi eşleşiyor mu?
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Yeni şifre ve onay şifresi eşleşmiyor");
      return;
    }
    
    // Yeni şifre eski şifreyle aynı mı?
    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error("Yeni şifre eski şifreyle aynı olamaz");
      return;
    }
    
    // Şifre uzunluğu kontrolü
    if (passwordData.newPassword.length < 6) {
      toast.error("Şifre en az 6 karakter olmalıdır");
      return;
    }
    
    setLoadingPassword(true);
    
    try {
      const response = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Şifre değiştirme başarısız oldu');
      }
      
      toast.success('Şifreniz başarıyla değiştirildi');
      setIsChangingPassword(false);
      
      // Şifre alanlarını temizle
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error) {
      console.error('Şifre değiştirme hatası:', error);
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu');
    } finally {
      setLoadingPassword(false);
    }
  };

  if (session?.user === undefined || loading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <Header />
        <div className="pt-20 flex justify-center items-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4">Yükleniyor...</p>
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
        {/* Profil Başlığı */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
              <UserCircle className="h-12 w-12 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{session?.user?.name || "Kullanıcı"}</h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {session?.user?.email}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sol Kolon - Dashboard Sidebar */}
          <div className="lg:col-span-3">
            <DashboardSidebar />
          </div>

          {/* Orta Kolon - Profil Bilgileri */}
          <div className="lg:col-span-6 space-y-8">
            {/* Kullanıcı Bilgileri */}
            <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}>
              <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex justify-between items-center">
                  <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} flex items-center`}>
                    <UserCircle className="h-5 w-5 mr-2 text-blue-500" />
                    Profil Bilgileri
                  </h2>
                  {!isEditingProfile && (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${
                        theme === 'dark' 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                      } transition-colors duration-200`}
                    >
                      <Edit className="h-4 w-4 mr-1.5" />
                      Düzenle
                    </button>
                  )}
                </div>
              </div>
              
              <div className="p-6">
                {isEditingProfile ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block mb-2 text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Ad Soyad
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                          E-posta Adresi
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className={`w-full p-3 rounded-md ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50' 
                              : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30'
                          } border transition-all duration-200`}
                          placeholder="ornek@mail.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingProfile(false);
                          if (session?.user) {
                            setFormData({
                              name: session.user.name || '',
                              email: session.user.email || '',
                            });
                          }
                        }}
                        className={`px-4 py-2 rounded-md ${
                          theme === 'dark'
                            ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        } text-sm font-medium transition-colors duration-200`}
                        disabled={loadingProfile}
                      >
                        İptal
                      </button>
                      <button
                        type="submit"
                        className={`px-4 py-2 rounded-md ${
                          loadingProfile 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : theme === 'dark' 
                              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                        } text-sm font-medium transition-colors duration-200 flex items-center`}
                        disabled={loadingProfile}
                      >
                        {loadingProfile ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Güncelleniyor...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-1.5" />
                            Kaydet
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                      <div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                          Ad Soyad
                        </div>
                        <div className={`font-medium flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          <User className="h-4 w-4 mr-2 text-blue-500" />
                          {session?.user?.name || "Belirtilmemiş"}
                        </div>
                      </div>
                      
                      <div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                          E-posta Adresi
                        </div>
                        <div className={`font-medium flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          <Mail className="h-4 w-4 mr-2 text-blue-500" />
                          {session?.user?.email}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <button
                        onClick={() => setIsChangingPassword(true)}
                        className={`mt-4 inline-flex items-center px-4 py-2 ${
                          theme === 'dark' 
                            ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        } rounded-md text-sm font-medium transition-colors duration-200`}
                      >
                        <Key className="h-4 w-4 mr-1.5" />
                        Şifre Değiştir
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Fatura Detayları */}
            <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}>
              <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex justify-between items-center">
                  <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} flex items-center`}>
                    <CreditCard className="h-5 w-5 mr-2 text-blue-500" />
                    Fatura Detayları
                  </h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${
                        theme === 'dark' 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                      } transition-colors duration-200`}
                    >
                      <Edit className="h-4 w-4 mr-1.5" />
                      Düzenle
                    </button>
                  )}
                </div>
              </div>
              
              <div className="p-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block mb-2 text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Ülke
                        </label>
                        <input
                          type="text"
                          value={billingDetails.country}
                          onChange={(e) => setBillingDetails({ ...billingDetails, country: e.target.value })}
                          className={`w-full p-3 rounded-md ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50'
                              : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30'
                          } border transition-all duration-200`}
                          placeholder="Ülke"
                          required
                        />
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
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className={`px-4 py-2 rounded-md ${
                          theme === 'dark' 
                            ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        } text-sm font-medium transition-colors duration-200`}
                        disabled={loading}
                      >
                        İptal
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveBillingDetails}
                        className={`px-4 py-2 rounded-md ${
                          loading
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : theme === 'dark' 
                              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                        } text-sm font-medium transition-colors duration-200 flex items-center`}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Kaydediliyor...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-1.5" />
                            Kaydet
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                      <div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                          Ad Soyad
                        </div>
                        <div className={`font-medium flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          <User className="h-4 w-4 mr-2 text-blue-500" />
                          {billingDetails.fullName || "Belirtilmemiş"}
                        </div>
                      </div>
                      
                      <div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                          Telefon
                        </div>
                        <div className={`font-medium flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          <Phone className="h-4 w-4 mr-2 text-blue-500" />
                          {billingDetails.phone || "Belirtilmemiş"}
                        </div>
                      </div>
                      
                      <div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                          Ülke
                        </div>
                        <div className={`font-medium flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          <Globe2 className="h-4 w-4 mr-2 text-blue-500" />
                          {billingDetails.country || "Belirtilmemiş"}
                        </div>
                      </div>
                      
                      <div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                          Şehir
                        </div>
                        <div className={`font-medium flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                          {billingDetails.city || "Belirtilmemiş"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sağ Kolon - Şifre Değiştirme */}
          <div className="lg:col-span-3">
            {/* Şifre Değiştirme */}
            {isChangingPassword && (
              <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}>
                <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-center">
                    <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} flex items-center`}>
                      <Lock className="h-5 w-5 mr-2 text-blue-500" />
                      Şifre Değiştir
                    </h2>
                    <button
                      onClick={() => setIsChangingPassword(false)}
                      className={`inline-flex items-center p-1.5 rounded-md ${
                        theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                      } transition-colors duration-200`}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className={`block mb-2 text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Mevcut Şifre
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className={`w-full p-3 pl-10 pr-10 rounded-md ${
                            theme === 'dark' 
                              ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50' 
                              : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30'
                          } border transition-all duration-200`}
                          placeholder="••••••••"
                          required
                        />
                        <Lock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                        <button 
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className={`block mb-2 text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Yeni Şifre
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className={`w-full p-3 pl-10 pr-10 rounded-md ${
                            theme === 'dark' 
                              ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50' 
                              : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30'
                          } border transition-all duration-200`}
                          placeholder="••••••••"
                          required
                          minLength={6}
                        />
                        <Key className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                        <button 
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Şifreniz en az 6 karakter uzunluğunda olmalıdır
                      </p>
                    </div>
                    
                    <div>
                      <label className={`block mb-2 text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Şifre Tekrar
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className={`w-full p-3 pl-10 pr-10 rounded-md ${
                            theme === 'dark' 
                              ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50' 
                              : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30'
                          } border transition-all duration-200`}
                          placeholder="••••••••"
                          required
                        />
                        <CheckCircle2 className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                        <button 
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsChangingPassword(false);
                          setPasswordData({
                            currentPassword: "",
                            newPassword: "",
                            confirmPassword: ""
                          });
                        }}
                        className={`px-4 py-2 rounded-md ${
                          theme === 'dark' 
                            ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        } text-sm font-medium transition-colors duration-200`}
                        disabled={loadingPassword}
                      >
                        İptal
                      </button>
                      <button
                        type="submit"
                        className={`px-4 py-2 rounded-md ${
                          loadingPassword 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : theme === 'dark' 
                              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                        } text-sm font-medium transition-colors duration-200 flex items-center`}
                        disabled={loadingPassword}
                      >
                        {loadingPassword ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Güncelleniyor...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-1.5" />
                            Şifreyi Değiştir
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 