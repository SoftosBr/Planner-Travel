"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoonStarIcon, SunIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

function getPageTitle(pathname: string): string {
  if (pathname === "/home") {
    return "Home budget board";
  }

  if (pathname === "/") {
    return "Travel Planner";
  }

  return pathname
    .split("/")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" / ");
}

export function TopBar() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(true);

  function toggleTheme() {
    const nextIsDark = !isDark;
    document.documentElement.classList.toggle("dark", nextIsDark);
    setIsDark(nextIsDark);
  }

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/70 bg-background/92 px-4 py-4 backdrop-blur-sm sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">Travel Planner</p>
          <h1 className="text-xl leading-tight font-semibold text-foreground sm:text-2xl [font-family:var(--font-display)]">
            <Link href="/home">{getPageTitle(pathname)}</Link>
          </h1>
        </div>
        <Button variant="outline" onClick={toggleTheme}>
          {isDark ? <SunIcon data-icon="inline-start" /> : <MoonStarIcon data-icon="inline-start" />}
          {isDark ? "Light mode" : "Dark mode"}
        </Button>
      </div>
    </header>
  );
}
