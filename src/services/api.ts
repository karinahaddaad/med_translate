// ─── When you have a stable endpoint, hardcode it here ───────────────────────
// Otherwise leave empty — you can paste the ngrok URL in the app UI each session
export const YOUR_API_ENDPOINT = ''; // e.g. 'https://abc123.ngrok-free.app'
export const YOUR_API_KEY      = ''; // leave empty — ngrok doesn't need auth
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'medtrans_octopus_url';

export function getStoredEndpoint(): string {
  try { return localStorage.getItem(STORAGE_KEY) ?? ''; } catch { return ''; }
}

export function setStoredEndpoint(url: string): void {
  try { localStorage.setItem(STORAGE_KEY, url.trim()); } catch {}
}

export function getActiveEndpoint(): string {
  return YOUR_API_ENDPOINT.trim() || getStoredEndpoint();
}

export function isApiConfigured(): boolean {
  return getActiveEndpoint().length > 0;
}

export interface TranscriptionResult {
  arabicText: string;
  englishText: string;
  keywords: string[];
  summary: string;
}

export interface PatientContext {
  name?: string;
  age?: string;
  gender?: string;
  medicalRecordNumber?: string;
}

// Calls the Octopus FastAPI server (POST /transcribe, returns { result: string })
async function callOctopus(
  baseUrl: string,
  audioBlob: Blob,
  task: 'asr' | 'translation'
): Promise<string> {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'audio.webm');
  formData.append('task', task);

  const headers: Record<string, string> = {
    'ngrok-skip-browser-warning': 'true', // required — ngrok blocks browser requests without this
  };
  if (YOUR_API_KEY) headers['Authorization'] = `Bearer ${YOUR_API_KEY}`;

  const res = await fetch(`${baseUrl.replace(/\/$/, '')}/transcribe`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    let msg = res.statusText;
    try { const e = await res.json(); msg = e.error ?? e.message ?? msg; } catch {}
    throw new Error(`Octopus API error (${task}): ${msg}`);
  }

  const data = await res.json();
  // Octopus server returns { result: "text" }
  return (data.result ?? data.arabicText ?? data.englishText ?? '') as string;
}

// Makes two sequential calls: asr (Arabic) first, then translation (English)
export async function transcribeAndTranslate(
  audioBlob: Blob,
  browserTranscript: string,      // live Web Speech API text — used as fallback
  _patientContext?: PatientContext // reserved for future use
): Promise<TranscriptionResult> {
  const endpoint = getActiveEndpoint();
  if (!endpoint) throw new Error('No API endpoint configured. Paste your ngrok URL in the app.');

  // ASR first — fall back to browser transcript if it fails
  let arabicText = browserTranscript;
  try {
    arabicText = await callOctopus(endpoint, audioBlob, 'asr') || browserTranscript;
    console.log('[Octopus ASR]', arabicText);
  } catch (err) {
    console.error('[Octopus ASR failed]', err);
  }

  // Translation — throw so the UI can surface the real error message
  let englishText = '';
  try {
    englishText = await callOctopus(endpoint, audioBlob, 'translation');
    console.log('[Octopus translation]', englishText);
  } catch (err) {
    console.error('[Octopus translation failed]', err);
    throw err; // surface this to the UI
  }

  return { arabicText, englishText, keywords: [], summary: '' };
}
