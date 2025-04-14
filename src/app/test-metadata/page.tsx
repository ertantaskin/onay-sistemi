import { Metadata } from 'next';
import MetaTester from './MetaTester';
import { getPageMetadata } from '../components/MetadataProvider';

// Metadata üretecini tanımlıyoruz
export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/test-metadata');
}

export default function TestMetadataPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Metadata Test Sayfası</h1>
        
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Bu Sayfa Hakkında</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Bu sayfa, admin panelinden eklenen SEO verilerinin sayfa metadata'sına doğru şekilde yansıyıp yansımadığını test etmek için kullanılır.
          </p>
          
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-yellow-800 dark:text-yellow-200">
              <strong>Nasıl Test Edilir:</strong> Admin paneli SEO ayarlarında <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">/test-metadata</code> sayfası için bir kayıt oluşturun 
              ve sayfayı yenileyin. Sayfa başlığının ve diğer meta etiketlerinin değiştiğini göreceksiniz.
            </p>
          </div>
        </div>
        
        {/* Meta etiketlerini test etme bileşeni */}
        <MetaTester />
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Kontrol Adımları</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Admin panelinden <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">/test-metadata</code> için bir SEO kaydı oluşturun</li>
            <li>Kaydı aktif olarak işaretleyin</li>
            <li>Bu sayfayı tarayıcıda görüntüleyin</li>
            <li>Tarayıcı sekmesindeki başlığın değiştiğini kontrol edin</li>
            <li>Sayfanın kaynağını görüntüleyip meta etiketlerini kontrol edin</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 