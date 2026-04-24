import { Download } from 'lucide-react';
import { PatientInfo } from './patient-info-form';

interface ExportButtonProps {
  patientInfo: PatientInfo;
  arabicText: string;
  englishText: string;
  keywords: string[];
  summary: string;
  sessionTime: string;
}

export function ExportButton({
  patientInfo,
  arabicText,
  englishText,
  keywords,
  summary,
  sessionTime,
}: ExportButtonProps) {
  const handleExport = () => {
    const date = new Date().toLocaleString();

    const reportContent = `
MedTranslate Clinical Report
============================

Generated: ${date}
Session Duration: ${sessionTime}

PATIENT INFORMATION
-------------------
Name: ${patientInfo.name || 'N/A'}
Age: ${patientInfo.age || 'N/A'}
Gender: ${patientInfo.gender || 'N/A'}
Medical Record Number: ${patientInfo.medicalRecordNumber || 'N/A'}
Attachments: ${patientInfo.attachments.length} file(s)

ARABIC TRANSCRIPTION
--------------------
${arabicText || 'No transcription available'}

ENGLISH TRANSLATION
-------------------
${englishText || 'No translation available'}

CLINICAL KEYWORDS
-----------------
${keywords.length > 0 ? keywords.join(', ') : 'None extracted'}

CLINICAL SUMMARY
----------------
${summary || 'No summary available'}

============================
End of Report
    `.trim();

    // Create a blob and download
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `medtranslate-report-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-['IBM_Plex_Mono'] hover:bg-secondary/80 transition-colors border border-border"
    >
      <Download className="w-4 h-4" />
      Export Report
    </button>
  );
}
