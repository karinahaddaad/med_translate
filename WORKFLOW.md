# MedTranslate Workflow

## User Journey

```
┌─────────────────────────────────────────────────────────┐
│                   INTAKE SCREEN                         │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │           MedTranslate                           │  │
│  │    Medical Speech Translation System             │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Patient Information                             │  │
│  │                                                  │  │
│  │  Name: _____________________ *                   │  │
│  │  Age: _______  Gender: [▼]  MRN: __________     │  │
│  │                                                  │  │
│  │  Attachments (Optional)                          │  │
│  │  ┌──────────────────────────────────────────┐   │  │
│  │  │  📎 Drop files or click to browse        │   │  │
│  │  └──────────────────────────────────────────┘   │  │
│  │                                                  │  │
│  │        [Start Recording Session →]              │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│              * Required field                           │
│        Secure • HIPAA Compliant • Encrypted            │
└─────────────────────────────────────────────────────────┘

                           ↓
                [User clicks "Start Recording Session"]
                           ↓

┌─────────────────────────────────────────────────────────┐
│                  RECORDING SCREEN                       │
│                                                         │
│  [← Edit Patient Info]         Timer: 00:00            │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Patient: John Doe  Age: 45  Gender: Male  ...   │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│                    ┌────────┐                           │
│                    │   🎤   │                           │
│                    └────────┘                           │
│                                                         │
│  ┌─────────────────────┐  ┌─────────────────────────┐  │
│  │ Arabic              │  │ English Translation     │  │
│  │ Transcription       │  │                         │  │
│  └─────────────────────┘  └─────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Clinical Summary                                 │  │
│  │ [Keyword] [Keyword] [Keyword]                    │  │
│  │ Summary text...                                  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│    [Export Report] [Record Another] [New Patient]      │
│                                                         │
│         Model: Whisper + GPT-4 | Connected             │
└─────────────────────────────────────────────────────────┘
```

## Workflow States

### 1. Intake Screen
**Purpose**: Collect patient demographic information and attachments

**Required Fields**:
- Patient Name (validated)

**Optional Fields**:
- Age
- Gender (dropdown: Male/Female/Other)
- Medical Record Number
- File attachments (images, PDFs, documents)

**Validation**:
- Cannot proceed without patient name
- Files limited to 10MB each
- Supported formats: images, PDFs, DOC/DOCX, TXT

**Actions**:
- "Start Recording Session" → Proceeds to recording screen

---

### 2. Recording Screen
**Purpose**: Record, transcribe, and translate medical consultations

**UI Elements**:
1. **Back button**: Returns to intake (clears recording data)
2. **Patient summary bar**: Shows key patient info
3. **Session timer**: Tracks recording duration
4. **Microphone button**: Start/stop recording
5. **Transcription panels**: Side-by-side Arabic + English
6. **Clinical summary**: Keywords + narrative summary

**Recording States**:
- **Idle**: Ready to record
- **Recording**: Active recording with waveform animation
- **Paused**: Recording temporarily paused (can resume or end)
- **Processing**: Transcribing and translating
- **Results**: Complete transcription displayed

**Actions After Results**:
- **Export Report**: Downloads complete clinical documentation
- **Record Another**: Clears recording, keeps patient info
- **New Patient**: Returns to intake, clears everything

---

## Use Cases

### Case 1: Single Patient, Single Session
```
Intake → Record → Export → New Patient
```

### Case 2: Single Patient, Multiple Sessions
```
Intake → Record → Export → Record Another → Export → New Patient
```

### Case 3: Edit Patient Info Mid-Session
```
Intake → Recording (idle) → Edit Patient Info → Recording → Continue
```

---

## Data Flow

```
┌──────────────┐
│ User Input   │
│ - Name       │
│ - Age        │
│ - Gender     │
│ - MRN        │
│ - Files      │
└──────┬───────┘
       │
       ↓
┌──────────────┐      ┌──────────────┐
│ Audio Blob   │  →   │ Whisper API  │ → Arabic Text
└──────────────┘      └──────────────┘
                             │
                             ↓
                      ┌──────────────┐
                      │  GPT-4 API   │ → English + Summary
                      │ (+ context)  │
                      └──────────────┘
                             │
                             ↓
                      ┌──────────────┐
                      │ Export .txt  │
                      │ - Patient    │
                      │ - Arabic     │
                      │ - English    │
                      │ - Summary    │
                      │ - Files list │
                      └──────────────┘
```

---

## Security & Privacy

✅ **Client-side processing** (unless API configured)
✅ **No data stored on server** by default
✅ **Files stay local** (only filenames exported)
✅ **HTTPS required** for microphone access in production
✅ **Encrypted transmission** when using APIs

---

## Technical Implementation

### State Management
```typescript
workflowStep: 'intake' | 'recording'
recordingState: 'idle' | 'recording' | 'paused' | 'processing' | 'results'
patientInfo: { name, age, gender, mrn, attachments[] }
```

### Navigation Flow
```typescript
// Intake → Recording
handleProceedToRecording()

// Recording → Intake (edit)
handleBackToIntake()

// Results → New session (same patient)
handleRecordAnother()

// Results → New patient
handleNewRecording()
```

### API Integration Points
1. **Transcription**: Audio blob → Whisper → Arabic text
2. **Translation**: Arabic text + patient context → GPT-4 → English + keywords + summary
3. **Export**: All data → Text file download

---

## Future Enhancements

- [ ] Save sessions to database
- [ ] Print-ready PDF export
- [ ] Real-time transcription during recording
- [ ] Multi-language support beyond Arabic/English
- [ ] FHIR integration for EHR systems
- [ ] Voice activity detection (auto-stop on silence)
- [ ] Speaker diarization (multiple speakers)
