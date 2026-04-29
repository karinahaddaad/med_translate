<div align="center">

<br/>

# MedTranslate

**Dialect-aware, medically-fluent Arabic → English translation.**

*Relieving doctors. Reaching patients.*

<br/>

[![BLEU Baseline](https://img.shields.io/badge/Baseline%20BLEU-20.99-gray?style=flat-square)](.)
[![BLEU Finetuned](https://img.shields.io/badge/Fine--tuned%20BLEU-35.16-C8A84B?style=flat-square)](.)
[![ROUGE-L](https://img.shields.io/badge/ROUGE--L-0.681-1E4FC2?style=flat-square)](.)

</div>

---

## Where we fit in

Arabic-speaking patients walk into clinics every day and leave without fully understanding their diagnosis. On the other side of that encounter, doctors are spending significant time on documentation and translation on top of note-taking — hours per day that belong to patient care, not paperwork.

Commercial translation tools weren't built for this. They weren't trained on medical language, they don't understand clinical context, and they certainly don't account for the difference between how a patient in Cairo speaks versus one in Riyadh or Beirut. The result is a gap that the market hasn't filled, because the communities who need it most are the least represented in training data.

We built a two-stage pipeline that listens to Arabic patient speech, transcribes it in real time, and produces accurate, dialect-aware medical translations — outputs that work for doctor documentation and for patients receiving notes in a language they actually understand. The system is fine-tuned specifically for the medical domain, covering clinical terminology, conversational Arabic, and regional dialect variation across Gulf, Levantine, and Egyptian speech.

---

## How it works

```
Patient speaks Arabic
        │
        ▼
┌───────────────────┐
│  Speech           │  Fine-tuned on medical Arabic audio.
│  Recognition      │  Handles Gulf, Levantine, Egyptian dialects.
│  (ASR)            │  Real-time transcription, low latency.
└────────┬──────────┘
         │  Arabic text
         ▼
┌───────────────────┐
│  Medical Machine  │  Domain-adapted on proprietary medical corpora.
│  Translation      │  Trained on clinical terminology + conversational Arabic.
│  (MT)             │  Arabic → English
└────────┬──────────┘
         │  Clinical English
         ▼
  Doctor notes + patient summaries
```

---

## Results

Benchmarked on a held-out gold test set — data the model has never seen. These are generalization numbers, not training performance.

| | Baseline | Fine-tuned | Δ |
|---|---|---|---|
| **BLEU** | 20.99 | **35.16** | +14.17 |
| **ROUGE-L** | 0.547 | **0.681** | +0.135 |

Every medical category improved after fine-tuning.

---

## Why this matters

400M+ people speak Arabic. The communities who need this most — patients navigating healthcare in a language their doctors don't share — are the ones least represented in existing training data. Less data means fewer tools. Fewer tools means patients stay underserved. We're breaking that loop.
