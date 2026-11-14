import Link from "next/link";
import { getHouse, getRooms, hexToRgb } from "@/lib/content";
import { Swatches } from "@/components/ui";

export const metadata = { title: "Style & palette · Casa Muffoletto" };

export default function Style() {
  const house = getHouse();
  const s = house.style ?? {};
  const rooms = getRooms().filter((r) => r.target?.palette?.length);
  return (
    <>
      <h1>Style & palette</h1>
      <p className="lede">{s.direction}</p>

      {s.principles?.length ? (<><h2>Design principles</h2><ol>{s.principles.map((p) => <li key={p}>{p}</li>)}</ol></>) : null}

      <h2>Whole-house palette</h2>
      <Swatches palette={s.palette} />

      <div className="grid g2" style={{ marginTop: 18 }}>
        <div className="card"><h3>Signature materials</h3>{s.materials?.length ? <ul>{s.materials.map((m) => <li key={m}>{m}</li>)}</ul> : <p className="muted small">To be defined.</p>}</div>
        <div className="card"><h3>What we avoid</h3>{s.avoid?.length ? <ul>{s.avoid.map((m) => <li key={m}>{m}</li>)}</ul> : <p className="muted small">To be defined.</p>}</div>
      </div>

      <h2>Colour by room</h2>
      {rooms.map((r) => (
        <section key={r.slug} style={{ marginBottom: 22 }}>
          <div className="spread"><h3><Link href={`/rooms/${r.slug}`}>{r.name}</Link></h3></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th></th><th>Colour</th><th>Use</th><th>Brand / code</th><th>Finish</th><th>HEX / RGB</th></tr></thead>
              <tbody>
                {r.target!.palette!.map((c) => (
                  <tr key={c.name + c.hex}>
                    <td style={{ width: 44 }}><span style={{ display: "block", width: 28, height: 28, borderRadius: 6, background: c.hex, border: "1px solid var(--line)" }} /></td>
                    <td>{c.name}</td><td>{c.role}</td><td>{[c.brand, c.code].filter(Boolean).join(" ")}</td><td>{c.finish}</td>
                    <td className="small" style={{ fontFamily: "ui-monospace, monospace" }}>{c.hex.toUpperCase()}<br />{hexToRgb(c.hex)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </>
  );
}
