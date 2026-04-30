"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletConnect } from "@/components/wallet-connect";
import { buttonClassName } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/escrows/new", label: "Create escrow" }
];

export function TopNavbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[rgba(255,250,240,0.86)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/taskLoop_logo.png"
            alt="TaskLoop logo"
            width={42}
            height={42}
            className="rounded-xl bg-white object-contain"
            priority
          />
          <div>
            <p className="text-base font-black tracking-tight text-[var(--ink)]">TaskLoop</p>
            <p className="hidden text-xs text-[var(--muted)] sm:block">Escrow rails for agent work</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-3 py-2 text-sm font-semibold text-[var(--muted)] transition hover:bg-black/5 hover:text-[var(--ink)]",
                pathname === link.href && "bg-black/5 text-[var(--ink)]"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/dashboard" className={buttonClassName("ghost", "hidden sm:inline-flex")}>
            Demo
          </Link>
          <WalletConnect />
        </div>
      </div>
    </header>
  );
}
