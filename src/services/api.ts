// Translation model endpoint — read from .env (VITE_TRANSLATION_ENDPOINT).
// Falls back to empty string so the UI surfaces a clear "not configured" error
// instead of fetching `undefined`.
export const TRANSLATION_ENDPOINT: string = import.meta.env.VITE_TRANSLATION_ENDPOINT ?? '';

const TRANSLATION_MODE_KEY = 'medtrans_translation_mode';

export type TranslationMode = 'audio' | 'text';

export function getActiveTranslationEndpoint(): string {
  return TRANSLATION_ENDPOINT;
}

export function isTranslationConfigured(): boolean {
  return TRANSLATION_ENDPOINT.length > 0;
}

export function getTranslationMode(): TranslationMode {
  try {
    const v = localStorage.getItem(TRANSLATION_MODE_KEY);
    return v === 'text' ? 'text' : 'audio';
  } catch { return 'audio'; }
}

export function setTranslationMode(mode: TranslationMode): void {
  try { localStorage.setItem(TRANSLATION_MODE_KEY, mode); } catch {}
}

// Posts to the translation endpoint and parses { translation } or { result }.
async function postTranslation(
  body: BodyInit,
  extraHeaders: Record<string, string>,
  modeLabel: string,
): Promise<string> {
  const url = getActiveTranslationEndpoint();
  if (!url) throw new Error('No translation endpoint configured. Set VITE_TRANSLATION_ENDPOINT in .env.');

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'ngrok-skip-browser-warning': 'true', ...extraHeaders },
    body,
  });

  if (!res.ok) {
    let msg = res.statusText;
    try { const e = await res.json(); msg = e.error ?? e.message ?? msg; } catch {}
    throw new Error(`Translation API error (${modeLabel}): ${msg}`);
  }

  const data = await res.json();
  return (data.translation ?? data.result ?? '') as string;
}

// Audio → English (multipart FormData with the audio blob).
// For audio-capable models that accept POST multipart with an `audio` field.
export async function translateAudio(audioBlob: Blob): Promise<string> {
  const fd = new FormData();
  fd.append('audio', audioBlob, 'audio.webm');
  return postTranslation(fd, {}, 'audio');
}

// Arabic text → English (JSON body).
export async function translateText(arabicText: string): Promise<string> {
  return postTranslation(
    JSON.stringify({ text: arabicText, source_lang: 'ar', target_lang: 'en' }),
    { 'Content-Type': 'application/json' },
    'text',
  );
}
