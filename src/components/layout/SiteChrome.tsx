import { Link } from "@tanstack/react-router";
import { Scale, Menu } from "lucide-react";
import { useState } from "react";

import { IMG } from "@/lib/brand";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "#advocates", label: "Find an advocate" },
  { to: "#advice", label: "Legal advice" },
  { to: "#library", label: "Law library" },
  { to: "#news", label: "News & tips" },
  { to: "#safety", label: "Public safety" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={IMG.logoMark} alt="" className="h-8 w-8 rounded-md object-contain" />
          <span className="font-display text-lg font-bold tracking-tight">
            Legal<span className="text-crimson">Finder</span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.to}
              href={item.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Button asChild size="sm" className="bg-crimson text-crimson-foreground hover:bg-crimson/90">
            <a href="#advocates">
              <Scale className="mr-1.5 h-4 w-4" />
              Get help
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-border bg-background px-4 py-2 lg:hidden">
          {NAV.map((item) => (
            <a
              key={item.to}
              href={item.to}
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>
      ) : null}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <img src={IMG.logoMark} alt="" className="h-8 w-8 rounded-md object-contain" />
            <span className="font-display text-lg font-bold">LegalFinder</span>
          </div>
          <p className="mt-3 text-sm text-primary-foreground/70">
            Connecting citizens with advocates, courts and law enforcement — in one trusted place.
          </p>
        </div>
        <FooterCol
          title="Services"
          links={[
            { to: "#advocates", label: "Find an advocate" },
            { to: "#advice", label: "Legal advice" },
            { to: "#library", label: "Law library" },
          ]}
        />
        <FooterCol
          title="Public"
          links={[
            { to: "#news", label: "News & security tips" },
            { to: "#safety", label: "Police stations" },
            { to: "#safety", label: "Wanted notices" },
          ]}
        />
        <FooterCol
          title="Account"
          links={[
            { to: "#advocates", label: "Browse advocates" },
            { to: "#advice", label: "Read guides" },
          ]}
        />
      </div>
      <div className="border-t border-primary-foreground/10 px-4 py-5 text-center text-xs text-primary-foreground/60">
        © {new Date().getFullYear()} LegalFinder. Information here is general guidance, not legal advice.
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <h3 className="font-display text-sm font-bold uppercase tracking-wider text-primary-foreground/90">
        {title}
      </h3>
      <ul className="mt-3 space-y-2">
        {links.map((l, i) => (
          <li key={`${l.to}-${i}`}>
            <a href={l.to} className="text-sm text-primary-foreground/70 hover:text-primary-foreground">
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
