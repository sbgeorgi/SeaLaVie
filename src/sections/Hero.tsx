import { useRef } from "react";
import { PICK, img, srcSet } from "../data/photos";
import { useSectionProgress } from "../lib/hooks";
import { useGallery } from "../components/ui";

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const gallery = useGallery();
  useSectionProgress(
    ref,
    (p) => {
      if (media.current) media.current.style.transform = `translate3d(0, ${p * 18}%, 0) scale(${1 + p * 0.08})`;
      if (copy.current) {
        copy.current.style.transform = `translate3d(0, ${p * -60}px, 0)`;
        copy.current.style.opacity = String(1 - p * 1.4);
      }
    },
    false,
  );

  return (
    <section id="top" ref={ref} aria-label="Sea La Vie" className="relative h-[100svh] min-h-[600px] overflow-hidden bg-forest-deep text-ivory">
      <div ref={media} className="absolute inset-0 will-change-transform">
        <div className="animate-hero-scale absolute inset-0">
          <img
            src={img(PICK.heroSea, 1920)}
            srcSet={srcSet(PICK.heroSea)}
            sizes="100vw"
            alt="White arches of the Sea La Vie loggia frame the pool, palapas and the open Caribbean"
            fetchPriority="high"
            className="h-full w-full object-cover object-[50%_60%]"
          />
        </div>
      </div>
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-forest-deep/55 via-forest-deep/10 to-forest-deep/80" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-forest-deep/50 via-transparent to-transparent" />

      <div ref={copy} className="relative flex h-full flex-col justify-end px-5 pb-10 md:px-10 md:pb-14">
        <div className="mx-auto w-full max-w-[1600px]">
          <p className="chapter animate-fade-in text-ivory/80 [animation-delay:600ms]">
            <span className="text-ember">Iron Shore</span> &nbsp;·&nbsp; West End &nbsp;·&nbsp; Roatán, Honduras
          </p>
          <h1 className="display mt-5 text-[22vw] text-ivory md:mt-6 md:text-[15vw] lg:text-[13.5vw]">
            <span className="block overflow-hidden pb-[0.06em]">
              <span className="animate-line-in block [animation-delay:250ms]">Sea</span>
            </span>
            <span className="-mt-[0.1em] block overflow-hidden pb-[0.1em] pl-[0.5em] md:pl-[1.2em]">
              <span className="animate-line-in block italic [animation-delay:420ms]">La Vie</span>
            </span>
          </h1>
          <div className="mt-6 flex flex-col gap-6 md:mt-4 md:flex-row md:items-end md:justify-between">
            <p className="animate-fade-in max-w-sm text-[15px] leading-relaxed text-ivory/80 [animation-delay:900ms] md:text-base">
              An oceanfront residence of three suites, a pool between the house and the reef, and sunsets you watch from the patio.
            </p>
            <div className="animate-fade-in flex items-center gap-6 [animation-delay:1100ms]">
              <button onClick={() => gallery.open("exterior")} className="group chapter flex items-center text-[10px] text-ivory">
                <span className="lux-underline whitespace-nowrap">View 49 photographs</span>
                <svg aria-hidden viewBox="0 0 12 12" className="arrow-diag ml-2 h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M2 10 10 2M4 2h6v6" /></svg>
              </button>
              <a href="#inquire" className="btn-lux chapter whitespace-nowrap rounded-full border border-ivory/50 px-6 py-3.5 text-[10px] text-ivory [--btn-fill:var(--color-ivory)] hover:text-forest">
                Plan your stay
              </a>
            </div>
          </div>
        </div>
      </div>

      <div aria-hidden className="absolute bottom-0 left-1/2 hidden h-16 w-px overflow-hidden bg-ivory/15 md:block">
        <span className="animate-scroll-cue block h-full w-full bg-ivory" />
      </div>
      <p aria-hidden className="chapter absolute right-5 top-1/2 hidden origin-right -translate-y-1/2 translate-x-1/2 rotate-90 text-[9px] text-ivory/60 md:right-10 md:block">
        16°18′41″N — 86°35′34″W
      </p>
    </section>
  );
}
