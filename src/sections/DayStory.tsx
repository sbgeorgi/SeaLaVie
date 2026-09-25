import { useRef } from "react";
import { PICK, img, srcSet, byId } from "../data/photos";
import { useSectionProgress, useIsMobile, useReducedMotion, clamp, smooth } from "../lib/hooks";
import { cn } from "../utils/cn";

const MOMENTS = [
  { time: "07:00", title: "Morning", line: "Coffee beneath the arches.", copy: "The loggia catches the first trade winds. Pelicans work the reef line; the water below is glass.", id: PICK.lounger },
  { time: "13:00", title: "Afternoon", line: "The pool, the reef, the shade.", copy: "Swim between the house and the sea, then walk seven minutes to Half Moon Bay for the reef.", id: PICK.poolDay },
  { time: "18:10", title: "Evening", line: "The sun sets straight ahead.", copy: "West End's famous gold light, poured directly across the patio. Dinner under the palapa follows.", id: PICK.sunset },
];

export default function DayStory() {
  const ref = useRef<HTMLElement>(null);
  const p = useSectionProgress(ref);
  const mobile = useIsMobile();
  const reduced = useReducedMotion();
  const n = MOMENTS.length;
  const seg = p * n;
  const idx = Math.min(n - 1, Math.floor(seg));

  return (
    <section ref={ref} aria-label="A day at Sea La Vie" className="relative bg-forest-deep text-ivory" style={{ height: `${n * 110}svh` }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Alternating image wipes follow the scroll, as in the MVP story. */}
        <div className={cn("absolute", mobile ? "inset-0" : "inset-y-0 right-0 w-[64%]")}>
          {MOMENTS.map((m, i) => {
            const t = i === 0 ? 1 : reduced ? Number(idx >= i) : smooth(i - 0.35, i + 0.2, seg);
            const inner = reduced ? 1 : 1.12 - 0.12 * clamp(seg - i + 0.6);
            const inset = i % 2 ? `inset(0 ${(1 - t) * 100}% 0 0)` : `inset(0 0 0 ${(1 - t) * 100}%)`;
            return (
              <div key={m.id} className="absolute inset-0 overflow-hidden" style={{ clipPath: inset, zIndex: i }}>
                <img
                  src={img(m.id, 1920)}
                  srcSet={srcSet(m.id)}
                  sizes={mobile ? "100vw" : "64vw"}
                  alt={byId(m.id).alt}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover will-change-transform"
                  style={{ transform: `scale(${inner})` }}
                />
              </div>
            );
          })}
          <div aria-hidden className={cn("absolute inset-0 z-10", mobile ? "bg-gradient-to-t from-forest-deep via-forest-deep/45 to-forest-deep/10" : "bg-gradient-to-r from-forest-deep via-forest-deep/10 to-transparent")} />
        </div>

        {/* copy */}
        <div className={cn("relative z-20 flex h-full flex-col px-6 md:px-12 lg:px-16", mobile ? "justify-end pb-10" : "w-[46%] justify-center")}>
          <p className="chapter text-ivory/60">
            <span className="text-ember">II</span> &nbsp;— &nbsp;A Day at Sea La Vie
          </p>
          <div className="relative mt-6 min-h-[250px] md:mt-10 md:min-h-[330px]" aria-live="polite">
            {MOMENTS.map((m, i) => (
              <div
                key={m.title}
                className="absolute inset-0 transition-[opacity,transform] duration-500 ease-[var(--ease-lux)]"
                style={{ opacity: idx === i ? 1 : 0, transform: `translateY(${reduced || idx === i ? 0 : idx > i ? -14 : 14}px)` }}
                aria-hidden={idx !== i}
              >
                <p className="font-serif text-xl italic text-seaglass">{m.time}</p>
                <h3 className="display mt-2 text-[56px] sm:text-7xl lg:text-[104px]">{m.title}</h3>
                <p className="mt-4 font-serif text-2xl font-light italic text-ivory/90 md:text-3xl">{m.line}</p>
                <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-ivory/65">{m.copy}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-3" aria-hidden>
            {MOMENTS.map((m, i) => (
              <div key={m.title} className="flex-1">
                <div className="h-px bg-ivory/20">
                  <div className="h-full bg-ivory" style={{ width: `${clamp(seg - i) * 100}%` }} />
                </div>
                <p className={cn("chapter mt-2 text-[9px] transition-colors duration-700", idx === i ? "text-ivory" : "text-ivory/40")}>{m.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
