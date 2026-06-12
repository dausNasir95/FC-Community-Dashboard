import { SiteHeader } from "@/components/public/site-header";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <footer className="border-t border-[#1d3326] py-8 text-center text-sm text-[#8fa298]">
        FC26 Community Dashboard. Original community styling; no official EA assets used.
      </footer>
    </>
  );
}
