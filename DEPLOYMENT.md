# MedTranslate Deployment Guide

## Option 1: Deploy to Vercel/Netlify (Easiest)

### Prerequisites
- Node.js 18+ installed
- Git installed

### Steps

1. **Download the code from Figma Make**
   - In Figma Make, export or download your project files

2. **Initialize Git repository**
   ```bash
   cd medtranslate
   git init
   git add .
   git commit -m "Initial commit"
   ```

3. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel
   ```
   
   Or **Deploy to Netlify**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

## Option 2: Run Locally

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Create environment file**
   Create `.env` file in the root directory:
   ```env
   VITE_OPENAI_API_KEY=your_openai_key_here
   VITE_OPENAI_BASE_URL=https://api.openai.com/v1
   ```

3. **Start development server**
   ```bash
   pnpm run dev
   ```
   
   Open http://localhost:5173 in your browser

4. **Build for production**
   ```bash
   pnpm run build
   pnpm preview
   ```

## Integrating Your Own Models

### Option A: OpenAI Whisper + GPT-4

The app is pre-configured to use OpenAI's APIs. Just add your API key to `.env`:

```env
VITE_OPENAI_API_KEY=sk-...
```

### Option B: Custom API Endpoint

If you have your own model server, update `.env`:

```env
VITE_API_ENDPOINT=https://your-api.com/transcribe
VITE_API_KEY=your_api_key
```

### Option C: Azure OpenAI

```env
VITE_AZURE_OPENAI_KEY=your_key
VITE_AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
VITE_AZURE_DEPLOYMENT_NAME=your-deployment
```

## Security Notes

⚠️ **IMPORTANT**: Never commit API keys to Git!

1. Add `.env` to `.gitignore`
2. For production, use environment variables in your hosting platform
3. Consider using a backend proxy to hide API keys from the client

## Backend Proxy (Recommended for Production)

For security, create a simple backend to proxy API calls:

```javascript
// server.js
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const OpenAI = require('openai');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors({ origin: 'http://localhost:5173' }));

app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    // Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: 'whisper-1',
      language: 'ar',
    });

    const arabicText = transcription.text;

    // Translate with GPT-4
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `Translate Arabic medical text to English and extract clinical keywords and summary. Return JSON: { "translation": "...", "keywords": [...], "summary": "..." }`
        },
        { role: 'user', content: arabicText }
      ],
      temperature: 0.3,
    });

    const result = JSON.parse(completion.choices[0].message.content);
    fs.unlinkSync(req.file.path);

    res.json({
      arabicText,
      englishText: result.translation,
      keywords: result.keywords,
      summary: result.summary,
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

**Setup:**
```bash
npm install express multer openai cors dotenv
node server.js
```

Update frontend `.env`:
```env
VITE_CUSTOM_API_ENDPOINT=http://localhost:3000/api/transcribe
```

Then update `src/app/App.tsx` line 54 to use `transcribeAndTranslateCustom` instead of `transcribeAndTranslate`.

This keeps your API keys secure on the server.
