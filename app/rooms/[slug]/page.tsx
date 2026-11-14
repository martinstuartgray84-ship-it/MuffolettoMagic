import Link from "next/link";
import { notFound } from "next/navigation";
import { getRooms, getRoom, getHouse, getTasks, area, wallArea, TYPE_LABEL, eur } from "@/lib/content";
import { ItemList, StatusPill, Swatches } from "@/components/ui";
import CopyPrompt from "@/components/CopyPrompt";

export function generateStaticParams() {
  return getRooms().map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: `${getRoom(slug)?.name ?? "Room"} · Casa Muffoletto` };
}

export default async function RoomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const room = getRoom(slug);
  if (!room) notFound();
  const floor = getHouse().floors.find((f) => f.id === room.floor);
  const tasks = getTasks().filter((t) => t.room === room.slug);
  const current = room.photos?.filter((p) => !p.kind || p.kind === "current" || p.kind === "detail") ?? [];
  const ideas = room.photos?.filter((p) => p.kind === "inspiration" || p.kind === "target" || p.kind === "render") ?? [];
  const d = room.dimensions;
  const t = room.target;

  return (
    <>
      <div className="eyebrow"><Link href="/rooms">Rooms</Link> · {floor?.name}</div>
      <div className="spread">
        <h1 style={{ marginBottom: 4 }}>{room.name}</h1>
        <div className="row no-print">
          <Link className="btn" href={`/brief/${room.slug}`}>Decorator brief / PDF</Link>
        </div>
      </div>
      <div className="row" style={{ marginBottom: 18 }}>
        {room.ref && <span className="pill">{room.ref}</span>}
        {room.nameIt && <span className="muted">{room.nameIt}</span>}
        <StatusPill status={room.status} />
        {room.example && <span className="pill example">template — will be replaced by real rooms</span>}
      </div>

      <div className="grid g4">
        <div className="card"><div className="muted small">Floor area</div><div className="stat">{area(room) ? `${area(room)} m²` : "—"}</div></div>
        <div className="card"><div className="muted small">Size (L × W × H)</div><div className="stat" style={{ fontSize: "1.3rem", marginTop: 8 }}>{d?.length && d?.width ? `${d.length} × ${d.width}${d.height ? ` × ${d.height}` : ""} m` : "To measure"}</div></div>
        <div className="card"><div className="muted small">Approx. wall area</div><div className="stat">{wallArea(room) ? `${wallArea(room)} m²` : "—"}</div></div>
        <div className="card"><div className="muted small">Orientation & light</div><div style={{ marginTop: 8 }}>{room.orientation ?? "—"}</div></div>
      </div>
      {d?.notes && <p className="muted small" style={{ marginTop: 8 }}>{d.notes}</p>}

      <h2>Now</h2>
      {current.length ? (
        <div className="photos">
          {current.map((p) => (
            <figure key={p.src}>
              <a href={p.src} target="_blank" rel="noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.src} alt={p.caption ?? room.name} loading="lazy" />
              </a>
              {p.caption && <figcaption>{p.caption}</figcaption>}
            </figure>
          ))}
        </div>
      ) : <div className="empty">No photos yet.</div>}
      {room.current?.summary && <p style={{ marginTop: 16 }}>{room.current.summary}</p>}
      <div className="grid g2" style={{ marginTop: 12 }}>
        <div className="card"><h3>Keep & restore</h3><ul>{(room.current?.keep?.length ? room.current.keep : ["—"]).map((k) => <li key={k}>{k}</li>)}</ul></div>
        <div className="card"><h3>Issues to fix</h3><ul>{(room.current?.issues?.length ? room.current.issues : ["—"]).map((k) => <li key={k}>{k}</li>)}</ul></div>
      </div>

      {room.proposal && (
        <>
          <h2>Proposed works <span className="muted small">· {room.proposal.by}{room.proposal.date ? `, ${room.proposal.date}` : ""}</span></h2>
          {room.proposal.summary && <p>{room.proposal.summary}</p>}
          {room.proposal.options?.length ? (
            <div className="grid g2" style={{ marginBottom: 12 }}>
              {room.proposal.options.map((o) => <div className="card" key={o.name}><h3>{o.name}</h3><p className="small" style={{ margin: 0 }}>{o.detail}</p></div>)}
            </div>
          ) : null}
          <div className="grid g2">
            {room.proposal.items?.length ? <div className="card"><h3>What's proposed</h3><ul>{room.proposal.items.map((x) => <li key={x}>{x}</li>)}</ul></div> : null}
            {room.proposal.questions?.length ? <div className="card"><h3>Open questions</h3><ul>{room.proposal.questions.map((x) => <li key={x}>{x}</li>)}</ul></div> : null}
          </div>
          {room.proposal.drawings?.length ? (
            <div className="photos" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", marginTop: 12 }}>
              {room.proposal.drawings.map((d) => (
                <figure key={d.src}>
                  <a href={d.pdf ?? d.src} target="_blank" rel="noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={d.src} alt={d.name} loading="lazy" style={{ objectFit: "contain", background: "#fff", border: "1px solid var(--line)" }} />
                  </a>
                  <figcaption>{d.name}{d.pdf && " — click for PDF"}</figcaption>
                </figure>
              ))}
            </div>
          ) : null}
        </>
      )}

      <h2>Target design</h2>
      {t?.concept ? <p className="lede" style={{ color: "var(--ink)" }}>{t.concept}</p> : <div className="empty">Design to come.</div>}
      {t?.mood?.length ? <div className="row" style={{ marginBottom: 16 }}>{t.mood.map((m) => <span className="pill" key={m}>{m}</span>)}</div> : null}

      <h3 style={{ marginTop: 20 }}>Colour scheme</h3>
      <Swatches palette={t?.palette} />

      <div className="grid g2" style={{ marginTop: 18 }}>
        <div className="card"><h3>Materials & finishes</h3><ItemList items={t?.materials} /></div>
        <div className="card"><h3>Furniture</h3><ItemList items={t?.furniture} /></div>
        <div className="card"><h3>Lighting</h3><ItemList items={t?.lighting} /></div>
        <div className="card"><h3>Textiles & soft furnishings</h3><ItemList items={t?.textiles} /></div>
      </div>

      {t?.renderPrompt && <CopyPrompt text={t.renderPrompt} />}

      {ideas.length > 0 && (
        <>
          <h3 style={{ marginTop: 24 }}>Visuals of the target design</h3>
          <div className="photos">
            {ideas.map((p) => (
              <figure key={p.src}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.src} alt={p.caption ?? "inspiration"} loading="lazy" />
                {p.caption && <figcaption>{p.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </>
      )}

      <h2>Works for this room</h2>
      {tasks.length ? (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Task</th><th>Type</th><th>Status</th><th>Est.</th></tr></thead>
            <tbody>
              {tasks.map((x) => (
                <tr key={x.id} className={x.status === "done" ? "done" : ""}>
                  <td>{x.title}{x.notes && <div className="muted small">{x.notes}</div>}</td>
                  <td>{TYPE_LABEL[x.type]}</td><td>{x.status}</td><td>{eur(x.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <div className="empty">No tasks linked to this room yet.</div>}

      {room.updated && <p className="muted small" style={{ marginTop: 30 }}>Room record updated {room.updated}</p>}
    </>
  );
}
