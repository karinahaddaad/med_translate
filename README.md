# MedTranslate

Arabic → English medical translation app. Capture a patient session via audio
or paste Arabic text, send it to a configurable translation API (a fine-tuned
NLLB Modal deployment in our reference setup), and display the English
translation alongside live in-browser Arabic transcription.

## Features

- **Patient intake** — collect name, age, gender, MRN, and file attachments before each session
- **Two translation modes** — toggle between **Audio** (record + send blob) and **Text** (paste Arabic)
- **Live Arabic transcription** — browser Web Speech API streams Arabic text while recording (Chrome/Edge)
- **Recording controls** — pause, resume, stop, and re-record
- **Configurable translation backend** — single env var points to any model that follows the contract below
- **Cold-start hint** — surfaces a "warming up" notice when the API takes >5s on first request
- **Export** — bundle Arabic + English + patient info into a clinical report
- **Demo mode** — falls back to sample data when microphone permission is denied

## Quick Start

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure the translation endpoint

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_TRANSLATION_ENDPOINT=https://your-model.modal.run/translate
```

### 3. Run

```bash
pnpm dev
```

Open http://localhost:5173.

> Microphone access requires HTTPS in production. `localhost` is fine for dev.

## Translation API contract

The UI talks to a single endpoint. Whatever model is behind it determines which
mode works.

**Text mode** — `POST` JSON:
```json
{ "text": "النص العربي" }
```
Response:
```json
{ "translation": "English text" }
```

**Audio mode** — `POST` `multipart/form-data` with an `audio` field (a `.webm`
blob from the browser). Response is the same `{ "translation": "..." }` shape.

The UI also accepts `{ "result": "..." }` as a fallback response field.

A reference Modal deployment using fine-tuned NLLB-200 lives in
`MT_finetunning/` (gitignored — not part of the public repo).

## Architecture

```
src/
├── main.tsx                       # entry
├── vite-env.d.ts                  # env var typing (VITE_TRANSLATION_ENDPOINT)
├── app/
│   ├── App.tsx                    # state, recording flow, mode toggle
│   └── components/
│       ├── patient-intake-screen.tsx
│       ├── patient-info-form.tsx
│       ├── header.tsx
│       ├── recording-controls.tsx
│       ├── recorder-button.tsx
│       ├── transcription-panels.tsx
│       ├── clinical-summary.tsx
│       ├── export-button.tsx
│       ├── status-bar.tsx
│       └── ui/                    # Radix-based primitives
├── services/
│   └── api.ts                     # translateText, translateAudio, env-var helpers
└── styles/                        # theme.css, fonts.css, tailwind.css, index.css
```

**Stack:** React 18 + Vite 6 + TypeScript + Tailwind CSS 4 + Radix UI + MUI.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full instructions.

Quick deploy:

```bash
# Vercel
npx vercel

# Netlify
npx netlify deploy --prod
```

Set `VITE_TRANSLATION_ENDPOINT` in the platform's environment variables before
deploying.

## Security caveats

- **Vite bundles `VITE_*` env vars into the client JS at build time.** Your
  endpoint URL is hidden from the GitHub source but visible to anyone who
  inspects the deployed app's network tab or JS bundle. Add auth on the
  translation API (or proxy through a backend you control) if you need to keep
  it private.
- **No auth on the translation API by default.** Modal endpoints are publicly
  callable unless you add token verification.
- **Patient data is processed client-side and sent to your translation API.**
  This app is not a HIPAA-compliant medical device — treat it as a research /
  educational prototype.

## Browser compatibility

- ✅ Chrome 88+ — full support including live Arabic transcription
- ✅ Edge 88+ — full support
- ⚠️ Firefox 90+ / Safari 14.1+ — recording works; live Arabic transcription
  unavailable (Web Speech API for Arabic is Chromium-only)

Requires the `MediaRecorder` API.

## Demo mode

When microphone permission is denied, the app falls back to sample Arabic /
English content so the UI is still navigable end-to-end.

## License

MIT
