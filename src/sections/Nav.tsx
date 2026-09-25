import { useEffect, useRef, useState } from "react";
import { NAV } from "../data/content";
import { useActiveSection } from "../lib/hooks";
import { useGallery } from "../components/ui";
import { cn } from "../utils/cn";

const IDS = NAV.map((n) => n.id).concat(["amenities", "inquire"]);

export default function Nav() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const bar = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const active = useActiveSection(IDS);
  const gallery = useGallery();

  useEffect(() => {
    const on = () => {
      setSolid(window.scrollY > window.innerHeight * 0.75);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = "hidden";
    const first = menuRef.current?.querySelector<HTMLElement>("a,button");
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab" && menuRef.current) {
        const f = Array.from(menuRef.current.querySelectorAll<HTMLElement>("a,button"));
        const [a, b] = [f[0], f[f.length - 1]];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); b.focus(); }
        else if (!e.shiftKey && document.activeElement === b) { e.preventDefault(); a.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      toggleRef.current?.focus();
    };
  }, [open]);

  const links = [...NAV.slice(0, 3), { id: "amenities", label: "Amenities" }, ...NAV.slice(3)];

  return (
    <>
      <a href="#main" className="chapter fixed left-4 top-4 z-[100] -translate-y-20 rounded-full bg-forest px-5 py-3 text-ivory transition-transform focus:translate-y-0">
        Skip to content
      </a>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,color,backdrop-filter,padding] duration-700 ease-[var(--ease-lux)]",
          solid && !open ? "bg-ivory/80 py-3 text-forest backdrop-blur-xl" : "py-5 text-ivory md:py-7",
        )}
      >
        <nav aria-label="Primary" className="mx-auto flex max-w-[1600px] items-center justify-between px-5 md:px-10">
          <a href="#top" className="group flex items-baseline gap-2" aria-label="Sea La Vie, back to top">
            <span className="font-serif text-2xl leading-none tracking-tight md:text-[28px]">
              Sea <em className="font-light">La</em> Vie
            </span>
            <span className="chapter hidden text-[9px] opacity-60 lg:inline">Roatán</span>
          </a>
          <ul className="hidden items-center gap-8 lg:flex">
            {links.map((l) => (
              <li key={l.id}>
                <a href={`#${l.id}`} aria-current={active === l.id ? "true" : undefined} className="lux-underline chapter text-[10px]">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2 md:gap-3">
            <button onClick={() => gallery.open()} className="chapter lux-underline hidden text-[10px] sm:inline-block">
              Gallery
            </button>
            <a
              href="#inquire"
              className={cn(
                "btn-lux chapter ml-3 hidden rounded-full border px-5 py-3 text-[10px] sm:inline-block",
                solid && !open ? "border-forest/30 [--btn-fill:var(--color-forest)] hover:text-ivory" : "border-ivory/40 [--btn-fill:var(--color-ivory)] hover:text-forest",
              )}
            >
              Inquire
            </a>
            <button
              ref={toggleRef}
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="relative z-[60] grid h-11 w-11 place-items-center lg:hidden"
            >
              <span className={cn("absolute h-px w-6 bg-current transition-transform duration-700 ease-[var(--ease-lux)]", open ? "rotate-45" : "-translate-y-1")} />
              <span className={cn("absolute h-px w-6 bg-current transition-transform duration-700 ease-[var(--ease-lux)]", open ? "-rotate-45" : "translate-y-1")} />
            </button>
          </div>
        </nav>
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-px">
          <div ref={bar} className="h-full origin-left bg-ember" style={{ transform: "scaleX(0)" }} />
        </div>
      </header>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        hidden={!open}
        className="fixed inset-0 z-40 flex flex-col justify-between bg-forest-deep px-6 pb-10 pt-28 text-ivory lg:hidden"
      >
        <ul className="space-y-1">
          {[...links, { id: "inquire", label: "Inquire" }].map((l, i) => (
            <li key={l.id} className="overflow-hidden">
              <a
                href={`#${l.id}`}
                onClick={() => setOpen(false)}
                className="animate-line-in flex items-baseline gap-4 py-1.5"
                style={{ animationDelay: `${80 + i * 60}ms` }}
              >
                <span className="chapter w-6 text-[9px] text-ember">{String(i + 1).padStart(2, "0")}</span>
                <span className="display text-[46px] leading-[1] sm:text-6xl">{l.label}</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-ivory/15 pt-6">
          <button onClick={() => { setOpen(false); gallery.open(); }} className="chapter lux-underline text-[10px]">
            Open gallery
          </button>
          <p className="chapter text-[9px] text-ivory/50">16°18′N · 86°35′W</p>
        </div>
      </div>
    </>
  );
}
