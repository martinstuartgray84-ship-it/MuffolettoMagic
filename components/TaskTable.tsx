"use client";
import { useMemo, useState } from "react";

type T = {
  id: string; title: string; type: string; room?: string; roomName?: string; priority?: string;
  status: string; who?: string; cost?: number; link?: string; notes?: string;
};

const fmt = (n?: number) =>
  n == null ? "" : new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

export default function TaskTable({ tasks, filters, showLink = false }: { tasks: T[]; filters: [string, string][]; showLink?: boolean }) {
  const [f, setF] = useState("all");
  const [showDone, setShowDone] = useState(false);
  const list = useMemo(() => {
    const order = { high: 0, medium: 1, low: 2 } as Record<string, number>;
    return tasks
      .filter((t) => f === "all" || t.type === f || t.room === f)
      .filter((t) => showDone || t.status !== "done")
      .sort((a, b) => (order[a.priority ?? "medium"] - order[b.priority ?? "medium"]) || a.id.localeCompare(b.id));
  }, [tasks, f, showDone]);
  const total = list.reduce((s, t) => s + (t.cost ?? 0), 0);

  return (
    <>
      <div className="filters">
        {filters.map(([k, label]) => (
          <button key={k} aria-pressed={f === k} onClick={() => setF(k)}>{label}</button>
        ))}
        <button aria-pressed={showDone} onClick={() => setShowDone(!showDone)}>{showDone ? "Hide done" : "Show done"}</button>
      </div>
      {list.length ? (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Item</th><th>Room</th><th>Who</th><th>Priority</th><th>Status</th><th>Est.</th></tr></thead>
            <tbody>
              {list.map((t) => (
                <tr key={t.id} className={t.status === "done" ? "done" : ""}>
                  <td>
                    {showLink && t.link ? <a href={t.link} target="_blank" rel="noreferrer">{t.title}</a> : t.title}
                    {t.notes && <div className="muted small">{t.notes}</div>}
                  </td>
                  <td className="small">{t.roomName ?? "Whole house"}</td>
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
      ) : <div className="empty">Nothing here.</div>}
    </>
  );
}
