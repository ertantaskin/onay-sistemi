#!/bin/bash

# Çalışma dizinini projenin kök dizinine ayarla
cd "$(dirname "$0")/../.."

# Node.js ile create-page-contents.js dosyasını çalıştır
echo "Sayfa içerikleri oluşturuluyor..."
node src/scripts/create-page-contents.js

# İşlem başarılı olduysa bildir
if [ $? -eq 0 ]; then
  echo "İşlem başarıyla tamamlandı!"
else
  echo "İşlem sırasında bir hata oluştu!"
  exit 1
fi