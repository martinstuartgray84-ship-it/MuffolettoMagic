import { getRooms, getTasks } from "@/lib/content";
import TaskTable from "@/components/TaskTable";

export const metadata = { title: "Shopping list · Casa Muffoletto" };

export default function Shopping() {
  const rooms = getRooms();
  const name = new Map(rooms.map((r) => [r.slug, r.name]));
  const items = getTasks().filter((t) => t.type === "buy").map((t) => ({ ...t, roomName: t.room ? name.get(t.room) : undefined }));
  const used = Array.from(new Set(items.map((i) => i.room).filter(Boolean))) as string[];
  return (
    <>
      <h1>Shopping list</h1>
      <p className="lede">Furniture, lighting, materials and pieces to buy, with links and estimates.</p>
      <TaskTable showLink tasks={items} filters={[["all", "All rooms"], ...used.map((r) => [r, name.get(r) ?? r] as [string, string])]} />
    </>
  );
}
