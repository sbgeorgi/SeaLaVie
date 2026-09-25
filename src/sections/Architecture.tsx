import { useEffect, useRef, useState } from "react";
import { useSectionProgress, useIsMobile, useReducedMotion, scrollToY } from "../lib/hooks";
import { ROOMS, type VillaScene, type LabelScreen } from "../three/VillaScene";
import { Chapter } from "../components/ui";
import { cn } from "../utils/cn";

const STAGES = [
  { n: "01", title: "First Lines", at: 0.0, copy: "Every home begins as a drawing. A rectangle set square to the sea, a loggia pulled forward to catch the trade wind." },
  { n: "02", title: "Massing", at: 0.26, copy: "Four quiet storeys on the ironshore ledge — volume, orientation and shade before a single ornament." },
  { n: "03", title: "Detail", at: 0.45, copy: "Arches, balustrades and wide glass. The pool is set between the house and the reef; the palapa takes the corner of sunset." },
  { n: "04", title: "Finished Home", at: 0.63, copy: "White stucco, terracotta, turquoise water. The residence occupies the entire second floor — 3,000 square feet above the pool." },
  { n: "05", title: "The Residence", at: 0.9, copy: "A sectional cut through Level Two: three en-suite bedrooms, an open great room and a patio that runs the full width of the sea." },
];
const stageIndex = (p: number) => (p < 0.18 ? 0 : p < 0.37 ? 1 : p < 0.55 ? 2 : p < 0.76 ? 3 : 4);

const SITE_LABELS: Record<string, { label: string; sub: string }> = {
  residence: { label: "Level Two", sub: "Sea La Vie · entire floor" },
  pool: { label: "Oceanfront Pool", sub: "sun loungers" },
  palapa: { label: "Palapa", sub: "outdoor dining" },
};

