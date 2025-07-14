# Sabancıoğlu Otomotiv - Hibrit Stok ve Satış Yönetimi Sistemi

## 🚀 Hızlı Başlangıç (Son Kullanıcı İçin)

Bu sistem hem sunucu hem de tarayıcı tabanlı hibrit bir yapıda çalışır. Kurulum son derece basittir.

### 1. 📦 Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Sunucuyu başlat
npm start
```

### 2. 🌐 Kullanım

Sunucu başladıktan sonra tarayıcınızda şu adrese girin:
```
http://localhost:3000
```

## ✨ Yeni Özellikler ve Düzeltmeler

### ✅ Çözülen Sorunlar

1. **Hibrit Yapı**: ✅ Sunucu ve browser birlikte çalışır
2. **Stok Düzenleme**: ✅ Düzenlemeler artık doğru şekilde kaydediliyor
3. **Satış Geçmişi**: ✅ Barkod yerine ürün adları doğru gösteriliyor
4. **Açıklama Tarihi**: ✅ Stok düzenlemesinde tarih otomatik eklenmez
5. **Veri Kaydetme**: ✅ Satış geçmişi ve müşteri verileri de kaydediliyor
6. **Barkod Yazdırma**: ✅ Önizleme hataları düzeltildi

### 🔧 Teknik İyileştirmeler

- **Otomatik Kaydetme**: Tüm veriler otomatik olarak sunucuya kaydediliyor
- **Veri Senkronizasyonu**: Server ve tarayıcı verileri senkronize
- **Hata Yönetimi**: Gelişmiş hata kontrolü ve kullanıcı bildirimleri
- **Performans**: Optimize edilmiş veri işleme

## 📋 Sistem Özellikleri

### 🏪 Stok Yönetimi
- Ürün ekleme, düzenleme, silme
- Barkod sistemi
- Otomatik veri kaydetme
- Excel içe/dışa aktarma

### 💰 Satış İşlemleri
- Nakit ve borç satış
- Müşteri bazlı satış takibi
- Satış geçmişi
- İade işlemleri

### 👥 Müşteri Yönetimi
- Müşteri kayıtları
- Borç takibi
- Müşteri satış geçmişi

### 📊 Raporlama
- Kar/zarar analizi
- Satış raporları
- Stok raporları

## 🛠️ Veri Yönetimi

### Otomatik Kaydetme
- Her işlem sonrası otomatik sunucuya kaydetme
- LocalStorage ile tarayıcı yedeği
- Çakışma durumunda kullanıcı seçimi

### Manuel İşlemler
- **JSON Dışa Aktar**: Tüm verileri yedekle
- **JSON İçe Aktar**: Yedekten geri yükle
- **Sunucuya Kaydet**: Manuel kaydetme
- **Sunucudan Yükle**: Server verilerini çek

## 🖨️ Barkod Yazdırma

1. Ürün listesinde "Barkod Bas" butonuna tıklayın
2. Önizleme penceresi açılır
3. "Yazdır" butonuna tıklayın
4. Yazdırma penceresi otomatik açılır

## 📁 Veri Dosyaları

Veriler `veriler/` klasöründe saklanır:
- `stok.json` - Stok verileri
- `satisGecmisi.json` - Satış kayıtları
- `musteriler.json` - Müşteri bilgileri
- `tumVeriler.json` - Tüm veriler (yedek)

## 🔌 API Endpoint'leri

- `GET /api/tum-veriler` - Tüm verileri getir
- `POST /api/tum-veriler` - Tüm verileri kaydet
- `GET /urunler` - Sadece stok verilerini getir (eski)
- `POST /urunler` - Sadece stok verilerini kaydet (eski)

## 🎯 Kullanım İpuçları

### Stok İşlemleri
1. **Yeni Ürün**: Barkod ve ürün adı zorunlu
2. **Düzenleme**: Listeden "Düzenle" butonuna tıklayın
3. **Otomatik Tarih**: Sadece yeni ürünlerde açıklamaya tarih eklenir

### Satış İşlemleri
1. **Nakit Satış**: Ürün yanındaki "Sat" butonuna tıklayın
2. **Borç Satış**: "Borca Sat" seçeneğini işaretleyin
3. **Müşteri Seçimi**: Borç satışlarda müşteri seçimi zorunlu

### Veri Güvenliği
- Düzenli olarak JSON yedek alın
- Sunucu verilerini kontrol edin
- Önemli işlemler öncesi yedek yapın

## ⚠️ Önemli Notlar

- Sunucu her zaman çalışır durumda kalmalı
- Tarayıcı kapatılsa bile veriler sunucuda saklanır
- JSON içe aktarma mevcut verilerin üzerine yazar
- Barkod yazdırma için popup'ların açık olması gerekli

## 🆘 Sorun Giderme

### Sunucu Başlatma Sorunları
```bash
# Port zaten kullanılıyorsa
killall node
npm start
```

### Veri Kaydetme Sorunları
1. Sunucu çalışıyor mu kontrol edin
2. "Sunucuya Kaydet" butonunu kullanın
3. Tarayıcı konsolunu kontrol edin

### Barkod Yazdırma Sorunları
1. Popup blocker'ı devre dışı bırakın
2. Barkod önizlemesini kontrol edin
3. Tarayıcıyı yenileyin ve tekrar deneyin

---

**Son Güncelleme**: Tüm istenen düzeltmeler uygulandı
**Sürüm**: Hibrit v2.0 - Production Ready

Bu sistem artık son kullanıcı için hazır ve tüm sorunlar çözülmüştür.