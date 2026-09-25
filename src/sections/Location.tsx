import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useSectionProgress, useIsMobile, smooth, clamp } from "../lib/hooks";
import * as G from "../data/geo";
import { Chapter } from "../components/ui";
import { cn } from "../utils/cn";

const N = G.CHAPTERS.length;
const lg = Math.log;

function viewAt(p: number, mobile: boolean) {
  const t = clamp(p) * (N - 1);
  const i = Math.min(N - 2, Math.floor(t));
  const f = t - i;
  const e = smooth(0.22, 0.86, f);
  const a = G.CHAPTERS[i], b = G.CHAPTERS[i + 1];
  const w0 = mobile ? a.spanM : a.span, w1 = mobile ? b.spanM : b.span;
  const w = Math.exp(lg(w0) + (lg(w1) - lg(w0)) * e);
  const k = w0 === w1 ? e : (w0 - w) / (w0 - w1);
  return { lon: a.lon + (b.lon - a.lon) * k, lat: a.lat + (b.lat - a.lat) * k, span: w };
}
const band = (w: number, min: number, max: number) =>
  smooth(lg(Math.max(min, 1e-6) * 0.6), lg(Math.max(min, 1e-6)), lg(w)) * (1 - smooth(lg(max), lg(max * 1.6), lg(w)));

const dms = (v: number, pos: string, neg: string) => {
  const a = Math.abs(v);
  const d = Math.floor(a);
  const m = Math.floor((a - d) * 60);
  const s = ((a - d) * 3600 - m * 60).toFixed(0).padStart(2, "0");
  return `${d}°${String(m).padStart(2, "0")}′${s}″${v >= 0 ? pos : neg}`;
};

function niceDistance(m: number) {
  const p = Math.pow(10, Math.floor(Math.log10(m)));
  const n = m / p;
  return (n >= 5 ? 5 : n >= 2 ? 2 : 1) * p;
}

