import { motion } from 'motion/react';

interface TranscriptionPanelsProps {
  arabicText: string;
  englishText: string;
  isLoading: boolean;
  apiReady?: boolean;
  hideArabic?: boolean;
}

export function TranscriptionPanels({ arabicText, englishText, isLoading, apiReady, hideArabic }: TranscriptionPanelsProps) {
  const showApiNotice = !apiReady && arabicText && !englishText && !isLoading;

  if (hideArabic) {
    return (
      <div className="w-full max-w-6xl">
        <Panel
          title="English Translation"
          content={englishText}
          isItalic
          isLoading={isLoading}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-6xl">
      <Panel
        title="Arabic Transcription"
        content={arabicText}
        isRTL
        isLoading={isLoading}
      />
      <Panel
        title="English Translation"
        content={englishText}
        isItalic
        isLoading={isLoading}
        placeholder={
          showApiNotice
            ? 'Translation available once your model API is connected — see src/services/api.ts'
            : undefined
        }
      />
    </div>
  );
}

interface PanelProps {
  title: string;
  content: string;
  isRTL?: boolean;
  isItalic?: boolean;
  isLoading: boolean;
  placeholder?: string;
}

function Panel({ title, content, isRTL, isItalic, isLoading, placeholder }: PanelProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 min-h-[240px] flex flex-col">
      <div className="font-['IBM_Plex_Mono'] text-xs uppercase tracking-wider text-muted-foreground mb-4">
        {title}
      </div>
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <div
          className={`flex-1 overflow-y-auto ${isRTL ? 'text-right' : 'text-left'} ${
            isItalic ? "font-['Lora'] italic" : "font-['Lora']"
          }`}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {content || (
            <span className="text-muted-foreground text-sm">
              {placeholder ?? (isRTL ? 'في انتظار التسجيل...' : 'Waiting for recording...')}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex-1 space-y-3">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="h-4 bg-muted rounded"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
          style={{ width: `${100 - i * 10}%` }}
        />
      ))}
    </div>
  );
}
