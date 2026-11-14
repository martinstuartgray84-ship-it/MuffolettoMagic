import { getRooms, getTasks, TYPE_LABEL } from "@/lib/content";
import TaskTable from "@/components/TaskTable";

export const metadata = { title: "To-do & projects · Casa Muffoletto" };

export default function Tasks() {
  const rooms = getRooms();
  const name = new Map(rooms.map((r) => [r.slug, r.name]));
  const tasks = getTasks().filter((t) => t.type !== "buy").map((t) => ({ ...t, roomName: t.room ? name.get(t.room) : undefined }));
  const types = Array.from(new Set(tasks.map((t) => t.type)));
  return (
    <>
      <h1>To-do & projects</h1>
      <p className="lede">Everything to fix, build, decorate or organise — sorted by priority. Things to buy live on the shopping list.</p>
      <TaskTable tasks={tasks} filters={[["all", "All"], ...types.map((t) => [t, TYPE_LABEL[t]] as [string, string])]} />
    </>
  );
}
