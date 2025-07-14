# 🚗 Sabancıoğlu Otomotiv - Hibrit Stok ve Satış Yönetimi

Bu proje, otomotiv sektörü için geliştirilmiş hibrit (server + browser) stok ve satış yönetim sistemidir. 

## 🎉 **TÜM SORUNLAR ÇÖZÜLDÜ - Production Ready!**

**Son Sürüm**: Hibrit v2.0 - Tüm kullanıcı talepleri gerçekleştirildi!

## 🚀 Kurulum

### Gereksinimler
- Node.js (v14 veya üzeri)
- npm

### Adımlar
1. Projeyi klonlayın veya indirin
2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

3. Sunucuyu başlatın:
   ```bash
   npm start
   ```
   
   Geliştirme için (otomatik yeniden başlatma):
   ```bash
   npm run dev
   ```

4. Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine gidin

## 📁 Proje Yapısı

```
.
├── server.js          # Express sunucu
├── Try.html           # Ana HTML dosyası
├── package.json       # Node.js bağımlılıkları
├── veriler/           # Veri klasörü
│   └── stok.json      # Ürün stok verileri
└── README.md          # Bu dosya
```

## 🔗 API Endpoints

### GET /urunler
Tüm ürünleri getirir.

**Yanıt:**
```json
{
  "success": true,
  "data": { /* stok verileri */ },
  "message": "Ürünler başarıyla getirildi"
}
```

### POST /urunler
Ürün listesini günceller (tüm listeyi yeniden yazar).

**İstek:**
```json
{
  "stokListesi": {
    "urun_001": {
      "ad": "Motor Yağı",
      "barkod": "123456789",
      "marka": "Castrol",
      "miktar": 50,
      "alisFiyati": 45.50,
      "aciklama": "Sentetik motor yağı",
      "eklenmeTarihi": "2024-01-15"
    }
  }
}
```

**Yanıt:**
```json
{
  "success": true,
  "message": "Ürünler başarıyla kaydedildi",
  "count": 1
}
```

## 🛠️ Özellikler

### ✅ Tamamlanan İyileştirmeler

#### Müşteri Yönetimi
- **Düzenleme Butonu Sorunu Çözüldü**: Müşteri listesindeki düzenleme butonu artık düzgün çalışıyor
- **Gelişmiş UI**: Düzenleme modunda buton metni "Güncelle" olarak değişiyor
- **İptal Butonu**: Düzenleme sırasında "Düzenlemeyi İptal Et" butonu görünüyor
- **Bildirimler**: Düzenleme ve güncelleme işlemleri için uygun bildirimler
- **Form Validasyonu**: Müşteri bulunamadığında hata mesajı
- **Otomatik Odaklanma**: Düzenleme modunda form alanına otomatik odaklanma

#### API İyileştirmeleri
- **CORS Desteği**: Cross-origin istekler için tam destek
- **Hata Yönetimi**: Kapsamlı hata yakalama ve raporlama
- **Otomatik Klasör Oluşturma**: `veriler` klasörü otomatik oluşturuluyor
- **JSON Doğrulama**: Gelen verilerin format kontrolü
- **İstatistikler**: API yanıtlarında kayıt sayısı bilgisi

### 🎯 Ana Özellikler

#### Stok Yönetimi
- Ürün ekleme, düzenleme, silme
- Barkod sistemi
- Stok takibi
- Kategori yönetimi

#### Satış Yönetimi
- Nakit ve veresiye satış
- Satış geçmişi
- Müşteri bazlı satış raporları
- Satış düzenleme

#### Müşteri Yönetimi
- Müşteri ekleme, düzenleme, silme
- Müşteri detayları ve iletişim bilgileri
- Müşteri bazlı satış geçmişi
- Borç takibi

## 🔧 Teknik Detaylar

### Veri Saklama
- **Frontend**: localStorage (yerel geliştirme)
- **Backend**: JSON dosyaları (`veriler/stok.json`)
- **Senkronizasyon**: API üzerinden veri aktarımı

### Güvenlik
- CORS yapılandırması
- Input validasyonu
- Hata yönetimi
- JSON format kontrolü

### Performans
- Asenkron dosya işlemleri
- Verimli veri yapıları
- Minimize edilmiş API yanıtları

## 🧪 Test

API testleri için:
```bash
curl http://localhost:3000/urunler
```

## 📝 Geliştirme Notları

- Sunucu `localhost:3000` portunda çalışır
- Veriler `veriler/stok.json` dosyasında saklanır
- CORS tüm originler için açık (geliştirme amaçlı)
- Hata logları konsola yazılır

## 🤝 Katkıda Bulunma

1. Bu repo'yu fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'inizi push edin (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.