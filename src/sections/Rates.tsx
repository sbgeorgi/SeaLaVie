import { useMemo, useRef, useState } from "react";
import { TIERS, EXTRAS, OCCASIONS, CONTACT } from "../data/content";
import { Chapter, MaskLines, Reveal } from "../components/ui";
import { cn } from "../utils/cn";

const fmt = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const fmtDate = (s: string) => (s ? new Date(s + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : "—");
const today = () => new Date().toISOString().slice(0, 10);

type Brief = {
  name: string;
  email: string;
  arrive: string;
  depart: string;
  guests: number;
  occasion: string[];
  tier: string;
  extras: string[];
  notes: string;
};

export default function Rates() {
  const [b, setB] = useState<Brief>({ name: "", email: "", arrive: "", depart: "", guests: 4, occasion: [], tier: "signature", extras: ["late"], notes: "" });
  const [review, setReview] = useState(false);
  const [status, setStatus] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const briefRef = useRef<HTMLDivElement>(null);
  const set = <K extends keyof Brief>(k: K, v: Brief[K]) => setB((o) => ({ ...o, [k]: v }));
  const toggle = (k: "occasion" | "extras", v: string) => setB((o) => ({ ...o, [k]: o[k].includes(v) ? o[k].filter((x) => x !== v) : [...o[k], v] }));

  const nights = useMemo(() => {
    if (!b.arrive || !b.depart) return 0;
    const d = (new Date(b.depart).getTime() - new Date(b.arrive).getTime()) / 86400000;
    return d > 0 ? Math.round(d) : 0;
  }, [b.arrive, b.depart]);
  const tier = TIERS.find((t) => t.id === b.tier)!;
  const extras = EXTRAS.filter((e) => b.extras.includes(e.id));
  const n = nights || 7;
  const base = tier.unit === "month" ? (Math.max(n, 28) / 30) * tier.rate : n * tier.rate;
  const extrasTotal = extras.reduce((a, e) => a + (e.per === "day" ? e.price * n : e.per === "trip" ? e.price * 2 : e.price), 0);
  const total = base + extrasTotal;
  const dateError = b.arrive && b.depart && nights <= 0 ? "Departure must be after arrival." : "";

  const text = [
    "SEA LA VIE — STAY BRIEF",
    "Oceanfront residence · Iron Shore, West End, Roatán",
    "",
    `Guest: ${b.name || "—"}${b.email ? ` <${b.email}>` : ""}`,
    `Dates: ${fmtDate(b.arrive)} → ${fmtDate(b.depart)}${nights ? ` (${nights} night${nights > 1 ? "s" : ""})` : ""}`,
    `Party: ${b.guests} guest${b.guests > 1 ? "s" : ""}${b.occasion.length ? ` · ${b.occasion.join(", ")}` : ""}`,
    `Tier: ${tier.name} — ${fmt(tier.rate)}/${tier.unit}`,
    `Extras: ${extras.length ? extras.map((e) => `${e.label}${e.price ? ` (${fmt(e.price)}/${e.per})` : ` (${e.per})`}`).join("; ") : "None"}`,
    `Indicative total: ${fmt(total)}${nights ? "" : " (based on 7 nights)"} — before taxes, fees & electricity ($0.42/kWh)`,
    b.notes ? `\nNotes: ${b.notes}` : "",
  ]
    .filter((l) => l !== "")
    .join("\n");

  const announce = (s: string) => {
    setStatus(s);
    window.setTimeout(() => setStatus(""), 2600);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      announce("Brief copied to clipboard");
    } catch {
      announce("Copy unavailable — select the text to copy");
    }
  };
  const download = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    a.download = `sea-la-vie-brief${b.arrive ? "-" + b.arrive : ""}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
    announce("Brief downloaded");
  };
  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Sea La Vie — Stay brief", text });
      } catch {
        /* dismissed */
      }
    } else copy();
  };
  const mail = `mailto:${CONTACT.email}?subject=${encodeURIComponent("Stay brief — Sea La Vie")}&body=${encodeURIComponent(text)}`;
  const wa = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;

  const compose = (e: React.FormEvent) => {
    e.preventDefault();
    if (dateError) return;
    setReview(true);
    announce("Your brief is ready — review, then send");
    requestAnimationFrame(() => briefRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
    briefRef.current?.focus({ preventScroll: true });
  };
  const edit = () => {
    setReview(false);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    formRef.current?.querySelector<HTMLInputElement>("input")?.focus({ preventScroll: true });
  };

  const label = "chapter text-[9px] text-forest/55";
  const input =
    "mt-2 w-full border-0 border-b border-forest/20 bg-transparent px-0 py-3 font-serif text-xl text-forest placeholder:text-forest/30 transition-colors duration-500 focus:border-forest focus:outline-none focus:ring-0 focus-visible:outline-none";

  return (
    <>
      {/* ---------- Tiers ---------- */}
      <section id="rates" aria-labelledby="rates-title" className="bg-ivory px-5 py-28 md:px-10 md:py-40">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid gap-8 md:grid-cols-12">
            <div className="md:col-span-7">
              <Chapter n="VIII">Rates</Chapter>
              <h2 id="rates-title" className="display mt-8 text-[54px] text-forest sm:text-7xl lg:text-[112px]">
                <MaskLines lines={["Three ways", <em key="e">to stay.</em>]} />
              </h2>
            </div>
            <Reveal className="self-end md:col-span-4 md:col-start-9">
              <p className="text-[14.5px] leading-relaxed text-forest/65">Indicative rates for the entire residence. Final pricing is confirmed against your dates — seasonality, length of stay and taxes apply.</p>
            </Reveal>
          </div>
          <div role="radiogroup" aria-label="Choose a tier" className="mt-16 grid gap-5 md:mt-24 md:grid-cols-3">
            {TIERS.map((t, i) => {
              const sel = b.tier === t.id;
              return (
                <Reveal key={t.id} delay={i * 110}>
                  <button
                    role="radio"
                    aria-checked={sel}
                    onClick={() => set("tier", t.id)}
                    className={cn(
                      "group relative flex h-full w-full flex-col p-7 text-left transition-all duration-700 ease-[var(--ease-lux)] md:p-9",
                      sel ? "bg-forest text-ivory shadow-[0_40px_80px_-40px_rgba(18,28,22,.6)]" : "bg-paper text-forest hover:-translate-y-1.5",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn("chapter text-[9px]", sel ? "text-seaglass" : "text-ember")}>{t.featured ? "Most requested" : t.min}</span>
                      <span className={cn("grid h-6 w-6 place-items-center rounded-full border transition-colors", sel ? "border-ivory" : "border-forest/30")}>
                        <span className={cn("h-2 w-2 rounded-full transition-transform duration-500", sel ? "scale-100 bg-ivory" : "scale-0 bg-forest")} />
                      </span>
                    </div>
                    <h3 className="display mt-8 text-5xl">{t.name}</h3>
                    <p className={cn("mt-3 text-[13.5px] leading-relaxed", sel ? "text-ivory/70" : "text-forest/65")}>{t.blurb}</p>
                    <p className="mt-8 flex items-baseline gap-2">
                      <span className="chapter text-[9px] opacity-60">from</span>
                      <span className="display text-6xl">{fmt(t.rate)}</span>
                      <span className="text-[12px] opacity-60">/ {t.unit}</span>
                    </p>
                    <ul className={cn("mt-8 space-y-2.5 border-t pt-6", sel ? "border-ivory/15" : "border-forest/10")}>
                      {t.includes.map((x) => (
                        <li key={x} className="flex items-center gap-3 text-[13px]">
                          <span aria-hidden className={cn("h-px w-3", sel ? "bg-seaglass" : "bg-sage")} />
                          {x}
                        </li>
                      ))}
                    </ul>
                  </button>
                </Reveal>
              );
            })}
          </div>
          <p className="mt-6 text-[12px] text-forest/50">Electricity is metered separately at $0.42/kWh and settled before departure.</p>
        </div>
      </section>

      {/* ---------- Brief builder ---------- */}
      <section id="inquire" aria-labelledby="inq-title" className="bg-paper px-5 py-28 md:px-10 md:py-40">
        <div className="mx-auto grid max-w-[1500px] gap-16 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <Chapter n="IX">Inquire</Chapter>
            <h2 id="inq-title" className="display mt-8 text-[54px] text-forest sm:text-7xl lg:text-[96px]">
              <MaskLines lines={["Compose", <em key="e">your stay.</em>]} />
            </h2>
            <p className="mt-6 max-w-md text-[14.5px] leading-relaxed text-forest/65">Not a form — a brief. Shape the stay you have in mind, then send it however you prefer: WhatsApp, email, or keep it for later.</p>

            <form ref={formRef} onSubmit={compose} className="mt-14 space-y-12" noValidate>
              <fieldset>
                <legend className="font-serif text-2xl italic text-forest">
                  <span className="chapter mr-3 align-middle text-[9px] not-italic text-ember">01</span>When
                </legend>
                <div className="mt-4 grid gap-6 sm:grid-cols-2">
                  <label className="block">
                    <span className={label}>Arrival</span>
                    <input type="date" min={today()} value={b.arrive} onChange={(e) => set("arrive", e.target.value)} className={input} />
                  </label>
                  <label className="block">
                    <span className={label}>Departure</span>
                    <input type="date" min={b.arrive || today()} value={b.depart} onChange={(e) => set("depart", e.target.value)} className={input} aria-invalid={!!dateError} aria-describedby="date-err" />
                  </label>
                </div>
                <p id="date-err" role="alert" className="mt-2 text-[12px] text-ember">
                  {dateError}
                </p>
              </fieldset>

              <fieldset>
                <legend className="font-serif text-2xl italic text-forest">
                  <span className="chapter mr-3 align-middle text-[9px] not-italic text-ember">02</span>Who
                </legend>
                <div className="mt-5 flex items-center gap-5">
                  <span className={label} id="guests-l">
                    Guests
                  </span>
                  <div className="flex items-center gap-1" role="group" aria-labelledby="guests-l">
                    <button type="button" onClick={() => set("guests", Math.max(1, b.guests - 1))} aria-label="Fewer guests" className="grid h-11 w-11 place-items-center rounded-full border border-forest/20 text-forest transition-colors hover:border-forest">
                      −
                    </button>
                    <output aria-live="polite" className="display w-14 text-center text-4xl text-forest">
                      {b.guests}
                    </output>
                    <button type="button" onClick={() => set("guests", Math.min(6, b.guests + 1))} aria-label="More guests" className="grid h-11 w-11 place-items-center rounded-full border border-forest/20 text-forest transition-colors hover:border-forest">
                      +
                    </button>
                  </div>
                  <span className="text-[12px] text-forest/45">max 6</span>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {OCCASIONS.map((o) => (
                    <Chip key={o} on={b.occasion.includes(o)} onClick={() => toggle("occasion", o)}>
                      {o}
                    </Chip>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="font-serif text-2xl italic text-forest">
                  <span className="chapter mr-3 align-middle text-[9px] not-italic text-ember">03</span>Tier
                </legend>
                <div className="mt-5 grid gap-2 sm:grid-cols-3">
                  {TIERS.map((t) => (
                    <label key={t.id} className={cn("cursor-pointer border px-4 py-4 transition-all duration-500 has-[:focus-visible]:outline has-[:focus-visible]:outline-1 has-[:focus-visible]:outline-ember", b.tier === t.id ? "border-forest bg-forest text-ivory" : "border-forest/15 text-forest hover:border-forest/50")}>
                      <input type="radio" name="tier" value={t.id} checked={b.tier === t.id} onChange={() => set("tier", t.id)} className="sr-only" />
                      <span className="block font-serif text-xl">{t.name}</span>
                      <span className="text-[12px] opacity-70">
                        {fmt(t.rate)} / {t.unit}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="font-serif text-2xl italic text-forest">
                  <span className="chapter mr-3 align-middle text-[9px] not-italic text-ember">04</span>Extras
                </legend>
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  {EXTRAS.map((e) => {
                    const on = b.extras.includes(e.id);
                    return (
                      <label key={e.id} className={cn("flex cursor-pointer items-center justify-between gap-3 border px-4 py-3.5 transition-all duration-500 has-[:focus-visible]:outline has-[:focus-visible]:outline-1 has-[:focus-visible]:outline-ember", on ? "border-forest bg-forest/[0.04]" : "border-forest/15 hover:border-forest/40")}>
                        <input type="checkbox" checked={on} onChange={() => toggle("extras", e.id)} className="sr-only" />
                        <span className="flex items-center gap-3">
                          <span aria-hidden className={cn("grid h-4 w-4 place-items-center border transition-colors", on ? "border-forest bg-forest" : "border-forest/30")}>
                            {on && <svg viewBox="0 0 10 10" className="h-2.5 w-2.5 text-ivory" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m2 5 2 2 4-4" /></svg>}
                          </span>
                          <span className="text-[13.5px] text-forest">{e.label}</span>
                        </span>
                        <span className="text-[11px] text-forest/50">{e.price ? `${fmt(e.price)}/${e.per}` : e.per}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset>
                <legend className="font-serif text-2xl italic text-forest">
                  <span className="chapter mr-3 align-middle text-[9px] not-italic text-ember">05</span>You
                </legend>
                <div className="mt-4 grid gap-6 sm:grid-cols-2">
                  <label className="block">
                    <span className={label}>Name</span>
                    <input value={b.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" placeholder="Your name" className={input} />
                  </label>
                  <label className="block">
                    <span className={label}>Email</span>
                    <input type="email" value={b.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" placeholder="you@domain.com" className={input} />
                  </label>
                </div>
                <label className="mt-6 block">
                  <span className={label}>Anything else</span>
                  <textarea value={b.notes} onChange={(e) => set("notes", e.target.value)} rows={3} placeholder="Celebrations, flight times, dive plans…" className={cn(input, "resize-none text-lg")} />
                </label>
              </fieldset>

              <button type="submit" className="btn-lux group chapter flex w-full items-center justify-between rounded-full border border-forest px-7 py-5 text-[10px] text-forest hover:text-ivory sm:w-auto sm:gap-10">
                Compose brief
                <svg aria-hidden viewBox="0 0 12 12" className="arrow-diag h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M2 10 10 2M4 2h6v6" /></svg>
              </button>
            </form>
          </div>

          {/* live brief document */}
          <div className="lg:col-span-5 lg:col-start-8">
            <div className="lg:sticky lg:top-28">
              <div
                ref={briefRef}
                tabIndex={-1}
                aria-label="Your stay brief"
                className={cn(
                  "relative bg-ivory p-7 shadow-[0_50px_100px_-50px_rgba(18,28,22,.45)] transition-all duration-700 ease-[var(--ease-lux)] focus:outline-none md:p-10",
                  review ? "ring-1 ring-forest" : "",
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="chapter text-[9px] text-ember">Stay brief</p>
                    <p className="mt-2 font-serif text-3xl text-forest">
                      Sea <em>La</em> Vie
                    </p>
                  </div>
                  <p className="chapter text-right text-[8.5px] leading-relaxed text-forest/45">
                    Iron Shore
                    <br />
                    West End · Roatán
                  </p>
                </div>
                <dl className="mt-8 divide-y divide-forest/10 border-y border-forest/10 text-[13.5px]">
                  <Row k="Guest" v={b.name || "—"} />
                  <Row k="Dates" v={b.arrive || b.depart ? `${fmtDate(b.arrive)} → ${fmtDate(b.depart)}` : "Choose your dates"} sub={nights ? `${nights} night${nights > 1 ? "s" : ""}` : undefined} />
                  <Row k="Party" v={`${b.guests} guest${b.guests > 1 ? "s" : ""}`} sub={b.occasion.join(" · ") || undefined} />
                  <Row k="Tier" v={tier.name} sub={`${fmt(tier.rate)} / ${tier.unit}`} />
                  <Row k="Extras" v={extras.length ? extras.map((e) => e.label).join(", ") : "None"} />
                  {b.notes && <Row k="Notes" v={b.notes} />}
                </dl>
                <div className="mt-8 flex items-end justify-between">
                  <div>
                    <p className="chapter text-[9px] text-forest/50">Indicative total</p>
                    <p className="text-[11px] text-forest/45">{nights ? `${nights} nights` : "based on 7 nights"} · before taxes</p>
                  </div>
                  <p className="display text-6xl text-forest tabular-nums">{fmt(total)}</p>
                </div>

                <div className={cn("grid transition-[grid-template-rows] duration-700 ease-[var(--ease-lux)]")} style={{ gridTemplateRows: review ? "1fr" : "0fr" }}>
                  <div className="overflow-hidden">
                    <div className="mt-8 border-t border-forest/10 pt-6">
                      <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-lux group chapter flex w-full items-center justify-between rounded-full bg-forest px-6 py-4 text-[10px] text-ivory [--btn-fill:var(--color-ember)]">
                        <span className="flex items-center gap-3">
                          <WaIcon /> Send via WhatsApp
                        </span>
                        <svg aria-hidden viewBox="0 0 12 12" className="arrow-diag h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M2 10 10 2M4 2h6v6" /></svg>
                      </a>
                      <div className="mt-3 grid grid-cols-5 gap-2">
                        <Action onClick={copy} label="Copy">⧉</Action>
                        <Action onClick={download} label="Download">↓</Action>
                        <Action href={mail} label="Email">✉</Action>
                        <Action onClick={share} label="Share">↗</Action>
                        <Action onClick={edit} label="Edit">✎</Action>
                      </div>
                    </div>
                  </div>
                </div>
                {!review && <p className="mt-6 text-[12px] text-forest/50">Updates as you compose. Press “Compose brief” to send.</p>}
                <p role="status" aria-live="polite" className="chapter mt-4 h-4 text-[9px] text-ember">
                  {status}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Row({ k, v, sub }: { k: string; v: string; sub?: string }) {
  return (
    <div className="grid grid-cols-[72px_1fr] gap-4 py-3.5">
      <dt className="chapter pt-1 text-[8.5px] text-forest/45">{k}</dt>
      <dd className="text-forest">
        <span className="font-serif text-[17px] leading-snug">{v}</span>
        {sub && <span className="block text-[11.5px] text-forest/50">{sub}</span>}
      </dd>
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on} className={cn("rounded-full border px-4 py-2.5 text-[12.5px] transition-all duration-500 ease-[var(--ease-lux)]", on ? "border-forest bg-forest text-ivory" : "border-forest/20 text-forest hover:border-forest/60")}>
      {children}
    </button>
  );
}

function Action({ onClick, href, label, children }: { onClick?: () => void; href?: string; label: string; children: React.ReactNode }) {
  const cls = "group flex flex-col items-center gap-1.5 rounded-sm border border-forest/15 py-3 text-forest transition-all duration-500 hover:-translate-y-0.5 hover:border-forest";
  const inner = (
    <>
      <span aria-hidden className="text-base leading-none">{children}</span>
      <span className="chapter text-[8px]">{label}</span>
    </>
  );
  return href ? (
    <a href={href} className={cls}>
      {inner}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

export function WaIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.8-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.4-.3Z" />
    </svg>
  );
}
