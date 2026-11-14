"use client";
import { useState } from "react";
export default function CopyPrompt({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className="card" style={{ marginTop: 18 }}>
      <div className="spread">
        <h3 style={{ margin: 0 }}>Visualise this room</h3>
        <button className="btn" onClick={() => { navigator.clipboard?.writeText(text); setDone(true); setTimeout(() => setDone(false), 2000); }}>
          {done ? "Copied ✓" : "Copy prompt"}
        </button>
      </div>
      <p className="muted small" style={{ margin: "8px 0" }}>
        Open ChatGPT or Gemini, upload one of this room’s photos, paste this prompt. Send the result back to Claude to add it here as a target image.
      </p>
      <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: "0.88rem", background: "var(--paper)", padding: 12, borderRadius: 8, margin: 0 }}>{text}</pre>
    </div>
  );
}
