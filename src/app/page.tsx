'use client';

import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import axios, { AxiosError } from 'axios';

export default function Home() {
  const [iid, setIid] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!iid) {
      toast.error('Lütfen IID giriniz');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`https://pidkey.com/ajax/cidms_api?iids=${iid}&justforcheck=0&apikey=Sd0zJS8vlm5VnkltMR2CqPI8n`);
      if (response.data) {
        toast.success('Onay numarası başarıyla alındı!');
        // Burada response.data ile gelen onay numarasını işleyebilirsiniz
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof AxiosError 
        ? error.response?.data?.message || 'API yanıt hatası'
        : 'Bir hata oluştu';
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
      </div>
      <Toaster position="top-right" />
    </main>
  );
}
