import Link from "next/link";
import { notFound } from "next/navigation";
import { getHouse, getRooms, getTasks, area, wallArea, hexToRgb, inkFor, Room } from "@/lib/content";
import PrintButton from "@/components/PrintButton";

export const metadata = { title: "Decorator brief · Casa Muffoletto" };

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ rooms?: string }> };

export default async function Brief({ params, searchParams }: Props) {
  const { slug } = await params;
  const { rooms: q } = await searchParams;
  const house = getHouse();
  const all = getRooms();
  let rooms: Room[];
  if (slug === "house") rooms = all.filter((r) => !r.example);
  else if (slug === "selection") {
    const want = (q ?? "").split(",").filter(Boolean);
    rooms = all.filter((r) => want.includes(r.slug));
  } else rooms = all.filter((r) => r.slug === slug);
  if (!rooms.length && slug !== "house") notFound();

  const tasks = getTasks();
  const floors = new Map(house.floors.map((f) => [f.id, f.name]));
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const title = rooms.length === 1 ? rooms[0].name : slug === "house" ? "Whole house" : `${rooms.length} rooms`;

  // Colour schedule across all included rooms (deduplicated by hex+name)
  const schedule = new Map<string, { s: NonNullable<NonNullable<Room["target"]>["palette"]>[number]; rooms: string[] }>();
  rooms.forEach((r) => r.target?.palette?.forEach((s) => {
    const k = s.hex.toLowerCase() + s.name;
    const e = schedule.get(k) ?? { s, rooms: [] };
    e.rooms.push(r.name);
    schedule.set(k, e);
  }));

  return (
    <>
      <div className="print-bar">
        <Link href="/brief" className="small">← All briefs</Link>
        <PrintButton />
      </div>
      <article className="doc">
        <section className="cover">
          <div className="eyebrow">Decoration brief · Capitolato lavori di tinteggiatura e finitura</div>
          <h1>{house.name}</h1>
          <div style={{ fontFamily: "var(--serif)", fontSize: "1.5rem" }}>{title}</div>
          <p className="muted" style={{ marginTop: 18 }}>
            Issued {today}{house.location && house.location !== "To be confirmed" ? ` · ${house.location}` : ""}
          </p>
          <p className="small">Rooms included: {rooms.map((r) => r.name).join(", ") || "—"}</p>
          {house.contacts?.length ? (
            <p className="small">Contacts: {house.contacts.map((c) => `${c.role}: ${c.name}${c.phone ? ` (${c.phone})` : ""}`).join(" · ")}</p>
          ) : null}
        </section>

        <h2>How to read this brief</h2>
        <ul className="small">
          <li>Each room has its scope, its measurements, a surface schedule (preparation → finish → colour) and the exact colours to use.</li>
          <li>Colours are given by brand and code; HEX values are for reference only — always match to the manufacturer’s physical chart.</li>
          <li>Please quote per room, separating preparation, materials and labour, and flag anything you think we have missed.</li>
          <li>Wall areas are approximate (perimeter × height, less ~15% for openings) — please verify on site.</li>
        </ul>

        {schedule.size > 0 && (
          <>
            <h2>Colour schedule</h2>
            <table>
              <thead><tr><th></th><th>Colour</th><th>Brand / code</th><th>Finish</th><th>Reference</th><th>Used in</th></tr></thead>
              <tbody>
                {[...schedule.values()].map(({ s, rooms: rs }) => (
                  <tr key={s.hex + s.name}>
                    <td style={{ width: 40 }}><span style={{ display: "block", width: 26, height: 26, borderRadius: 4, background: s.hex, border: "1px solid #ccc" }} /></td>
                    <td><strong>{s.name}</strong>{s.role && <div className="muted small">{s.role}</div>}</td>
                    <td>{[s.brand, s.code].filter(Boolean).join(" ") || "—"}</td>
                    <td>{s.finish ?? "—"}</td>
                    <td className="small" style={{ fontFamily: "ui-monospace, monospace" }}>{s.hex.toUpperCase()}<br />RGB {hexToRgb(s.hex)}</td>
                    <td className="small">{rs.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {rooms.map((r, i) => {
          const photos = (r.photos ?? []).filter((p) => p.kind !== "inspiration").slice(0, 6);
          const roomTasks = tasks.filter((t) => t.room === r.slug && t.status !== "done" && (t.type === "decor" || t.type === "fix"));
          const d = r.dimensions;
          return (
            <section className="room-section" key={r.slug}>
              <div className="eyebrow" style={{ marginTop: 30 }}>Room {i + 1} of {rooms.length} · {floors.get(r.floor)}</div>
              <h2 style={{ marginTop: 0 }}>{r.name}{r.nameIt && <span className="muted" style={{ fontSize: "1rem" }}> · {r.nameIt}</span>}</h2>

              <table style={{ marginBottom: 14 }}>
                <tbody>
                  <tr><th>Dimensions</th><td>{d?.length && d?.width ? `${d.length} × ${d.width} m${d.height ? `, ceiling ${d.height} m` : ""}` : "To be measured on site"}</td>
                    <th>Floor area</th><td>{area(r) ? `${area(r)} m²` : "—"}</td></tr>
                  <tr><th>Approx. walls</th><td>{wallArea(r) ? `${wallArea(r)} m²` : "—"}</td>
                    <th>Light</th><td>{r.orientation ?? "—"}</td></tr>
                  <tr><th>Access</th><td colSpan={3}>{r.brief?.access ?? "To be agreed"}</td></tr>
                </tbody>
              </table>

              {photos.length > 0 && (
                <div className="photos" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                  {photos.map((p) => (
                    <figure key={p.src}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.src} alt={p.caption ?? r.name} />
                      {p.caption && <figcaption>{p.caption}</figcaption>}
                    </figure>
                  ))}
                </div>
              )}

              {r.proposal?.summary && (<><h3 style={{ marginTop: 16 }}>Building works by others (architect: {r.proposal.by})</h3><p>{r.proposal.summary}</p>{r.proposal.items?.length ? <ul>{r.proposal.items.map((x) => <li key={x}>{x}</li>)}</ul> : null}</>)}
              {r.target?.concept && (<><h3 style={{ marginTop: 16 }}>Design intent</h3><p>{r.target.concept}</p></>)}

              <h3>Scope of works</h3>
              {r.brief?.scope?.length ? <ul>{r.brief.scope.map((s) => <li key={s}>{s}</li>)}</ul> : <p className="muted">To be defined.</p>}

              {r.brief?.surfaces?.length ? (
                <>
                  <h3 style={{ marginTop: 16 }}>Surface schedule</h3>
                  <table>
                    <thead><tr><th>Surface</th><th>Preparation</th><th>Finish</th><th>Colour</th></tr></thead>
                    <tbody>
                      {r.brief.surfaces.map((s) => {
                        const sw = r.target?.palette?.find((p) => s.colour && (s.colour.includes(p.name) || (p.code && s.colour.includes(p.code))));
                        return (
                          <tr key={s.surface}>
                            <td><strong>{s.surface}</strong>{s.notes && <div className="muted small">{s.notes}</div>}</td>
                            <td>{s.prep ?? "—"}</td>
                            <td>{s.finish ?? "—"}</td>
                            <td>
                              {sw && <span style={{ display: "inline-block", width: 14, height: 14, borderRadius: 3, background: sw.hex, border: "1px solid #ccc", verticalAlign: "-2px", marginRight: 6 }} />}
                              {s.colour ?? "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </>
              ) : null}

              {r.target?.palette?.length ? (
                <>
                  <h3 style={{ marginTop: 16 }}>Colours for this room</h3>
                  <div className="swatches">
                    {r.target.palette.map((s) => (
                      <div className="swatch" key={s.name + s.hex}>
                        <div className="chip" style={{ background: s.hex, color: inkFor(s.hex) }}>{s.hex.toUpperCase()}</div>
                        <div className="meta"><strong>{s.name}</strong>{s.role}<br />{[s.brand, s.code].filter(Boolean).join(" ")}{s.finish && <><br />{s.finish}</>}</div>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}

              {(r.current?.issues?.length || roomTasks.length) ? (
                <>
                  <h3 style={{ marginTop: 16 }}>Known defects & repairs</h3>
                  <ul>
                    {r.current?.issues?.map((x) => <li key={x}>{x}</li>)}
                    {roomTasks.map((t) => <li key={t.id}>{t.title}{t.notes ? ` — ${t.notes}` : ""}</li>)}
                  </ul>
                </>
              ) : null}

              {r.current?.keep?.length ? (<><h3 style={{ marginTop: 16 }}>Protect / do not alter</h3><ul>{r.current.keep.map((x) => <li key={x}>{x}</li>)}</ul></>) : null}
              {r.brief?.notes?.length ? (<><h3 style={{ marginTop: 16 }}>Important notes</h3><ul>{r.brief.notes.map((x) => <li key={x}>{x}</li>)}</ul></>) : null}
            </section>
          );
        })}
        {!rooms.length && <p className="muted">No real rooms recorded yet.</p>}
      </article>
    </>
  );
}
