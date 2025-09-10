import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ dest: '/tmp' }); // Vercel hanya bisa tulis di /tmp

// API KEY dari .env
const API_KEY = process.env.API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// ------------------
// Routing halaman
// ------------------
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'Beranda', 'Beranda.html'));
});

app.get('/Kalender', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'Kalender', 'Kalender.html'));
});

app.get('/ChatAI', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'ChatAI', 'ChatAI.html'));
});

app.get('/Media', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'Media', 'Media.html'));
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

    // Jika ada gambar → tambahkan analisis chart trading
    if (imageFile) {
      const imagePrompt = `Gunakan format Markdown (misalnya, **tebal**, bullet point - , dan emoji) untuk analisis.
Analisis gambar chart trading ini.
Berikan analisis dalam format bullet point yang mudah dibaca.
Sertakan poin-poin penting seperti:

✅ 1. Validasi Timeframe  
Pastikan chart telah divalidasi pada timeframe yang diberikan user.  

📊 2. Analisa Teknis Lengkap  
🔸 Trend Saat Ini : {Trend : Bullish📈, Bearish📉, Sideways}  
🔸 Struktur Harga : HH-HL untuk bullish, LH-LL untuk bearish.  
🔸 Support & Resistance Terdekat  
🔸 Zona liquidity  
🔸 Zona order block  
🔸 Analisa SMC  
🔸 Analisa ICT  

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
📐 Risk Reward (RR): Tulis detail RR  

⏱️ 5. Estimasi Waktu & Validitas Setup  

✖️ 6. Alasan kalau SL dan TP :  
🔸 Kalau kena SL: ...  
🔸 Kalau kena TP: ...  

${userText}`;

      parts[0].text = imagePrompt;
      parts.push({
        inlineData: {
          mimeType: imageFile.mimetype,
          data: fs.readFileSync(imageFile.path).toString('base64'),
        },
      });
    }

    const result = await model.generateContent({ contents: [{ parts }] });
    const response = await result.response;
    const textResponse = response.text();

    if (imageFile) {
      try { fs.unlinkSync(imageFile.path); } catch (e) {}
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
// API Generate Gambar dari teks
// ------------------
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

    res.json({ imageUrl: textResponse });
  } catch (err) {
    console.error('Gemini Image API Error:', err);
    res.status(500).json({ error: 'Gagal membuat gambar.' });
  }
});

// ------------------
// Export app untuk Vercel
// ------------------
export default app;