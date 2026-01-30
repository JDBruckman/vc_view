"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

import { Menu } from "lucide-react";

const navItems = [
  { href: "/overview", label: "Overview" },
  { href: "/compare", label: "Compare" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const showShell = useMemo(() => {
    if (!pathname) return true;
    if (pathname === "/login") return false;
    if (pathname.startsWith("/auth/")) return false;
    return true;
  }, [pathname]);

  if (!showShell) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b bg-background px-4 py-3 md:hidden">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

        <div className="font-semibold">VC View</div>
      </header>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-background md:flex md:flex-col">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="px-4 py-3">
            <SheetTitle>VC View</SheetTitle>
          </SheetHeader>
          <Separator />
          <SidebarContent pathname={pathname} onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <main className="md:pl-64">
        <div className="px-4 py-6">{children}</div>
      </main>
    </div>
  );
}

function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string | null;
  onNavigate?: () => void;
}) {

  function normalizePath(p: string) {
    return p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p;
  }

  return (
    <div className="flex h-full flex-col p-4">
      <div className="hidden md:block">
        <div className="text-lg font-semibold">VC View</div>
        <div className="mt-1 text-xs text-muted-foreground">
          Ads Performance Dashboard
        </div>
      </div>

      <nav className="mt-6 flex flex-col gap-1">
        {navItems.map((item) => {
        const current = normalizePath(pathname ?? "");
        const active = current === item.href;


          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={buttonVariants({
                variant: active ? "default" : "ghost",
                className: "w-full justify-start",
              })}
            >
              {item.label}
            </Link>

          );
        })}
      </nav>

      <Separator className="my-6" />

      <div>
        <div className="text-xs text-muted-foreground">User</div>
        <Button
          className="mt-2 w-full justify-start"
          variant="outline"
          disabled
          title="Coming soon"
        >
          Settings (soon)
        </Button>
      </div>

      <div className="mt-auto pt-6">
        <form action="/auth/logout" method="post">
          <Button className="w-full" variant="outline" type="submit">
            Logout
          </Button>
        </form>
      </div>
    </div>
  );
}
