import Link from "next/link";
import { getRooms } from "@/lib/content";
import BriefPicker from "@/components/BriefPicker";

export const metadata = { title: "Briefs & PDFs · Casa Muffoletto" };

export default function Briefs() {
  const rooms = getRooms();
  return (
    <>
      <h1>Briefs & PDFs</h1>
      <p className="lede">Print-ready packs for decorators and trades: photos, the agreed jobs, surface-by-surface preparation and finish, and the colour schedule with paint references. For a checklist per tradesperson, use By trade. Open one and press “Download PDF” (or Ctrl/⌘ + P → Save as PDF).</p>
      <div className="grid g2" style={{ marginTop: 20 }}>
        <BriefPicker rooms={rooms.filter((r) => !r.example).map((r) => ({ slug: r.slug, name: r.name, floor: r.floor }))} />
        <div className="card">
          <h3>Ready-made</h3>
          <ul>
            <li><Link href="/brief/house">Whole house</Link></li>
            {rooms.map((r) => <li key={r.slug}><Link href={`/brief/${r.slug}`}>{r.name}</Link>{r.example && <span className="muted small"> (template — see what a finished brief looks like)</span>}</li>)}
          </ul>
        </div>
      </div>
    </>
  );
}
