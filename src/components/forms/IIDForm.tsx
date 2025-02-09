'use client';

import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios, { AxiosError } from 'axios';
import { useTheme } from '@/app/ThemeContext';

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

export function IIDForm() {
  const { theme } = useTheme();
  const [iidParts, setIidParts] = useState<string[]>(Array(9).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    status: 'success' | 'error';
    data?: ApiResponse;
    message: string;
  } | null>(null);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 9);
  }, []);

  const handleInputChange = (index: number, value: string) => {
    const newValue = value.replace(/[^0-9]/g, '').slice(0, 7);
    const newParts = [...iidParts];
    newParts[index] = newValue;
    setIidParts(newParts);

    if (newValue.length === 7 && index < 8) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
    const parts: string[] = [];
    
    for (let i = 0; i < 9; i++) {
      parts.push(pastedText.slice(i * 7, (i + 1) * 7));
    }
    
    setIidParts(parts);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !iidParts[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 8) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const fullIID = iidParts.join('');
      if (fullIID.length !== 9) {
        setResult({
          status: 'error',
          message: 'Lütfen 9 haneli IID numarasını eksiksiz girin.',
        });
        toast.error('Eksik IID numarası');
        return;
      }

      const response = await fetch(`https://api.example.com/check-iid?iid=${fullIID}`);
      const apiResponse = await response.json();

      if (!response.ok || apiResponse.error_executing || apiResponse.had_occurred) {
        setResult({
          status: 'error',
          data: apiResponse,
          message: 'Girdiğiniz IID numarası geçersiz. Lütfen numaraları tekrar kontrol edin ve lisansın aktif olduğundan emin olun.'
        });
        toast.error('Geçersiz IID numarası');
        return;
      }

      // Veritabanına kaydet
      try {
        const saveResponse = await fetch('/api/approvals/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            iidNumber: fullIID,
            confirmationNumber: apiResponse.confirmation_id_with_dash,
          }),
        });

        const saveData = await saveResponse.json();

        if (!saveResponse.ok) {
          throw new Error(saveData.error || 'Onay kaydı başarısız oldu');
        }

        // Başarılı kayıt
        setResult({
          status: 'success',
          data: apiResponse,
          message: 'Onay numarası başarıyla alındı ve kaydedildi!'
        });
        toast.success('Onay numarası başarıyla alındı ve kaydedildi!');
      } catch (error) {
        console.error('Onay kaydı hatası:', error);
        
        // Kayıt hatası durumunda
        setResult({
          status: 'error',
          data: apiResponse,
          message: error instanceof Error ? error.message : 'Onay kaydedilirken bir hata oluştu'
        });
        toast.error('Onay kaydedilirken bir hata oluştu');
      }
    } catch (error) {
      console.error('API hatası:', error);
      setResult({
        status: 'error',
        message: error instanceof Error ? error.message : 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
      });
      toast.error('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Onay numarası kopyalandı!');
    } catch {
      toast.error('Kopyalama başarısız oldu');
    }
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl p-8 backdrop-blur-sm`}>
      <form onSubmit={handleSubmit} className="space-y-8" autoComplete="off" noValidate>
        <div>
          <label htmlFor="iid-0" className="block text-lg font-medium mb-3">
            IID (Yükleme Kimliği)
          </label>
          <div className="grid grid-cols-3 gap-4 md:gap-6">
            {iidParts.map((part, index) => (
              <div key={index} className="relative group">
                <input
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  id={`iid-${index}`}
                  value={part}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  autoComplete="off"
                  className={`w-full h-14 px-3 text-center rounded-xl border-2 text-base font-mono tracking-wider ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                      : 'bg-white border-gray-300 focus:border-blue-500'
                  } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 group-hover:border-blue-400`}
                  placeholder="0000000"
                  maxLength={7}
                  inputMode="numeric"
                />
                <div className={`absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full transition-all duration-200 ${
                  part.length === 7
                    ? 'bg-green-500'
                    : part.length > 0
                    ? 'bg-yellow-500'
                    : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                }`} />
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>Her kutu 7 rakam içermelidir. Yapıştır (Ctrl+V) ile otomatik doldurabilirsiniz.</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full h-14 rounded-xl font-medium text-lg transition-all duration-300 ${
            loading 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-blue-600 hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'
          } bg-blue-500 text-white`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin w-6 h-6 border-3 border-white border-t-transparent rounded-full mr-3" />
              İşleniyor...
            </div>
          ) : (
            'Onay Numarası Al'
          )}
        </button>
      </form>

      {result && (
        <div className={`mt-8 overflow-hidden ${
          result.status === 'success'
            ? theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'
            : theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'
        } rounded-xl`}>
          <div className={`p-4 ${
            result.status === 'success'
              ? theme === 'dark' ? 'bg-green-500/10' : 'bg-green-100/50'
              : theme === 'dark' ? 'bg-red-500/10' : 'bg-red-100/50'
          }`}>
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                result.status === 'success'
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
              }`}>
                {result.status === 'success' ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">
                  {result.status === 'success' ? 'İşlem Başarılı' : 'İşlem Başarısız'}
                </h3>
                <p className={`text-sm ${
                  result.status === 'success'
                    ? theme === 'dark' ? 'text-green-300' : 'text-green-600'
                    : theme === 'dark' ? 'text-red-300' : 'text-red-600'
                }`}>
                  {result.message}
                </p>
              </div>
            </div>
          </div>
          
          {result.status === 'success' && result.data?.confirmation_id_with_dash && (
            <div className="p-6">
              <div className={`p-4 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700/50' : 'bg-white'
              } border border-opacity-10 shadow-sm`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium opacity-75 mb-1">Onay Numarası</p>
                    <p className="font-mono text-lg tracking-wide">
                      {result.data.confirmation_id_with_dash}
                    </p>
                  </div>
                  <button
                    onClick={() => result.data && handleCopy(result.data.confirmation_id_with_dash)}
                    className={`p-3 rounded-lg hover:bg-opacity-80 transition-all duration-200 ${
                      theme === 'dark' 
                        ? 'bg-gray-600 hover:bg-gray-500' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    title="Kopyala"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {result.status === 'error' && (
            <div className="p-6">
              <div className={`p-4 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700/50' : 'bg-white'
              } border border-opacity-10 shadow-sm`}>
                <div className="space-y-4">
                  <p className="text-base">
                    {result.message}
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm font-medium opacity-75">Kontrol listesi:</p>
                    <ul className="text-sm space-y-1 list-disc list-inside opacity-75">
                      <li>Tüm kutucukların doğru doldurulduğundan emin olun</li>
                      <li>Her kutucukta 7 rakam olmalıdır</li>
                      <li>IID numarasını kurulum ekranından doğru kopyaladığınızdan emin olun</li>
                      <li>Microsoft ürününüzün lisansının aktif olduğundan emin olun</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 