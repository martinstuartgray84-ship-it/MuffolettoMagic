import fs from "node:fs";
import path from "node:path";

/* ------------------------------------------------------------------ */
/* Types — the shape of everything in /content. See CLAUDE.md.         */
/* ------------------------------------------------------------------ */

export type Swatch = {
  name: string; // e.g. "Lime-wash bianco"
  hex: string; // "#EDE6DA"
  role?: string; // "walls", "ceiling", "trim", "accent", "joinery"…
  brand?: string; // "Farrow & Ball", "Sikkens", "RAL"…
  code?: string; // "No. 2005", "RAL 9010", "NCS S 1005-Y20R"
  finish?: string; // "matt", "eggshell", "satin", "lime-wash"…
  notes?: string;
};

export type Photo = {
  src: string; // "/photos/kitchen/01.jpg"
  caption?: string;
  kind?: "current" | "target" | "inspiration" | "detail" | "plan";
  date?: string;
};

export type Surface = {
  surface: string; // "North wall", "Ceiling", "Skirting", "Door frames"
  prep?: string; // "Fill cracks, sand, stain-block"
  finish?: string; // "2 coats matt emulsion"
  colour?: string; // swatch name or code
  notes?: string;
};

export type Item = {
  name: string;
  detail?: string;
  link?: string;
  status?: "idea" | "chosen" | "ordered" | "installed";
};

export type RoomStatus = "survey" | "designing" | "approved" | "in-progress" | "done";

export type Room = {
  slug: string;
  name: string;
  nameIt?: string;
  ref?: string; // owners' numbering within a floor, e.g. "Top 1"
  floor: string; // must match an id in house.floors
  status: RoomStatus;
  example?: boolean;
  dimensions?: { length?: number; width?: number; height?: number; area?: number; notes?: string };
  orientation?: string; // "South-facing, two windows"
  photos?: Photo[];
  current?: { summary?: string; keep?: string[]; issues?: string[] };
  target?: {
    concept?: string;
    mood?: string[];
    palette?: Swatch[];
    materials?: Item[];
    furniture?: Item[];
    lighting?: Item[];
    textiles?: Item[];
  };
  proposal?: {
    summary?: string;
    by?: string;
    date?: string;
    items?: string[];
    options?: { name: string; detail: string }[];
    drawings?: { name: string; src: string; pdf?: string }[];
    questions?: string[];
  };
  brief?: { scope?: string[]; surfaces?: Surface[]; notes?: string[]; access?: string };
  updated?: string;
};

export type Floor = { id: string; name: string; nameIt?: string; notes?: string; plan?: string };

export type House = {
  name: string;
  tagline?: string;
  location?: string;
  owners?: string[];
  overview?: string;
  facts?: { label: string; value: string }[];
  floors: Floor[];
  style?: {
    direction?: string;
    principles?: string[];
    palette?: Swatch[];
    materials?: string[];
    avoid?: string[];
  };
  documents?: { name: string; date?: string; by?: string; file: string }[];
  contacts?: { role: string; name: string; phone?: string; email?: string; notes?: string }[];
  updated?: string;
};

export type TaskType = "fix" | "project" | "buy" | "decor" | "admin";
export type Task = {
  id: string;
  title: string;
  type: TaskType;
  room?: string; // room slug, or omit for whole-house
  priority?: "high" | "medium" | "low";
  status: "todo" | "doing" | "waiting" | "done";
  who?: string; // "Martin", "Decorator", "Electrician"…
  cost?: number; // estimate, EUR
  link?: string;
  notes?: string;
  added?: string;
};

/* ------------------------------------------------------------------ */
/* Loaders                                                             */
/* ------------------------------------------------------------------ */

const ROOT = path.join(process.cwd(), "content");
const readJson = <T,>(p: string): T => JSON.parse(fs.readFileSync(p, "utf8")) as T;

export function getHouse(): House {
  return readJson<House>(path.join(ROOT, "house.json"));
}

export function getRooms(): Room[] {
  const dir = path.join(ROOT, "rooms");
  const house = getHouse();
  const floorOrder = new Map(house.floors.map((f, i) => [f.id, i]));
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => readJson<Room>(path.join(dir, f)))
    .sort(
      (a, b) =>
        Number(!!a.example) - Number(!!b.example) ||
        (floorOrder.get(a.floor) ?? 99) - (floorOrder.get(b.floor) ?? 99) ||
        (a.ref ?? "zz").localeCompare(b.ref ?? "zz", undefined, { numeric: true }) ||
        a.name.localeCompare(b.name),
    );
}

export function getRoom(slug: string): Room | undefined {
  return getRooms().find((r) => r.slug === slug);
}

export function getTasks(): Task[] {
  return readJson<Task[]>(path.join(ROOT, "tasks.json"));
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export const STATUS_LABEL: Record<RoomStatus, string> = {
  survey: "Surveying",
  designing: "Designing",
  approved: "Design approved",
  "in-progress": "Works in progress",
  done: "Done",
};

export const TYPE_LABEL: Record<TaskType, string> = {
  fix: "Fix",
  project: "Project",
  buy: "Buy",
  decor: "Decorate",
  admin: "Admin",
};

export function eur(n?: number) {
  if (n == null) return "";
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

export function area(r: Room) {
  const d = r.dimensions;
  if (!d) return undefined;
  if (d.area) return d.area;
  if (d.length && d.width) return Math.round(d.length * d.width * 10) / 10;
  return undefined;
}

/** Approximate paintable wall area (m²) — perimeter × height, minus ~15% for openings. */
export function wallArea(r: Room) {
  const d = r.dimensions;
  if (!d?.length || !d?.width || !d?.height) return undefined;
  return Math.round(2 * (d.length + d.width) * d.height * 0.85);
}

/** Pick black or white text for a given background hex. */
export function inkFor(hex: string) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.55 ? "#1f1b16" : "#fbf8f3";
}

export function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)).join(", ");
}
