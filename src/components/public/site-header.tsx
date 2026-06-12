import Link from "next/link";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

const nav = [
  ["Home", "/"],
  ["Posters", "/posters"],
  ["Tournaments", "/tournaments"],
  ["Fixtures", "/fixtures"],
  ["Collections", "/collections"],
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[#1d3326] bg-[#050806]/90 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-white">
          <span className="grid size-9 place-items-center rounded-md bg-[#39ff88] text-[#041006]">
            <Trophy size={18} />
          </span>
          FC26 Community
        </Link>
        <nav className="hidden items-center gap-5 md:flex">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="text-sm text-[#cbe5d2] hover:text-[#39ff88]">
              {label}
            </Link>
          ))}
        </nav>
        <Button asChild variant="secondary">
          <Link href="/admin">Admin</Link>
        </Button>
      </div>
      <div className="container flex gap-3 overflow-x-auto pb-3 md:hidden">
        {nav.map(([label, href]) => (
          <Link key={href} href={href} className="rounded-full border border-[#203929] px-3 py-1 text-sm text-[#cbe5d2]">
            {label}
          </Link>
        ))}
      </div>
    </header>
  );
}
