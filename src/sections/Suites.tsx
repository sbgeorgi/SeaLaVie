import { useEffect, useRef, useState } from "react";
import { SUITES, type Suite } from "../data/content";
import { bySection } from "../data/photos";
import { useSectionProgress, useIsMobile, scrollToY } from "../lib/hooks";
import { Chapter, Photo, useGallery, ArrowLabel } from "../components/ui";
import { cn } from "../utils/cn";

export default function Suites() {
  const mobile = useIsMobile();
  return mobile ? <SuitesMobile /> : <SuitesDesktop />;
}

function Header({ light }: { light?: boolean }) {
  return (
    <div>
      <Chapter n="VII" light={light}>
        The Suites
      </Chapter>
      <h2 id="suites-title" className={cn("display mt-6 text-[54px] sm:text-7xl lg:text-[88px]", light ? "text-ivory" : "text-forest")}>
        Rooms, <em>as chapters.</em>
      </h2>
    </div>
  );
}

function SuitesDesktop() {
  const ref = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);
  const p = useSectionProgress(ref, (v) => {
    if (track.current) track.current.style.transform = `translate3d(${-v * dist}px,0,0)`;
  });

  useEffect(() => {
    const m = () => track.current && setDist(track.current.scrollWidth - window.innerWidth);
    m();
    window.addEventListener("resize", m);
    return () => window.removeEventListener("resize", m);
  }, []);

  const active = Math.min(SUITES.length - 1, Math.round(p * (SUITES.length - 1)));
  const goTo = (i: number) => {
    const sec = ref.current!;
    const top = sec.getBoundingClientRect().top + window.scrollY;
    scrollToY(top + (sec.offsetHeight - window.innerHeight) * (i / (SUITES.length - 1)));
  };

  return (
    <section id="suites" ref={ref} aria-labelledby="suites-title" className="relative bg-ivory" style={{ height: `${SUITES.length * 85}vh` }}>
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        <div className="mb-8 flex items-end justify-between px-10 lg:px-16">
          <Header />
          <nav aria-label="Suites" className="flex items-center gap-6">
            {SUITES.map((s, i) => (
              <button key={s.id} onClick={() => goTo(i)} aria-current={active === i ? "true" : undefined} className="group text-left">
                <span className={cn("font-serif text-2xl italic transition-colors duration-500", active === i ? "text-forest" : "text-forest/30 group-hover:text-forest/60")}>{s.numeral}</span>
                <span className="mt-1 block h-px w-10 bg-forest/15">
                  <span className="block h-full bg-ember transition-transform duration-700 ease-[var(--ease-lux)]" style={{ transform: `scaleX(${active === i ? 1 : 0})`, transformOrigin: "left" }} />
                </span>
              </button>
            ))}
          </nav>
        </div>
        <div ref={track} className="flex gap-10 pl-10 pr-[20vw] will-change-transform lg:pl-16">
          {SUITES.map((s, i) => (
            <SuitePanel key={s.id} s={s} active={active === i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SuitePanel({ s, active }: { s: Suite; active: boolean }) {
  const gallery = useGallery();
  const photos = bySection(s.section);
  const [hover, setHover] = useState(0);
  const shown = photos[hover]?.id ?? s.image;
  return (
    <article className={cn("grid h-[62svh] w-[74vw] shrink-0 grid-cols-12 gap-8 transition-opacity duration-700 xl:w-[64vw]", active ? "opacity-100" : "opacity-55")} aria-label={s.name}>
      <div className="relative col-span-7 overflow-hidden">
        {photos.slice(0, 4).map((ph, i) => (
          <div key={ph.id} className="absolute inset-0 transition-opacity duration-[900ms] ease-[var(--ease-lux)]" style={{ opacity: shown === ph.id || (i === 0 && !photos.length) ? 1 : 0 }}>
            <Photo id={ph.id} alt={ph.alt} sizes="45vw" className="h-full w-full" imgClassName={cn("transition-transform duration-[2000ms] ease-[var(--ease-lux)]", active ? "scale-100" : "scale-110")} />
          </div>
        ))}
        <span className="chapter absolute left-5 top-5 rounded-full bg-ivory/85 px-3 py-1.5 text-[9px] text-forest backdrop-blur">{s.bed}</span>
      </div>
      <div className="col-span-5 flex flex-col justify-between py-2">
        <div>
          <p className="display text-[120px] italic leading-none text-forest/10">{s.numeral}</p>
          <p className="chapter -mt-4 text-[9px] text-ember">{s.kicker}</p>
          <h3 className="display mt-3 text-5xl text-forest xl:text-6xl">{s.name}</h3>
          <p className="mt-5 max-w-sm text-[14px] leading-relaxed text-forest/70">{s.copy}</p>
          <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2">
            {s.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-[12.5px] text-forest/70">
                <span aria-hidden className="mt-2 h-px w-2.5 shrink-0 bg-sage" />
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="mb-5 flex gap-2" role="group" aria-label={`${s.name} preview images`}>
            {photos.slice(0, 4).map((ph, i) => (
              <button
                key={ph.id}
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onClick={() => gallery.open(s.section, ph.id)}
                aria-label={`Open ${ph.alt}`}
                className={cn("relative h-14 w-12 overflow-hidden transition-all duration-500 ease-[var(--ease-lux)]", hover === i ? "w-16 opacity-100" : "opacity-60 hover:opacity-100")}
              >
                <Photo id={ph.id} alt="" sizes="80px" className="h-full w-full" />
              </button>
            ))}
          </div>
          <button onClick={() => gallery.open(s.section)} className="group chapter flex items-center text-[10px] text-forest">
            <ArrowLabel>All {photos.length} photographs</ArrowLabel>
          </button>
        </div>
      </div>
    </article>
  );
}

function SuitesMobile() {
  const scroller = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const gallery = useGallery();
  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    setIdx(Math.round(el.scrollLeft / (el.firstElementChild as HTMLElement).offsetWidth));
  };
  const go = (d: number) => {
    const el = scroller.current;
    if (!el) return;
    const w = (el.firstElementChild as HTMLElement).offsetWidth + 16;
    el.scrollTo({ left: Math.max(0, Math.min(SUITES.length - 1, idx + d)) * w, behavior: "smooth" });
  };
  return (
    <section id="suites" aria-labelledby="suites-title" className="bg-ivory py-24">
      <div className="px-5">
        <Header />
        <p className="mt-5 text-[14px] leading-relaxed text-forest/65">Swipe through the residence, one room at a time.</p>
      </div>
      <div
        ref={scroller}
        onScroll={onScroll}
        className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5 pb-2"
        role="region"
        aria-roledescription="carousel"
        aria-label="Suites"
        tabIndex={0}
      >
        {SUITES.map((s, i) => (
          <article key={s.id} className="w-[84vw] shrink-0 snap-center" aria-label={`${i + 1} of ${SUITES.length}: ${s.name}`}>
            <button onClick={() => gallery.open(s.section)} className="relative block w-full" aria-label={`Open ${s.name} photographs`}>
              <Photo id={s.image} alt={s.alt} sizes="84vw" className="aspect-[4/5] w-full" />
              <span className="chapter absolute left-4 top-4 rounded-full bg-ivory/85 px-3 py-1.5 text-[9px] text-forest">{s.bed}</span>
              <span className="display absolute bottom-3 right-4 text-7xl italic text-ivory/90">{s.numeral}</span>
            </button>
            <p className="chapter mt-5 text-[9px] text-ember">{s.kicker}</p>
            <h3 className="display mt-2 text-[44px] text-forest">{s.name}</h3>
            <p className="mt-3 text-[14px] leading-relaxed text-forest/70">{s.copy}</p>
            <ul className="mt-4 space-y-1.5">
              {s.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-[13px] text-forest/70">
                  <span aria-hidden className="h-px w-2.5 bg-sage" />
                  {f}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <div className="mt-8 flex items-center gap-4 px-5">
        <button onClick={() => go(-1)} disabled={idx === 0} aria-label="Previous suite" className="grid h-11 w-11 place-items-center rounded-full border border-forest/25 text-forest disabled:opacity-30">
          ←
        </button>
        <div className="h-px flex-1 bg-forest/15" aria-hidden>
          <div className="h-full bg-forest transition-all duration-700 ease-[var(--ease-lux)]" style={{ width: `${((idx + 1) / SUITES.length) * 100}%` }} />
        </div>
        <span className="chapter text-[9px] text-forest/60" aria-live="polite">
          {idx + 1} / {SUITES.length}
        </span>
        <button onClick={() => go(1)} disabled={idx === SUITES.length - 1} aria-label="Next suite" className="grid h-11 w-11 place-items-center rounded-full border border-forest/25 text-forest disabled:opacity-30">
          →
        </button>
      </div>
    </section>
  );
}
