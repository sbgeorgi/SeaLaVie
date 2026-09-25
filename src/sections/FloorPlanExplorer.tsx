import { useState, type KeyboardEvent } from "react";
import { bySection, type SectionKey } from "../data/photos";
import { ROOMS } from "../three/VillaScene";
import { ArrowLabel, Chapter, Photo, useGallery } from "../components/ui";
import { cn } from "../utils/cn";

type Place = { id: string; name: string; section: SectionKey; detail: string };

const PLACES: Place[] = [
  { id: "suite1", name: "Suite I", section: "suite1", detail: "The ocean-front king suite, with a private bath, balcony and a desk facing the water." },
  { id: "living", name: "Living room", section: "living", detail: "A generous place to gather, framed by wide glass and the changing Caribbean light." },
  { id: "dining", name: "Dining room", section: "dining", detail: "A table for six beside the doors that open toward the sea." },
  { id: "kitchen", name: "Full kitchen", section: "kitchen", detail: "Warm timber cabinetry, a gas range and an island made for unhurried mornings." },
  { id: "suite2", name: "Suite II", section: "suite2", detail: "A second king suite with its own bath, balcony and kitchenette." },
  { id: "suite3", name: "Suite III", section: "suite3", detail: "A queen suite with a sitting corner, kitchenette and timber-ceilinged balcony." },
  { id: "baths", name: "En-suite baths", section: "baths", detail: "Three private baths, one for each bedroom, finished in warm stone and wood." },
  { id: "patio", name: "Sunset patio", section: "terrace", detail: "An open-air extension of the home above the pool, with the horizon beyond." },
];

const zoneToPlace = (id: string) => id.startsWith("bath") ? "baths" : PLACES.some((p) => p.id === id) ? id : null;
const ZONE_LABELS: Record<string, string> = { suite1: "SUITE I", suite2: "SUITE II", suite3: "SUITE III", living: "LIVING", dining: "DINING", kitchen: "KITCHEN", patio: "SUNSET PATIO", bath1: "BATH I", bath2: "BATH II", bath3: "BATH III", laundry: "LAUNDRY", entry: "ENTRY & WORKSPACE" };

