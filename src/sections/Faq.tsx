import { useState } from "react";
import { FAQS } from "../data/content";
import { Chapter, PlusIcon, Reveal } from "../components/ui";

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section aria-labelledby="faq-title" className="bg-ivory px-5 py-28 md:px-10 md:py-40">
      <div className="mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Chapter n="X">Before you arrive</Chapter>
          <h2 id="faq-title" className="display mt-8 text-[54px] text-forest sm:text-7xl">
            Good <em>to know.</em>
          </h2>
        </div>
        <div className="lg:col-span-7 lg:col-start-6">
          <ul className="border-t border-forest/15">
            {FAQS.map((f, i) => {
              const isOpen = open === i;
              return (
                <Reveal as="li" key={f.q} delay={i * 60} className="border-b border-forest/15">
                  <h3>
                    <button onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} aria-controls={`faq-${i}`} className="group flex w-full items-center justify-between gap-6 py-6 text-left">
                      <span className="font-serif text-2xl leading-snug text-forest transition-transform duration-700 ease-[var(--ease-lux)] group-hover:translate-x-1.5 md:text-[28px]">{f.q}</span>
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-forest/20 text-forest transition-colors group-hover:border-forest">
                        <PlusIcon />
                      </span>
                    </button>
                  </h3>
                  <div id={`faq-${i}`} role="region" aria-label={f.q} className="grid transition-[grid-template-rows] duration-700 ease-[var(--ease-lux)]" style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}>
                    <div className="overflow-hidden">
                      <p className="max-w-xl pb-7 text-[14.5px] leading-relaxed text-forest/70">{f.a}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
