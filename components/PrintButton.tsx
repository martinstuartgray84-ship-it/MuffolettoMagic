"use client";
export default function PrintButton({ label = "Download PDF" }: { label?: string }) {
  return <button className="btn" onClick={() => window.print()}>{label}</button>;
}
