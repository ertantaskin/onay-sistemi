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
    const fullIID = iidParts.join('');

    if (fullIID.length !== 63) {
      toast.error('Lütfen tüm IID alanlarını doldurun');
      return;
    }

    setLoading(true);
    setResult(null);
    
    try {
      const response = await axios.get(`https://pidkey.com/ajax/cidms_api?iids=${fullIID}&justforcheck=0&apikey=Sd0zJS8vlm5VnkltMR2CqPI8n`);
      
      if (response.data) {
        const apiResponse = response.data as ApiResponse;
        
        if (apiResponse.error_executing || apiResponse.had_occurred || !apiResponse.confirmation_id_with_dash) {
          setResult({
            status: 'error',
            data: apiResponse,
            message: 'Girdiğiniz IID numarası geçersiz. Lütfen numaraları tekrar kontrol edin ve lisansın aktif olduğundan emin olun.'
          });
          toast.error('Geçersiz IID numarası');
        } else {
          // Önce veritabanına kaydet
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

            // Başarılı kayıt durumu
            setResult({
              status: 'success',
              data: apiResponse,
              message: 'Onay numarası başarıyla alındı ve kaydedildi!'
            });
            toast.success('Onay numarası başarıyla alındı ve kaydedildi!');
          } catch (error) {
            console.error('Onay kaydı hatası:', error);
            toast.error('Onay kaydedilirken bir hata oluştu');
            
            // Kayıt başarısız olsa da onay numarasını göster
            setResult({
              status: 'success',
              data: apiResponse,
              message: 'Onay numarası alındı fakat kayıt edilemedi!'
            });
          }
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof AxiosError 
        ? error.response?.data?.message || 'Sunucu yanıt hatası'
        : 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
      setResult({
        status: 'error',
        message: errorMessage
      });
      toast.error(`İşlem başarısız: ${errorMessage}`);
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
              <h3 className={`ml-3 text-lg font-medium ${
                result.status === 'success'
                  ? theme === 'dark' ? 'text-green-100' : 'text-green-800'
                  : theme === 'dark' ? 'text-red-100' : 'text-red-800'
              }`}>
                {result.message}
              </h3>
            </div>
          </div>

          {result.data && result.data.confirmation_id_with_dash && (
            <div className="p-6">
              <div className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                <p className="text-sm font-medium mb-1">Onay Numarası:</p>
                <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <code className="text-lg font-mono">{result.data.confirmation_id_with_dash}</code>
                  <button
                    onClick={() => handleCopy(result.data.confirmation_id_with_dash)}
                    className="ml-4 p-2 text-blue-500 hover:text-blue-600 focus:outline-none"
                    title="Kopyala"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 