import { useEffect, useRef, useState } from "react";
import { Chapter } from "../components/ui";
import { clamp, lerp, scrollToY, smooth, useIsMobile, useSectionProgress } from "../lib/hooks";
import * as G from "../data/geo";
import { cn } from "../utils/cn";

// The first four stops follow the canvas map journey in MVP_example. The final
// stop replaces its concept footprint with Sea La Vie art from IslandJourney.
// This illustrative shoreline vertex sits immediately north of Half Moon Bay.
const SEA_LA_VIE_POINT = [-86.5964, 16.309] as const;
const STOPS = [
  { name: "Caribbean", number: "01 / THE REGION", title: "Somewhere in the Caribbean.", copy: "A different pace, just beyond the everyday. Follow the journey toward Roatán.", center: [-87.3, 17], width: 1250 },
  { name: "Bay Islands", number: "02 / THE ARCHIPELAGO", title: "The Bay Islands.", copy: "Utila, Roatán and Guanaja: three island worlds beside the Mesoamerican Reef.", center: [-86.47, 16.36], width: 190 },
  { name: "Roatán", number: "03 / THE ISLAND", title: "Beautifully, Roatán.", copy: "A long ribbon of green, fringed with reef. Your own corner of the western Caribbean.", center: [-86.4, 16.365], width: 66 },
  { name: "West End", number: "04 / THE NEIGHBOURHOOD", title: "West End, a world away.", copy: "The village, beach and dive shops are an easy walk from the quieter coast.", center: SEA_LA_VIE_POINT, width: 5.5 },
  { name: "Sea La Vie", number: "05 / YOUR ARRIVAL", title: "Sea La Vie.", copy: "The oceanfront home, pool and sunset patio. Your journey has found its place.", center: SEA_LA_VIE_POINT, width: 0.2 },
] as const;

type Point = readonly [number, number];
const KM_LAT = 111.32;
const KM_LON = KM_LAT * Math.cos((G.HOME.lat * Math.PI) / 180);
const LAND = [G.MAINLAND, G.FLORIDA, G.CUBA, G.JAMAICA, G.HISPANIOLA, G.PUERTO_RICO, G.CAYMAN, G.UTILA, G.GUANAJA, G.ROATAN];

