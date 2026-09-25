import { useRef } from "react";
import { useSectionProgress, clamp } from "../lib/hooks";
import { FACTS } from "../data/content";
import { Chapter, Reveal } from "../components/ui";

const TEXT =
  "Wake to the sound of waves on the Iron Shore. Coffee beneath white arches, a swim before the reef wakes, long lunches in the shade of the palapa — and every evening, the sun going down directly in front of you.";

export default function Intro() {
  const ref = useRef<HTMLElement>(null);
  const p = useSectionProgress(ref);
  const words = TEXT.split(" ");
  return (
    <section id="story" ref={ref} aria-labelledby="intro-title" className="relative bg-ivory" style={{ height: "210vh" }}>
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center px-5 md:px-10">
        <div className="mx-auto w-full max-w-[1400px]">
          <Chapter n="I">The Story</Chapter>
          <h2 id="intro-title" className="sr-only">
            A day at Sea La Vie
          </h2>
          <p className="mt-8 max-w-[1200px] font-serif text-[30px] font-light leading-[1.12] tracking-[-0.02em] text-forest sm:text-5xl md:mt-12 lg:text-[64px]" aria-label={TEXT}>
            {words.map((w, i) => {
              const t = clamp((p * 1.35 - i / words.length) * 6);
              const em = ["Iron", "Shore.", "palapa", "sun"].includes(w);
              return (
                <span key={i} aria-hidden className={em ? "italic" : undefined} style={{ opacity: 0.14 + t * 0.86, transition: "opacity .3s" }}>
                  {w}{" "}
                </span>
              );
            })}
          </p>
          <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-forest/15 pt-8 md:mt-20 md:grid-cols-4">
            {FACTS.map((f, i) => (
              <Reveal key={f.k} delay={i * 90}>
                <dt className="chapter text-[9px] text-forest/50">{f.k}</dt>
                <dd className="mt-2">
                  <span className="display text-5xl text-forest md:text-7xl">{f.v}</span>
                  <span className="mt-2 block text-[12px] leading-snug text-forest/60">{f.note}</span>
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
