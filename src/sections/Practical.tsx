import { useState } from "react";
import { AMENITIES } from "../data/content";
import { Chapter, MaskLines, PlusIcon, Reveal } from "../components/ui";
import { cn } from "../utils/cn";

const NOTES = [
  { k: "Arrival", v: "Private security gate", d: "Access code shared at check-in · self check-in by lockbox." },
  { k: "Community", v: "Registered guests only", d: "A private community — non-registered guests are not permitted on the property." },
  { k: "Utilities", v: "Electricity · $0.42 / kWh", d: "Metered by unit; settled before departure in cash or via Airbnb." },
  { k: "Distance", v: "½ mile to West End", d: "Seven minutes on foot to the beach, dive shops, Sundowners and dining." },
];

export default function Practical() {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const total = AMENITIES.reduce((a, g) => a + g.items.length, 0);
  return (
    <section id="amenities" aria-labelledby="amen-title" className="relative bg-paper px-5 py-28 md:px-10 md:py-40">
      <div className="mx-auto grid max-w-[1500px] gap-16 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <Chapter n="VII">Practical Context</Chapter>
            <h2 id="amen-title" className="display mt-8 text-[54px] text-forest sm:text-7xl lg:text-[96px]">
              <MaskLines lines={["What the", <em key="e">house offers.</em>]} />
            </h2>
            <p className="mt-6 max-w-sm text-[14.5px] leading-relaxed text-forest/65">
              {total} considered comforts — from a gas range and blender to beach umbrellas and room-darkening shades.
            </p>
            <dl className="mt-12 divide-y divide-forest/10 border-y border-forest/10">
              {NOTES.map((n, i) => (
                <Reveal key={n.k} delay={i * 80} className="grid grid-cols-[88px_1fr] gap-4 py-5">
                  <dt className="chapter pt-1 text-[9px] text-forest/45">{n.k}</dt>
                  <dd>
                    <p className="font-serif text-xl leading-tight text-forest">{n.v}</p>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-forest/60">{n.d}</p>
                  </dd>
                </Reveal>
              ))}
            </dl>
          </div>
        </div>

        <div className="grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:col-span-7 lg:col-start-6">
          {AMENITIES.map((g, gi) => {
            const isOpen = !!open[g.group];
            const shown = isOpen ? g.items : g.items.slice(0, 5);
            const id = `amen-${gi}`;
            return (
              <Reveal key={g.group} delay={(gi % 2) * 120}>
                <div className="flex items-baseline justify-between border-b border-forest/15 pb-3">
                  <h3 className="font-serif text-[28px] leading-none text-forest md:text-3xl">{g.group}</h3>
                  <span className="chapter text-[9px] text-forest/40">{String(g.items.length).padStart(2, "0")}</span>
                </div>
                <ul id={id} className="mt-4 space-y-2.5">
                  {shown.map((it, i) => (
                    <li
                      key={it}
                      className={cn("flex items-center gap-3 text-[14px] text-forest/75", i >= 5 && "animate-fade-in")}
                      style={i >= 5 ? { animationDelay: `${(i - 5) * 40}ms` } : undefined}
                    >
                      <span aria-hidden className="h-px w-3 bg-sage" />
                      {it}
                    </li>
                  ))}
                </ul>
                {g.items.length > 5 && (
                  <button
                    onClick={() => setOpen((o) => ({ ...o, [g.group]: !isOpen }))}
                    aria-expanded={isOpen}
                    aria-controls={id}
                    className="chapter mt-5 flex items-center gap-3 text-[9.5px] text-forest"
                  >
                    <PlusIcon />
                    <span className="lux-underline">{isOpen ? "Show less" : `${g.items.length - 5} more`}</span>
                  </button>
                )}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
