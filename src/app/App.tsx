import { useState, useEffect, useRef } from 'react';
import { Header } from './components/header';
import { RecordingControls } from './components/recording-controls';
import { TranscriptionPanels } from './components/transcription-panels';
import { ClinicalSummary } from './components/clinical-summary';
import { StatusBar } from './components/status-bar';
import { type PatientInfo } from './components/patient-info-form';
import { PatientIntakeScreen } from './components/patient-intake-screen';
import { ExportButton } from './components/export-button';
import { RotateCcw, AlertCircle, ChevronLeft, Link, CheckCircle2, Pencil } from 'lucide-react';
import {
  transcribeAndTranslate,
  isApiConfigured,
  getStoredEndpoint,
  setStoredEndpoint,
  getActiveEndpoint,
} from '../services/api';

type AppState = 'idle' | 'recording' | 'paused' | 'processing' | 'results';
type WorkflowStep = 'intake' | 'recording';

const DEMO_ARABIC   = 'المريض يعاني من صداع شديد منذ ثلاثة أيام، مع غثيان وحساسية للضوء. لديه تاريخ من ارتفاع ضغط الدم والسكري من النوع الثاني. يأخذ الأدوية بانتظام.';
const DEMO_ENGLISH  = 'Patient presents with severe headache for three days, accompanied by nausea and photophobia. Past medical history includes hypertension and type 2 diabetes mellitus. Medications are taken regularly.';
const DEMO_KEYWORDS = ['Chief complaint: Headache', 'Duration: 3 days', 'Associated symptoms', 'HTN + T2DM', 'Compliant with meds'];
const DEMO_SUMMARY  = 'The patient presents with a 3-day history of severe headache with nausea and photophobia. Relevant PMH includes well-controlled hypertension and type 2 diabetes mellitus, with good medication compliance.';

const SpeechRecognitionAPI =
  typeof window !== 'undefined'
    ? (window.SpeechRecognition ?? (window as any).webkitSpeechRecognition ?? null)
    : null;

