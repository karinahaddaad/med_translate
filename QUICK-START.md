# MedTranslate - Quick Start Guide

## 🚀 Get Your Files

### Option 1: Export from Figma Make
Look for **"Export"**, **"Download"**, or **"Share"** button in the Figma Make interface to download all files as a ZIP.

### Option 2: Manual Copy
If no export button, copy these files manually (see `FILES-TO-EXPORT.txt` for complete list):

**Essential files:**
- `package.json`
- `vite.config.ts`
- `src/` folder (entire directory)
- `.env.example`

**Create yourself:**
- `index.html` (copy from `EXPORT-GUIDE.md`)
- `.env` (your API keys)

---

## 🔧 Setup (5 minutes)

### 1. Install Node.js
```bash
# Download from: https://nodejs.org
# Verify installation:
node --version  # Should be v18 or higher
```

### 2. Install pnpm
```bash
npm install -g pnpm
```

### 3. Install Dependencies
```bash
cd medtranslate
pnpm install
```

### 4. Add Your API Key

Create `.env` file:
```env
VITE_OPENAI_API_KEY=sk-proj-xxxxx
```

Or use your own model (see below).

### 5. Run!
```bash
pnpm run dev
```

Open: http://localhost:5173

**Allow microphone access** when prompted!

## 📋 Using the App

### Step 1: Patient Intake
1. **Enter patient name** (required)
2. **Add details**: Age, gender, MRN (optional)
3. **Upload files**: Drag & drop labs, images, documents (optional)
4. **Click "Start Recording Session"** to proceed

### Step 2: Recording Session
1. **Review patient info** at the top
2. **Click mic button** to start recording Arabic speech
3. **While recording**:
   - Click **Pause** to temporarily pause
   - Click **Resume** to continue recording
   - Click **End Recording** to stop and process
4. **View results**: Arabic transcription + English translation
5. **Export the report** with all information

### Options After Recording
- **Export Report**: Download complete clinical documentation
- **Record Another**: Keep same patient, record new session
- **New Patient**: Start over with new patient information

---

## 🤖 Using Your Own Model

### Option A: Python + Whisper (Local)

1. **Install requirements:**
```bash
pip install flask flask-cors openai-whisper
```

2. **Run the server:**
```bash
python custom-model-server-example.py
```

3. **Update `.env`:**
```env
VITE_CUSTOM_API_ENDPOINT=http://localhost:8000/transcribe
```

4. **Update code** - Edit `src/app/App.tsx` line ~54:
```typescript
// Change from:
const result = await transcribeAndTranslate(audioBlob);

// To:
const result = await transcribeAndTranslateCustom(audioBlob);
```

### Option B: HuggingFace API

```env
VITE_CUSTOM_API_ENDPOINT=https://api-inference.huggingface.co/models/your-model
VITE_CUSTOM_API_KEY=hf_xxxxx
```

### Option C: Azure OpenAI

```env
VITE_AZURE_OPENAI_KEY=your-key
VITE_AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
VITE_AZURE_DEPLOYMENT_NAME=your-deployment
```

Then update `src/app/App.tsx`:
```typescript
const result = await transcribeAndTranslateAzure(audioBlob);
```

---

## 📝 Your Model API Format

Your model endpoint should accept:
- **Method:** POST
- **Body:** FormData with `audio` file (Blob/File)
- **Return:** JSON

```json
{
  "arabicText": "النص العربي",
  "englishText": "English translation",
  "keywords": ["Chief complaint: X", "Duration: 3 days"],
  "summary": "Clinical summary paragraph here"
}
```

See `custom-model-server-example.py` for a complete example.

---

## 🌐 Deploy to Production

### Vercel (Easiest)
```bash
npm install -g vercel
vercel
```
Add `VITE_OPENAI_API_KEY` in Vercel dashboard → Environment Variables

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```
Add environment variables in Netlify dashboard

### Your Own Server
```bash
pnpm run build
# Upload the `dist/` folder to your server
```

---

## ⚠️ Important Notes

1. **Microphone requires HTTPS** (except localhost)
2. **Don't commit `.env`** to git (it's in `.gitignore`)
3. **Client-side API keys are visible** to users - use a backend proxy for production
4. **CORS:** Your API server needs CORS enabled for browser requests

---

## 🆘 Troubleshooting

**"No microphone access"**
- Check browser permissions (click lock icon in address bar)
- Use Chrome/Edge (best support)
- Must be HTTPS or localhost

**"API key not configured"**
- Check `.env` file exists in root directory
- Check variable name starts with `VITE_`
- Restart dev server after changing `.env`

**"Module not found"**
- Run `pnpm install` again
- Delete `node_modules` and reinstall

**"CORS error"**
- Your API server needs `Access-Control-Allow-Origin` header
- Use `flask-cors` (Python) or `cors` package (Node.js)

---

## 📚 More Info

- `README.md` - Complete documentation
- `DEPLOYMENT.md` - Deployment details
- `EXPORT-GUIDE.md` - Detailed export instructions
- `custom-model-server-example.py` - Python model integration example

---

## 💡 Quick Command Reference

```bash
# Install
pnpm install

# Run development server
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm preview

# Run custom model server (Python)
python custom-model-server-example.py
```

---

**Need help?** Check the documentation files or open an issue!
