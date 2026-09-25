import { useState } from "react";
import { SUITES, type Suite } from "../data/content";
import { bySection } from "../data/photos";
import { ArrowLabel, Chapter, Photo, Reveal, useGallery } from "../components/ui";
import { cn } from "../utils/cn";

export default function Suites() {
  return (
    <section id="suites" aria-labelledby="suites-title" className="bg-ivory px-5 py-24 md:px-10 md:py-36">
      <div className="mx-auto max-w-[1500px]">
        <Chapter n="VII">The Suites</Chapter>
        <div className="mb-14 grid gap-5 md:mb-24 md:grid-cols-12 md:items-end">
          <h2 id="suites-title" className="display mt-6 text-[54px] text-forest sm:text-7xl lg:col-span-8 lg:text-[96px]">Rooms, <em>as chapters.</em></h2>
          <p className="max-w-sm text-[14px] leading-relaxed text-forest/65 lg:col-span-4">Move through the home as you scroll. Choose a photograph in each chapter, then open the gallery to see the full room.</p>
        </div>
        <div className="space-y-24 md:space-y-36">
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
  const image = photos[photoIndex] ?? photos[0];

  return (
    <article id={suite.id} aria-labelledby={`${suite.id}-title`} className="grid gap-7 border-t border-forest/20 pt-7 md:grid-cols-12 md:gap-10 md:pt-10">
      <div className={cn("md:col-span-7", index % 2 === 1 && "md:order-2")}>
        <Reveal clip className="relative aspect-[4/3] w-full md:aspect-[5/4]">
          <button onClick={() => gallery.open(suite.section, image.id)} className="group block h-full w-full" aria-label={`Open ${suite.name} photograph gallery`}>
            <Photo id={image.id} alt={image.alt} sizes="(min-width: 768px) 58vw, 100vw" className="h-full w-full" imgClassName="transition-transform duration-[1600ms] ease-[var(--ease-lux)] group-hover:scale-[1.04]" />
            <span className="chapter absolute bottom-4 right-4 bg-ivory/90 px-4 py-2 text-[9px] text-forest">View gallery ↗</span>
          </button>
        </Reveal>
        <div className="mt-3 flex flex-wrap items-center gap-2" role="group" aria-label={`${suite.name} image previews`}>
          {photos.slice(0, 5).map((photo, i) => (
            <button key={photo.id} onClick={() => setPhotoIndex(i)} onMouseEnter={() => setPhotoIndex(i)} onFocus={() => setPhotoIndex(i)} aria-label={`Show ${photo.alt}`} aria-pressed={photoIndex === i} className={cn("h-14 w-14 overflow-hidden border-2 transition-opacity sm:h-16 sm:w-16", photoIndex === i ? "border-ember opacity-100" : "border-transparent opacity-55 hover:opacity-100")}>
              <Photo id={photo.id} alt="" sizes="72px" className="h-full w-full" />
            </button>
          ))}
          <span className="chapter ml-auto text-[9px] text-forest/45">{String(photoIndex + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}</span>
        </div>
      </div>
      <div className={cn("flex flex-col justify-center md:col-span-5", index % 2 === 1 && "md:order-1")}>
        <p className="display text-[84px] italic leading-none text-forest/10 md:text-[120px]">{suite.numeral}</p>
        <p className="chapter -mt-3 text-[9px] text-ember">{suite.kicker}</p>
        <h3 id={`${suite.id}-title`} className="display mt-4 text-[48px] text-forest sm:text-[64px]">{suite.name}</h3>
        <p className="mt-6 max-w-md text-[14px] leading-relaxed text-forest/70">{suite.copy}</p>
        <ul className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {suite.features.map((feature) => <li key={feature} className="flex items-start gap-2 text-[12.5px] leading-relaxed text-forest/65"><span aria-hidden className="mt-2 h-px w-3 shrink-0 bg-sage" />{feature}</li>)}
        </ul>
        <button onClick={() => gallery.open(suite.section)} className="group chapter mt-9 flex items-center self-start text-[10px] text-forest"><ArrowLabel>All {photos.length} photographs</ArrowLabel></button>
      </div>
    </article>
  );
}
