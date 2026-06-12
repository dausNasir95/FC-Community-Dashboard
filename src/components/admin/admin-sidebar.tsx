import Link from "next/link";
import { BarChart3, Calendar, Files, Home, Image, Settings, Shield, Trophy, Users } from "lucide-react";

const links = [
  ["Overview", "/admin", Home],
  ["Posters", "/admin/posters", Image],
  ["Tournaments", "/admin/tournaments", Trophy],
  ["Fixtures", "/admin/fixtures", Calendar],
  ["Standings", "/admin/standings", BarChart3],
  ["Participants", "/admin/participants", Users],
  ["Collections", "/admin/collections", Files],
  ["Settings", "/admin/settings", Settings],
];

export function AdminSidebar() {
  return (
    <aside className="border-b border-[#1d3326] bg-[#07100b] lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
      <div className="flex h-16 items-center gap-2 px-5 font-bold">
        <Shield className="text-[#39ff88]" size={20} />
        Admin Console
      </div>
      <nav className="flex gap-2 overflow-x-auto px-3 pb-3 lg:grid lg:gap-1 lg:overflow-visible lg:pb-0">
        {links.map(([label, href, Icon]) => (
          <Link key={href as string} href={href as string} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-[#cbe5d2] hover:bg-[#102016] hover:text-white">
            <Icon size={16} />
            {label as string}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
