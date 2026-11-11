"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/courses", label: "Courses" },
  { href: "/assignments", label: "Assignments" },
  { href: "/assignments/new", label: "Add assignment" },
  { href: "/assignments/import", label: "Import syllabus" },
  { href: "/health", label: "Health" },
] as const;

type SiteNavProps = {
  appName: string;
};

export function SiteNav({ appName }: SiteNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="relative border-b border-border bg-surface">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-md px-md py-md">
        <Link
          href="/"
          className="shrink-0 text-lg font-semibold text-brand"
          onClick={() => setOpen(false)}
        >
          {appName}
        </Link>

        <button
          type="button"
          className="inline-flex items-center rounded-md border border-border bg-surface px-md py-sm text-sm font-medium text-foreground md:hidden"
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Close" : "Menu"}
        </button>

        <nav
          id="primary-nav"
          className={`${open ? "flex" : "hidden"} absolute left-0 right-0 top-[3.25rem] z-10 max-h-[calc(100vh-3.25rem)] flex-col gap-sm overflow-y-auto border-b border-border bg-surface px-md py-md md:static md:flex md:max-h-none md:flex-row md:flex-wrap md:items-center md:gap-md md:overflow-visible md:border-0 md:bg-transparent md:p-0`}
        >
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-md px-sm py-sm text-sm ${
                  active
                    ? "bg-brand text-brand-foreground"
                    : "text-muted hover:bg-background hover:text-foreground"
                }`}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
