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

export function RoomCard({ room }: { room: Room }) {
  const cover = room.photos?.find((p) => p.kind !== "inspiration") ?? room.photos?.[0];
  const palette = room.target?.palette ?? [];
  return (
    <Link href={`/rooms/${room.slug}`} className="card room-card">
      <div className="thumb">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover.src} alt={room.name} loading="lazy" />
        ) : palette.length ? (
          <div className="strip">{palette.map((s) => <span key={s.hex + s.name} style={{ background: s.hex }} />)}</div>
        ) : null}
      </div>
      <div className="body">
        <div className="spread">
          <h3 style={{ margin: 0 }}>{room.name}</h3>
        </div>
        {room.nameIt && <div className="muted small">{room.nameIt}</div>}
        <div className="row" style={{ marginTop: 8 }}>
          <StatusPill status={room.status} />
          {room.example && <span className="pill example">template</span>}
        </div>
      </div>
    </Link>
  );
}
