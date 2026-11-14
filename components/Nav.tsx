"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  ["/", "Overview"],
  ["/rooms", "Rooms"],
  ["/tasks", "To-do"],
  ["/trades", "By trade"],
  ["/shopping", "Shopping"],
  ["/style", "Style & palette"],
  ["/plan", "Floor plans"],
  ["/brief", "Briefs & PDFs"],
] as const;

export default function Nav() {
  const path = usePathname();
  return (
    <nav className="nav">
      {NAV.map(([href, label]) => {
        const active = href === "/" ? path === "/" : path.startsWith(href);
        return <Link key={href} href={href} aria-current={active ? "page" : undefined}>{label}</Link>;
      })}
    </nav>
  );
}
