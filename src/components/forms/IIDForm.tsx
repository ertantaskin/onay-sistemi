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
            message: apiResponse.result || 'Geçersiz IID numarası'
          });
          toast.error(apiResponse.result || 'Geçersiz IID numarası');
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
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label htmlFor="iid-0" className="block text-lg font-medium mb-3">
            IID (Yükleme Kimliği)
          </label>
          <div className="grid grid-cols-3 md:grid-cols-9 gap-2">
            {iidParts.map((part, index) => (
              <div key={index} className="relative">
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
                  className={`w-full px-2 py-3 text-center rounded-lg border text-lg font-mono ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                      : 'bg-white border-gray-300 focus:border-blue-500'
                  } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200`}
                  placeholder="0000000"
                  maxLength={7}
                  inputMode="numeric"
                />
                {index < 8 && (
                  <span className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 text-gray-400 font-mono">
                    -
                  </span>
                )}
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            IID numaranızı Microsoft ürününüzün kurulum ekranında bulabilirsiniz. Her kutu 7 rakam içermelidir.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 px-6 rounded-xl font-medium text-lg transition-all duration-200 ${
            loading 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-blue-600 hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'
          } bg-blue-500 text-white`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              İşleniyor...
            </div>
          ) : (
            'Onay Numarası Al'
          )}
        </button>
      </form>

      {result && (
        <div className={`mt-8 p-6 rounded-xl ${
          result.status === 'success'
            ? theme === 'dark' ? 'bg-green-900/30 text-green-300' : 'bg-green-50 text-green-800'
            : theme === 'dark' ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-800'
        }`}>
          <div className="flex items-center mb-4">
            {result.status === 'success' ? (
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <h3 className="text-lg font-medium">
              {result.status === 'success' ? 'İşlem Başarılı' : 'İşlem Başarısız'}
            </h3>
          </div>
          
          <p className="text-base mb-4">{result.message}</p>
          
          {result.status === 'success' && result.data?.confirmation_id_with_dash && (
            <div className={`p-4 rounded-xl ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } border border-opacity-10 shadow-sm`}>
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <p className="text-base font-medium">Onay Numarası:</p>
                  <p className="font-mono text-lg break-all">
                    {result.data.confirmation_id_with_dash}
                  </p>
                </div>
                <button
                  onClick={() => result.data && handleCopy(result.data.confirmation_id_with_dash)}
                  className={`p-3 rounded-lg hover:bg-opacity-80 transition-colors ${
                    theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  title="Kopyala"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </button>
              </div>
              {result.data.typeiid && (
                <div className="mt-4 pt-4 border-t border-current border-opacity-10">
                  <p className="text-sm opacity-75">
                    Ürün Tipi: {result.data.typeiid}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 