// ─── Ngrok URL bar ────────────────────────────────────────────────────────────
function OctopusUrlBar({
  onSave,
}: {
  onSave: (url: string) => void;
}) {
  const [editing, setEditing] = useState(!isApiConfigured());
  const [draft, setDraft]     = useState(getActiveEndpoint());
  const active                = getActiveEndpoint();

  const save = () => {
    setStoredEndpoint(draft);
    onSave(draft);
    setEditing(false);
  };

  if (!editing && active) {
    return (
      <div className="w-full max-w-6xl flex items-center gap-3 px-4 py-2.5 bg-primary/10 border border-primary/30 rounded-lg font-['IBM_Plex_Mono'] text-xs mb-2">
        <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
        <span className="text-primary flex-1 truncate">Octopus: {active}</span>
        <button onClick={() => setEditing(true)} className="text-muted-foreground hover:text-foreground transition-colors">
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl flex items-center gap-2 mb-2">
      <div className="flex items-center gap-2 flex-1 px-3 py-2 bg-card border border-border rounded-lg">
        <Link className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        <input
          type="url"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && save()}
          placeholder="Paste your ngrok URL — https://abc123.ngrok-free.app"
          className="flex-1 bg-transparent font-['IBM_Plex_Mono'] text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
          autoFocus
        />
      </div>
      <button
        onClick={save}
        disabled={!draft.trim()}
        className="px-3 py-2 bg-primary text-primary-foreground rounded-lg font-['IBM_Plex_Mono'] text-xs hover:bg-primary/90 transition-all disabled:opacity-50"
      >
        Connect
      </button>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [workflowStep, setWorkflowStep] = useState<WorkflowStep>('intake');
  const [state, setState]               = useState<AppState>('idle');
  const [sessionTime, setSessionTime]   = useState('00:00');
  const [seconds, setSeconds]           = useState(0);
  const [error, setError]               = useState<string | null>(null);
  const [audioBlob, setAudioBlob]       = useState<Blob | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [useMockMode, setUseMockMode]   = useState(false);
  const [arabicText, setArabicText]     = useState('');
  const [englishText, setEnglishText]   = useState('');
  const [keywords, setKeywords]         = useState<string[]>([]);
  const [summary, setSummary]           = useState('');
  // triggers re-render when URL is saved so the bar and status update
  const [, forceUpdate]                 = useState(0);
  const [patientInfo, setPatientInfo]   = useState<PatientInfo>({
    name: '', age: '', gender: '', medicalRecordNumber: '', attachments: [],
  });

  const mediaRecorderRef   = useRef<MediaRecorder | null>(null);
  const audioChunksRef     = useRef<Blob[]>([]);
  const streamRef          = useRef<MediaStream | null>(null);
  const recognitionRef     = useRef<any>(null);
  const savedTranscriptRef = useRef('');
  const arabicTextRef      = useRef('');

  // ─── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    let interval: number | undefined;
    if (state === 'recording') {
      interval = window.setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [state]);

  useEffect(() => {
    const m = Math.floor(seconds / 60), s = seconds % 60;
    setSessionTime(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
  }, [seconds]);

  // ─── Speech recognition ────────────────────────────────────────────────────
  const startRecognitionSession = () => {
    if (!SpeechRecognitionAPI) return;
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous     = true;
    recognition.interimResults = true;
    recognition.lang           = 'ar-SA';
    const base = savedTranscriptRef.current;
    recognition.onresult = (event: any) => {
      let text = '';
      for (let i = 0; i < event.results.length; i++) text += event.results[i][0].transcript;
      const full = base + (base && text ? ' ' : '') + text;
      arabicTextRef.current = full;
      setArabicText(full);
    };
    recognition.onerror = (e: any) => { if (e.error !== 'no-speech') console.warn('SR:', e.error); };
    recognitionRef.current = recognition;
    try { recognition.start(); } catch {}
  };

  const stopRecognitionSession = () => {
    if (recognitionRef.current) {
      savedTranscriptRef.current = arabicTextRef.current;
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
  };

  // ─── Recording ─────────────────────────────────────────────────────────────
  const startRecording = async () => {
    setError(null);
    savedTranscriptRef.current = '';
    arabicTextRef.current      = '';
    setArabicText('');

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Microphone not supported in this browser');
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current     = stream;
    const mediaRecorder   = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current   = [];

    mediaRecorder.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };

    mediaRecorder.onstop = async () => {
      stopRecognitionSession();
      const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      setAudioBlob(blob);
      streamRef.current?.getTracks().forEach(t => t.stop());
      const captured = arabicTextRef.current;

      if (isApiConfigured()) {
        setState('processing');
        try {
          const result = await transcribeAndTranslate(blob, captured, {
            name: patientInfo.name, age: patientInfo.age,
            gender: patientInfo.gender, medicalRecordNumber: patientInfo.medicalRecordNumber,
          });
          setArabicText(result.arabicText);
          setEnglishText(result.englishText);
          setKeywords(result.keywords);
          setSummary(result.summary);
        } catch (err) {
          console.error('API error:', err);
          const msg = err instanceof Error ? err.message : 'API call failed';
          setError(msg);
          setArabicText(captured);
          // Show the error inside the English panel so it's visible
          setEnglishText('');
          setKeywords([]);
          setSummary('');
        }
      } else {
        setArabicText(captured);
        setEnglishText('');
        setKeywords([]);
        setSummary('');
      }

      setState('results');
    };

    mediaRecorder.start();
    startRecognitionSession();
    setState('recording');
    setPermissionStatus('granted');
    setUseMockMode(false);
  };

  const pauseRecording = () => {
    stopRecognitionSession();
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.pause();
    setState('paused');
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current?.state === 'paused') mediaRecorderRef.current.resume();
    startRecognitionSession();
    setState('recording');
  };

  const stopRecording = () => {
    const mr = mediaRecorderRef.current;
    if (mr && (mr.state === 'recording' || mr.state === 'paused')) mr.stop();
  };

  // ─── Mock / demo mode ──────────────────────────────────────────────────────
  const stopMockRecording = () => {
    setAudioBlob(new Blob(['mock'], { type: 'audio/webm' }));
    setState('processing');
    setTimeout(() => {
      setArabicText(DEMO_ARABIC);
      setEnglishText(DEMO_ENGLISH);
      setKeywords(DEMO_KEYWORDS);
      setSummary(DEMO_SUMMARY);
      setState('results');
    }, 1500);
  };

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleStartRecording  = () => startRecording().catch(() => { setState('recording'); setUseMockMode(true); setError(null); });
  const handlePauseRecording  = () => useMockMode ? setState('paused')   : pauseRecording();
  const handleResumeRecording = () => useMockMode ? setState('recording') : resumeRecording();
  const handleStopRecording   = () => useMockMode ? stopMockRecording()   : stopRecording();

  const resetRecording = () => {
    setState('idle'); setSeconds(0); setSessionTime('00:00');
    setAudioBlob(null); setError(null); setUseMockMode(false);
    setArabicText(''); setEnglishText(''); setKeywords([]); setSummary('');
    savedTranscriptRef.current = ''; arabicTextRef.current = '';
  };

  const handleBackToIntake  = () => { resetRecording(); setWorkflowStep('intake'); };
  const handleRecordAnother = () => resetRecording();
  const handleNewRecording  = () => {
    resetRecording();
    setPatientInfo({ name: '', age: '', gender: '', medicalRecordNumber: '', attachments: [] });
    setWorkflowStep('intake');
  };

  const apiReady  = isApiConfigured();
  const isLoading = state === 'processing';

  // ─── Intake screen ─────────────────────────────────────────────────────────
  if (workflowStep === 'intake') {
    return (
      <div className="size-full bg-background text-foreground">
        <PatientIntakeScreen
          patientInfo={patientInfo}
          onChange={setPatientInfo}
          onProceed={() => setWorkflowStep('recording')}
        />
      </div>
    );
  }

  // ─── Recording screen ──────────────────────────────────────────────────────
  return (
    <div className="size-full bg-background text-foreground overflow-auto">
      <div className="min-h-full flex flex-col items-center p-6 md:p-12">

        {/* Back button */}
        <div className="w-full max-w-6xl mb-4">
          <button
            onClick={handleBackToIntake}
            disabled={state === 'recording' || state === 'processing'}
            className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground font-['IBM_Plex_Mono'] text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Edit Patient Info
          </button>
        </div>

        {/* Ngrok / Octopus URL bar */}
        <OctopusUrlBar onSave={() => forceUpdate(n => n + 1)} />

        <Header sessionTime={sessionTime} />

        {/* Patient info strip */}
        <div className="w-full max-w-6xl mb-6 px-6 py-4 bg-card/50 border border-border rounded-lg">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-['IBM_Plex_Mono'] text-sm">
            <div>
              <span className="text-muted-foreground text-xs uppercase tracking-wider">Patient:</span>{' '}
              <span className="text-foreground font-medium">{patientInfo.name}</span>
            </div>
            {patientInfo.age && <div><span className="text-muted-foreground text-xs uppercase tracking-wider">Age:</span> <span>{patientInfo.age}</span></div>}
            {patientInfo.gender && <div><span className="text-muted-foreground text-xs uppercase tracking-wider">Gender:</span> <span className="capitalize">{patientInfo.gender}</span></div>}
            {patientInfo.medicalRecordNumber && <div><span className="text-muted-foreground text-xs uppercase tracking-wider">MRN:</span> <span>{patientInfo.medicalRecordNumber}</span></div>}
            {patientInfo.attachments.length > 0 && <div><span className="text-muted-foreground text-xs uppercase tracking-wider">Attachments:</span> <span className="text-primary">{patientInfo.attachments.length} file(s)</span></div>}
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center gap-8 w-full mb-8">

          {/* Alerts */}
          {permissionStatus === 'denied' && state === 'idle' && (
            <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 border border-border rounded-lg max-w-2xl w-full">
              <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1">
                <span className="font-['IBM_Plex_Mono'] text-sm">Running in Demo Mode</span>
                <p className="font-['IBM_Plex_Mono'] text-xs text-muted-foreground mt-1">Microphone unavailable — showing sample data.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-lg max-w-2xl w-full">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              <span className="font-['IBM_Plex_Mono'] text-sm text-destructive">{error}</span>
            </div>
          )}

          {!SpeechRecognitionAPI && state === 'idle' && !useMockMode && (
            <p className="font-['IBM_Plex_Mono'] text-xs text-amber-500 text-center max-w-sm">
              Live transcription requires Chrome or Edge. Other browsers can still record and send audio to Octopus.
            </p>
          )}

          <RecordingControls
            state={state}
            onStart={handleStartRecording}
            onPause={handlePauseRecording}
            onResume={handleResumeRecording}
            onStop={handleStopRecording}
          />

          {useMockMode && state !== 'idle' && state !== 'results' && (
            <div className="font-['IBM_Plex_Mono'] text-xs text-muted-foreground">(Demo Mode)</div>
          )}

          {audioBlob && state === 'results' && (
            <div className="font-['IBM_Plex_Mono'] text-xs text-muted-foreground">
              {useMockMode ? 'Demo recording' : `Recorded: ${(audioBlob.size / 1024).toFixed(1)} KB`}
            </div>
          )}

          <TranscriptionPanels
            arabicText={arabicText}
            englishText={englishText}
            isLoading={isLoading}
            apiReady={apiReady}
          />

          <ClinicalSummary
            keywords={keywords}
            summary={summary}
            isLoading={isLoading}
          />

          {state === 'results' && (
            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3">
              <ExportButton
                patientInfo={patientInfo}
                arabicText={arabicText}
                englishText={englishText}
                keywords={keywords}
                summary={summary}
                sessionTime={sessionTime}
              />
              <button
                onClick={handleRecordAnother}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-['IBM_Plex_Mono'] hover:bg-primary/90 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Record Another
              </button>
              <button
                onClick={handleNewRecording}
                className="flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-['IBM_Plex_Mono'] hover:bg-secondary/80 transition-colors border border-border"
              >
                New Patient
              </button>
            </div>
          )}
        </div>

        <StatusBar
          modelName={
            useMockMode  ? 'Demo Mode'          :
            apiReady     ? 'Octopus (ArabicSpeech)' :
                           'Browser Speech API (Arabic live)'
          }
          isConnected={state === 'recording' || state === 'processing'}
        />
      </div>
    </div>
  );
}
