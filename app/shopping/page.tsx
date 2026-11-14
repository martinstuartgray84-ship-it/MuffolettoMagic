import { getRooms, getTasks, getHouse , floorsTopDown } from "@/lib/content";
import TaskTable from "@/components/TaskTable";

export const metadata = { title: "Shopping · Casa Muffoletto" };

export default function Shopping() {
  const house = getHouse();
  const rooms = getRooms();
  const order = floorsTopDown(house).flatMap((f) => rooms.filter((r) => r.floor === f.id));
  const name = new Map(rooms.map((r) => [r.slug, r.name]));
  const items = getTasks().filter((t) => t.type === "buy").map((t) => ({ ...t, roomName: t.room ? name.get(t.room) : undefined }));
  const used = order.filter((r) => items.some((t) => t.room === r.slug)).map((r) => [r.slug, r.name] as [string, string]);
  return (
    <>
      <h1>Shopping list</h1>
      <p className="lede">Things to buy. Product options with links and sizes are on each room's page, under Furniture & fittings.</p>
      <TaskTable showLink tasks={items} rooms={used} filters={[["all", "All"]]} />
    </>
  );
}
