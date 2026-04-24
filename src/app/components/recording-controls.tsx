import { Mic, Pause, Square, Play } from 'lucide-react';
import { motion } from 'motion/react';

interface RecordingControlsProps {
  state: 'idle' | 'recording' | 'paused' | 'processing';
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export function RecordingControls({ state, onStart, onPause, onResume, onStop }: RecordingControlsProps) {
  if (state === 'idle') {
    return (
      <div className="flex flex-col items-center gap-6">
        <button
          onClick={onStart}
          className="relative w-32 h-32 rounded-full bg-primary flex items-center justify-center transition-all hover:scale-105 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40"
        >
          <Mic className="w-12 h-12 text-white" />
        </button>
        <div className="font-['IBM_Plex_Mono'] text-sm text-muted-foreground">
          Click to start recording
        </div>
      </div>
    );
  }

  if (state === 'processing') {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-32 h-32 rounded-full bg-primary/50 flex items-center justify-center">
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-primary"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            style={{ borderTopColor: 'transparent' }}
          />
          <Mic className="w-12 h-12 text-white opacity-50" />
        </div>
        <div className="font-['IBM_Plex_Mono'] text-sm text-primary animate-pulse">
          Processing...
        </div>
      </div>
    );
  }

  // Recording or Paused state
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Main Mic Button with Waveform */}
      <div className="relative w-32 h-32 rounded-full bg-primary flex items-center justify-center">
        {state === 'recording' && (
          <>
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
          </>
        )}
        {state === 'paused' && (
          <Pause className="w-12 h-12 text-white" />
        )}
      </div>

      {/* Status Text */}
      <div className="font-['IBM_Plex_Mono'] text-sm">
        {state === 'recording' && (
          <span className="text-destructive">● Recording</span>
        )}
        {state === 'paused' && (
          <span className="text-amber-500">❚❚ Paused</span>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-4">
        {state === 'recording' && (
          <>
            <button
              onClick={onPause}
              className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-['IBM_Plex_Mono'] transition-all shadow-lg"
              title="Pause recording"
            >
              <Pause className="w-4 h-4" />
              Pause
            </button>
            <button
              onClick={onStop}
              className="flex items-center gap-2 px-6 py-3 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg font-['IBM_Plex_Mono'] transition-all shadow-lg"
              title="Stop and process"
            >
              <Square className="w-4 h-4" />
              End Recording
            </button>
          </>
        )}
        {state === 'paused' && (
          <>
            <button
              onClick={onResume}
              className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-['IBM_Plex_Mono'] transition-all shadow-lg"
              title="Resume recording"
            >
              <Play className="w-4 h-4" />
              Resume
            </button>
            <button
              onClick={onStop}
              className="flex items-center gap-2 px-6 py-3 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg font-['IBM_Plex_Mono'] transition-all shadow-lg"
              title="Stop and process"
            >
              <Square className="w-4 h-4" />
              End Recording
            </button>
          </>
        )}
      </div>
    </div>
  );
}
