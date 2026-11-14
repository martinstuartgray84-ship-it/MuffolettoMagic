"use client";
import { useCallback, useEffect, useState } from "react";

type P = { src: string; caption?: string };

/** Photo grid with a full-screen viewer (arrow keys, Esc, tap sides). */
export default function Gallery({ photos, min = 220, contain = false }: { photos: P[]; min?: number; contain?: boolean }) {
  const [i, setI] = useState<number | null>(null);
  const close = useCallback(() => setI(null), []);
  const step = useCallback((d: number) => setI((x) => (x == null ? x : (x + d + photos.length) % photos.length)), [photos.length]);

  useEffect(() => {
    if (i == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [i, close, step]);

  if (!photos.length) return null;
  const cur = i == null ? null : photos[i];
  return (
    <>
      <div className="photos" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))` }}>
        {photos.map((p, n) => (
          <figure key={p.src}>
            <button className="photo-btn" onClick={() => setI(n)} aria-label={`Open photo: ${p.caption ?? n + 1}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.src} alt={p.caption ?? ""} loading="lazy" style={contain ? { objectFit: "contain", background: "#fff" } : undefined} />
            </button>
            {p.caption && <figcaption>{p.caption}</figcaption>}
          </figure>
        ))}
      </div>
      {cur && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={close}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cur.src} alt={cur.caption ?? ""} onClick={(e) => { e.stopPropagation(); step(1); }} />
          <div className="lb-bar" onClick={(e) => e.stopPropagation()}>
            <span>{cur.caption}</span>
            <span className="lb-count">{i! + 1} / {photos.length}</span>
          </div>
          {photos.length > 1 && (
            <>
              <button className="lb-nav lb-prev" aria-label="Previous" onClick={(e) => { e.stopPropagation(); step(-1); }}>‹</button>
              <button className="lb-nav lb-next" aria-label="Next" onClick={(e) => { e.stopPropagation(); step(1); }}>›</button>
            </>
          )}
          <button className="lb-close" aria-label="Close" onClick={close}>×</button>
        </div>
      )}
    </>
  );
}