export default function Location() {
  const section = useRef<HTMLElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 1200, h: 800 });
  const mobile = useIsMobile();
  const p = useSectionProgress(section);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const v = viewAt(p, mobile);
  const [cx, cy] = G.proj(v.lon, v.lat);
  const vbW = G.spanToUnits(v.span);
  const vbH = (vbW * size.h) / size.w;
  const vb = `${cx - vbW / 2} ${cy - vbH / 2} ${vbW} ${vbH}`;
  const pxPerUnit = size.w / vbW;
  const toScreen = (lon: number, lat: number) => {
    const [x, y] = G.proj(lon, lat);
    return [(x - (cx - vbW / 2)) * pxPerUnit, (y - (cy - vbH / 2)) * pxPerUnit];
  };

  const chapterIdx = Math.min(N - 1, Math.round(clamp(p) * (N - 1)));
  const ch = G.CHAPTERS[chapterIdx];

  const meters = niceDistance((110 / pxPerUnit) * G.METERS_PER_UNIT);
  const barPx = (meters / G.METERS_PER_UNIT) * pxPerUnit;
  const scaleLabel = meters >= 1000 ? `${(meters / 1000).toLocaleString()} km` : `${meters} m`;
  const w = v.span;

  const [hx, hy] = toScreen(G.HOME.lon, G.HOME.lat);
  const homeO = band(w, 0, 4);

  return (
    <section id="location" ref={section} aria-labelledby="loc-title" className="relative bg-forest-deep text-ivory" style={{ height: mobile ? "540svh" : "620vh" }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div ref={box} className="absolute inset-0" role="img" aria-label={`Illustrated map, ${ch.title}. ${ch.copy}`}>
          <svg viewBox={vb} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
            <MapLayers w={w} />
          </svg>
          {/* vignette */}
          <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(18,28,22,.55) 100%)" }} />

          {/* labels */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            {G.LABELS.map((l) => {
              const o = band(w, l.min, l.max);
              if (o < 0.02) return null;
              const [x, y] = toScreen(l.lon, l.lat);
              return (
                <div key={l.id} className="absolute left-0 top-0" style={{ transform: `translate3d(${x}px, ${y}px, 0)`, opacity: o }}>
                  <div className="-translate-x-1/2 -translate-y-1/2 text-center">
                    {l.kind === "sea" ? (
                      <span className="whitespace-nowrap font-serif text-base italic tracking-wide text-forest/60 md:text-xl">{l.name}</span>
                    ) : l.kind === "place" ? (
                      <span className="whitespace-nowrap font-serif text-lg text-forest md:text-2xl">{l.name}</span>
                    ) : (
                      <span className="flex flex-col items-center">
                        <span className="mb-1 h-1.5 w-1.5 rounded-full bg-forest" />
                        <span className="chapter whitespace-nowrap text-[9px] text-forest md:text-[10px]">{l.name}</span>
                        {l.sub && <span className="whitespace-nowrap font-serif text-sm italic text-forest/60">{l.sub}</span>}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {homeO > 0.02 && (
              <div className="absolute left-0 top-0" style={{ transform: `translate3d(${hx}px, ${hy}px, 0)`, opacity: homeO }}>
                <span className="absolute -left-5 -top-5 h-10 w-10 animate-ping rounded-full bg-ember/30 [animation-duration:2.6s]" />
                <span className="absolute -left-[7px] -top-[7px] h-3.5 w-3.5 rounded-full border-2 border-ivory bg-ember shadow" />
                <span className="absolute left-4 top-[-10px] whitespace-nowrap font-serif text-lg italic text-forest md:text-2xl">Sea La Vie</span>
              </div>
            )}
          </div>
        </div>

        {/* instruments */}
        <div className="pointer-events-none absolute right-4 top-20 flex flex-col items-end gap-4 text-forest md:right-10 md:top-28">
          <Compass rot={Math.sin(p * 9) * 6 * (1 - p)} />
          <div className="text-right">
            <p className="chapter text-[9px] text-forest/70" aria-hidden>
              {dms(v.lat, "N", "S")}
            </p>
            <p className="chapter text-[9px] text-forest/70" aria-hidden>
              {dms(v.lon, "E", "W")}
            </p>
          </div>
          <div className="flex flex-col items-end" aria-hidden>
            <div className="flex h-2 items-end border-x border-b border-forest/70" style={{ width: barPx }}>
              <span className="h-full w-1/2 border-r border-forest/70 bg-forest/70" />
            </div>
            <span className="chapter mt-1 text-[9px] text-forest/70">{scaleLabel}</span>
          </div>
        </div>

        {/* chapter rail */}
        <ol className="absolute left-4 top-1/2 hidden -translate-y-1/2 flex-col gap-3 md:left-10 md:flex" aria-label="Map chapters">
          {G.CHAPTERS.map((c, i) => (
            <li key={c.key} className={cn("flex items-center gap-3 transition-all duration-700", i === chapterIdx ? "text-forest" : "text-forest/35")} aria-current={i === chapterIdx ? "step" : undefined}>
              <span className={cn("h-px bg-current transition-all duration-700", i === chapterIdx ? "w-10" : "w-4")} />
              <span className="chapter text-[9px]">{c.n}</span>
            </li>
          ))}
        </ol>

        {/* copy card */}
        <div className={cn("absolute z-10", mobile ? "inset-x-4 bottom-5" : "bottom-12 right-10 w-[420px] lg:right-16")}>
          <div className="relative overflow-hidden rounded-[2px] bg-ivory/90 p-6 text-forest shadow-[0_30px_80px_-40px_rgba(0,0,0,.5)] backdrop-blur-md md:p-9">
            <Chapter n="IV">Location</Chapter>
            <h2 id="loc-title" className="sr-only">
              Location — from the Caribbean to the Iron Shore
            </h2>
            <div key={ch.key} className="animate-fade-in" aria-live="polite">
              <p className="mt-4 font-serif text-sm italic text-ember">
                {ch.n} — {ch.kicker}
              </p>
              <p className="display mt-2 text-[40px] md:text-6xl">{ch.title}</p>
              <p className="mt-3 text-[13.5px] leading-relaxed text-forest/70 md:mt-4 md:text-[14.5px]">{ch.copy}</p>
            </div>
            <div className="mt-5 h-px w-full bg-forest/10">
              <div className="h-full bg-ember transition-[width] duration-300" style={{ width: `${p * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Compass({ rot }: { rot: number }) {
  return (
    <svg viewBox="0 0 64 64" className="h-14 w-14 md:h-16 md:w-16" aria-hidden>
      <circle cx="32" cy="32" r="30" fill="rgba(244,239,230,.6)" stroke="currentColor" strokeOpacity=".35" />
      <circle cx="32" cy="32" r="24" fill="none" stroke="currentColor" strokeOpacity=".2" strokeDasharray="1 3" />
      <g style={{ transform: `rotate(${rot}deg)`, transformOrigin: "32px 32px", transition: "transform .6s var(--ease-lux)" }}>
        <path d="M32 8 36 32 32 56 28 32Z" fill="none" stroke="currentColor" strokeWidth=".8" />
        <path d="M32 8 36 32H28Z" fill="#c07a4f" />
      </g>
      <text x="32" y="6.5" textAnchor="middle" fontSize="6" fill="currentColor" fontFamily="Manrope" letterSpacing="1">
        N
      </text>
    </svg>
  );
}

const MapLayers = memo(function MapLayers({ w }: { w: number }) {
  const paths = useMemo(
    () => ({
      main: G.pathOf(G.MAINLAND),
      fl: G.pathOf(G.FLORIDA),
      cuba: G.pathOf(G.CUBA),
      jam: G.pathOf(G.JAMAICA),
      hisp: G.pathOf(G.HISPANIOLA),
      pr: G.pathOf(G.PUERTO_RICO),
      cay: G.pathOf(G.CAYMAN),
      utila: G.pathOf(G.UTILA),
      guan: G.pathOf(G.GUANAJA),
      roatan: G.pathOf(G.ROATAN),
      road: G.pathOf(G.ROAD, false),
      walk: G.pathOf(G.WALK, false),
      reef: G.pathOf(G.REEF_MESO, false),
    }),
    [],
  );
  const [rtx, rty] = G.proj(-86.523, 16.3168);
  const routes = useMemo(
    () =>
      G.ROUTES.map((r) => {
        const [x0, y0] = G.proj(r.from[0], r.from[1]);
        const [x1, y1] = [rtx, rty];
        const mx = (x0 + x1) / 2, my = (y0 + y1) / 2 - Math.hypot(x1 - x0, y1 - y0) * 0.22;
        return { d: `M${x0} ${y0}Q${mx} ${my} ${x1} ${y1}`, name: r.name };
      }),
    [rtx, rty],
  );
  const ns = { vectorEffect: "non-scaling-stroke" as const };
  const graticule = (step: number, o: number) => {
    if (o < 0.02) return null;
    const lines = [];
    const R = 24;
    const lonC = Math.round(G.HOME.lon / step) * step;
    const latC = Math.round(G.HOME.lat / step) * step;
    const [xa] = G.proj(lonC - R * step, 0), [xb] = G.proj(lonC + R * step, 0);
    const [, ya] = G.proj(0, latC + R * step), [, yb] = G.proj(0, latC - R * step);
    for (let i = -R; i <= R; i++) {
      const [x] = G.proj(lonC + i * step, 0);
      lines.push(<line key={"x" + i} x1={x} x2={x} y1={ya} y2={yb} {...ns} />);
      const [, y] = G.proj(0, latC + i * step);
      lines.push(<line key={"y" + i} x1={xa} x2={xb} y1={y} y2={y} {...ns} />);
    }
    return (
      <g stroke="#1d2b23" strokeOpacity={0.09 * o} strokeWidth="1">
        {lines}
      </g>
    );
  };

  const oCarib = band(w, 3, 80);
  const oBay = band(w, 0.3, 6);
  const oIsland = band(w, 0.004, 1.2);
  const oLocal = band(w, 0, 0.06);
  const oSite = band(w, 0, 0.005);
  const [sx, sy] = [0, 0];

  return (
    <g>
      <defs>
        <radialGradient id="sea" cx="50%" cy="50%" r="80%">
          <stop offset="0%" stopColor="#dbe8e3" />
          <stop offset="100%" stopColor="#b9d0c9" />
        </radialGradient>
        <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#1d2b23" strokeOpacity=".08" strokeWidth="1" {...ns} />
        </pattern>
      </defs>
      <rect x="-400000" y="-400000" width="800000" height="800000" fill="url(#sea)" />
      {graticule(5, band(w, 4, 100))}
      {graticule(0.5, band(w, 0.4, 4))}
      {graticule(0.05, band(w, 0.04, 0.5))}
      {graticule(0.002, band(w, 0.002, 0.04))}

      {/* reef & routes */}
      <path d={paths.reef} fill="none" stroke="#5f8a83" strokeWidth="1.5" strokeDasharray="2 5" opacity={Math.max(oCarib, oBay) * 0.9} {...ns} />
      {routes.map((r) => (
        <path key={r.name} d={r.d} fill="none" stroke="#c07a4f" strokeWidth="1.2" strokeDasharray="5 6" opacity={oCarib} style={{ animation: "dash 2.4s linear infinite" }} {...ns} />
      ))}

      {/* land */}
      <g fill="#f4efe6" stroke="#1d2b23" strokeOpacity=".55" strokeWidth="1" strokeLinejoin="round">
        {[paths.main, paths.fl, paths.cuba, paths.jam, paths.hisp, paths.pr, paths.cay, paths.utila, paths.guan].map((d, i) => (
          <path key={i} d={d} {...ns} />
        ))}
        <path d={paths.roatan} {...ns} />
      </g>
      <path d={paths.roatan} fill="url(#hatch)" opacity={oIsland} />
      {/* ironshore — rocky coastal texture at local zoom */}
      <path d={paths.roatan} fill="none" stroke="#3d3f3a" strokeWidth="5" strokeDasharray="1.5 3.5" strokeLinecap="round" opacity={oLocal * 0.7} {...ns} />
      {/* island reef halo */}
      <path d={paths.roatan} fill="none" stroke="#5f8a83" strokeOpacity=".35" strokeWidth="10" opacity={oIsland * (1 - oLocal)} {...ns} />

      {/* roads & walk */}
      <path d={paths.road} fill="none" stroke="#1d2b23" strokeOpacity=".35" strokeWidth="1.4" opacity={oIsland} {...ns} />
      <path d={paths.walk} fill="none" stroke="#c07a4f" strokeWidth="2.5" strokeDasharray="4 5" strokeLinecap="round" opacity={oLocal} style={{ animation: "dash 1.6s linear infinite" }} {...ns} />

      {/* site plan */}
      <g opacity={oSite} transform={`translate(${sx} ${sy}) rotate(11)`} strokeWidth="1" stroke="#1d2b23">
        <rect x="-2.3" y="-1.8" width="2.1" height="3.6" fill="#e2d8c6" strokeOpacity=".3" {...ns} />
        <rect x="-1.85" y="-1.25" width="1.25" height="2.3" fill="#8fd3c9" strokeOpacity=".6" {...ns} />
        {[-1.4, -0.9, -0.4, 0.1, 0.6].map((y) => (
          <rect key={y} x="-0.52" y={y} width="0.18" height="0.36" fill="#fbf8f2" strokeOpacity=".4" {...ns} />
        ))}
        <circle cx="-2.05" cy="2.2" r="0.38" fill="#c9a877" strokeOpacity=".6" {...ns} />
        <rect x="0" y="-1.75" width="1.45" height="3.5" fill="#f7f3ec" {...ns} />
        <path d="M0 -1.75 0.72 -1.05 0.72 1.05 0 1.75M1.45 -1.75 0.72 -1.05M1.45 1.75 0.72 1.05" fill="none" strokeOpacity=".5" {...ns} />
        <rect x="-0.22" y="-1.75" width="0.22" height="3.5" fill="none" strokeDasharray="2 2" {...ns} />
        <rect x="0.1" y="2.35" width="1.35" height="3.1" fill="#f7f3ec" strokeOpacity=".4" opacity=".6" {...ns} />
        <path d="M-2.8 -0.2 -3.8 -0.2" stroke="#c07a4f" strokeWidth="1.4" {...ns} />
      </g>
    </g>
  );
});
