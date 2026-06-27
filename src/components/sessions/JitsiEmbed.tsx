export function JitsiEmbed({ url }: { url: string }) {
  return (
    <div className="jitsi">
      <iframe src={url} allow="camera; microphone; fullscreen" title="Jitsi session" />
      <a href={url} target="_blank" rel="noopener noreferrer" className="btn secondary">Open in new tab</a>
    </div>
  );
}
