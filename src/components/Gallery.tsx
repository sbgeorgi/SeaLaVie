import { useCallback, useEffect, useRef, useState } from "react";
import { PHOTOS, SECTIONS, img, srcSet, type SectionKey } from "../data/photos";
import { cn } from "../utils/cn";

type Props = { open: boolean; section?: SectionKey; photoId?: string; onClose: () => void };

export default function Gallery({ open, section, photoId, onClose }: Props) {
  const [tab, setTab] = useState<SectionKey | "all">("all");
  const [view, setView] = useState<number | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const touch = useRef<number | null>(null);

  const list = tab === "all" ? PHOTOS : PHOTOS.filter((p) => p.section === tab);

  useEffect(() => {
    if (!open) return;
    lastFocus.current = document.activeElement as HTMLElement;
    setTab(section ?? "all");
    const l = section ? PHOTOS.filter((p) => p.section === section) : PHOTOS;
    const i = photoId ? l.findIndex((p) => p.id === photoId) : -1;
    setView(i >= 0 ? i : null);
    document.documentElement.style.overflow = "hidden";
    (window as unknown as { __lenis?: { stop: () => void } }).__lenis?.stop();
    requestAnimationFrame(() => root.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus());
    return () => {
      document.documentElement.style.overflow = "";
      (window as unknown as { __lenis?: { start: () => void } }).__lenis?.start();
      lastFocus.current?.focus?.();
    };
  }, [open, section, photoId]);

  const step = useCallback((d: number) => setView((v) => (v === null ? v : (v + d + list.length) % list.length)), [list.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (view !== null) setView(null);
        else onClose();
      }
      if (view !== null && e.key === "ArrowRight") step(1);
      if (view !== null && e.key === "ArrowLeft") step(-1);
      if (e.key === "Tab" && root.current) {
        const f = Array.from(root.current.querySelectorAll<HTMLElement>("button:not([disabled]),[href],[tabindex='0']")).filter((el) => el.offsetParent !== null);
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, view, step, onClose]);

  useEffect(() => {
    gridRef.current?.scrollTo({ top: 0 });
  }, [tab]);

  if (!open) return null;
  const cur = view !== null ? list[view] : null;
  const secLabel = (k: SectionKey) => SECTIONS.find((s) => s.key === k)?.label ?? "";

  return (
    <div ref={root} role="dialog" aria-modal="true" aria-label="Photo gallery" className="animate-fade-in fixed inset-0 z-[80] flex flex-col bg-forest-deep text-ivory [animation-duration:.6s]">
      {/* header */}
      <div className="flex items-center justify-between gap-4 px-5 pb-3 pt-5 md:px-10 md:pt-7">
        <p className="font-serif text-2xl">
          Sea <em>La</em> Vie <span className="chapter ml-3 align-middle text-[9px] text-ivory/50">{PHOTOS.length} photographs</span>
        </p>
        <button data-autofocus onClick={onClose} aria-label="Close gallery" className="group grid h-11 w-11 place-items-center rounded-full border border-ivory/25 transition-colors hover:border-ivory">
          <span className="relative block h-3.5 w-3.5 transition-transform duration-700 ease-[var(--ease-lux)] group-hover:rotate-90">
            <span className="absolute left-0 top-1/2 h-px w-full rotate-45 bg-current" />
            <span className="absolute left-0 top-1/2 h-px w-full -rotate-45 bg-current" />
          </span>
        </button>
      </div>
      {/* tabs */}
      <div role="tablist" aria-label="Rooms" className="no-scrollbar flex gap-6 overflow-x-auto border-b border-ivory/10 px-5 md:px-10">
        {[{ key: "all" as const, short: "All" }, ...SECTIONS].map((s) => (
          <button
            key={s.key}
            role="tab"
            aria-selected={tab === s.key}
            onClick={() => { setTab(s.key); setView(null); }}
            className={cn("chapter relative shrink-0 py-4 text-[9.5px] transition-colors duration-500", tab === s.key ? "text-ivory" : "text-ivory/45 hover:text-ivory/80")}
          >
            {s.short}
            <span className={cn("absolute inset-x-0 bottom-0 h-px origin-left bg-ember transition-transform duration-700 ease-[var(--ease-lux)]", tab === s.key ? "scale-x-100" : "scale-x-0")} />
          </button>
        ))}
      </div>

      {/* grid */}
      <div ref={gridRef} role="tabpanel" aria-label={tab === "all" ? "All photographs" : secLabel(tab)} className="flex-1 overflow-y-auto overscroll-contain px-5 py-6 md:px-10 md:py-10" data-lenis-prevent>
        {(tab === "all" ? SECTIONS.map((s) => s.key) : [tab]).map((k) => {
          const items = list.filter((p) => p.section === k);
          if (!items.length) return null;
          return (
            <div key={k} className="mb-14">
              <h3 className="display mb-5 text-4xl md:text-5xl">{secLabel(k)}</h3>
              <div className="columns-2 gap-3 md:columns-3 md:gap-4 xl:columns-4">
                {items.map((p) => {
                  const i = list.indexOf(p);
                  return (
                    <button key={p.id} onClick={() => setView(i)} className="group relative mb-3 block w-full overflow-hidden md:mb-4" aria-label={`View larger: ${p.alt}`}>
                      <img src={img(p.id, 720)} alt={p.alt} loading="lazy" className="w-full transition-transform duration-[1400ms] ease-[var(--ease-lux)] group-hover:scale-[1.04]" style={{ aspectRatio: String(p.ratio) }} />
                      <span aria-hidden className="absolute inset-0 bg-forest-deep/0 transition-colors duration-700 group-hover:bg-forest-deep/15" />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* lightbox */}
      {cur && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Photo ${view! + 1} of ${list.length}`}
          className="animate-fade-in fixed inset-0 z-[90] flex flex-col bg-forest-deep/98 [animation-duration:.5s]"
          onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touch.current === null) return;
            const dx = e.changedTouches[0].clientX - touch.current;
            if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
            touch.current = null;
          }}
        >
          <div className="flex items-center justify-between px-5 pt-5 md:px-10 md:pt-7">
            <p className="chapter text-[9px] text-ivory/60" aria-live="polite">
              {secLabel(cur.section)} &nbsp;·&nbsp; {String(view! + 1).padStart(2, "0")} / {String(list.length).padStart(2, "0")}
            </p>
            <button onClick={() => setView(null)} aria-label="Back to grid" className="chapter lux-underline text-[9.5px]">
              Grid view
            </button>
          </div>
          <div className="relative flex flex-1 items-center justify-center px-2 py-4 md:px-24">
            <img key={cur.id} src={img(cur.id, 1920)} srcSet={srcSet(cur.id)} sizes="100vw" alt={cur.alt} className="animate-fade-in max-h-full max-w-full object-contain [animation-duration:.9s]" />
            <button onClick={() => step(-1)} aria-label="Previous photo" className="group absolute left-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-ivory/25 bg-forest-deep/40 backdrop-blur transition-colors hover:border-ivory md:left-8">
              <span className="transition-transform duration-500 group-hover:-translate-x-0.5">←</span>
            </button>
            <button onClick={() => step(1)} aria-label="Next photo" className="group absolute right-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-ivory/25 bg-forest-deep/40 backdrop-blur transition-colors hover:border-ivory md:right-8">
              <span className="transition-transform duration-500 group-hover:translate-x-0.5">→</span>
            </button>
          </div>
          <p className="px-5 pb-6 text-center font-serif text-lg italic text-ivory/75 md:pb-8">{cur.alt}</p>
        </div>
      )}
    </div>
  );
}
