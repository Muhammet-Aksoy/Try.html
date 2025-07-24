const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const nodemailer = require('nodemailer');
const cron = require('node-cron');

const app = express();
const PORT = 3000;

// SQLite veritabanı dosyası
const dbPath = path.join(__dirname, 'veriler', 'veritabani.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Veritabanı açılamadı:', err.message);
    } else {
        console.log('SQLite veritabanına bağlanıldı.');
    }
});

// Tablo oluşturma
function initializeDatabase() {
    db.serialize(() => {
        db.run('DROP TABLE IF EXISTS stok');
        db.run(`CREATE TABLE IF NOT EXISTS stok (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            barkod TEXT,
            ad TEXT,
            miktar INTEGER,
            alisFiyati REAL,
            satisFiyati REAL,
            kategori TEXT,
            aciklama TEXT
        )`);
        db.run(`CREATE TABLE IF NOT EXISTS satisGecmisi (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            barkod TEXT,
            miktar INTEGER,
            fiyat REAL,
            alisFiyati REAL,
            musteriId TEXT,
            tarih TEXT,
            borc INTEGER,
            toplam REAL
        )`);
        db.run(`CREATE TABLE IF NOT EXISTS musteriler (
            id TEXT PRIMARY KEY,
            ad TEXT,
            telefon TEXT,
            adres TEXT,
            bakiye REAL
        )`);
        db.run(`CREATE TABLE IF NOT EXISTS borclarim (
            id TEXT PRIMARY KEY,
            musteriId TEXT,
            tutar REAL,
            aciklama TEXT,
            tarih TEXT
        )`);
    });
}

initializeDatabase();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('.'));

// Veriler klasörünü oluştur
const dataDir = path.join(__dirname, 'veriler');
const stockFile = path.join(dataDir, 'stok.json');
const salesFile = path.join(dataDir, 'satisGecmisi.json');
const customersFile = path.join(dataDir, 'musteriler.json');
const allDataFile = path.join(dataDir, 'tumVeriler.json');

// initializeData fonksiyonu ve çağrısı kaldırıldı, sadece initializeDatabase kullanılacak

// API Routes

// GET /api/tum-veriler - Tüm verileri döndür
app.get('/api/tum-veriler', async (req, res) => {
    try {
        db.serialize(() => {
            let stokListesi = {};
            let satisGecmisi = [];
            let musteriler = {};
            let borclarim = {};
            
            db.all('SELECT * FROM stok', [], (err, stokRows) => {
                if (err) return res.status(500).json({ success: false, message: 'Stok verisi okunamadı', error: err.message });
                stokRows.forEach(row => { stokListesi[row.barkod] = row; });
                db.all('SELECT * FROM satisGecmisi', [], (err, satisRows) => {
                    if (err) return res.status(500).json({ success: false, message: 'Satış geçmişi okunamadı', error: err.message });
                    satisGecmisi = satisRows;
                    db.all('SELECT * FROM musteriler', [], (err, musteriRows) => {
                        if (err) return res.status(500).json({ success: false, message: 'Müşteriler okunamadı', error: err.message });
                        musteriRows.forEach(row => { musteriler[row.id] = row; });
                        db.all('SELECT * FROM borclarim', [], (err, borcRows) => {
                            if (err) return res.status(500).json({ success: false, message: 'Borçlar okunamadı', error: err.message });
                            borcRows.forEach(row => { borclarim[row.id] = row; });
                            res.json({
                                success: true,
                                data: { stokListesi, satisGecmisi, musteriler, borclarim },
                                message: 'Tüm veriler başarıyla getirildi'
                            });
                        });
                    });
                });
            });
        });
    } catch (error) {
        console.error('Veriler okunurken hata:', error);
        res.status(500).json({
            success: false,
            message: 'Veriler okunurken hata oluştu',
            error: error.message
        });
    }
});

// POST /api/tum-veriler - Tüm verileri kaydet
app.post('/api/tum-veriler', async (req, res) => {
    try {
        const { stokListesi, satisGecmisi, musteriler } = req.body;
        if (!stokListesi || !satisGecmisi || !musteriler) {
            return res.status(400).json({
                success: false,
                message: 'Eksik veri: stokListesi, satisGecmisi ve musteriler gerekli'
            });
        }
        db.serialize(() => {
            // Stok tablosunu güncelle
            db.run('DELETE FROM stok');
            for (const barkod in stokListesi) {
                const urun = stokListesi[barkod];
                db.run(`INSERT INTO stok (barkod, ad, miktar, alisFiyati, satisFiyati, kategori, aciklama) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [urun.barkod, urun.ad, urun.miktar, urun.alisFiyati, urun.satisFiyati, urun.kategori, urun.aciklama]);
            }
            // Satış geçmişi tablosunu güncelle
            db.run('DELETE FROM satisGecmisi');
            for (const satis of satisGecmisi) {
                db.run(`INSERT INTO satisGecmisi (barkod, miktar, fiyat, alisFiyati, musteriId, tarih, borc, toplam) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [satis.barkod, satis.miktar, satis.fiyat, satis.alisFiyati, satis.musteriId, satis.tarih, satis.borc, satis.toplam]);
            }
            // Müşteriler tablosunu güncelle
            db.run('DELETE FROM musteriler');
            for (const id in musteriler) {
                const musteri = musteriler[id];
                db.run(`INSERT INTO musteriler (id, ad, telefon, adres, bakiye) VALUES (?, ?, ?, ?, ?)`,
                    [musteri.id, musteri.ad, musteri.telefon, musteri.adres, musteri.bakiye]);
            }
            res.json({
                success: true,
                message: 'Tüm veriler başarıyla kaydedildi',
                stats: {
                    stokSayisi: Object.keys(stokListesi).length,
                    satisSayisi: satisGecmisi.length,
                    musteriSayisi: Object.keys(musteriler).length
                }
            });
        });
    } catch (error) {
        console.error('Veriler kaydedilirken hata:', error);
        res.status(500).json({
            success: false,
            message: 'Veriler kaydedilirken hata oluştu',
            error: error.message
        });
    }
});

