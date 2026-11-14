"use client";
import { useMemo, useState } from "react";

type T = {
  id: string; title: string; type: string; room?: string; roomName?: string; priority?: string;
  status: string; who?: string; suggested?: boolean; cost?: number; link?: string; notes?: string;
};

const fmt = (n?: number) =>
  n == null ? "" : new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

export default function TaskTable({ tasks, filters, rooms = [], showLink = false }: { tasks: T[]; filters: [string, string][]; rooms?: [string, string][]; showLink?: boolean }) {
  const [f, setF] = useState("all");
  const [room, setRoom] = useState("all");
  const [q, setQ] = useState("");
  const [showDone, setShowDone] = useState(false);
  const list = useMemo(() => {
    const order = { high: 0, medium: 1, low: 2 } as Record<string, number>;
    const needle = q.trim().toLowerCase();
    return tasks
      .filter((t) => f === "all" || t.type === f)
      .filter((t) => room === "all" || (room === "house" ? !t.room : t.room === room))
      .filter((t) => showDone || t.status !== "done")
      .filter((t) => !needle || `${t.title} ${t.notes ?? ""} ${t.who ?? ""} ${t.roomName ?? ""}`.toLowerCase().includes(needle))
      .sort((a, b) => Number(a.status === "done") - Number(b.status === "done") || (order[a.priority ?? "medium"] - order[b.priority ?? "medium"]) || a.id.localeCompare(b.id));
  }, [tasks, f, room, q, showDone]);
  const total = list.reduce((s, t) => s + (t.cost ?? 0), 0);
  const doneCount = tasks.filter((t) => t.status === "done").length;

  return (
    <>
      <div className="tools">
        <input type="search" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
        {rooms.length > 0 && (
          <select value={room} onChange={(e) => setRoom(e.target.value)} aria-label="Room">
            <option value="all">All rooms</option>
            <option value="house">Whole house</option>
            {rooms.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        )}
      </div>
      <div className="filters">
        {filters.map(([k, label]) => (
          <button key={k} aria-pressed={f === k} onClick={() => setF(k)}>{label}</button>
        ))}
        <button aria-pressed={showDone} onClick={() => setShowDone(!showDone)}>{showDone ? "Hide done" : `Show done (${doneCount})`}</button>
      </div>
      <div className="count">{list.length} item{list.length === 1 ? "" : "s"}</div>
      {list.length ? (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Item</th><th>Room</th><th>Who</th><th>Priority</th><th>Status</th><th>Est.</th></tr></thead>
            <tbody>
              {list.map((t) => (
                <tr key={t.id} className={t.status === "done" ? "done" : ""}>
                  <td>
                    {showLink && t.link ? <a href={t.link} target="_blank" rel="noreferrer">{t.title}</a> : t.title}
                    {t.suggested && <span className="pill" style={{ marginLeft: 6 }}>suggestion</span>}
                    {t.notes && <div className="muted small">{t.notes}</div>}
                  </td>
                  <td className="small">{t.room ? <a href={`/rooms/${t.room}`}>{t.roomName}</a> : "Whole house"}</td>
                  <td className="small">{t.who}</td>
                  <td>{t.priority && <span className={`pill ${t.priority === "high" ? "high" : ""}`}>{t.priority}</span>}</td>
                  <td className="small">{t.status}</td>
                  <td className="small">{fmt(t.cost)}</td>
                </tr>
              ))}
              {total > 0 && <tr><td colSpan={5} style={{ textAlign: "right" }}><strong>Total shown</strong></td><td><strong>{fmt(total)}</strong></td></tr>}
            </tbody>
          </table>
        </div>
      ) : <div className="empty">Nothing matches.</div>}
    </>
  );
}
