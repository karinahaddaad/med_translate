# How to Export and Run MedTranslate Locally

## Method 1: Download from Figma Make (Recommended)

1. **In Figma Make**, look for an **Export** or **Download** button in the interface
2. This will download a ZIP file with all the source code
3. Unzip the file on your computer
4. Follow the "Running Locally" steps below

---

## Method 2: Manual File Copy

If there's no export button, you can manually copy the files:

### Required Files & Folders:

```
medtranslate/
├── package.json                    # Dependencies
├── vite.config.ts                  # Vite configuration
├── tsconfig.json                   # TypeScript config (if exists)
├── .env                            # YOUR API KEYS (create this)
├── .gitignore                      # Git ignore rules
├── src/
│   ├── app/
│   │   ├── App.tsx                # Main app
│   │   └── components/            # All components
│   │       ├── header.tsx
│   │       ├── recorder-button.tsx
│   │       ├── transcription-panels.tsx
│   │       ├── clinical-summary.tsx
│   │       └── status-bar.tsx
│   ├── services/
│   │   └── api.ts                 # API integration
│   └── styles/
│       ├── fonts.css              # Font imports
│       ├── theme.css              # Design tokens
│       ├── tailwind.css           # Tailwind base
│       └── index.css              # Main CSS
├── index.html                     # HTML entry (create if missing)
└── README.md                      # Documentation
```

### Create Missing Files:

If `index.html` doesn't exist, create it:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MedTranslate</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

If `src/main.tsx` doesn't exist, create it:

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

---

## Running Locally

### Step 1: Install Node.js
Download from https://nodejs.org (v18 or higher)

### Step 2: Install pnpm (package manager)
```bash
npm install -g pnpm
```

### Step 3: Install Dependencies
```bash
cd medtranslate
pnpm install
```

### Step 4: Configure Your API

Create a `.env` file in the root directory:

```env
# Option A: Use OpenAI
VITE_OPENAI_API_KEY=sk-your-openai-key-here

# Option B: Use your own API endpoint
VITE_CUSTOM_API_ENDPOINT=http://localhost:8000/transcribe
VITE_CUSTOM_API_KEY=your-key-here

# Option C: Use Azure OpenAI
VITE_AZURE_OPENAI_KEY=your-key
VITE_AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
VITE_AZURE_DEPLOYMENT_NAME=your-deployment
```

### Step 5: Update Code to Use Your API

Edit `src/app/App.tsx`, find line ~54 where it says:

```typescript
const result = await transcribeAndTranslate(audioBlob);
```

**For custom API**, change to:
```typescript
import { transcribeAndTranslateCustom } from '../services/api';
// ...
const result = await transcribeAndTranslateCustom(audioBlob);
```

**For Azure**, change to:
```typescript
import { transcribeAndTranslateAzure } from '../services/api';
// ...
const result = await transcribeAndTranslateAzure(audioBlob);
```

### Step 6: Run the App
```bash
pnpm run dev
```

Open http://localhost:5173 in your browser.

**Important:** You need to allow microphone permissions in your browser!

---

## Integrating Your Own Model

### Option 1: Custom API Server

If you have your own model (Whisper, etc.) running as a server:

1. Your API should accept a `POST` request with audio file
2. Return JSON in this format:

```json
{
  "arabicText": "النص العربي المنسوخ",
  "englishText": "Transcribed English translation",
  "keywords": ["Chief complaint: X", "Duration: Y", "HTN"],
  "summary": "Clinical summary paragraph"
}
```

3. Update `.env`:
```env
VITE_CUSTOM_API_ENDPOINT=http://your-server:8000/transcribe
```

4. Edit `src/services/api.ts`, update the `transcribeAndTranslateCustom` function:

```typescript
export async function transcribeAndTranslateCustom(
  audioBlob: Blob
): Promise<TranscriptionResult> {
  const endpoint = import.meta.env.VITE_CUSTOM_API_ENDPOINT;
  const apiKey = import.meta.env.VITE_CUSTOM_API_KEY;

  const formData = new FormData();
  formData.append('audio', audioBlob);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: apiKey ? {
      'Authorization': `Bearer ${apiKey}`,
    } : {},
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return await response.json();
}
```

### Option 2: Local Python Model

Run a local Flask/FastAPI server:

```python
# server.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import whisper
from transformers import pipeline

app = Flask(__name__)
CORS(app)

# Load models
whisper_model = whisper.load_model("large-v3")
translator = pipeline("translation", model="Helsinki-NLP/opus-mt-ar-en")

@app.route('/transcribe', methods=['POST'])
def transcribe():
    audio_file = request.files['audio']
    
    # Save temporarily
    audio_file.save('temp.webm')
    
    # Transcribe Arabic
    result = whisper_model.transcribe('temp.webm', language='ar')
    arabic_text = result['text']
    
    # Translate to English
    english_text = translator(arabic_text)[0]['translation_text']
    
    # Extract keywords (you can add your own logic)
    keywords = extract_keywords(arabic_text)
    
    # Generate summary (you can use another model)
    summary = generate_summary(english_text)
    
    return jsonify({
        'arabicText': arabic_text,
        'englishText': english_text,
        'keywords': keywords,
        'summary': summary
    })

if __name__ == '__main__':
    app.run(port=8000)
```

Run it:
```bash
pip install flask flask-cors openai-whisper transformers
python server.py
```

Update `.env`:
```env
VITE_CUSTOM_API_ENDPOINT=http://localhost:8000/transcribe
```

---

## Building for Production

```bash
pnpm run build
```

This creates a `dist/` folder with static files you can deploy to:
- Netlify
- Vercel
- Your own server
- AWS S3 + CloudFront
- Any static hosting

---

## Troubleshooting

**Microphone not working?**
- Must use HTTPS in production (or localhost for dev)
- Check browser permissions
- Try Chrome/Edge (best support)

**API not connecting?**
- Check `.env` file exists and has correct keys
- Check CORS settings on your API server
- Check console for errors (F12 → Console tab)

**Build fails?**
- Delete `node_modules` and run `pnpm install` again
- Check Node.js version (need 18+)

---

## Questions?

Check the files:
- `README.md` - Full documentation
- `DEPLOYMENT.md` - Deployment details
- `src/services/api.ts` - API integration examples
