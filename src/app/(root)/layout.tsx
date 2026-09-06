import * as React from "react";

import Link from "next/link";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Briefcase } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export default function RootGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-border bg-background/80 sticky top-0 z-30 border-b px-4 backdrop-blur transition-all sm:px-8">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-lg shadow-sm">
              <Briefcase className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight">KerjaNTB</span>
              <span className="text-muted-foreground -mt-1 text-[10px]">
                Portal Karir NTB
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <Link
              href="/"
              className="text-foreground hover:text-primary transition-colors"
            >
              Beranda
            </Link>
            <Link
              href="/dashboard"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Show when="signed-out">
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm">
                  Masuk
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm">Daftar</Button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Button asChild variant="outline" size="sm" className="mr-1">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <UserButton />
            </Show>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
