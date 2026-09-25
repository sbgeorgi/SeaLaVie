import { useState } from "react";
import { SUITES, type Suite } from "../data/content";
import { bySection } from "../data/photos";
import { ArrowLabel, Chapter, Photo, useGallery } from "../components/ui";
import { useInView } from "../lib/hooks";
import { cn } from "../utils/cn";

export default function Suites() {
  return (
    <section id="suites" aria-labelledby="suites-title" className="bg-ivory px-5 py-24 md:px-10 md:py-36">
      <div className="mx-auto max-w-[1500px]">
        <Chapter n="IX">The Suites</Chapter>
        <div className="mb-12 grid gap-5 md:mb-20 md:grid-cols-12 md:items-end">
          <h2 id="suites-title" className="display mt-6 text-[54px] text-forest sm:text-7xl lg:col-span-8 lg:text-[96px]">Rooms, <em>as chapters.</em></h2>
          <p className="max-w-sm text-[14px] leading-relaxed text-forest/65 lg:col-span-4">Five views of life at Sea La Vie. Scroll through the home, choose a photograph, and open each room's full gallery.</p>
        </div>
        <div className="space-y-20 md:space-y-32">
          {SUITES.map((suite, index) => <SuiteChapter key={suite.id} suite={suite} index={index} />)}
        </div>
      </div>
    </section>
  );
}

function SuiteChapter({ suite, index }: { suite: Suite; index: number }) {
  const gallery = useGallery();
  const photos = bySection(suite.section);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [stageRef, inView] = useInView<HTMLDivElement>({ rootMargin: "0px 0px 15% 0px", threshold: 0.01 });
  const visiblePhotos = photos.slice(0, 5);
  const image = visiblePhotos[photoIndex] ?? visiblePhotos[0];

  return (
    <article id={suite.id} aria-labelledby={`${suite.id}-title`} className="border-t border-forest/20 pt-5 md:pt-7">
      <div className="mb-3 flex items-center justify-between text-forest/55 md:mb-5">
        <p className="chapter text-[9px]">Sea La Vie / {suite.kicker}</p>
        <p className="font-serif text-xl italic text-ember">{String(index + 1).padStart(2, "0")} / {String(SUITES.length).padStart(2, "0")}</p>
      </div>

      <div ref={stageRef} className="relative h-[58svh] min-h-[400px] overflow-hidden bg-forest-deep md:h-[78svh] md:min-h-[570px]">
        <div className={cn("suite-wipe absolute inset-0", index % 2 ? "suite-wipe-from-right" : "suite-wipe-from-left", inView && "is-in")}>
          {visiblePhotos.map((photo, i) => (
            <div key={photo.id} className={cn("absolute inset-0 transition-[opacity,transform] duration-[700ms] ease-[var(--ease-lux)]", photoIndex === i ? "scale-100 opacity-100" : "scale-[1.04] opacity-0")} style={{ zIndex: photoIndex === i ? 2 : 1 }} aria-hidden={photoIndex !== i}>
              <Photo id={photo.id} alt={photoIndex === i ? photo.alt : ""} sizes="(min-width: 768px) 90vw, 100vw" className="absolute inset-0 h-full w-full" imgClassName="object-cover" />
            </div>
          ))}
          <div aria-hidden className="pointer-events-none absolute inset-0 z-[3] bg-gradient-to-t from-forest-deep/70 via-transparent to-forest-deep/20" />
          <button onClick={() => gallery.open(suite.section, image.id)} className="group absolute inset-0 z-[4] block w-full text-left" aria-label={`Open ${suite.name} photograph gallery`}>
            <span className="chapter absolute right-4 top-4 border border-ivory/70 bg-forest-deep/40 px-3 py-2.5 text-[8px] text-ivory backdrop-blur-sm transition-colors group-hover:bg-forest-deep/70 sm:right-6 sm:top-6 sm:px-4 sm:text-[9px]">View photograph ↗</span>
          </button>
          <div className="absolute inset-x-4 bottom-4 z-[6] sm:inset-x-6 sm:bottom-6" role="group" aria-label={`${suite.name} image previews`}>
            <p className="chapter mb-2 text-[9px] text-ivory/85" aria-live="polite">{String(photoIndex + 1).padStart(2, "0")} / {String(visiblePhotos.length).padStart(2, "0")} &nbsp;·&nbsp; Choose a view</p>
            <div className="flex max-w-full gap-2 overflow-x-auto no-scrollbar">
              {visiblePhotos.map((photo, i) => (
                <button key={photo.id} onClick={() => setPhotoIndex(i)} aria-label={`Show ${photo.alt}`} aria-pressed={photoIndex === i} className={cn("relative h-12 w-12 shrink-0 overflow-hidden border-2 bg-forest-deep transition-[opacity,border-color,transform] duration-500 sm:h-16 sm:w-16", photoIndex === i ? "-translate-y-1 border-ivory opacity-100" : "border-ivory/45 opacity-75 hover:opacity-100")}>
                  <Photo id={photo.id} alt="" sizes="72px" className="absolute inset-0 h-full w-full" />
                </button>
              ))}
            </div>
          </div>
        </div>
        <span className="chapter absolute left-5 top-5 z-10 rounded-full bg-ivory/90 px-4 py-2 text-[9px] text-forest md:left-8 md:top-8">{suite.bed}</span>
      </div>

      <div className={cn("relative z-20 w-full border border-t-0 border-forest/10 bg-paper p-6 shadow-[0_24px_70px_-45px_rgba(18,28,22,.45)] md:max-w-[690px] md:p-10 lg:p-12", index % 2 ? "md:ml-0 md:mr-auto" : "md:ml-auto md:mr-0")}>
        <p className="chapter text-[9px] text-ember">{suite.kicker}</p>
        <h3 id={`${suite.id}-title`} className="display mt-4 text-[50px] text-forest sm:text-[66px] lg:text-[78px]">{suite.name}</h3>
        <p className="mt-5 max-w-lg text-[14px] leading-relaxed text-forest/70">{suite.copy}</p>
        <ul className="mt-6 grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {suite.features.map((feature) => <li key={feature} className="flex items-start gap-2 text-[12px] leading-relaxed text-forest/65"><span aria-hidden className="mt-2 h-px w-3 shrink-0 bg-sage" />{feature}</li>)}
        </ul>
        <button onClick={() => gallery.open(suite.section, image.id)} className="group chapter mt-7 flex items-center border-t border-forest/15 pt-5 text-[10px] text-forest"><ArrowLabel>Explore all {photos.length} photographs</ArrowLabel></button>
      </div>
    </article>
  );
}
