import { Wifi, WifiOff } from 'lucide-react';

interface StatusBarProps {
  modelName: string;
  isConnected: boolean;
}

export function StatusBar({ modelName, isConnected }: StatusBarProps) {
  return (
    <div className="w-full max-w-6xl border-t border-border pt-4 mt-8">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="font-['IBM_Plex_Mono'] text-xs text-muted-foreground uppercase tracking-wider">
            Model
          </div>
          <div className="font-['IBM_Plex_Mono'] text-sm text-foreground">
            {modelName}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Wifi className="w-4 h-4 text-primary" />
              <span className="font-['IBM_Plex_Mono'] text-xs text-primary uppercase tracking-wider">
                Connected
              </span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-destructive" />
              <span className="font-['IBM_Plex_Mono'] text-xs text-destructive uppercase tracking-wider">
                Disconnected
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
