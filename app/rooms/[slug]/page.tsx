import Link from "next/link";
import { notFound } from "next/navigation";
import { getRooms, getRoom, getHouse, getTasks, area, wallArea, TYPE_LABEL, eur, splitIssues, tradeOf , floorsTopDown } from "@/lib/content";
import { ItemList, StatusPill, Swatches } from "@/components/ui";
import CopyPrompt from "@/components/CopyPrompt";
import Gallery from "@/components/Gallery";

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
  const house = getHouse();
  const floor = house.floors.find((f) => f.id === room.floor);
  const tasks = getTasks().filter((t) => t.room === room.slug);
  const openTasks = tasks.filter((t) => t.status !== "done");
  const doneTasks = tasks.filter((t) => t.status === "done");
  const photos = room.photos ?? [];
  const current = photos.filter((p) => !p.kind || p.kind === "current");
  const details = photos.filter((p) => p.kind === "detail");
  const renders = photos.filter((p) => p.kind === "target" || p.kind === "render");
  const inspo = photos.filter((p) => p.kind === "inspiration");
  const d = room.dimensions;
  const t = room.target;
  const { jobs, suggestions, decisions, checks } = splitIssues(room.current?.issues);
  const hasSize = !!(area(room) || (d?.length && d?.width));

  // prev / next in house order (top floor first, as on the Rooms page)
  const order = floorsTopDown(house).flatMap((f) => getRooms().filter((r) => r.floor === f.id));
  const idx = order.findIndex((r) => r.slug === room.slug);
  const prev = order[idx - 1], next = order[idx + 1];
  const has = (x?: unknown[]) => !!x?.length;

  return (
    <>
      <div className="eyebrow"><Link href="/rooms">Rooms</Link> · <Link href={`/rooms#${room.floor}`}>{floor?.name}</Link></div>
      <div className="spread">
        <h1 style={{ marginBottom: 4 }}>{room.name}</h1>
        <div className="row no-print">
          <Link className="btn" href={`/brief/${room.slug}`}>Brief / PDF</Link>
        </div>
      </div>
      <div className="row" style={{ marginBottom: 14 }}>
        {room.ref && <span className="pill">{room.ref}</span>}
        {room.nameIt && <span className="muted">{room.nameIt}</span>}
        <StatusPill status={room.status} />
        {tasks.length > 0 && <span className="muted small">{openTasks.length} open · {doneTasks.length} done</span>}
      </div>
      <div className="subnav no-print">
        <a href="#jobs">Jobs</a><a href="#now">Now</a><a href="#design">Design</a>
        {room.proposal && <a href="#architect">Architect</a>}
        {room.brief && <a href="#spec">Spec</a>}
        <a href="#list">To-do list</a>
      </div>

      {current[0] && renders[0] && (
        <div className="ba">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <figure><img src={current[0].src} alt="" /><span className="tag">Now</span></figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <figure><img src={renders[0].src} alt="" /><span className="tag to">Target</span></figure>
        </div>
      )}

      <h2 id="jobs">Jobs</h2>
      {jobs.length ? (
        <div className="card"><ol className="jobs">{jobs.map((j) => <li key={j}>{j}</li>)}</ol></div>
      ) : <div className="empty">No jobs agreed for this room yet.</div>}
      {(has(decisions) || has(checks) || has(suggestions)) && (
        <div className="grid g2" style={{ marginTop: 12 }}>
          {(has(decisions) || has(checks)) && (
            <div className="panel ask">
              <h3>To decide or check</h3>
              <ul>{[...decisions, ...checks].map((x) => <li key={x}>{x}</li>)}</ul>
            </div>
          )}
          {has(suggestions) && (
            <div className="card soft">
              <h3>Claude's suggestions — not agreed</h3>
              <ul className="small">{suggestions.map((x) => <li key={x}>{x}</li>)}</ul>
            </div>
          )}
        </div>
      )}

      <h2 id="now">Now</h2>
      {current.length ? <Gallery photos={current} /> : <div className="empty">No photos yet — send some and they will appear here.</div>}
      {room.current?.summary && <p style={{ marginTop: 16, maxWidth: "85ch" }}>{room.current.summary}</p>}
      {details.length > 0 && (<><h3 style={{ marginTop: 18 }}>Details</h3><Gallery photos={details} /></>)}

      <div className="grid g2" style={{ marginTop: 16 }}>
        {has(room.current?.keep) && <div className="card"><h3>Keep</h3><ul>{room.current!.keep!.map((k) => <li key={k}>{k}</li>)}</ul></div>}
        <div className="card">
          <h3>Measurements</h3>
          {hasSize ? (
            <table><tbody>
              {d?.length && d?.width ? <tr><th>Size</th><td>{d.length} × {d.width} m{d.height ? `, height ${d.height} m` : ""}</td></tr> : null}
              {area(room) ? <tr><th>Floor area</th><td>{area(room)} m²</td></tr> : null}
              {wallArea(room) ? <tr><th>Walls, approx.</th><td>{wallArea(room)} m²</td></tr> : null}
            </tbody></table>
          ) : null}
          {room.orientation && <p className="small" style={{ margin: "10px 0 0" }}><strong>Light & openings:</strong> {room.orientation}</p>}
          {d?.notes && <p className="muted small" style={{ margin: "8px 0 0" }}>{d.notes}</p>}
          {!hasSize && !room.orientation && !d?.notes && <p className="muted small">To measure.</p>}
        </div>
      </div>

      <h2 id="design">Target design</h2>
      {t?.concept ? <p className="lede" style={{ color: "var(--ink)" }}>{t.concept}</p> : <div className="empty">Design to come.</div>}
      {has(t?.mood) && <div className="row" style={{ marginBottom: 16 }}>{t!.mood!.map((m) => <span className="pill" key={m}>{m}</span>)}</div>}
      {renders.length > 0 && <Gallery photos={renders} min={300} />}

      {has(t?.palette) && (<><h3 style={{ marginTop: 20 }}>Colours</h3><Swatches palette={t!.palette} /></>)}

      {(has(t?.materials) || has(t?.furniture) || has(t?.lighting) || has(t?.textiles)) && (
        <div className="grid g2" style={{ marginTop: 18 }}>
          {has(t?.materials) && <div className="card"><h3>Materials & finishes</h3><ItemList items={t!.materials} /></div>}
          {has(t?.furniture) && <div className="card"><h3>Furniture & fittings</h3><ItemList items={t!.furniture} /></div>}
          {has(t?.lighting) && <div className="card"><h3>Lighting</h3><ItemList items={t!.lighting} /></div>}
          {has(t?.textiles) && <div className="card"><h3>Textiles</h3><ItemList items={t!.textiles} /></div>}
        </div>
      )}
      {inspo.length > 0 && (<><h3 style={{ marginTop: 22 }}>Inspiration</h3><Gallery photos={inspo} min={300} /></>)}
      {t?.renderPrompt && <CopyPrompt text={t.renderPrompt} from={t.renderFrom} />}

      {room.proposal && (
        <>
          <h2 id="architect">Architect's proposal <span className="muted small">· {room.proposal.by}{room.proposal.date ? `, ${room.proposal.date}` : ""}</span></h2>
          {room.proposal.summary && <p>{room.proposal.summary}</p>}
          {has(room.proposal.options) && (
            <div className="grid g2" style={{ marginBottom: 12 }}>
              {room.proposal.options!.map((o) => <div className="card" key={o.name}><h3>{o.name}</h3><p className="small" style={{ margin: 0 }}>{o.detail}</p></div>)}
            </div>
          )}
          <div className="grid g2">
            {has(room.proposal.items) && <div className="card"><h3>What's proposed</h3><ul>{room.proposal.items!.map((x) => <li key={x}>{x}</li>)}</ul></div>}
            {has(room.proposal.questions) && <div className="card"><h3>Open questions</h3><ul>{room.proposal.questions!.map((x) => <li key={x}>{x}</li>)}</ul></div>}
          </div>
          {has(room.proposal.drawings) && <div style={{ marginTop: 12 }}><Gallery photos={room.proposal.drawings!.map((x) => ({ src: x.src, caption: x.name }))} min={320} contain /></div>}
        </>
      )}

      {room.brief && (has(room.brief.surfaces) || has(room.brief.notes)) && (
        <>
          <div className="spread"><h2 id="spec">Spec for the trades</h2><Link href={`/brief/${room.slug}`} className="small no-print">Printable brief →</Link></div>
          {has(room.brief.surfaces) && (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Surface / item</th><th>Preparation</th><th>Finish</th><th>Colour</th></tr></thead>
                <tbody>
                  {room.brief.surfaces!.map((s) => (
                    <tr key={s.surface}>
                      <td><strong>{s.surface}</strong>{s.notes && <div className="muted small">{s.notes}</div>}</td>
                      <td>{s.prep ?? "—"}</td><td>{s.finish ?? "—"}</td><td>{s.colour ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {has(room.brief.notes) && <div className="card" style={{ marginTop: 12 }}><h3>Important notes</h3><ul>{room.brief.notes!.map((x) => <li key={x}>{x}</li>)}</ul></div>}
        </>
      )}

      <h2 id="list">To-do list for this room</h2>
      {tasks.length ? (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Item</th><th>Who</th><th>Type</th><th>Status</th><th>Est.</th></tr></thead>
            <tbody>
              {[...openTasks, ...doneTasks].map((x) => (
                <tr key={x.id} className={x.status === "done" ? "done" : ""}>
                  <td>{x.priority === "high" && x.status !== "done" && <span className="pill high" style={{ marginRight: 6 }}>high</span>}{x.title}{x.suggested && <span className="pill" style={{ marginLeft: 6 }}>suggestion</span>}{x.notes && <div className="muted small">{x.notes}</div>}</td>
                  <td className="small">{x.who ?? tradeOf(x)}</td><td className="small">{TYPE_LABEL[x.type]}</td><td className="small">{x.status}</td><td className="small">{eur(x.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <div className="empty">Nothing on the list for this room yet.</div>}

      <div className="pager no-print">
        {prev ? <Link href={`/rooms/${prev.slug}`}>← {prev.name}</Link> : <span />}
        {next ? <Link href={`/rooms/${next.slug}`}>{next.name} →</Link> : <span />}
      </div>
      {room.updated && <p className="muted small" style={{ marginTop: 18 }}>Room record updated {room.updated}</p>}
    </>
  );
}
