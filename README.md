# MedTranslate

Medical Arabic-to-English speech translation app with real-time transcription and clinical summary extraction.

## Features

- 🎯 **Two-step workflow**: Clean patient intake → Recording session
- 👤 **Patient information**: Name, age, gender, MRN with validation
- 📎 **File upload**: Drag & drop labs, images, and documents
- 🎤 **Real-time audio recording**: Professional waveform visualization with pause/resume
- ⏸️ **Recording controls**: Pause, resume, and end recording at any time
- 🗣️ **Arabic speech transcription**: Powered by Whisper
- 🌍 **English translation**: Powered by GPT-4
- 🏥 **Clinical keyword extraction**: Automated tag generation
- 📋 **Clinical summary generation**: Context-aware summaries
- 💾 **Export reports**: Complete clinical documentation
- 🔄 **Multi-session support**: Record multiple sessions per patient
- 🎨 **Dark clinical UI**: Sleek, professional medical device aesthetic

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Translation Endpoint

Copy `.env.example` to `.env` and set the URL of your deployed translation API:

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_TRANSLATION_ENDPOINT=https://your-modal-app.modal.run/translate
```

The endpoint must accept:
- **Text mode** — `POST` with JSON `{ "text": "..." }` and return `{ "translation": "..." }`
- **Audio mode** — `POST` with `multipart/form-data` (`audio` field) and return `{ "translation": "..." }`

A reference Modal deployment using fine-tuned NLLB-200 lives in `MT_finetunning/` (gitignored).

### 3. Run Locally

```bash
pnpm run dev
```

Open http://localhost:5173 in your browser.

**Note:** Microphone access requires HTTPS in production. Use `localhost` for development.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy

**Vercel:**
```bash
npm install -g vercel
vercel
```

**Netlify:**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

Add `VITE_TRANSLATION_ENDPOINT` in the deployment platform's environment variables.

## Architecture

```
src/
├── app/
│   ├── App.tsx              # Main application logic
│   └── components/          # UI components
│       ├── header.tsx
│       ├── recorder-button.tsx
│       ├── transcription-panels.tsx
│       ├── clinical-summary.tsx
│       └── status-bar.tsx
├── services/
│   └── api.ts               # API integration layer
└── styles/
    ├── theme.css            # Design tokens
    └── fonts.css            # Font imports
```

## Security

⚠️ **Client-side API keys are visible to users!**

For production, use a backend proxy:

```
Browser → Your Backend → OpenAI API
```

This keeps your API keys secure on the server.

Example backend (Express):

```javascript
const express = require('express');
const OpenAI = require('openai');

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/api/transcribe', async (req, res) => {
  const audioFile = req.files.audio;
  const transcription = await openai.audio.transcriptions.create({
    file: audioFile,
    model: 'whisper-1',
    language: 'ar',
  });
  // ... handle translation
  res.json(result);
});

app.listen(3000);
```

Update `.env` to point to your backend:
```env
VITE_CUSTOM_API_ENDPOINT=https://yourbackend.com/api/transcribe
```

## Browser Compatibility

- ✅ Chrome 88+
- ✅ Firefox 90+
- ✅ Safari 14.1+
- ✅ Edge 88+

Requires `MediaRecorder` API support.

## Demo Mode

If no API key is configured or microphone access is unavailable, the app runs in demo mode with sample data.

## License

MIT
