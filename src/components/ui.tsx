import { createContext, useContext, type ReactNode, type ElementType, type CSSProperties } from "react";
import { useInView } from "../lib/hooks";
import { img, srcSet, type SectionKey } from "../data/photos";
import { cn } from "../utils/cn";

/* ---------- Gallery context ---------- */
type GalleryCtx = { open: (section?: SectionKey, photoId?: string) => void };
export const GalleryContext = createContext<GalleryCtx>({ open: () => {} });
export const useGallery = () => useContext(GalleryContext);

/* ---------- Reveal ---------- */
export function Reveal({
  children,
  as: Tag = "div",
  className,
  delay = 0,
  clip = false,
  style,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  clip?: boolean;
  style?: CSSProperties;
}) {
  const [ref, inView] = useInView<HTMLElement>();
  return (
    <Tag
      ref={ref}
      className={cn(clip ? "reveal-clip" : "reveal", inView && "is-in", className)}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </Tag>
  );
}

/* ---------- Split line headline (masked line reveal) ---------- */
export function MaskLines({ lines, className, delay = 0, lineClass }: { lines: ReactNode[]; className?: string; delay?: number; lineClass?: string }) {
  const [ref, inView] = useInView<HTMLSpanElement>();
  return (
    <span ref={ref} className={cn("block", className)}>
      {lines.map((l, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <span
            className={cn("block transition-transform duration-[1300ms] ease-[var(--ease-lux)]", lineClass)}
            style={{ transform: inView ? "translateY(0)" : "translateY(108%)", transitionDelay: `${delay + i * 110}ms` }}
          >
            {l}
          </span>
        </span>
      ))}
    </span>
  );
}

/* ---------- Photo ---------- */
export function Photo({
  id,
  alt,
  className,
  sizes = "100vw",
  eager = false,
  style,
  imgClassName,
}: {
  id: string;
  alt: string;
  className?: string;
  sizes?: string;
  eager?: boolean;
  style?: CSSProperties;
  imgClassName?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-forest/10", className)} style={style}>
      <img
        src={img(id, 1200)}
        srcSet={srcSet(id)}
        sizes={sizes}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className={cn("absolute inset-0 h-full w-full object-cover", imgClassName)}
      />
    </div>
  );
}

/* ---------- Chapter label ---------- */
export function Chapter({ n, children, className, light }: { n?: string; children: ReactNode; className?: string; light?: boolean }) {
  return (
    <p className={cn("chapter flex items-center gap-3", light ? "text-ivory/75" : "text-forest/60", className)}>
      {n && <span className={light ? "text-ivory" : "text-ember"}>{n}</span>}
      <span aria-hidden className={cn("h-px w-8", light ? "bg-ivory/40" : "bg-forest/25")} />
      <span>{children}</span>
    </p>
  );
}

/* ---------- Arrow link / button ---------- */
export function ArrowLabel({ children }: { children: ReactNode }) {
  return (
    <>
      <span className="lux-underline">{children}</span>
      <svg aria-hidden viewBox="0 0 12 12" className="arrow-diag ml-2 h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M2 10 10 2M4 2h6v6" />
      </svg>
    </>
  );
}

export function PlusIcon({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("plus-rot relative inline-block h-3 w-3", className)}>
      <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current" />
    </span>
  );
}
