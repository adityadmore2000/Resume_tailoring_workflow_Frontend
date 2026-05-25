import type { Metadata } from "next";

import "@/app/globals.css";
import { TopNav } from "@/components/top-nav";
import { Providers } from "@/app/providers";

export const metadata: Metadata = {
  title: "Resume Tailoring",
  description: "Evidence-grounded AI resume tailoring workflow"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <Providers>
          <TopNav />
          <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
