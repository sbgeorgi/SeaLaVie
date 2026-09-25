import { CONTACT } from "../data/content";
import { PICK, img, srcSet } from "../data/photos";
import { WaIcon } from "./Rates";
import { ArrowLabel, useGallery } from "../components/ui";

export default function Footer() {
  const gallery = useGallery();
  return (
    <footer className="relative overflow-hidden bg-forest-deep text-ivory">
      <div className="relative h-[70svh] min-h-[460px]">
        <img src={img(PICK.sunset, 1920)} srcSet={srcSet(PICK.sunset)} sizes="100vw" alt="The pool glowing beneath a Roatán sunset" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-forest-deep/30 via-forest-deep/20 to-forest-deep" />
        <div className="relative flex h-full flex-col items-center justify-center px-5 text-center">
          <p className="chapter text-ivory/70">Until the next sunset</p>
          <p className="display mt-6 text-[18vw] md:text-[11vw]">
            Sea <em>La</em> Vie
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
            <a href={`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent("Hello — I'd love to hear more about Sea La Vie, Roatán.")}`} target="_blank" rel="noopener noreferrer" className="btn-lux chapter flex items-center gap-3 rounded-full bg-ivory px-7 py-4 text-[10px] text-forest [--btn-fill:var(--color-ember)] hover:text-ivory">
              <WaIcon /> WhatsApp the host
            </a>
            <a href="#inquire" className="btn-lux chapter rounded-full border border-ivory/40 px-7 py-4 text-[10px] [--btn-fill:var(--color-ivory)] hover:text-forest">
              Compose a brief
            </a>
          </div>
        </div>
      </div>
      <div className="mx-auto grid max-w-[1600px] gap-10 px-5 py-14 md:grid-cols-4 md:px-10">
        <div>
          <p className="chapter text-[9px] text-ivory/45">Address</p>
          <p className="mt-3 font-serif text-xl leading-snug">
            Iron Shore, West End
            <br />
            Roatán, Bay Islands, Honduras
          </p>
        </div>
        <div>
          <p className="chapter text-[9px] text-ivory/45">Contact</p>
          <a href={`mailto:${CONTACT.email}`} className="lux-underline mt-3 inline-block font-serif text-xl">{CONTACT.email}</a>
          <p className="mt-1 text-[13px] text-ivory/60">WhatsApp {CONTACT.whatsappDisplay}</p>
        </div>
        <div>
          <p className="chapter text-[9px] text-ivory/45">Explore</p>
          <ul className="mt-3 space-y-1.5 text-[14px]">
            <li><button onClick={() => gallery.open()} className="group flex items-center"><ArrowLabel>Full gallery</ArrowLabel></button></li>
            <li><a href={CONTACT.airbnb} target="_blank" rel="noopener noreferrer" className="group flex items-center"><ArrowLabel>View on Airbnb</ArrowLabel></a></li>
            <li><a href="#architecture" className="group flex items-center"><ArrowLabel>The model</ArrowLabel></a></li>
          </ul>
        </div>
        <div className="md:text-right">
          <p className="chapter text-[9px] text-ivory/45">Coordinates</p>
          <p className="mt-3 font-serif text-xl">16°18′41″N · 86°35′34″W</p>
          <a href="#top" className="chapter lux-underline mt-6 inline-block text-[9px] text-ivory/70">Back to top ↑</a>
        </div>
      </div>
      <p className="chapter border-t border-ivory/10 px-5 py-6 text-center text-[8.5px] text-ivory/35 md:px-10">© {new Date().getFullYear()} Sea La Vie · Oceanfront 3BR · West End, Roatán</p>
    </footer>
  );
}
