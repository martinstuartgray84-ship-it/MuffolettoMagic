import Link from "next/link";
import { getRooms, getTasks, TYPE_LABEL, getHouse , floorsTopDown } from "@/lib/content";
import TaskTable from "@/components/TaskTable";

export const metadata = { title: "To-do · Casa Muffoletto" };

export default function Tasks() {
  const house = getHouse();
  const rooms = getRooms();
  const order = floorsTopDown(house).flatMap((f) => rooms.filter((r) => r.floor === f.id));
  const name = new Map(rooms.map((r) => [r.slug, r.name]));
  const tasks = getTasks().filter((t) => t.type !== "buy").map((t) => ({ ...t, roomName: t.room ? name.get(t.room) : undefined }));
  const types = ["fix", "project", "decor", "admin"].filter((x) => tasks.some((t) => t.type === x)) as (keyof typeof TYPE_LABEL)[];
  const used = order.filter((r) => tasks.some((t) => t.room === r.slug)).map((r) => [r.slug, r.name] as [string, string]);
  return (
    <>
      <h1>To-do</h1>
      <p className="lede">Everything to fix, build, decorate or decide, most urgent first. Things to buy are on the <Link href="/shopping">shopping list</Link>; lists for each tradesperson are under <Link href="/trades">By trade</Link>.</p>
      <TaskTable tasks={tasks} rooms={used} filters={[["all", "All"], ...types.map((t) => [t, t === "admin" ? "Decisions & admin" : TYPE_LABEL[t]] as [string, string])]} />
    </>
  );
}
