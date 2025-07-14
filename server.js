const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Veriler klasörünü oluştur
const dataDir = path.join(__dirname, 'veriler');
const stockFile = path.join(dataDir, 'stok.json');

// Başlangıçta veriler klasörünü ve stok.json dosyasını oluştur
async function initializeData() {
    try {
        await fs.ensureDir(dataDir);
        
        // Eğer stok.json yoksa boş bir obje ile oluştur
        if (!await fs.pathExists(stockFile)) {
            await fs.writeJson(stockFile, {}, { spaces: 2 });
            console.log('stok.json dosyası oluşturuldu');
        }
    } catch (error) {
        console.error('Veri klasörü oluşturulurken hata:', error);
    }
}

// API Routes

// GET /urunler - Tüm ürünleri döndür
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

// POST /urunler - Ürün listesini güncelle (tüm listeyi yazar)
app.post('/urunler', async (req, res) => {
    try {
        const { stokListesi } = req.body;
        
        if (!stokListesi || typeof stokListesi !== 'object') {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz veri formatı. stokListesi objesi bekleniyor.'
            });
        }

        // Stok verisini dosyaya yaz
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

// Sunucuyu başlat
async function startServer() {
    await initializeData();
    
    app.listen(PORT, () => {
        console.log(`🚀 Server çalışıyor: http://localhost:${PORT}`);
        console.log(`📁 Veriler klasörü: ${dataDir}`);
        console.log(`📄 Stok dosyası: ${stockFile}`);
        console.log('');
        console.log('API Endpoints:');
        console.log(`  GET  /urunler - Tüm ürünleri getir`);
        console.log(`  POST /urunler - Ürünleri kaydet`);
    });
}

startServer().catch(console.error);