// Eski endpoint'ler (geriye uyumluluk için)
app.get('/urunler', async (req, res) => {
    try {
        db.all('SELECT * FROM stok', [], (err, rows) => {
            if (err) {
                console.error('Ürünler okunurken hata:', err);
                return res.status(500).json({ success: false, message: 'Ürünler okunurken hata oluştu', error: err.message });
            }
            let stokData = {};
            rows.forEach(row => { stokData[row.barkod] = row; });
            res.json({
                success: true,
                data: stokData,
                message: 'Ürünler başarıyla getirildi'
            });
        });
    } catch (error) {
        console.error('Ürünler okunurken hata:', error);
        res.status(500).json({
            success: false,
            message: 'Ürünler okunurken hata oluştu',
            error: error.message
        });
    }
});

app.post('/urunler', async (req, res) => {
    try {
        const { stokListesi } = req.body;
        if (!stokListesi || typeof stokListesi !== 'object') {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz veri formatı. stokListesi objesi bekleniyor.'
            });
        }
        db.serialize(() => {
            db.run('DELETE FROM stok');
            for (const barkod in stokListesi) {
                const urun = stokListesi[barkod];
                db.run(`INSERT INTO stok (barkod, ad, miktar, alisFiyati, satisFiyati, kategori, aciklama) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [urun.barkod, urun.ad, urun.miktar, urun.alisFiyati, urun.satisFiyati, urun.kategori, urun.aciklama]);
            }
            res.json({
                success: true,
                message: 'Ürünler başarıyla kaydedildi',
                count: Object.keys(stokListesi).length
            });
        });
    } catch (error) {
        console.error('Ürünler kaydedilirken hata:', error);
        res.status(500).json({
            success: false,
            message: 'Ürünler kaydedilirken hata oluştu',
            error: error.message
        });
    }
});

// Ana sayfa için HTML dosyasını serve et
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Try.html'));
});

// Hata yakalama middleware
app.use((error, req, res, next) => {
    console.error('Sunucu hatası:', error);
    res.status(500).json({
        success: false,
        message: 'Sunucu hatası oluştu',
        error: error.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint bulunamadı'
    });
});

// Yedek dosyasını mail ile gönder
async function sendBackupMail() {
    try {
        // Tüm verileri veritabanından çek
        let allData = {};
        await new Promise((resolve, reject) => {
            db.serialize(() => {
                let stokListesi = {};
                let satisGecmisi = [];
                let musteriler = {};
                let borclarim = {};
                db.all('SELECT * FROM stok', [], (err, stokRows) => {
                    if (err) return reject(err);
                    stokRows.forEach(row => { stokListesi[row.barkod] = row; });
                    db.all('SELECT * FROM satisGecmisi', [], (err, satisRows) => {
                        if (err) return reject(err);
                        satisGecmisi = satisRows;
                        db.all('SELECT * FROM musteriler', [], (err, musteriRows) => {
                            if (err) return reject(err);
                            musteriRows.forEach(row => { musteriler[row.id] = row; });
                            db.all('SELECT * FROM borclarim', [], (err, borcRows) => {
                                if (err) return reject(err);
                                borcRows.forEach(row => { borclarim[row.id] = row; });
                                allData = { stokListesi, satisGecmisi, musteriler, borclarim };
                                resolve();
                            });
                        });
                    });
                });
            });
        });
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'yedek@example.com', // GÖNDEREN MAIL
                pass: 'uygunuygulamasifresi' // Uygulama şifresi veya app password
            }
        });
        await transporter.sendMail({
            from: 'yedek@example.com',
            to: 'yedek@example.com', // ALICI MAIL
            subject: `Günlük Yedek - ${new Date().toLocaleDateString('tr-TR')}`,
            text: 'Günlük otomatik yedek dosyası ektedir.',
            attachments: [
                {
                    filename: `yedek_${new Date().toISOString().replace(/:/g, '-')}.json`,
                    content: JSON.stringify(allData, null, 2)
                }
            ]
        });
        console.log('Yedek maili gönderildi.');
    } catch (error) {
        console.error('Yedek maili gönderilemedi:', error);
    }
}
// Her gün gece 23:59'da yedek maili gönder
cron.schedule('59 23 * * *', () => {
    sendBackupMail();
});

// Sunucuyu başlat
async function startServer() {
    // initializeData(); // Bu satır kaldırıldı
    
    app.listen(PORT, () => {
        console.log(`🚀 Server çalışıyor: http://localhost:${PORT}`);
        console.log(`📁 Veriler klasörü: ${dataDir}`);
        console.log(`📄 Veri dosyaları:`);
        console.log(`   - Stok: ${stockFile}`);
        console.log(`   - Satışlar: ${salesFile}`);
        console.log(`   - Müşteriler: ${customersFile}`);
        console.log(`   - Tüm Veriler: ${allDataFile}`);
        console.log('');
        console.log('API Endpoints:');
        console.log(`  GET  /api/tum-veriler - Tüm verileri getir`);
        console.log(`  POST /api/tum-veriler - Tüm verileri kaydet`);
        console.log(`  GET  /urunler - Sadece ürünleri getir (eski)`);
        console.log(`  POST /urunler - Sadece ürünleri kaydet (eski)`);
        console.log('');
        console.log('💡 Hibrit kullanım için optimize edildi');
        console.log('💾 Otomatik veri kaydetme aktif');
    });
}

startServer().catch(console.error);