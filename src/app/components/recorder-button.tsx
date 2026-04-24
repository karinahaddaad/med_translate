import { Mic } from 'lucide-react';
import { motion } from 'motion/react';

interface RecorderButtonProps {
  state: 'idle' | 'recording' | 'processing';
  onClick: () => void;
}

export function RecorderButton({ state, onClick }: RecorderButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={state === 'processing'}
      className="relative w-32 h-32 rounded-full bg-primary flex items-center justify-center transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
    >
      {state === 'recording' ? (
        <div className="relative w-full h-full flex items-center justify-center">
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/40"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <div className="flex gap-1 items-end h-8">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="w-1 bg-white rounded-full"
                animate={{
                  height: ['12px', '32px', '12px'],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        <Mic className="w-12 h-12 text-white" />
      )}
    </button>
  );
}
