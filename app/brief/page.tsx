import Link from "next/link";
import { getRooms } from "@/lib/content";
import BriefPicker from "@/components/BriefPicker";

export const metadata = { title: "Decorator briefs · Casa Muffoletto" };

export default function Briefs() {
  const rooms = getRooms();
  return (
    <>
      <h1>Decorator briefs</h1>
      <p className="lede">Print-ready packs for decorators and trades: photos, scope of works, surface-by-surface preparation and finish, and an exact colour schedule with brand codes. Open one and press “Download PDF” (or Ctrl/⌘ + P → Save as PDF).</p>
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
