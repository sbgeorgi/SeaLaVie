import { PICK, byId } from "../data/photos";
import { Chapter, MaskLines, Photo, Reveal, useGallery, ArrowLabel } from "../components/ui";

export default function Residence() {
  const gallery = useGallery();
  const tile = (id: string, cls: string, section: Parameters<typeof gallery.open>[0], caption: string, sizes: string) => (
    <figure className={cls}>
      <button onClick={() => gallery.open(section, id)} className="group block h-full w-full text-left" aria-label={`Open gallery: ${caption}`}>
        <Reveal clip className="h-full w-full">
          <Photo id={id} alt={byId(id).alt} sizes={sizes} className="h-full w-full" imgClassName="transition-transform duration-[1600ms] ease-[var(--ease-lux)] group-hover:scale-[1.04]" />
        </Reveal>
      </button>
      <figcaption className="chapter mt-3 flex justify-between text-[9px] text-forest/55">
        <span>{caption}</span>
        <span className="font-serif text-sm normal-case italic tracking-normal">view</span>
      </figcaption>
    </figure>
  );

  return (
    <section aria-labelledby="res-title" className="relative bg-ivory px-5 py-28 md:px-10 md:py-44">
      <div className="mx-auto max-w-[1500px]">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <Chapter n="II">The Residence</Chapter>
            <h2 id="res-title" className="display mt-8 text-[58px] text-forest sm:text-8xl lg:text-[132px]">
              <MaskLines lines={["The entire", <em key="e">second floor.</em>]} />
            </h2>
          </div>
          <Reveal className="self-end md:col-span-4 md:col-start-9" delay={200}>
            <p className="text-[15px] leading-relaxed text-forest/70">
              Three thousand square feet of marble, timber and glass, raised above the pool so every room holds the sea. Three bedrooms, each with its own bath and balcony; a full kitchen and two kitchenettes; air conditioning and Wi-Fi throughout.
            </p>
            <button onClick={() => gallery.open()} className="group chapter mt-8 flex items-center text-[10px] text-forest">
              <ArrowLabel>Open the full gallery</ArrowLabel>
            </button>
          </Reveal>
        </div>

        {/* asymmetric editorial grid */}
        <div className="mt-16 grid grid-cols-6 gap-4 md:mt-28 md:grid-cols-12 md:gap-6">
          {tile(PICK.livingDusk, "col-span-4 aspect-[3/4] md:col-span-5 md:row-span-2", "living", "Living room · dusk", "(min-width: 768px) 40vw, 70vw")}
          <div className="col-span-2 flex flex-col justify-end md:col-span-2 md:col-start-7">
            <p className="font-serif text-[15px] italic leading-snug text-forest/70 md:text-xl">“Plentiful ocean views from every room.”</p>
          </div>
          {tile(PICK.dining, "col-span-6 aspect-[3/2] md:col-span-5 md:col-start-8 md:mt-24", "dining", "Dining · doors to the sea", "(min-width: 768px) 40vw, 100vw")}
          {tile(PICK.kitchen, "col-span-3 col-start-2 aspect-[3/4] md:col-span-3 md:col-start-7 md:mt-10", "kitchen", "The full kitchen", "(min-width: 768px) 25vw, 50vw")}
          {tile(PICK.bath, "col-span-2 aspect-[3/4] self-end md:col-span-3 md:col-start-10 md:aspect-[4/5]", "baths", "Three en-suite baths", "(min-width: 768px) 25vw, 35vw")}
        </div>
      </div>
    </section>
  );
}
