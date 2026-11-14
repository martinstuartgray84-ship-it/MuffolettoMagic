import Link from "next/link";
import { getRooms, getTasks, tradeOf, TRADE_ORDER, slugify, getHouse , floorsTopDown } from "@/lib/content";
import PrintButton from "@/components/PrintButton";

export const metadata = { title: "By trade · Casa Muffoletto" };

export default function Trades() {
  const house = getHouse();
  const rooms = getRooms();
  const order = floorsTopDown(house).flatMap((f) => rooms.filter((r) => r.floor === f.id));
  const name = new Map(rooms.map((r) => [r.slug, r.name]));
  const pos = new Map(order.map((r, i) => [r.slug, i]));
  const open = getTasks().filter((t) => t.status !== "done" && t.type !== "admin" && t.type !== "buy");
  const groups = TRADE_ORDER.map((tr) => ({ tr, list: open.filter((t) => tradeOf(t) === tr) })).filter((g) => g.list.length);

  return (
    <>
      <div className="spread">
        <h1>Jobs by trade</h1>
        <div className="no-print"><PrintButton label="Print / save PDF" /></div>
      </div>
      <p className="lede">One list per tradesperson, room by room — hand each their page. Jobs with two trades are listed under the one who leads. Items marked “suggestion” are Claude's and not yet agreed — confirm before asking for a price. Full specs are in each room's brief.</p>
      <div className="subnav no-print">{groups.map((g) => <a key={g.tr} href={`#${slugify(g.tr)}`}>{g.tr} · {g.list.length}</a>)}</div>

      {groups.map((g) => {
        const byRoom = new Map<string, typeof g.list>();
        [...g.list].sort((a, b) => (pos.get(a.room ?? "") ?? 99) - (pos.get(b.room ?? "") ?? 99)).forEach((t) => {
          const k = t.room ?? "";
          byRoom.set(k, [...(byRoom.get(k) ?? []), t]);
        });
        return (
          <section className="trade" key={g.tr} id={slugify(g.tr)}>
            <h2>{g.tr} <span className="muted small">{g.list.length} job{g.list.length > 1 ? "s" : ""}</span></h2>
            {[...byRoom.entries()].map(([slug, list]) => (
              <div key={slug || "house"}>
                <h3>{slug ? <Link href={`/rooms/${slug}`}>{name.get(slug)}</Link> : "Whole house"}</h3>
                {list.sort((a, b) => Number(!!a.suggested) - Number(!!b.suggested) || Number(b.priority === "high") - Number(a.priority === "high")).map((t) => (
                  <div className="tick" key={t.id}>
                    <span className="box" />
                    <div>
                      {t.priority === "high" && <span className="pill high" style={{ marginRight: 6 }}>high</span>}
                      {t.suggested && <span className="pill" style={{ marginRight: 6 }}>suggestion — not agreed</span>}
                      {t.title}
                      {t.who && t.who.includes("/") && <span className="muted small"> · with {t.who.split("/").slice(1).join("/").trim()}</span>}
                      {t.notes && <div className="muted small">{t.notes}</div>}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </section>
        );
      })}
    </>
  );
}
