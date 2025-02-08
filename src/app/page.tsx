'use client';

import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import axios, { AxiosError } from 'axios';
import { useTheme } from './ThemeContext';

interface ApiResponse {
  short_result: string;
  result: string;
  typeiid: string;
  userID: string;
  confirmationid: string;
  have_cid: boolean;
  professional_have_cid: boolean;
  confirmation_id_with_dash: string;
  confirmation_id_no_dash: string;
  error_executing: boolean;
  had_occurred: boolean;
}

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [iid, setIid] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    status: 'success' | 'error';
    data?: ApiResponse;
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!iid) {
      toast.error('Lütfen IID giriniz');
      return;
    }

    setLoading(true);
    setResult(null);
    
    try {
      const response = await axios.get(`https://pidkey.com/ajax/cidms_api?iids=${iid}&justforcheck=0&apikey=Sd0zJS8vlm5VnkltMR2CqPI8n`);
      
      if (response.data) {
        const apiResponse = response.data as ApiResponse;
        
        if (apiResponse.error_executing || apiResponse.had_occurred) {
          setResult({
            status: 'error',
            data: apiResponse,
            message: apiResponse.result || 'İşlem başarısız oldu'
          });
          toast.error(apiResponse.result || 'İşlem başarısız oldu');
        } else {
          setResult({
            status: 'success',
            data: apiResponse,
            message: 'Onay numarası başarıyla alındı!'
          });
          toast.success('Onay numarası başarıyla alındı!');
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof AxiosError 
        ? error.response?.data?.message || 'API yanıt hatası'
        : 'Bir hata oluştu';
      setResult({
        status: 'error',
        message: errorMessage
      });
      toast.error(`İşlem başarısız: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold">Microsoft Onay</h1>
              <nav className="hidden md:flex space-x-4">
                <a href="#" className="hover:text-blue-500 transition-colors">Ana Sayfa</a>
                <a href="#" className="hover:text-blue-500 transition-colors">Hakkında</a>
                <a href="#" className="hover:text-blue-500 transition-colors">İletişim</a>
              </nav>
            </div>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}
            >
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className={`text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Microsoft Ürünleri İçin Onay Sistemi
            </h2>
            <p className={`text-lg mb-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Hızlı ve güvenli bir şekilde Microsoft ürünleriniz için onay numarası alın.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className={`max-w-md mx-auto ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl p-6`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="iid" className="block text-sm font-medium mb-2">
                IID (Yükleme Kimliği)
              </label>
              <input
                type="text"
                id="iid"
                value={iid}
                onChange={(e) => setIid(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                    : 'bg-white border-gray-300 focus:border-blue-500'
                } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors`}
                placeholder="IID numaranızı giriniz"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                loading 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'
              } bg-blue-500 text-white`}
            >
              {loading ? 'İşleniyor...' : 'Onay Numarası Al'}
            </button>
          </form>

          {result && (
            <div className={`mt-6 p-4 rounded-lg ${
              result.status === 'success'
                ? theme === 'dark' ? 'bg-green-900/30 text-green-300' : 'bg-green-50 text-green-800'
                : theme === 'dark' ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-800'
            }`}>
              <div className="flex items-center mb-2">
                {result.status === 'success' ? (
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <h3 className="font-medium">
                  {result.status === 'success' ? 'İşlem Başarılı' : 'İşlem Başarısız'}
                </h3>
              </div>
              
              <p className="text-sm">{result.message}</p>
              
              {result.status === 'success' && result.data && (
                <div className={`mt-3 p-3 rounded ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                } border border-opacity-10`}>
                  <p className="text-sm font-medium mb-1">Onay Numarası:</p>
                  <p className="font-mono text-sm break-all select-all">
                    {result.data.confirmation_id_with_dash}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className={`mt-12 py-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-sm">
                © 2024 Microsoft Onay Sistemi. Tüm hakları saklıdır.
              </p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-blue-500 transition-colors">Gizlilik Politikası</a>
              <a href="#" className="hover:text-blue-500 transition-colors">Kullanım Şartları</a>
            </div>
          </div>
        </div>
      </footer>

      <Toaster 
        position="top-right"
        toastOptions={{
          className: theme === 'dark' ? '!bg-gray-800 !text-white' : '',
        }}
      />
    </div>
  );
}
