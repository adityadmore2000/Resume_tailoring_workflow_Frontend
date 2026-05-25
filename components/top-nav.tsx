"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";

import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";

const items = [
  { href: "/", label: "Home" },
  { href: "/banks", label: "Experience Banks" },
  { href: "/tailor", label: "Tailor Resume" },
  { href: "/docs", label: "Docs" }
];

export function TopNav() {
  const pathname = usePathname();
  return (
    <div className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3">
        <Link href="/" className="text-sm font-semibold">
          Evidence-Grounded Resume Tailoring
        </Link>
        <nav className="flex flex-1 items-center gap-3 text-sm">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "rounded-md px-3 py-1.5 hover:bg-accent hover:text-accentForeground",
                pathname === it.href ? "bg-accent font-medium text-accentForeground" : "text-mutedForeground"
              )}
            >
              {it.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link href="/settings">
            <Button variant="ghost" size="sm" aria-label="Settings">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
