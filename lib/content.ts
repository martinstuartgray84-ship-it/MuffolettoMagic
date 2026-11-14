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
  kind?: "current" | "target" | "render" | "inspiration" | "detail" | "plan";
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
    renderFrom?: string; // the photo to upload with the prompt
    renderPrompt?: string; // ready-to-paste prompt for ChatGPT/Gemini photo restyling
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
  hero?: string;
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
  suggested?: boolean; // Claude's suggestion, not yet agreed by the owners
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

/* ------------------------------------------------------------------ */
/* Jobs, suggestions, decisions — parsed from a room's `current.issues` */
/* Convention: "JOB …" = agreed by the owners; "Proposed by Claude      */
/* (not yet agreed): …" = suggestion; "To decide/To confirm/IDEA" =    */
/* open decision; anything else = something to check.                  */
/* ------------------------------------------------------------------ */
export function splitIssues(issues?: string[]) {
  const jobs: string[] = [], suggestions: string[] = [], decisions: string[] = [], checks: string[] = [];
  for (const raw of issues ?? []) {
    const s = raw.trim();
    if (/^JOB\b/i.test(s)) jobs.push(s.replace(/^JOB\s*\d*\s*[—–-]\s*/i, ""));
    else if (/^Proposed by Claude/i.test(s)) suggestions.push(s.replace(/^Proposed by Claude[^:]*:\s*/i, ""));
    else if (/^(To decide|To confirm|IDEA)\b/i.test(s)) decisions.push(s.replace(/^(To decide|To confirm|IDEA)\s*[:—–-]\s*/i, ""));
    else checks.push(s);
  }
  return { jobs, suggestions, decisions, checks };
}

const TRADES: [RegExp, string][] = [
  [/martin|stefany/i, "You — Martin & Stefany"],
  [/gas/i, "Gas installer"],
  [/electric/i, "Electrician"],
  [/plumb/i, "Plumber"],
  [/tiler/i, "Tiler"],
  [/plaster/i, "Plasterer"],
  [/decorator/i, "Decorator"],
  [/carpenter/i, "Carpenter"],
  [/blacksmith/i, "Blacksmith"],
  [/builder/i, "Builder"],
  [/geometra|a3|architect|engineer/i, "Geometra / architect"],
];
export const TRADE_ORDER = ["Electrician", "Gas installer", "Plumber", "Builder", "Plasterer", "Tiler", "Carpenter", "Blacksmith", "Decorator", "Geometra / architect", "You — Martin & Stefany", "To buy", "Unassigned"];

/** The lead trade for a task: the first person named in `who`. */
export function tradeOf(t: Task): string {
  const first = (t.who ?? "").split("/")[0].trim();
  for (const [re, name] of TRADES) if (re.test(first)) return name;
  return t.type === "buy" ? "To buy" : "Unassigned";
}
export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function roomProgress(slug: string, tasks: Task[]) {
  const mine = tasks.filter((t) => t.room === slug && t.type !== "admin");
  return { done: mine.filter((t) => t.status === "done").length, total: mine.length };
}

/** Floors from the top of the house down, with the outside last. */
export function floorsTopDown(house: House): Floor[] {
  const inside = house.floors.filter((f) => f.id !== "outside").reverse();
  return [...inside, ...house.floors.filter((f) => f.id === "outside")];
}
