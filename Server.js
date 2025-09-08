import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch from 'node-fetch'; // Pastikan Anda sudah menginstal node-fetch

// --- Setup path ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ dest: 'uploads/' });
const PORT = 3000;

// Ganti dengan API key Anda langsung di sini
const API_KEY = process.env.API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ------------------
// Routing halaman
// ------------------
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Beranda', 'Beranda.html'));
});

app.get('/Kalender', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Kalender', 'Kalender.html'));
});

app.get('/ChatAI', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'ChatAI', 'ChatAI.html'));
});

app.get('/Media', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Media', 'Media.html'));
});

// ------------------
// API Chat teks & gambar
// ------------------
app.post('/api/chat', upload.single('image'), async (req, res) => {
  const userText = req.body.text || req.body.message || '';
  const imageFile = req.file;

  if (!userText && !imageFile) {
    return res.status(400).json({ error: 'Tidak ada teks atau gambar yang diterima.' });
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image-preview' });
    const parts = [{ text: userText }];

    // Jika ada gambar, tambahkan ke parts
    if (imageFile) {
        // Ganti prompt teks dengan instruksi format untuk gambar
        const imagePrompt = `Gunakan format Markdown (misalnya, **tebal**, bullet point - , dan emoji) untuk analisis.
            Analisis gambar chart trading ini.
            Berikan analisis dalam format bullet point yang mudah dibaca.
            Sertakan poin-poin penting seperti:
         ✅ 1. Validasi Timeframe
Pastikan chart telah divalidasi pada timeframe yang diberikan user. 

📊 2. Analisa Teknis Lengkap
🔸 Trend Saat Ini : {Trend : Bullih📈, Bearish📉, Sideways}

🔸Struktur Harga : HH-HL untuk bullish, LH-LL untuk bearish. 

🔸 Support & Resistance Terdekat
Support : {level support}
Resistance : {level resistance}

🔸Zona liquidity : liquiditi pool, sweep, run

🔸zona order block : {level harga}

🔸Analisa SMC :

🔸Analisa ICT :

⚡ 3. SIGNAL SETUP

Format:
⚡️ [pair yang dikirim user] – [BUY/SELL] ⚡️
🔎 TF: [Timeframe]
🎯 Entry: [level harga / zona entry]
🛑 SL: [Stop Loss level]
🎯 TP: TP1 … | TP2 … | TP3 …
📊 RR: Risk:Reward
📈/📉 Analisa: Jelaskan alasan entry singkat. 

🚀 4. Rincian Entry Setup

🎯 Entry: Zona harga entry + alasannya. 

🛑 Stop Loss: Level invalidasi setup. 

🎯 Take Profit: Level bertahap. 

⚙️ Jenis Setup: 

✅ Konfirmasi Visual: Yes/No

📍 Posisi utama: Buy / Sell.

📐 Risk Reward (RR): Tulis detail RR 

⏱️ 5. Estimasi Waktu & Validitas Setup

Estimasi durasi pergerakan

✖️ 6. Alasan kalau SL dan TP :

🔸Kalau Kena sl: 

🔸Kalau Kena TP:
pastikan jaban singkat,jelas,dan poin-poin terpisah:${userText}
        `;
        
        parts[0].text = imagePrompt; // Ganti prompt teks dengan yang baru
        parts.push({
            inlineData: {
                mimeType: imageFile.mimetype,
                data: fs.readFileSync(imageFile.path).toString('base64')
            }
        });
    }
    
    
    // --- API untuk membuat gambar dari teks ---
app.post('/api/generate-image', async (req, res) => {
    const userPrompt = req.body.prompt;
    
    if (!userPrompt) {
        return res.status(400).json({ error: 'Tidak ada teks yang diterima untuk membuat gambar.' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image-preview' });
        
        const result = await model.generateContent({
            contents: [{
                role: 'user',
                parts: [{ text: `Buat gambar yang sangat detail, fotorealistik, dan berkualitas tinggi berdasarkan deskripsi berikut: ${userPrompt}` }]
            }]
        });

        const response = await result.response;
        const textResponse = response.text(); 
        
        // Asumsi responsnya adalah URL gambar atau data base64
        res.json({ imageUrl: textResponse });

    } catch (err) {
        console.error('Gemini Image API Error:', err);
        res.status(500).json({ error: 'Gagal membuat gambar.' });
    }
});



    const result = await model.generateContent({ contents: [{ parts }] });
    const response = await result.response;
    const textResponse = response.text();

    // Hapus file gambar setelah digunakan
    if (imageFile) {
      fs.unlinkSync(imageFile.path);
    }
    
    res.json({ reply: textResponse });

  } catch (err) {
    if (imageFile) {
      try { fs.unlinkSync(imageFile.path); } catch (e) {}
    }
    console.error('Gemini API Error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan saat memproses permintaan.' });
  }
});

// ------------------
// Jalankan server
// ------------------
app.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
});
