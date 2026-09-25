import { useRef } from "react";
import { PICK, img, srcSet, byId } from "../data/photos";
import { useSectionProgress, useReducedMotion, clamp, smooth } from "../lib/hooks";
import { useGallery } from "../components/ui";

const FRAMES = [
  { id: PICK.aerialHigh, alt: 180, line: "From above,", em: "the shape of the place." },
  { id: PICK.aerialPoint, alt: 90, line: "A private address", em: "on the ironshore." },
  { id: PICK.aerialPool, alt: 45, line: "The pool between", em: "house and reef." },
  { id: PICK.fromWater, alt: 0, line: "And at the water's edge,", em: "home." },
];

export default function Aerial() {
  const ref = useRef<HTMLElement>(null);
  const p = useSectionProgress(ref);
  const reduced = useReducedMotion();
  const gallery = useGallery();
  const n = FRAMES.length;
  const seg = p * n;
  const idx = Math.min(n - 1, Math.floor(seg));
  const altitude = Math.round(
    FRAMES.reduce((acc, f, i) => (i === 0 ? f.alt : acc + (f.alt - FRAMES[i - 1].alt) * smooth(i - 0.4, i + 0.1, seg)), 0),
  );

  return (
    <section ref={ref} aria-labelledby="aerial-title" className="relative bg-forest-deep text-ivory" style={{ height: `${n * 95}svh` }}>
      <h2 id="aerial-title" className="sr-only">
        Aerial views of Sea La Vie
      </h2>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {FRAMES.map((f, i) => {
          const local = seg - i;
          const t = i === 0 ? 1 : reduced ? Number(idx >= i) : smooth(-0.35, 0.15, local);
          const s = reduced ? 1 : 1.16 - 0.14 * clamp((local + 0.4) / 1.4);
          const inset = i % 2 ? `inset(0 ${(1 - t) * 100}% 0 0)` : `inset(0 0 0 ${(1 - t) * 100}%)`;
          return (
            <div key={f.id} className="absolute inset-0 overflow-hidden" style={{ clipPath: inset, zIndex: i }}>
              <img
                src={img(f.id, 1920)}
                srcSet={srcSet(f.id)}
                sizes="100vw"
                alt={byId(f.id).alt}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover will-change-transform"
                style={{ transform: `scale(${s})` }}
              />
            </div>
          );
        })}
        <div aria-hidden className="absolute inset-0 z-10 bg-gradient-to-t from-forest-deep/80 via-forest-deep/10 to-forest-deep/40" />

        {/* HUD */}
        <div aria-hidden className="absolute inset-x-5 top-24 z-20 flex items-start justify-between md:inset-x-10 md:top-28">
          <p className="chapter text-[9px] text-ivory/70">
            <span className="text-ember">V</span> &nbsp;—&nbsp; Aerial &nbsp;·&nbsp; {String(idx + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </p>
          <div className="text-right">
            <p className="chapter text-[9px] text-ivory/60">Altitude</p>
            <p className="display text-4xl tabular-nums md:text-6xl">
              {altitude}
              <span className="ml-1 font-sans text-xs tracking-[0.2em]">M</span>
            </p>
          </div>
        </div>
        {/* frame corners */}
        <div aria-hidden className="pointer-events-none absolute inset-5 z-20 md:inset-10">
          {["left-0 top-0 border-l border-t", "right-0 top-0 border-r border-t", "left-0 bottom-0 border-l border-b", "right-0 bottom-0 border-r border-b"].map((c) => (
            <span key={c} className={`absolute h-6 w-6 border-ivory/50 ${c}`} />
          ))}
        </div>

        <div className="absolute inset-x-5 bottom-14 z-20 md:inset-x-10 md:bottom-20">
          <div className="relative h-[3.1em] text-[clamp(36px,9.6vw,48px)] sm:h-[2.3em] sm:text-6xl lg:h-[2.1em] lg:text-[96px]" aria-live="polite">
            {FRAMES.map((f, i) => (
              <p
                key={f.id}
                aria-hidden={idx !== i}
                className="display absolute inset-x-0 bottom-0 transition-[opacity,transform] duration-500 ease-[var(--ease-lux)]"
                style={{ opacity: idx === i ? 1 : 0, transform: `translateY(${reduced || idx === i ? 0 : idx > i ? -14 : 14}px)` }}
              >
                {f.line}
                <br />
                <em className="text-seaglass">{f.em}</em>
              </p>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between gap-6">
            <div className="h-px flex-1 bg-ivory/20">
              <div className="h-full bg-ivory" style={{ width: `${p * 100}%` }} />
            </div>
            <button onClick={() => gallery.open("exterior")} className="group chapter flex items-center text-[10px]">
              <span className="lux-underline">All aerials</span>
              <svg aria-hidden viewBox="0 0 12 12" className="arrow-diag ml-2 h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M2 10 10 2M4 2h6v6" /></svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
