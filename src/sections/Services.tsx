import { useState } from "react";
import { SERVICES } from "../data/content";
import { PICK, byId } from "../data/photos";
import { Chapter, MaskLines, Photo, PlusIcon } from "../components/ui";
import { cn } from "../utils/cn";

const IMAGES = [PICK.palapa, PICK.loggiaSeat, PICK.suite1desk, PICK.suite3balcony, PICK.loungers];

export default function Services() {
  const [open, setOpen] = useState(0);
  return (
    <section aria-labelledby="svc-title" className="relative bg-forest text-ivory">
      <div className="mx-auto grid max-w-[1600px] lg:grid-cols-2">
        {/* sticky crossfading image */}
        <div className="relative hidden lg:block">
          <div className="sticky top-0 h-[100svh] overflow-hidden">
            {IMAGES.map((id, i) => (
              <div
                key={id}
                className="absolute inset-0 transition-[opacity,transform] duration-[1300ms] ease-[var(--ease-lux)]"
                style={{ opacity: open === i ? 1 : 0, transform: open === i ? "scale(1)" : "scale(1.06)" }}
                aria-hidden={open !== i}
              >
                <Photo id={id} alt={byId(id).alt} sizes="50vw" className="h-full w-full" />
              </div>
            ))}
            <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-transparent to-forest/40" />
          </div>
        </div>

        <div className="px-5 py-28 md:px-12 md:py-40 lg:px-20">
          <Chapter n="VI" light>
            Services
          </Chapter>
          <h2 id="svc-title" className="display mt-8 text-[54px] sm:text-7xl lg:text-[92px]">
            <MaskLines lines={["Quietly", <em key="e" className="text-seaglass">taken care of.</em>]} />
          </h2>
          <ul className="mt-14 border-t border-ivory/15">
            {SERVICES.map((s, i) => {
              const isOpen = open === i;
              const pid = `svc-panel-${i}`;
              return (
                <li key={s.title} className="border-b border-ivory/15">
                  <h3>
                    <button
                      onClick={() => setOpen(isOpen ? -1 : i)}
                      aria-expanded={isOpen}
                      aria-controls={pid}
                      className="group flex w-full items-start gap-5 py-7 text-left md:gap-8"
                    >
                      <span className="chapter pt-2.5 text-[9px] text-ember">{String(i + 1).padStart(2, "0")}</span>
                      <span className="flex-1">
                        <span className={cn("block font-serif text-[28px] leading-[1.05] transition-transform duration-700 ease-[var(--ease-lux)] md:text-4xl", !isOpen && "group-hover:translate-x-2")}>
                          {s.title}
                        </span>
                        <span className="mt-2 block text-[13.5px] text-ivory/55">{s.lead}</span>
                      </span>
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-ivory/25 transition-colors duration-500 group-hover:border-ivory">
                        <PlusIcon />
                      </span>
                    </button>
                  </h3>
                  <div id={pid} role="region" aria-label={s.title} className="grid transition-[grid-template-rows] duration-700 ease-[var(--ease-lux)]" style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}>
                    <div className="overflow-hidden">
                      <div className="pb-8 pl-10 pr-12 md:pl-[52px]">
                        <Photo id={IMAGES[i]} alt={byId(IMAGES[i]).alt} sizes="100vw" className="mb-5 aspect-[16/10] w-full lg:hidden" />
                        <p className="max-w-md text-[14.5px] leading-relaxed text-ivory/75">{s.body}</p>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
