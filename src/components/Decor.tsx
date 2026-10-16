export function PixelStar({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`pixel-star ${className}`.trim()}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0c.55 6.3 5.15 10.9 12 12-6.85 1.1-11.45 5.7-12 12-.55-6.3-5.15-10.9-12-12C6.85 10.9 11.45 6.3 12 0Z" />
    </svg>
  );
}

export function Sparkle({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`sparkle ${className}`.trim()}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 0c.37 4.2 3.43 7.26 8 8-4.57.74-7.63 3.8-8 8-.37-4.2-3.43-7.26-8-8 4.57-.74 7.63-3.8 8-8Z" />
    </svg>
  );
}

export function Barcode({ className = "" }: { className?: string }) {
  const bars = [3, 1, 2, 1, 4, 1, 1, 3, 2, 1, 3, 1, 2, 4, 1, 2, 1, 3];
  return (
    <div className={`barcode ${className}`.trim()} aria-hidden="true">
      {bars.map((bar, index) => (
        <span key={`${bar}-${index}`} style={{ width: `${bar}px` }} />
      ))}
    </div>
  );
}
