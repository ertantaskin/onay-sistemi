"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { use } from "react";

// JSON editörünü artık kullanmayacağız

export default function EditPageContent({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pageContent, setPageContent] = useState<any>(null);
  const resolvedParams = use(params);
  const pageId = resolvedParams.id;

  useEffect(() => {
    fetchPageContent();
  }, [pageId]);

  const fetchPageContent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/page-content/${pageId}`);
      
      if (!response.ok) {
        throw new Error("Sayfa içeriği yüklenirken bir hata oluştu");
      }
      
      const data = await response.json();
      setPageContent(data);
    } catch (error) {
      console.error("Sayfa içeriği yüklenirken hata:", error);
      toast.error("Sayfa içeriği yüklenirken bir hata oluştu");
      router.push("/admin/page-content");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPageContent((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageContent((prev: any) => ({
      ...prev,
      isActive: e.target.checked,
    }));
  };

  // JSON değişiklik fonksiyonunu kaldırıyoruz

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Mevcut content değerini koruyalım
      const contentToSave = {
        ...pageContent,
        // content alanını değiştirmiyoruz, mevcut değeri koruyoruz
      };

      const response = await fetch(`/api/admin/page-content/${pageId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contentToSave),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Sayfa içeriği güncellenirken bir hata oluştu");
      }

      toast.success("Sayfa içeriği başarıyla güncellendi");
      router.refresh();
    } catch (error: any) {
      console.error("Sayfa içeriği güncellenirken hata:", error);
      toast.error(error.message || "Sayfa içeriği güncellenirken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Bu sayfa içeriğini silmek istediğinizden emin misiniz?")) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/admin/page-content/${pageId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Sayfa içeriği silinirken bir hata oluştu");
      }

      toast.success("Sayfa içeriği başarıyla silindi");
      router.push("/admin/page-content");
    } catch (error: any) {
      console.error("Sayfa içeriği silinirken hata:", error);
      toast.error(error.message || "Sayfa içeriği silinirken bir hata oluştu");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!pageContent) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
          <p>Sayfa içeriği bulunamadı.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold">Sayfa İçeriği Düzenle</h1>
          <div className="ml-4 text-sm text-blue-500">
            <span className="font-medium">Not:</span> Sadece meta veriler düzenlenebilir
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => router.push("/admin/page-content")}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Geri Dön
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {deleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                Siliniyor...
              </>
            ) : (
              "Sil"
            )}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="pageKey" className="block text-sm font-medium">Sayfa Anahtarı</label>
                <input
                  id="pageKey"
                  name="pageKey"
                  type="text"
                  value={pageContent.pageKey}
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
                  value={pageContent.title}
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
                  value={pageContent.description}
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
                  value={pageContent.metaTitle || ""}
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
                  value={pageContent.metaDesc || ""}
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
                  checked={pageContent.isActive}
                  onChange={handleSwitchChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="block text-sm font-medium">Aktif</label>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Not:</strong> Sayfa içeriği otomatik olarak yönetilmektedir. Sadece meta veriler (başlık, açıklama, vb.) düzenlenebilir.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => router.push("/admin/page-content")}
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
                  Kaydediliyor...
                </>
              ) : (
                "Kaydet"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 