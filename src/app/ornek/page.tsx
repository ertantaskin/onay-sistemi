import MetaTester from '../test-metadata/MetaTester';
import TestApiComponent from './test-api';

export default function OrnekPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Örnek Sayfa</h1>
        
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Bu Sayfa Hakkında</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Bu sayfa, yeni metadata sağlayıcı mekanizmasını test etmek için oluşturulmuştur.
            Admin panelinde '/ornek' yolu için bir SEO ayarı oluşturarak test edebilirsiniz.
          </p>
          
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-yellow-800 dark:text-yellow-200">
              <strong>Nasıl Test Edilir:</strong> Admin paneli SEO ayarlarında <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">/ornek</code> sayfası için bir kayıt oluşturun 
              ve sayfayı yenileyin. Sayfa başlığının ve diğer meta etiketlerinin değiştiğini göreceksiniz.
            </p>
          </div>
        </div>
        
        {/* Meta etiketlerini test etme bileşeni */}
        <MetaTester />
        
        {/* API Test Bileşeni */}
        <TestApiComponent />
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Yeni Metadata Sistemi Nasıl Çalışır?</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Yeni metadata sistemi, merkezi bir MetadataProvider bileşeni kullanarak çalışır:
          </p>
          
          <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
            <li>Her sayfa için bir <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">layout.tsx</code> dosyası oluşturun</li>
            <li>Layout dosyasına <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">generateMetadata()</code> fonksiyonunu ekleyin</li>
            <li>Bu fonksiyon içinde <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">getPageMetadata('/sayfa-yolu')</code> çağrısı yapın</li>
            <li>Admin panelinde ilgili sayfa yolu için SEO ayarları ekleyin</li>
            <li>Sayfanın meta etiketleri otomatik olarak güncellenecektir</li>
          </ol>
          
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-800 dark:text-green-200">
              <strong>İpucu:</strong> Tüm sayfalar için dinamik metadata ayarlamak istiyorsanız, layout dosyalarını ilgili sayfa dizinlerine ekleyin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 