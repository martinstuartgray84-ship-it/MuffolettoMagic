import Link from "next/link";
import { getHouse, getRooms, getTasks, eur } from "@/lib/content";
import { RoomCard } from "@/components/ui";

export default function Home() {
  const house = getHouse();
  const rooms = getRooms();
  const real = rooms.filter((r) => !r.example);
  const tasks = getTasks();
  const open = tasks.filter((t) => t.status !== "done");
  const urgent = open.filter((t) => t.priority === "high");
  const budget = open.reduce((s, t) => s + (t.cost ?? 0), 0);

  return (
    <>
      <div className="eyebrow">{house.location}</div>
      <h1>{house.name}</h1>
      <p className="lede">{house.overview}</p>

      <div className="grid g4" style={{ marginTop: 24 }}>
        <div className="card"><div className="stat">{real.length}</div><div className="muted small">rooms recorded</div></div>
        <div className="card"><div className="stat">{real.filter((r) => r.status !== "survey").length}</div><div className="muted small">with a target design</div></div>
        <div className="card"><div className="stat">{open.length}</div><div className="muted small">open to-dos ({urgent.length} high priority)</div></div>
        <div className="card"><div className="stat">{budget ? eur(budget) : "—"}</div><div className="muted small">estimated open spend</div></div>
      </div>

      {house.facts?.length ? (
        <div className="grid g3" style={{ marginTop: 16 }}>
          {house.facts.map((f) => <div className="card" key={f.label}><div className="muted small">{f.label}</div><div>{f.value}</div></div>)}
        </div>
      ) : null}

      <div className="spread"><h2>High priority</h2><Link href="/tasks" className="small">All to-dos →</Link></div>
      {urgent.length ? (
        <div className="table-wrap">
          <table>
            <tbody>
              {urgent.slice(0, 8).map((t) => (
                <tr key={t.id}><td>{t.title}</td><td className="muted small">{t.who}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <div className="empty">Nothing urgent.</div>}

      <div className="spread"><h2>Rooms</h2><Link href="/rooms" className="small">All rooms →</Link></div>
      {real.length === 0 && (
        <div className="empty" style={{ marginBottom: 16 }}>
          No rooms recorded yet. Send photos room by room and they will appear here. The template below shows what each room page will contain.
        </div>
      )}
      <div className="grid g3">{(real.length ? real : rooms).slice(0, 9).map((r) => <RoomCard key={r.slug} room={r} />)}</div>
    </>
  );
}
