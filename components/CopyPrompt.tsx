"use client";
import { useState } from "react";

export function CopyButton({ text, label = "Copy prompt" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button className="btn" onClick={async () => {
      try { await navigator.clipboard.writeText(text); } catch {
        const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
      }
      setDone(true); setTimeout(() => setDone(false), 2000);
    }}>{done ? "Copied ✓" : label}</button>
  );
}

export default function CopyPrompt({ text, from }: { text: string; from?: string }) {
  return (
    <div className="card" style={{ marginTop: 18 }}>
      <div className="spread">
        <h3 style={{ margin: 0 }}>Make a visual of this room</h3>
        <div className="row">
          {from && <a className="btn ghost" href={from} download>Download photo</a>}
          <CopyButton text={text} />
        </div>
      </div>
      <p className="muted small" style={{ margin: "8px 0" }}>
        Download the photo, upload it to ChatGPT, paste the prompt. Send the result to Claude to add it here as the target image.
      </p>
      <details><summary className="small">Read the prompt</summary>
        <pre className="prompt">{text}</pre>
      </details>
    </div>
  );
}
