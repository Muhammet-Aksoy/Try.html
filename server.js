const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const nodemailer = require('nodemailer');
const cron = require('node-cron');

const app = express();
const PORT = 3000;

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

// Başlangıçta veriler klasörünü ve dosyaları oluştur
async function initializeData() {
    try {
        await fs.ensureDir(dataDir);
        
        // Dosyalar yoksa boş objeler ile oluştur
        const filesToInit = [
            { file: stockFile, data: {} },
            { file: salesFile, data: [] },
            { file: customersFile, data: {} },
            { file: allDataFile, data: { stokListesi: {}, satisGecmisi: [], musteriler: {} } }
        ];

        for (const item of filesToInit) {
            if (!await fs.pathExists(item.file)) {
                await fs.writeJson(item.file, item.data, { spaces: 2 });
                console.log(`${path.basename(item.file)} dosyası oluşturuldu`);
            }
        }
    } catch (error) {
        console.error('Veri klasörü oluşturulurken hata:', error);
    }
}

// API Routes

// GET /api/tum-veriler - Tüm verileri döndür
app.get('/api/tum-veriler', async (req, res) => {
    try {
        const stokData = await fs.readJson(stockFile);
        const salesData = await fs.readJson(salesFile);
        const customersData = await fs.readJson(customersFile);
        
        res.json({
            success: true,
            data: {
                stokListesi: stokData,
                satisGecmisi: salesData,
                musteriler: customersData
            },
            message: 'Tüm veriler başarıyla getirildi'
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

        // Verileri ayrı dosyalara kaydet
        await fs.writeJson(stockFile, stokListesi, { spaces: 2 });
        await fs.writeJson(salesFile, satisGecmisi, { spaces: 2 });
        await fs.writeJson(customersFile, musteriler, { spaces: 2 });
        
        // Tüm verileri tek dosyaya da kaydet (yedek için)
        await fs.writeJson(allDataFile, { stokListesi, satisGecmisi, musteriler }, { spaces: 2 });
        
        res.json({
            success: true,
            message: 'Tüm veriler başarıyla kaydedildi',
            stats: {
                stokSayisi: Object.keys(stokListesi).length,
                satisSayisi: satisGecmisi.length,
                musteriSayisi: Object.keys(musteriler).length
            }
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
        const stokData = await fs.readJson(stockFile);
        res.json({
            success: true,
            data: stokData,
            message: 'Ürünler başarıyla getirildi'
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

        await fs.writeJson(stockFile, stokListesi, { spaces: 2 });
        
        res.json({
            success: true,
            message: 'Ürünler başarıyla kaydedildi',
            count: Object.keys(stokListesi).length
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
        const backupData = await fs.readFile(allDataFile);
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
                    filename: `tumVeriler_${new Date().toISOString().split('T')[0]}.json`,
                    content: backupData
                }
            ]
        });
        console.log('Yedek maili gönderildi.');
    } catch (err) {
        console.error('Yedek maili gönderilemedi:', err);
    }
}
// Her gün gece 23:59'da yedek maili gönder
cron.schedule('59 23 * * *', () => {
    sendBackupMail();
});

// Sunucuyu başlat
async function startServer() {
    await initializeData();
    
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