function drawMap(canvas: HTMLCanvasElement, progress: number, mobile: boolean) {
  const box = canvas.getBoundingClientRect();
  if (!box.width || !box.height) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const pixelWidth = Math.round(box.width * dpr);
  const pixelHeight = Math.round(box.height * dpr);
  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) { canvas.width = pixelWidth; canvas.height = pixelHeight; }
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const width = box.width, height = box.height;
  const t = clamp(progress, 0, 0.75) * 4;
  const segment = Math.min(2, Math.floor(t));
  const local = t - segment;
  const blend = smooth(0.12, 0.9, local);
  const a = STOPS[segment], b = STOPS[segment + 1];
  const lon = lerp(a.center[0], b.center[0], blend);
  const lat = lerp(a.center[1], b.center[1], blend);
  const widthKm = Math.exp(lerp(Math.log(a.width), Math.log(b.width), blend));
  const scale = (width * (mobile ? 0.93 : 0.63)) / widthKm;
  const originX = width * (mobile ? 0.5 : 0.66);
  const originY = height * (mobile ? 0.38 : 0.47);
  const project = ([x, y]: Point): [number, number] => [originX + (x - lon) * KM_LON * scale, originY - (y - lat) * KM_LAT * scale];

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#dbe8e3";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#a9c0b8";
  for (let x = 16; x < width; x += 28) for (let y = 16; y < height; y += 28) { ctx.globalAlpha = 0.3; ctx.fillRect(x, y, 1, 1); }
  ctx.globalAlpha = 1;

  const lonMargin = width / (KM_LON * scale), latMargin = height / (KM_LAT * scale);
  const isVisible = (ring: Point[]) => ring.some(([x, y]) => Math.abs(x - lon) < lonMargin * 1.2 && Math.abs(y - lat) < latMargin * 1.2);
  const trace = (points: Point[], close = true) => {
    ctx.beginPath();
    points.forEach((point, i) => { const [x, y] = project(point); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
    if (close) ctx.closePath();
  };
  LAND.filter((ring) => isVisible(ring)).forEach((ring) => { trace(ring); ctx.lineJoin = "round"; ctx.lineWidth = 24; ctx.strokeStyle = "#cddfd0"; ctx.stroke(); });
  LAND.filter((ring) => isVisible(ring)).forEach((ring) => { trace(ring); ctx.lineWidth = 10; ctx.strokeStyle = "#e8eadd"; ctx.stroke(); ctx.fillStyle = "#d5ddca"; ctx.fill(); ctx.lineWidth = 0.8; ctx.strokeStyle = "#97aa98"; ctx.stroke(); });

  if (widthKm < 90) {
    trace(G.ROAD, false); ctx.lineWidth = 1.5; ctx.strokeStyle = "#657e6d"; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
  }
  if (widthKm < 9) {
    trace(G.WALK, false); ctx.lineWidth = 2; ctx.strokeStyle = "#c07a4f"; ctx.setLineDash([5, 5]); ctx.stroke(); ctx.setLineDash([]);
  }

  const label = (value: string, point: Point, font = "11px Manrope, sans-serif", color = "#526b5c", dot = false) => {
    const [x, initialY] = project(point);
    let y = initialY;
    if (x < 16 || x > width - 16 || y < 20 || y > height - 20) return;
    ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = font; ctx.fillStyle = color;
    if (dot) { ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill(); y += 17; }
    ctx.lineWidth = 4; ctx.strokeStyle = "#e5ede4"; ctx.strokeText(value, x, y); ctx.fillText(value, x, y); ctx.restore();
  };
  if (widthKm > 320) {
    label("MEXICO", [-89.1, 19.5]); label("BELIZE", [-88.65, 17.2]); label("HONDURAS", [-86.65, 14.8]); label("CUBA", [-81.7, 22.3]);
    label("Caribbean Sea", [-84.6, 18.7], "italic 24px Georgia, serif", "#829c90");
  } else if (widthKm > 80) {
    label("UTILA", [-86.93, 16.13], undefined, undefined, true); label("ROATÁN", [-86.39, 16.43], "13px Manrope, sans-serif", undefined, true);
    label("GUANAJA", [-85.86, 16.5], undefined, undefined, true); label("La Ceiba", [-86.792, 15.779], undefined, undefined, true);
    label("The Bay Islands", [-86.45, 16.7], "italic 22px Georgia, serif", "#829c90");
  } else if (widthKm > 9) {
    label("Roatán", [-86.43, 16.402], "italic 29px Georgia, serif", "#607d6b");
    label("West End", [-86.595, 16.305], undefined, undefined, true); label("French Harbour", [-86.454, 16.353], undefined, undefined, true);
    label("Caribbean Sea", [-86.49, 16.24], "italic 22px Georgia, serif", "#829c90");
  } else {
    label("West End", [-86.595, 16.305], undefined, undefined, true);
    label("Half Moon Bay", [-86.5968, 16.3072], undefined, undefined, true);
  }
  const [px, py] = project(SEA_LA_VIE_POINT);
  if (px > -40 && px < width + 40 && py > -40 && py < height + 40) {
    ctx.save(); ctx.strokeStyle = "#c07a4f"; ctx.fillStyle = "#1d2b23"; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.arc(px, py, widthKm < 9 ? 9 : 15, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    if (widthKm < 9) label("Sea La Vie", [SEA_LA_VIE_POINT[0], SEA_LA_VIE_POINT[1] + 0.001], "italic 22px Georgia, serif", "#1d2b23");
  }
}

export default function Location() {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [sizeTick, setSizeTick] = useState(0);
  const mobile = useIsMobile();
  const progress = useSectionProgress(section);
  const active = Math.min(4, Math.round(progress * 4));
  const stop = STOPS[active];
  const finalOpacity = smooth(0.8, 0.91, progress);

  useEffect(() => {
    const node = canvas.current;
    if (!node) return;
    const observer = new ResizeObserver(() => setSizeTick((tick) => tick + 1));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useEffect(() => { if (canvas.current) drawMap(canvas.current, progress, mobile); }, [progress, mobile, sizeTick]);

  const goTo = (index: number) => {
    const node = section.current;
    if (!node) return;
    const top = node.getBoundingClientRect().top + window.scrollY;
    scrollToY(top + (node.offsetHeight - window.innerHeight) * (index / 4));
  };

  return (
    <section id="location" ref={section} aria-labelledby="loc-title" className="relative bg-seaglass" style={{ height: mobile ? "480svh" : "520vh" }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <canvas ref={canvas} className="absolute inset-0 h-full w-full" role="img" aria-label={`Illustrated map journey: ${stop.name}`} />
        <div className="pointer-events-none absolute inset-0 hidden md:block" style={{ background: "linear-gradient(90deg, rgba(244,239,230,.97), rgba(244,239,230,.89) 27%, transparent 58%)" }} />
        <div className="pointer-events-none absolute inset-0 md:hidden" style={{ background: "linear-gradient(0deg, rgba(244,239,230,.7), transparent 70%)" }} />
        <div className="pointer-events-none absolute inset-x-0 top-[8svh] h-[50svh] transition-opacity duration-700 md:inset-y-0 md:left-[38%] md:right-0 md:h-full" style={{ opacity: finalOpacity }} aria-hidden><SeaLaVieFinalMap /></div>

        <div className="pointer-events-none absolute right-5 top-20 hidden text-center text-forest/65 md:block" aria-hidden>
          <span className="chapter text-[9px]">N</span>
          <svg viewBox="0 0 30 45" className="mt-1 h-11 w-8"><path d="M15 0 26 37 15 30 4 37Z" fill="none" stroke="currentColor" strokeWidth="1" /><path d="M15 0v30L4 37Z" fill="currentColor" /></svg>
        </div>

        <div className="absolute inset-x-4 bottom-[7.5rem] max-w-md border border-forest/10 bg-ivory/95 p-5 text-forest shadow-[0_20px_50px_-35px_rgba(18,28,22,.6)] backdrop-blur-sm md:inset-x-auto md:bottom-auto md:left-[6vw] md:top-1/2 md:w-[34vw] md:max-w-[500px] md:-translate-y-1/2 md:border-0 md:bg-transparent md:p-0 md:shadow-none">
          <Chapter n="IV">A Sense of Place</Chapter>
          <h2 id="loc-title" className="display mt-3 hidden text-[42px] md:block md:text-[58px] lg:text-[74px]">Not just an address.<br /><em>A little escape.</em></h2>
          <div key={stop.number} className="animate-fade-in" aria-live="polite" aria-atomic="true">
            <p className="chapter mt-4 text-[9px] text-ember md:mt-10">{stop.number}</p>
            <h3 className="display mt-2 text-[37px] md:text-[48px]">{stop.title}</h3>
            <p className="mt-3 max-w-sm text-[12px] leading-relaxed text-forest/70 md:mt-5 md:text-[14px]">{stop.copy}</p>
          </div>
          <p className="chapter mt-4 hidden text-[9px] text-forest/45 md:block">16.3090° N / 86.5964° W · illustrative</p>
        </div>

        <div className="absolute inset-x-0 bottom-0 border-t border-forest/10 bg-ivory/95 px-4 pb-4 pt-3 backdrop-blur-sm md:px-[6vw] md:pb-6 md:pt-5">
          <nav className="grid grid-cols-5 gap-1 md:gap-5" aria-label="Choose a stage of the map journey">
            {STOPS.map((item, index) => <button key={item.name} onClick={() => goTo(index)} aria-pressed={active === index} className={cn("group min-w-0 border-t pt-2 text-left transition-colors md:pt-3", active === index ? "border-forest text-forest" : "border-forest/20 text-forest/45 hover:text-forest")}><span className="block font-serif text-lg italic text-ember md:text-2xl">0{index + 1}</span><span className="chapter mt-1 block truncate text-[8px] tracking-[0.08em] md:text-[10px]">{item.name}</span></button>)}
          </nav>
          <p className="mt-3 hidden text-[9px] text-forest/45 md:block">Illustrative journey based on island geography. The Sea La Vie site visual is not a navigation map.</p>
        </div>
      </div>
    </section>
  );
}

/** Sea La Vie ending adapted from luxury-scroll-based-villa-website/IslandJourney. */
function SeaLaVieFinalMap() {
  return (
    <svg viewBox="0 0 900 650" className="h-full w-full" role="img" aria-label="Illustration of Sea La Vie on the coast, with two buildings and an oceanfront pool">
      <defs><pattern id="sea-la-vie-grid" width="75" height="75" patternUnits="userSpaceOnUse"><path d="M75 0H0v75" fill="none" stroke="#829c90" strokeWidth=".4" opacity=".26" /></pattern></defs>
      <rect width="900" height="650" fill="#dbe8e3" /><rect width="900" height="650" fill="url(#sea-la-vie-grid)" />
      <path d="M121 0Q99 131 240 202L275 242 309 280 320 322 371 350 397 408 448 438 513 450 561 435 633 444 707 416 767 380 782 323 807 267 900 226V0Z" fill="#d4ddcd" stroke="#718e7b" strokeWidth="1.2" />
      <path d="M238 211 287 278 311 336 359 370 391 425 445 460 512 471 564 458 638 466 717 437 781 396 801 332 827 280 900 249M252 213 298 266 334 315 384 347 414 391 456 424 512 437 565 420 630 429 699 401 747 367 762 312 786 260" fill="none" stroke="#7f9d8d" strokeWidth="1" opacity=".7" />
      <g transform="translate(371 197) rotate(-20)">
        <path d="M0 0h96v131H0zM159 14h96v131h-96z" fill="#567868" stroke="#d4ddcd" strokeWidth="1.5" />
        <path d="M8 10h80v110H8zM167 24h80v110h-80z" fill="none" stroke="#d4ddcd" strokeWidth=".8" />
        <path d="M111 123h41v78h-41z" fill="#7bafa5" stroke="#f4efe6" strokeWidth="2" />
        <path d="M-12 155h79v42h-79zM197 179h47v38h-47z" fill="none" stroke="#d4ddcd" strokeWidth=".8" />
      </g>
      <g fill="#1d2b23" stroke="#1d2b23"><circle cx="445" cy="246" r="5" /><circle cx="445" cy="246" r="15" fill="none" strokeWidth=".8" /><circle cx="445" cy="246" r="25" fill="none" strokeWidth=".5" opacity=".5" /><path d="M454 237 473 217h75" fill="none" strokeWidth=".8" /></g>
      <text x="477" y="210" fill="#1d2b23" fontFamily="Cormorant Garamond, Georgia, serif" fontSize="27" fontStyle="italic">Sea La Vie</text>
      <text x="207" y="500" fill="#658579" fontFamily="Cormorant Garamond, Georgia, serif" fontSize="34" fontStyle="italic">Home, by the sea.</text>
      <text x="610" y="366" fill="#526b5c" fontFamily="Manrope, sans-serif" fontSize="11" letterSpacing="2">OCEANFRONT POOL</text>
      <path d="M530 344h65" fill="none" stroke="#7f9d8d" strokeWidth="1" />
    </svg>
  );
}
