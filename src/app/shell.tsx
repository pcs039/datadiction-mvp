"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { navItems } from "./data";

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === href;
  return pathname.startsWith(href);
}

function getPageTitle(pathname: string) {
  const active = navItems.find((item) => isActivePath(pathname, item.href));
  if (pathname.startsWith("/scenes/")) return "Scene Review";
  return active?.label ?? "Dashboard";
}

export default function DataDictionShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <main className="min-h-screen overflow-hidden bg-[#050918] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_74%_8%,rgba(168,85,247,0.24),transparent_28%),radial-gradient(circle_at_24%_34%,rgba(59,130,246,0.2),transparent_32%),linear-gradient(135deg,#050918_0%,#091225_48%,#100b24_100%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(148,163,184,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.035)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative grid min-h-screen lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden border-r border-white/10 bg-[#071022]/90 shadow-[12px_0_48px_rgba(0,0,0,0.35)] backdrop-blur-xl lg:flex lg:flex-col">
          <div className="border-b border-white/10 px-6 py-7">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl border border-sky-300/30 bg-[linear-gradient(135deg,#1d4ed8,#a855f7)] shadow-[0_0_28px_rgba(168,85,247,0.45)]" />
              <div>
                <p className="text-lg font-bold tracking-tight">D-Context Audit</p>
                <p className="text-sm text-slate-400">SceneContext Engine</p>
              </div>
            </Link>
          </div>

          <nav className="flex-1 space-y-2 px-4 py-6 text-sm font-semibold">
            {navItems.map((item) => {
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 ${
                    active
                      ? "bg-sky-300/14 text-white shadow-[inset_0_0_0_1px_rgba(125,211,252,0.25),0_0_28px_rgba(56,189,248,0.16)]"
                      : "text-slate-400 hover:bg-white/7 hover:text-slate-100"
                  }`}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      active ? "bg-sky-300" : "bg-slate-600"
                    }`}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/10 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Analysis Profile
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-200">
              Public archive PoC
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              184 scenes · 4 source videos · HITL queue active
            </p>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-[#071022]/80 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-7">
              <div>
                <p className="text-sm font-semibold text-slate-400">
                  D-Context Audit <span className="text-slate-600">|</span>{" "}
                  B2B AI Data Diagnostics
                </p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                  {pageTitle}
                </h1>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href="/"
                  className="rounded-lg border border-white/15 bg-white/7 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/12"
                >
                  홈
                </Link>
                <Link
                  href="/reports"
                  className="rounded-lg border border-violet-300/40 bg-[linear-gradient(90deg,rgba(56,189,248,0.28),rgba(168,85,247,0.78))] px-5 py-2 text-sm font-bold text-white shadow-[0_0_32px_rgba(168,85,247,0.34)]"
                >
                  Generate Data Suitability Statement
                </Link>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto border-t border-white/10 px-5 py-3 lg:hidden">
              {navItems.map((item) => {
                const active = isActivePath(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${
                      active
                        ? "bg-sky-300/20 text-sky-100 ring-1 ring-sky-300/30"
                        : "bg-white/7 text-slate-400"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </header>

          <div className="space-y-6 px-5 py-6 sm:px-7">{children}</div>
        </section>
      </div>
    </main>
  );
}
