import Link from "next/link";
import { Room, STATUS_LABEL, Swatch, inkFor, Item } from "@/lib/content";

export function StatusPill({ status }: { status: Room["status"] }) {
  return <span className={`pill ${status}`}>{STATUS_LABEL[status]}</span>;
}

export function Swatches({ palette }: { palette?: Swatch[] }) {
  if (!palette?.length) return <div className="empty">No colours chosen yet.</div>;
  return (
    <div className="swatches">
      {palette.map((s) => (
        <div className="swatch" key={s.name + s.hex}>
          <div className="chip" style={{ background: s.hex, color: inkFor(s.hex) }}>{s.hex.toUpperCase()}</div>
          <div className="meta">
            <strong>{s.name}</strong>
            {s.role && <div className="muted">{s.role}</div>}
            {(s.brand || s.code) && <div>{[s.brand, s.code].filter(Boolean).join(" · ")}</div>}
            {s.finish && <div className="muted">Finish: {s.finish}</div>}
            {s.notes && <div className="muted">{s.notes}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ItemList({ items }: { items?: Item[] }) {
  if (!items?.length) return <p className="muted small">Nothing yet.</p>;
  return (
    <ul>
      {items.map((i) => (
        <li key={i.name}>
          {i.link ? <a href={i.link} target="_blank" rel="noreferrer">{i.name}</a> : <strong style={{ fontWeight: 600 }}>{i.name}</strong>}
          {i.detail && <span className="muted"> — {i.detail}</span>}
          {i.status && <> <span className="pill">{i.status}</span></>}
        </li>
      ))}
    </ul>
  );
}

export function RoomCard({ room, progress, mini = false }: { room: Room; progress?: { done: number; total: number }; mini?: boolean }) {
  const cover = room.photos?.find((p) => !p.kind || p.kind === "current") ?? room.photos?.[0];
  const palette = room.target?.palette ?? [];
  const pct = progress && progress.total ? Math.round((progress.done / progress.total) * 100) : 0;
  return (
    <Link href={`/rooms/${room.slug}`} className={`card room-card${mini ? " mini" : ""}`}>
      <div className="thumb">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover.src} alt="" loading="lazy" />
        ) : palette.length ? (
          <div className="strip">{palette.map((s) => <span key={s.hex + s.name} style={{ background: s.hex }} />)}</div>
        ) : <span className="nophoto">No photos yet</span>}
      </div>
      <div className="body">
        <h3 style={{ margin: 0 }}>{room.name}</h3>
        {!mini && room.nameIt && <div className="muted small">{room.nameIt}</div>}
        <div className="row" style={{ marginTop: 8 }}>
          <StatusPill status={room.status} />
          {progress && progress.total > 0 && <span className="muted small">{progress.done}/{progress.total} jobs done</span>}
        </div>
        {progress && progress.total > 0 && <div className="bar"><i style={{ width: `${pct}%` }} /></div>}
      </div>
    </Link>
  );
}
