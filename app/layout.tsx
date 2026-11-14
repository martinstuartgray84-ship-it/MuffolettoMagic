import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { getHouse } from "@/lib/content";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Casa Muffoletto",
  description: "Design & works headquarters for Casa Muffoletto",
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: "Muffoletto", statusBarStyle: "default" },
};
export const viewport: Viewport = { themeColor: "#f7f3ec" };

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
            <Nav />
            <div className="side-foot">Last updated {house.updated}</div>
          </aside>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
