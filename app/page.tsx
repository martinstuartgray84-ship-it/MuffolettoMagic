import Link from "next/link";
import { getHouse, getRooms, getTasks, roomProgress, tradeOf, TRADE_ORDER, slugify , floorsTopDown } from "@/lib/content";
import { RoomCard } from "@/components/ui";

export default function Home() {
  const house = getHouse();
  const rooms = getRooms();
  const tasks = getTasks();
  const open = tasks.filter((t) => t.status !== "done");
  const work = open.filter((t) => t.type !== "admin" && t.type !== "buy");
  const name = new Map(rooms.map((r) => [r.slug, r.name]));

  const safety = open.filter((t) => t.priority === "high" && t.type === "fix" && /electric|gas|safe|wire|wiring|insulation|boiler/i.test(t.title + (t.who ?? "")));
  const decisions = open.filter((t) => t.type === "admin");
  const byTrade = new Map<string, number>();
  work.forEach((t) => byTrade.set(tradeOf(t), (byTrade.get(tradeOf(t)) ?? 0) + 1));
  const trades = TRADE_ORDER.filter((t) => byTrade.has(t) && !t.startsWith("You"));
  const approved = rooms.filter((r) => r.status === "approved" || r.status === "in-progress" || r.status === "done").length;
  const doneJobs = tasks.filter((t) => t.status === "done" && t.type !== "admin").length;
  const allJobs = tasks.filter((t) => t.type !== "admin").length;

  return (
    <>
      <div className="hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {house.hero && <img src={house.hero} alt="" />}
        <div className="hero-text">
          <div className="eyebrow">{house.location}</div>
          <h1>{house.name}</h1>
        </div>
      </div>
      <p className="lede" style={{ marginTop: 18 }}>{house.overview}</p>

      <div className="grid g4" style={{ marginTop: 20 }}>
        <Link href="/rooms" className="card" style={{ textDecoration: "none" }}><div className="stat">{rooms.length}</div><div className="muted small">rooms and spaces</div></Link>
        <Link href="/rooms" className="card" style={{ textDecoration: "none" }}><div className="stat">{approved}</div><div className="muted small">with an agreed design or works under way</div></Link>
        <Link href="/tasks" className="card" style={{ textDecoration: "none" }}><div className="stat">{work.length}</div><div className="muted small">jobs to do · {doneJobs} of {allJobs} items done</div></Link>
        <Link href="/shopping" className="card" style={{ textDecoration: "none" }}><div className="stat">{open.filter((t) => t.type === "buy").length}</div><div className="muted small">things to buy</div></Link>
      </div>

      <div className="grid g2" style={{ marginTop: 16 }}>
        {safety.length > 0 && (
          <div className="panel alert">
            <h3>Safety first</h3>
            <ul>
              {safety.map((t) => (
                <li key={t.id}>{t.title}{t.room && <> — <Link href={`/rooms/${t.room}`} className="small">{name.get(t.room)}</Link></>}</li>
              ))}
            </ul>
          </div>
        )}
        {decisions.length > 0 && (
          <div className="panel ask">
            <h3>Waiting on you · {decisions.length}</h3>
            <ul>
              {decisions.slice(0, 7).map((t) => (
                <li key={t.id}>{t.title}</li>
              ))}
            </ul>
            {decisions.length > 7 && <p className="small" style={{ margin: "8px 0 0" }}><Link href="/tasks">See all {decisions.length} →</Link></p>}
          </div>
        )}
      </div>

      <div className="spread"><h2>Who's needed</h2><Link href="/trades" className="small">Job lists by trade →</Link></div>
      <div className="chips">
        {trades.map((t) => <Link key={t} className="chip" href={`/trades#${slugify(t)}`}><b>{byTrade.get(t)}</b> {t}</Link>)}
      </div>

      <div className="spread"><h2>The house, floor by floor</h2><Link href="/rooms" className="small">All rooms →</Link></div>
      {floorsTopDown(house).map((f) => {
        const list = rooms.filter((r) => r.floor === f.id);
        if (!list.length) return null;
        return (
          <div className="floor-row" key={f.id}>
            <div><div className="fl">{f.name}</div><div className="muted small">{f.nameIt}</div></div>
            <div className="floor-rooms">{list.map((r) => <RoomCard key={r.slug} room={r} mini progress={roomProgress(r.slug, tasks)} />)}</div>
          </div>
        );
      })}

      {house.facts?.length ? (
        <>
          <h2>Key facts</h2>
          <div className="table-wrap"><table><tbody>
            {house.facts.map((f) => <tr key={f.label}><th style={{ width: "30%" }}>{f.label}</th><td>{f.value}</td></tr>)}
          </tbody></table></div>
        </>
      ) : null}
    </>
  );
}
