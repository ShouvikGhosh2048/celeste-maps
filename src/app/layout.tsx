import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import Link from "next/link";

export const metadata = {
  title: "Celeste Maps",
  description: "A website for statistics on various Celeste mod maps.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <nav className="px-5 py-2 flex gap-3 border-b border-slate-200">
          <Link href="/">Home</Link>
        </nav>
        <div className="p-5">
          {children}
        </div>
      </body>
    </html>
  );
}
