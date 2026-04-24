import { motion } from 'motion/react';

interface ClinicalSummaryProps {
  keywords: string[];
  summary: string;
  isLoading: boolean;
}

export function ClinicalSummary({ keywords, summary, isLoading }: ClinicalSummaryProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 w-full max-w-6xl">
      <div className="font-['IBM_Plex_Mono'] text-xs uppercase tracking-wider text-muted-foreground mb-4">
        Clinical Summary
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {keywords.map((keyword, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="px-3 py-1.5 bg-primary/20 text-primary rounded-full font-['IBM_Plex_Mono'] text-xs border border-primary/40"
                >
                  {keyword}
                </motion.span>
              ))}
            </div>
          )}

          <div className="font-['Lora'] text-foreground leading-relaxed">
            {summary || (
              <span className="text-muted-foreground">
                Clinical summary will appear here after translation...
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="h-7 w-24 bg-muted rounded-full"
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-4 bg-muted rounded"
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.1,
            }}
            style={{ width: `${100 - i * 15}%` }}
          />
        ))}
      </div>
    </div>
  );
}
