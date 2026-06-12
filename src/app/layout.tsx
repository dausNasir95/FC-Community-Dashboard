import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FC26 Community Dashboard",
  description: "Community posters, tournaments, fixtures, standings, collections, and admin tools.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
