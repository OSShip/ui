export function JitsiEmbed({ url, fullscreen = false }: { url: string; fullscreen?: boolean }) {
  return (
    <div className={fullscreen ? 'jitsi jitsi-fullscreen' : 'jitsi'}>
      <iframe src={url} allow="camera; microphone; fullscreen; display-capture" title="Jitsi session" />
      {!fullscreen && (
        <a href={url} target="_blank" rel="noopener noreferrer" className="btn secondary">
          Open in new tab
        </a>
      )}
    </div>
  );
}
