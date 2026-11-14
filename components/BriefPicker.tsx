"use client";
import Link from "next/link";
import { useState } from "react";

export default function BriefPicker({ rooms }: { rooms: { slug: string; name: string; floor: string }[] }) {
  const [sel, setSel] = useState<string[]>([]);
  const toggle = (s: string) => setSel((x) => (x.includes(s) ? x.filter((y) => y !== s) : [...x, s]));
  return (
    <div className="card">
      <h3>Build a brief for selected rooms</h3>
      <p className="muted small">Tick the rooms the decorator is quoting for, then open the brief and press “Download PDF”.</p>
      <div className="checklist">
        {rooms.map((r) => (
          <label key={r.slug}><input type="checkbox" checked={sel.includes(r.slug)} onChange={() => toggle(r.slug)} /> {r.name}</label>
        ))}
      </div>
      <div className="row">
        {sel.length ? <Link className="btn" href={`/brief/selection?rooms=${sel.join(",")}`}>Open brief ({sel.length} room{sel.length > 1 ? "s" : ""})</Link>
          : <span className="btn ghost" aria-disabled>Select rooms first</span>}
        <button className="btn ghost" onClick={() => setSel(rooms.map((r) => r.slug))}>Select all</button>
      </div>
    </div>
  );
}
