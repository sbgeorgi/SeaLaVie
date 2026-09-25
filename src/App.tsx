import { useCallback, useEffect, useMemo, useState } from "react";
import Lenis from "lenis";
import { GalleryContext } from "./components/ui";
import Gallery from "./components/Gallery";
import type { SectionKey } from "./data/photos";
import Nav from "./sections/Nav";
import Hero from "./sections/Hero";
import Intro from "./sections/Intro";
import DayStory from "./sections/DayStory";
import Residence from "./sections/Residence";
import Architecture from "./sections/Architecture";
import Aerial from "./sections/Aerial";
import Location from "./sections/Location";
import Practical from "./sections/Practical";
import Services from "./sections/Services";
import Suites from "./sections/Suites";
import Rates from "./sections/Rates";
import Faq from "./sections/Faq";
import Footer from "./sections/Footer";

export default function App() {
  const [gallery, setGallery] = useState<{ open: boolean; section?: SectionKey; photoId?: string }>({ open: false });

  // Weighted smooth scrolling (disabled for reduced motion)
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
      anchors: { offset: 0, duration: 1.6 },
      prevent: (node: HTMLElement) => node.hasAttribute("data-lenis-prevent") || node.id === "mobile-menu",
    });
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, []);

  const open = useCallback((section?: SectionKey, photoId?: string) => setGallery({ open: true, section, photoId }), []);
  const ctx = useMemo(() => ({ open }), [open]);

  return (
    <GalleryContext.Provider value={ctx}>
      <Nav />
      <main id="main" tabIndex={-1} className="focus:outline-none">
        <Hero />
        <Intro />
        <DayStory />
        <Residence />
        <Architecture />
        <Aerial />
        <Location />
        <Practical />
        <Services />
        <Suites />
        <Rates />
        <Faq />
      </main>
      <Footer />
      <Gallery open={gallery.open} section={gallery.section} photoId={gallery.photoId} onClose={() => setGallery({ open: false })} />
    </GalleryContext.Provider>
  );
}
