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

### 2. Configure API Keys

Copy `.env.example` to `.env` and add your OpenAI API key:

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_OPENAI_API_KEY=sk-your-key-here
```

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

Add your `VITE_OPENAI_API_KEY` in the deployment platform's environment variables.

## API Options

### Option 1: OpenAI (Default)

```env
VITE_OPENAI_API_KEY=sk-...
```

Models used:
- `whisper-1` for transcription
- `gpt-4` for translation & clinical extraction

### Option 2: Azure OpenAI

```env
VITE_AZURE_OPENAI_KEY=your-key
VITE_AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
VITE_AZURE_DEPLOYMENT_NAME=your-deployment
```

Update `src/app/App.tsx` to import `transcribeAndTranslateAzure` instead.

### Option 3: Custom API

```env
VITE_CUSTOM_API_ENDPOINT=https://your-api.com/transcribe
VITE_CUSTOM_API_KEY=your-key
```

Your API should accept `FormData` with an `audio` field and return:

```json
{
  "arabicText": "...",
  "englishText": "...",
  "keywords": ["...", "..."],
  "summary": "..."
}
```

Update `src/app/App.tsx` to import `transcribeAndTranslateCustom` instead.

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
