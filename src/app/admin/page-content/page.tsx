"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, HelpCircle, Pencil, Trash2, RefreshCw, Database } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface PageContent {
  id: string;
  pageKey: string;
  title: string;
  description: string;
  metaTitle?: string;
  metaDesc?: string;
  content: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PageContentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seedingContent, setSeedingContent] = useState(false);
  const [pageContents, setPageContents] = useState<PageContent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newPageContent, setNewPageContent] = useState({
    pageKey: "",
    title: "",
    description: "",
    metaTitle: "",
    metaDesc: "",
    content: {},
    isActive: true,
  });

  useEffect(() => {
    fetchPageContents();
  }, []);

  const fetchPageContents = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/page-content");
      
      if (!response.ok) {
        throw new Error("Sayfa içerikleri alınamadı");
      }
      
      const data = await response.json();
      setPageContents(data);
    } catch (error) {
      console.error("Sayfa içerikleri alınırken hata oluştu:", error);
      toast.error("Sayfa içerikleri alınamadı");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewPageContent({ ...newPageContent, [id]: value });
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = e.target;
    setNewPageContent({ ...newPageContent, [id]: checked });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/admin/page-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPageContent),
      });

      if (!response.ok) {
        throw new Error("Sayfa içeriği oluşturulamadı");
      }

      toast.success("Sayfa içeriği başarıyla oluşturuldu");
      setNewPageContent({
        pageKey: "",
        title: "",
        description: "",
        metaTitle: "",
        metaDesc: "",
        content: {},
        isActive: true,
      });
      setShowForm(false);
      fetchPageContents();
    } catch (error: any) {
      console.error("Sayfa içeriği oluşturulurken hata oluştu:", error);
      toast.error(error.message || "Sayfa içeriği oluşturulamadı");
    } finally {
      setSaving(false);
    }
  };

  const handleSeedPageContents = async () => {
    setSeedingContent(true);
    try {
      const response = await fetch("/api/admin/page-content/seed");
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Sayfa içerikleri oluşturulamadı");
      }
      
      const data = await response.json();
      toast.success(data.message || "Sayfa içerikleri başarıyla oluşturuldu");
      fetchPageContents();
    } catch (error) {
      console.error("Sayfa içerikleri oluşturulurken hata oluştu:", error);
      toast.error(error instanceof Error ? error.message : "Sayfa içerikleri oluşturulamadı");
    } finally {
      setSeedingContent(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Sayfa İçerikleri</h1>
          <div className="flex space-x-2">
            <button 
              onClick={() => handleSeedPageContents()}
              className="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-md"
              disabled={seedingContent}
            >
              {seedingContent ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  İçerikler Oluşturuluyor...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Örnek İçerikleri Oluştur
                </>
              )}
            </button>
            <button 
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md"
            >
              {showForm ? "İptal" : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Yeni Sayfa İçeriği
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Yeni Sayfa İçeriği Oluştur</h2>
            <div className="text-sm text-blue-500">
              <span className="font-medium">Not:</span> Sadece meta veriler düzenlenebilir
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="pageKey" className="block text-sm font-medium">Sayfa Anahtarı</label>
                  <input
                    id="pageKey"
                    name="pageKey"
                    type="text"
                    value={newPageContent.pageKey}
                    onChange={handleInputChange}
                    placeholder="Örn: home, about, contact"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Bu anahtar, içeriği çekmek için kullanılacak benzersiz bir tanımlayıcıdır.
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="title" className="block text-sm font-medium">Başlık</label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={newPageContent.title}
                    onChange={handleInputChange}
                    placeholder="Sayfa Başlığı"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="block text-sm font-medium">Açıklama</label>
                  <textarea
                    id="description"
                    name="description"
                    value={newPageContent.description}
                    onChange={handleInputChange}
                    placeholder="Sayfa açıklaması"
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="metaTitle" className="block text-sm font-medium">Meta Başlık (SEO)</label>
                  <input
                    id="metaTitle"
                    name="metaTitle"
                    type="text"
                    value={newPageContent.metaTitle}
                    onChange={handleInputChange}
                    placeholder="Meta başlık"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="metaDesc" className="block text-sm font-medium">Meta Açıklama (SEO)</label>
                  <textarea
                    id="metaDesc"
                    name="metaDesc"
                    value={newPageContent.metaDesc}
                    onChange={handleInputChange}
                    placeholder="Meta açıklama"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    id="isActive"
                    name="isActive"
                    type="checkbox"
                    checked={newPageContent.isActive}
                    onChange={handleSwitchChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="block text-sm font-medium">Aktif</label>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Not:</strong> Sayfa içeriği otomatik olarak oluşturulacaktır. Sadece meta veriler (başlık, açıklama, vb.) düzenlenebilir.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                disabled={saving}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                İptal
              </button>
              <button 
                type="submit" 
                disabled={saving}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                    Oluşturuluyor...
                  </>
                ) : (
                  "Oluştur"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium">Mevcut Sayfa İçerikleri</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Sistemde kayıtlı tüm sayfa içerikleri - Sadece meta veriler düzenlenebilir
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Sayfa Anahtarı
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Başlık
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Durum
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Oluşturulma Tarihi
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {pageContents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    Kayıtlı sayfa içeriği bulunamadı
                  </td>
                </tr>
              ) : (
                pageContents.map((page) => (
                  <tr key={page.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      {page.pageKey}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {page.title}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        page.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}>
                        {page.isActive ? "Aktif" : "Pasif"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(page.createdAt).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => router.push(`/admin/page-content/${page.id}`)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-xs font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Düzenle
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 