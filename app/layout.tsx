import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { getHouse } from "@/lib/content";

export const metadata: Metadata = {
  title: "Casa Muffoletto",
  description: "Private design & works headquarters for Casa Muffoletto",
  robots: { index: false, follow: false },
};

const NAV = [
  ["/", "Overview"],
  ["/rooms", "Rooms"],
  ["/plan", "Floor plan"],
  ["/style", "Style & palette"],
  ["/tasks", "To-do & projects"],
  ["/shopping", "Shopping list"],
  ["/brief", "Decorator briefs"],
] as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const house = getHouse();
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <aside className="side">
            <Link href="/" className="brand">
              {house.name}
              <small>{house.tagline ?? "Design HQ"}</small>
            </Link>
            <nav className="nav">
              {NAV.map(([href, label]) => (
                <Link key={href} href={href}>{label}</Link>
              ))}
            </nav>
            <div className="side-foot">Last updated {house.updated}</div>
          </aside>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
