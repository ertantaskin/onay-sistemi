'use client';

import { useState } from 'react';
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

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Onay numarası kopyalandı!');
    } catch {
      toast.error('Kopyalama başarısız oldu');
    }
  };

  return (
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
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
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
          
          {result.status === 'success' && result.data?.confirmation_id_with_dash && (
            <div className={`mt-3 p-3 rounded ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } border border-opacity-10`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium mb-1">Onay Numarası:</p>
                  <p className="font-mono text-sm break-all">
                    {result.data.confirmation_id_with_dash}
                  </p>
                </div>
                <button
                  onClick={() => result.data && handleCopy(result.data.confirmation_id_with_dash)}
                  className={`p-2 rounded hover:bg-opacity-80 transition-colors ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                  }`}
                  title="Kopyala"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 