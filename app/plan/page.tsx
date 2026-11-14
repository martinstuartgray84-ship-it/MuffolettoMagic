import Link from "next/link";
import { getHouse, getRooms, area } from "@/lib/content";
import { StatusPill } from "@/components/ui";
import TopFloorPlan from "@/components/TopFloorPlan";

export const metadata = { title: "Floor plan · Casa Muffoletto" };

export default function Plan() {
  const house = getHouse();
  const rooms = getRooms().filter((r) => !r.example);
  return (
    <>
      <h1>Floor plan</h1>
      <p className="lede">The footprint of the house, floor by floor. Plans are redrawn here as measurements and drawings come in.</p>
      <div className="grid g4" style={{ marginTop: 20 }}>
        {(house.facts ?? []).map((f) => (
          <div className="card" key={f.label}><div className="muted small">{f.label}</div><div style={{ fontFamily: "var(--serif)", fontSize: "1.25rem" }}>{f.value}</div></div>
        ))}
      </div>
      {house.documents?.length ? (
        <>
          <h2>Drawings & documents</h2>
          <div className="table-wrap">
            <table>
              <tbody>
                {house.documents.map((d) => (
                  <tr key={d.file}><td><a href={d.file} target="_blank" rel="noreferrer">{d.name}</a></td><td className="small muted">{d.by}</td><td className="small muted">{d.date}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
      <p className="muted small" style={{ marginTop: 14 }}>Plans are drawn with the street façade at the bottom. Click a plan to open it full size.</p>
      {house.floors.map((f) => {
        const list = rooms.filter((r) => r.floor === f.id);
        const total = list.reduce((s, r) => s + (area(r) ?? 0), 0);
        return (
          <section key={f.id}>
            <h2>{f.name} {f.nameIt && <span className="muted small"> · {f.nameIt}</span>}</h2>
            {f.notes && <p className="muted">{f.notes}</p>}
            {f.id === "outside" && <p className="small"><a href="/plans/roof.png" target="_blank" rel="noreferrer">Open the roof plan →</a></p>}
            {f.id === "third" ? (
              <>
                <TopFloorPlan />
                <p className="small"><a href={f.plan} target="_blank" rel="noreferrer">Your hand mark-up</a> · <a href="/plans/third.png" target="_blank" rel="noreferrer">original 2024 survey sheet</a></p>
              </>
            ) : f.plan ? (
              <a href={f.plan} target="_blank" rel="noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.plan} alt={`${f.name} plan`} style={{ width: "100%", maxHeight: "80vh", objectFit: "contain", background: "#fff", border: "1px solid var(--line)", borderRadius: 10 }} />
              </a>
            ) : (
              <div className="empty">Plan not drawn yet — send a photo of the planimetria or a hand sketch with measurements.</div>
            )}
            {list.length > 0 && (
              <div className="table-wrap" style={{ marginTop: 12 }}>
                <table>
                  <thead><tr><th>Room</th><th>Size (m)</th><th>Area</th><th>Status</th></tr></thead>
                  <tbody>
                    {list.map((r) => (
                      <tr key={r.slug}>
                        <td><Link href={`/rooms/${r.slug}`}>{r.name}</Link></td>
                        <td>{r.dimensions?.length && r.dimensions?.width ? `${r.dimensions.length} × ${r.dimensions.width}${r.dimensions.height ? ` (h ${r.dimensions.height})` : ""}` : "—"}</td>
                        <td>{area(r) ? `${area(r)} m²` : "—"}</td>
                        <td><StatusPill status={r.status} /></td>
                      </tr>
                    ))}
                    {total > 0 && <tr><td><strong>Total measured</strong></td><td /><td><strong>{Math.round(total * 10) / 10} m²</strong></td><td /></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        );
      })}
    </>
  );
}
