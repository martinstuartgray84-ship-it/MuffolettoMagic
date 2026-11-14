import { getHouse, getRooms } from "@/lib/content";
import { RoomCard } from "@/components/ui";

export const metadata = { title: "Rooms · Casa Muffoletto" };

export default function Rooms() {
  const house = getHouse();
  const rooms = getRooms();
  return (
    <>
      <h1>Rooms</h1>
      <p className="lede">Every space in the house, floor by floor — current state, target design, colours and works.</p>
      {house.floors.map((f) => {
        const list = rooms.filter((r) => r.floor === f.id && !r.example);
        return (
          <section key={f.id}>
            <h2>{f.name} {f.nameIt && <span className="muted small"> · {f.nameIt}</span>}</h2>
            {list.length ? <div className="grid g3">{list.map((r) => <RoomCard key={r.slug} room={r} />)}</div>
              : <div className="empty">No rooms recorded on this floor yet.</div>}
          </section>
        );
      })}
      {rooms.some((r) => r.example) && (
        <section>
          <h2>Template</h2>
          <p className="muted">A made-up room showing what a fully designed room page looks like — colours, materials, surface schedule and brief.</p>
          <div className="grid g3">{rooms.filter((r) => r.example).map((r) => <RoomCard key={r.slug} room={r} />)}</div>
        </section>
      )}
    </>
  );
}