export default function FloorPlanExplorer() {
  const [selected, setSelected] = useState("suite1");
  const [photoIndex, setPhotoIndex] = useState(0);
  const gallery = useGallery();
  const current = PLACES.find((place) => place.id === selected)!;
  const photos = bySection(current.section);
  const image = photos[Math.min(photoIndex, photos.length - 1)];

  const choose = (id: string) => { setSelected(id); setPhotoIndex(0); };
  const onZoneKey = (event: KeyboardEvent<SVGGElement>, id: string) => {
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); choose(id); }
  };

  return (
    <section id="floor-plan" aria-labelledby="floor-plan-title" className="bg-paper px-5 py-24 md:px-10 md:py-36">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-10 grid gap-6 md:mb-16 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <Chapter n="II">The Floor Plan</Chapter>
            <h2 id="floor-plan-title" className="display mt-6 text-[52px] text-forest sm:text-7xl lg:text-[96px]">Find your place <em>in the home.</em></h2>
          </div>
          <p className="max-w-sm text-[14px] leading-relaxed text-forest/65 md:col-span-4">Choose a room on the plan or in the menu. Its photographs appear beside the layout; open any image to continue through the gallery.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <div className="relative overflow-hidden border border-forest/15 bg-ivory-2 p-3 sm:p-6">
              <div className="pointer-events-none absolute inset-0 opacity-50" style={{ backgroundImage: "linear-gradient(rgba(29,43,35,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(29,43,35,.045) 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
              <svg viewBox="0 0 1000 690" className="relative w-full" role="group" aria-label="Illustrative floor plan. Select a room to see its photographs.">
                <text x="80" y="62" fill="#607065" fontSize="12" letterSpacing="3">SEA LA VIE / LEVEL TWO</text>
                <path d="M80 78H916M80 72v12M916 72v12" fill="none" stroke="#8f9d86" strokeWidth="1" />
                {ROOMS.map((room) => {
                  const place = zoneToPlace(room.id);
                  const active = place === selected;
                  const x = 80 + (room.x0 + 11) * 38;
                  const y = 110 + (room.z0 + 6) * 33;
                  const width = (room.x1 - room.x0) * 38;
                  const height = (room.z1 - room.z0) * 33;
                  return (
                    <g key={room.id} role={place ? "button" : undefined} tabIndex={place ? 0 : undefined} aria-label={place ? `Explore ${PLACES.find((p) => p.id === place)?.name}` : undefined} aria-pressed={place ? active : undefined} onClick={place ? () => choose(place) : undefined} onKeyDown={place ? (event) => onZoneKey(event, place) : undefined} className={cn(place && "cursor-pointer outline-none")}>
                      <rect x={x + 2} y={y + 2} width={width - 4} height={height - 4} fill={active ? "#a7c4bd" : place ? "#f3f0e7" : "#dedccf"} stroke={active ? "#1d2b23" : "#728375"} strokeWidth={active ? 3 : 1.2} className="transition-colors duration-500" />
                      {room.id === "patio" && <path d={`M${x + 10} ${y + 12}h${width - 20}m-${width - 20} 18h${width - 20}m-${width - 20} 18h${width - 20}`} stroke="#8f9d86" strokeWidth=".8" opacity=".7" pointerEvents="none" />}
                      <text x={x + width / 2} y={y + height / 2 + 4} textAnchor="middle" fill="#1d2b23" fontFamily="Manrope, sans-serif" fontSize={room.id.startsWith("bath") || room.id === "laundry" ? 10 : 13} letterSpacing="1.2" pointerEvents="none">{ZONE_LABELS[room.id]}</text>
                      {place && <rect x={x + 2} y={y + 2} width={width - 4} height={height - 4} fill="transparent" stroke="none" />}
                    </g>
                  );
                })}
                <path d="M80 590q80-15 160 0t160 0t160 0t160 0t160 0" fill="none" stroke="#5f8a83" strokeWidth="2" />
                <text x="500" y="632" textAnchor="middle" fill="#5f8a83" fontSize="12" letterSpacing="4">THE CARIBBEAN SEA</text>
                <text x="80" y="670" fill="#718178" fontSize="10" letterSpacing="2">ILLUSTRATIVE LAYOUT / NOT TO SCALE</text>
              </svg>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-4" role="group" aria-label="Choose a room">
              {PLACES.map((place, i) => <button key={place.id} onClick={() => choose(place.id)} aria-pressed={selected === place.id} className={cn("flex items-center gap-2 border-b py-3 text-left text-[12px] transition-colors", selected === place.id ? "border-forest text-forest" : "border-forest/15 text-forest/55 hover:text-forest")}><span className="font-serif text-lg italic text-ember">{String(i + 1).padStart(2, "0")}</span>{place.name}</button>)}
            </div>
          </div>

          <div className="lg:col-span-5" aria-live="polite">
            <div className="relative aspect-[4/3] overflow-hidden bg-forest/10 sm:aspect-[5/4] lg:aspect-[4/5]">
              <button key={image.id} onClick={() => gallery.open(current.section, image.id)} className="group block h-full w-full" aria-label={`Open ${image.alt} in photo gallery`}>
                <Photo id={image.id} alt={image.alt} sizes="(min-width: 1024px) 40vw, 100vw" className="h-full w-full" imgClassName="transition-transform duration-[1200ms] ease-[var(--ease-lux)] group-hover:scale-[1.04]" />
                <span className="chapter absolute bottom-5 right-5 bg-paper/90 px-4 py-2 text-[9px] text-forest">View photograph ↗</span>
              </button>
            </div>
            <div className="mt-6 border-t border-forest/20 pt-5">
              <p className="chapter text-[9px] text-ember">Selected room / {String(PLACES.findIndex((p) => p.id === selected) + 1).padStart(2, "0")}</p>
              <h3 className="display mt-3 text-[52px] text-forest sm:text-[64px]">{current.name}</h3>
              <p className="mt-4 max-w-lg text-[14px] leading-relaxed text-forest/70">{current.detail}</p>
              <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label={`${current.name} image previews`}>
                {photos.map((photo, i) => <button key={photo.id} onClick={() => setPhotoIndex(i)} aria-label={`Show ${photo.alt}`} aria-pressed={i === photoIndex} className={cn("h-14 w-14 overflow-hidden border-2 transition-opacity", i === photoIndex ? "border-ember opacity-100" : "border-transparent opacity-55 hover:opacity-100")}><Photo id={photo.id} alt="" sizes="64px" className="h-full w-full" /></button>)}
              </div>
              <button onClick={() => gallery.open(current.section, image.id)} className="group chapter mt-6 flex items-center text-[10px] text-forest"><ArrowLabel>Explore all {photos.length} photographs</ArrowLabel></button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
