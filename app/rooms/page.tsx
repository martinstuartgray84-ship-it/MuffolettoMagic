import { getHouse, getRooms, getTasks, roomProgress , floorsTopDown } from "@/lib/content";
import { RoomCard } from "@/components/ui";

export const metadata = { title: "Rooms · Casa Muffoletto" };

export default function Rooms() {
  const house = getHouse();
  const rooms = getRooms();
  const tasks = getTasks();
  return (
    <>
      <h1>Rooms</h1>
      <p className="lede">Every space in the house, from the top floor down — what's there now, the target design, colours and jobs.</p>
      <div className="subnav">{floorsTopDown(house).map((f) => rooms.some((r) => r.floor === f.id) && <a key={f.id} href={`#${f.id}`}>{f.name}</a>)}</div>
      {floorsTopDown(house).map((f) => {
        const list = rooms.filter((r) => r.floor === f.id);
        if (!list.length) return null;
        return (
          <section key={f.id} id={f.id}>
            <h2>{f.name} {f.nameIt && <span className="muted small"> · {f.nameIt}</span>}</h2>
            {f.notes && <p className="muted" style={{ maxWidth: "80ch" }}>{f.notes}</p>}
            <div className="grid g3">{list.map((r) => <RoomCard key={r.slug} room={r} progress={roomProgress(r.slug, tasks)} />)}</div>
          </section>
        );
      })}
    </>
  );
}
