"use client";

import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme/theme-provider";

export function ThemeToggle() {
  const { resolvedTheme, preference, setPreference } = useTheme();

  function toggle() {
    // Simple quick toggle between light/dark; keep system as an explicit choice on Settings page.
    const next = resolvedTheme === "dark" ? "light" : "dark";
    setPreference(next);
  }

  return (
    <Button variant="ghost" size="sm" onClick={toggle} aria-label="Toggle theme">
      {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="ml-2 hidden sm:inline">{preference === "system" ? "System" : resolvedTheme}</span>
    </Button>
  );
}