export default function Architecture() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const scene = useRef<VillaScene | null>(null);
  const labelEls = useRef<Record<string, HTMLDivElement | null>>({});
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [plan, setPlan] = useState(false);
  const mobile = useIsMobile();
  const reduced = useReducedMotion();

  const p = useSectionProgress(section, (v) => {
    if (scene.current) scene.current.progress = v;
  });
  const idx = plan ? 4 : stageIndex(p);

  // Lazy-init the WebGPU/WebGL scene when approaching the section
  useEffect(() => {
    const el = stage.current;
    const sec = section.current;
    if (!el || !sec) return;
    let disposed = false;
    let vis: IntersectionObserver | null = null;
    const io = new IntersectionObserver(
      async ([e]) => {
        if (!e.isIntersecting || scene.current) return;
        io.disconnect();
        try {
          const mod = await import("../three/VillaScene");
          if (disposed) return;
          const s = new mod.VillaScene(el, { mobile: window.innerWidth < 768, reduced });
          scene.current = s;
          s.setLabelCallback((ls: LabelScreen[]) => {
            for (const l of ls) {
              const node = labelEls.current[l.id];
              if (!node) continue;
              node.style.transform = `translate3d(${l.x.toFixed(1)}px, ${l.y.toFixed(1)}px, 0)`;
              node.style.opacity = String(l.o);
              node.style.visibility = l.o < 0.02 ? "hidden" : "visible";
            }
          });
          await s.init();
          if (disposed) return s.dispose();
          setReady(true);
          vis = new IntersectionObserver(([v]) => s.setActive(v.isIntersecting), { rootMargin: "10% 0px" });
          vis.observe(sec);
        } catch (err) {
          console.warn("3D unavailable, showing illustrated plan", err);
          setFailed(true);
        }
      },
      { rootMargin: "120% 0px" },
    );
    io.observe(sec);
    return () => {
      disposed = true;
      io.disconnect();
      vis?.disconnect();
      scene.current?.dispose();
      scene.current = null;
    };
  }, [reduced]);

  useEffect(() => {
    if (scene.current) scene.current.plan = plan;
  }, [plan]);

  // drag-to-rotate (horizontal drags rotate; vertical touch still scrolls thanks to touch-action: pan-y)
  const drag = useRef<{ x: number; y: number; id: number } | null>(null);
  const onDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current || !scene.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.pointerType === "touch" ? 0 : e.clientY - drag.current.y;
    drag.current.x = e.clientX;
    drag.current.y = e.clientY;
    scene.current.drag(dx, dy);
  };
  const onUp = () => (drag.current = null);

  const goStage = (i: number) => {
    const sec = section.current;
    if (!sec) return;
    setPlan(false);
    const total = sec.offsetHeight - window.innerHeight;
    const top = sec.getBoundingClientRect().top + window.scrollY;
    scrollToY(top + total * STAGES[i].at);
  };

  const s = STAGES[idx];

  return (
    <section
      id="architecture"
      ref={section}
      aria-labelledby="arch-title"
      className="relative bg-ivory"
      style={{ height: mobile ? "560svh" : "620vh" }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* blueprint grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(29,43,35,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(29,43,35,.05) 1px, transparent 1px)",
            backgroundSize: mobile ? "28px 28px" : "44px 44px",
            maskImage: "radial-gradient(ellipse at 60% 50%, black 30%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse at 60% 50%, black 30%, transparent 75%)",
          }}
        />

        {/* 3D stage */}
        <div
          className={cn(
            "absolute touch-pan-y select-none",
            mobile ? "inset-x-0 top-[8svh] h-[58svh]" : "inset-0 cursor-grab active:cursor-grabbing",
          )}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onPointerLeave={onUp}
          role="img"
          aria-label={`Architectural model of Sea La Vie, stage ${s.n}: ${s.title}. ${s.copy}`}
        >
          <div ref={stage} className="absolute inset-0" />
          {!ready && !failed && (
            <div className="absolute inset-0 grid place-items-center">
              <p className="chapter animate-pulse text-forest/50">Drafting the model…</p>
            </div>
          )}
          {failed && <PlanFallback idx={idx} />}

          {/* projected labels */}
          {!failed && (
            <div aria-hidden className="pointer-events-none absolute inset-0">
              {ROOMS.map((r) => (
                <div
                  key={r.id}
                  ref={(n) => {
                    labelEls.current[r.id] = n;
                  }}
                  className="absolute left-0 top-0 will-change-transform"
                  style={{ opacity: 0, visibility: "hidden" }}
                >
                  <div className="-translate-x-1/2 -translate-y-1/2 text-center">
                    <span className="block whitespace-nowrap font-serif text-[15px] italic leading-none text-forest md:text-[19px]">{r.label}</span>
                    {r.sub && !mobile && <span className="mt-1 block whitespace-nowrap text-[9px] uppercase tracking-[0.22em] text-forest/55">{r.sub}</span>}
                  </div>
                </div>
              ))}
              {Object.entries(SITE_LABELS).map(([id, l]) => (
                <div
                  key={id}
                  ref={(n) => {
                    labelEls.current[id] = n;
                  }}
                  className="absolute left-0 top-0 will-change-transform"
                  style={{ opacity: 0, visibility: "hidden" }}
                >
                  <div className="flex -translate-y-full items-end gap-2 pb-1">
                    <span className="mb-0.5 h-8 w-px bg-forest/40" />
                    <span>
                      <span className="block whitespace-nowrap font-serif text-[15px] italic leading-none text-forest md:text-lg">{l.label}</span>
                      <span className="block whitespace-nowrap text-[9px] uppercase tracking-[0.22em] text-forest/55">{l.sub}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Copy column */}
        <div
          className={cn(
            "relative z-10 flex h-full flex-col px-6 md:px-12 lg:px-16",
            mobile ? "justify-end pb-6" : "w-[40%] max-w-[560px] justify-center",
          )}
        >
          <div className={cn(mobile && "rounded-sm bg-ivory/85 p-5 backdrop-blur-md")}>
            <Chapter n="III">Architecture</Chapter>
            <h2 id="arch-title" className="sr-only">
              The architecture of Sea La Vie
            </h2>
            <div className="relative mt-5 md:mt-8" aria-live="polite" aria-atomic="true">
              <div key={idx} className="animate-fade-in">
                <p className="font-serif text-lg italic text-ember">{s.n} / 05</p>
                <p className="display mt-1 text-[44px] text-forest sm:text-6xl lg:text-[88px]">{s.title}</p>
                <p className="mt-4 max-w-md text-[14px] leading-relaxed text-forest/70 md:mt-6 md:text-[15px]">{s.copy}</p>
              </div>
            </div>

            {/* stage markers */}
            <ol className="mt-6 flex gap-2 md:mt-10" aria-label="Model stages">
              {STAGES.map((st, i) => {
                const a = STAGES[i].at;
                const b = STAGES[i + 1]?.at ?? 1;
                const local = Math.min(1, Math.max(0, (p - (i === 0 ? 0 : a - 0.08)) / (b - a)));
                return (
                  <li key={st.n} className="flex-1">
                    <button
                      onClick={() => goStage(i)}
                      aria-current={idx === i ? "step" : undefined}
                      aria-label={`Go to stage ${st.n}, ${st.title}`}
                      className="group block w-full py-2 text-left"
                    >
                      <span className="relative block h-px w-full bg-forest/15">
                        <span
                          className="absolute inset-y-0 left-0 bg-forest transition-[width] duration-300"
                          style={{ width: `${(plan ? (i === 4 ? 1 : 0) : idx > i ? 1 : idx === i ? Math.max(local, 0.08) : 0) * 100}%` }}
                        />
                      </span>
                      <span className={cn("chapter mt-2 hidden text-[9px] transition-colors duration-500 md:block", idx === i ? "text-forest" : "text-forest/40 group-hover:text-forest/70")}>
                        {st.title}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            {/* controls */}
            {!failed && (
              <div className="mt-4 flex flex-wrap items-center gap-2 md:mt-8">
                <CtrlBtn label="Rotate model left" onClick={() => scene.current?.rotate(-1)}>
                  <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M3 8a5 5 0 1 0 1.5-3.5M3 2.5V5h2.5" /></svg>
                </CtrlBtn>
                <CtrlBtn label="Rotate model right" onClick={() => scene.current?.rotate(1)}>
                  <svg viewBox="0 0 16 16" className="h-4 w-4 -scale-x-100" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M3 8a5 5 0 1 0 1.5-3.5M3 2.5V5h2.5" /></svg>
                </CtrlBtn>
                <CtrlBtn label="Reset view" onClick={() => { scene.current?.reset(); setPlan(false); }}>
                  <span className="text-[10px] uppercase tracking-[0.2em]">Reset</span>
                </CtrlBtn>
                <button
                  onClick={() => setPlan((v) => !v)}
                  aria-pressed={plan}
                  className={cn(
                    "btn-lux h-11 rounded-full border px-5 text-[10px] uppercase tracking-[0.22em] transition-colors",
                    plan ? "border-forest bg-forest text-ivory" : "border-forest/25 text-forest hover:text-ivory",
                  )}
                >
                  {plan ? "Exit floor plan" : "Floor plan"}
                </button>
              </div>
            )}
            <p className="mt-3 hidden text-[11px] text-forest/45 md:block">Drag to rotate · scroll to build</p>
          </div>
        </div>

        {/* scale / north marker */}
        <div aria-hidden className="pointer-events-none absolute right-6 top-24 hidden text-right md:block">
          <p className="chapter text-forest/45">Level 2 · 3,000 sq ft</p>
          <p className="chapter mt-1 text-forest/45">Iron Shore · West End</p>
        </div>
      </div>
    </section>
  );
}

function CtrlBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="btn-lux grid h-11 min-w-11 place-items-center rounded-full border border-forest/25 px-3 text-forest hover:border-forest hover:text-ivory"
    >
      {children}
    </button>
  );
}

/** Illustrated fallback: an animated line-drawn floor plan that evolves with the stages. */
function PlanFallback({ idx }: { idx: number }) {
  const sx = (x: number) => (x + 12) * 20;
  const sz = (z: number) => (z + 7) * 20;
  return (
    <svg viewBox="0 0 480 360" className="absolute inset-0 m-auto h-[85%] w-[92%]" aria-hidden>
      <rect x={sx(-11)} y={sz(-6)} width={440} height={240} fill={idx >= 1 ? "#ebe4d6" : "none"} stroke="#1d2b23" strokeWidth="1.2" style={{ transition: "fill 1s" }} />
      <rect x={sx(-11)} y={sz(6)} width={440} height={44} fill={idx >= 3 ? "#e9dfcf" : "none"} stroke="#1d2b23" strokeDasharray="4 4" />
      {idx >= 2 &&
        ROOMS.filter((r) => r.id !== "patio").map((r) => (
          <rect key={r.id} x={sx(r.x0)} y={sz(r.z0)} width={(r.x1 - r.x0) * 20} height={(r.z1 - r.z0) * 20} fill={idx >= 3 ? r.tone : "none"} stroke="#1d2b23" strokeWidth=".8" style={{ transition: "fill 1s" }} />
        ))}
      {idx >= 3 && <rect x={sx(-8)} y={sz(9.4) - 20} width={320} height={40} fill="#7fd0cb" opacity=".8" />}
      {idx >= 4 &&
        ROOMS.map((r) => (
          <text key={r.id} x={sx((r.x0 + r.x1) / 2)} y={sz((r.z0 + r.z1) / 2) + 4} textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontStyle="italic" fontSize="13" fill="#1d2b23">
            {r.label}
          </text>
        ))}
    </svg>
  );
}
