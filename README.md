# Microsoft Onay Sistemi

Bu proje, kullanıcıların kredi yükleyerek Microsoft onay numarası almalarını sağlayan bir web uygulamasıdır.

## Özellikler

- 👤 Kullanıcı kaydı ve girişi
- 💳 Kredi yükleme ve bakiye görüntüleme
- 🎫 Kupon kodu ile kredi yükleme
- ✅ IID yükleme kimliği ile onay numarası alma
- 📜 Onay geçmişi görüntüleme
- 👑 Admin paneli ile kullanıcı ve onay yönetimi
- 📊 Detaylı istatistikler ve raporlar
- 📱 Mobil uyumlu tasarım

## Teknolojiler

- Next.js 14 (App Router)
- TypeScript
- MongoDB
- NextAuth.js
- TailwindCSS
- Headless UI
- Heroicons

## Kurulum

1. Repoyu klonlayın:
```bash
git clone https://github.com/your-username/onay-sistemi.git
cd onay-sistemi
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. `.env` dosyasını oluşturun ve gerekli değişkenleri ayarlayın:
```env
MONGODB_URI=your-mongodb-uri
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

4. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

## Dağıtım

1. Vercel'e dağıtım için:
```bash
npm run build
vercel deploy
```

2. Ortam değişkenlerini Vercel'de ayarlayın:
- MONGODB_URI
- NEXTAUTH_SECRET
- NEXTAUTH_URL

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.
