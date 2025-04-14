export default function OrnekSeoPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Örnek SEO Sayfası (Sunucu Taraflı)</h1>
        
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Bu Sayfa Hakkında</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Bu sayfa, SEO meta etiketlerinin sunucu tarafında oluşturulması örneğidir.
            Tüm meta etiketleri sayfa kaynağında görülebilir.
          </p>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Sunucu Taraflı SEO Nasıl Çalışır?</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Next.js'in Metadata API'si, sayfaların meta etiketlerini sunucu tarafında oluşturur.
            Bu sayede arama motorları bu etiketleri sayfa kaynağında görebilir.
          </p>
          
          <ul className="list-disc list-inside space-y-2">
            <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">generateMetadata</code> fonksiyonu sayfa yüklenmeden önce çalışır</li>
            <li>Meta verileri veritabanından alınır</li>
            <li>HTML kaynağı bu meta verilerle birlikte oluşturulur</li>
            <li>Arama motorları bu etiketleri kolayca okuyabilir</li>
          </ul>
          
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-yellow-800 dark:text-yellow-200">
              <strong>İpucu:</strong> Bu sayfanın kaynağını görüntüleyin ve meta etiketlerinin HTML kodunda olduğunu görün.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 