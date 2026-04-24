interface HeaderProps {
  sessionTime: string;
}

export function Header({ sessionTime }: HeaderProps) {
  return (
    <div className="w-full max-w-6xl flex items-center justify-between mb-8">
      <h1 className="font-['IBM_Plex_Mono'] tracking-tight">
        MedTranslate
      </h1>
      <div className="font-['IBM_Plex_Mono'] text-sm text-muted-foreground">
        {sessionTime}
      </div>
    </div>
  );
}
