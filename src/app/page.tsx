'use client';

import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import axios, { AxiosError } from 'axios';

interface ApiResponse {
  status: string;
  confirmationId?: string;
  message?: string;
}

export default function Home() {
  const [iid, setIid] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);

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
        const apiResponse: ApiResponse = {
          status: 'success',
          confirmationId: response.data,
          message: 'Onay numarası başarıyla alındı!'
        };
        setResult(apiResponse);
        toast.success('Onay numarası başarıyla alındı!');
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
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Microsoft Onay Sistemi
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="iid" className="block text-sm font-medium text-gray-700 mb-2">
              IID (Yükleme Kimliği)
            </label>
            <input
              type="text"
              id="iid"
              value={iid}
              onChange={(e) => setIid(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="IID numaranızı giriniz"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'İşleniyor...' : 'Onay Numarası Al'}
          </button>
        </form>

        {result && (
          <div className={`mt-6 p-4 rounded-lg border ${
            result.status === 'success' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center mb-2">
              {result.status === 'success' ? (
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <h3 className={`font-medium ${
                result.status === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.status === 'success' ? 'İşlem Başarılı' : 'İşlem Başarısız'}
              </h3>
            </div>
            
            <p className={`text-sm ${
              result.status === 'success' ? 'text-green-700' : 'text-red-700'
            }`}>
              {result.message}
            </p>
            
            {result.confirmationId && (
              <div className="mt-3 p-3 bg-white border border-green-100 rounded">
                <p className="text-sm font-medium text-gray-600">Onay Numarası:</p>
                <p className="mt-1 font-mono text-green-800 break-all select-all">
                  {result.confirmationId}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      <Toaster position="top-right" />
    </main>
  );
}
