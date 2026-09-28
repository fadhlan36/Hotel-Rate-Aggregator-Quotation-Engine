"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, ChevronDown, Compass, Sparkles } from "lucide-react";

export function SiteHeader({ savedQuotes }: { savedQuotes: number }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 16);
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  return (
    <header className={isScrolled ? "topbar is-scrolled" : "topbar"}>
      <a className="brand" href="#top">
        <span className="brand-mark"><Compass size={21} strokeWidth={1.8} /></span>
        <span>SYAFAR TOUR<span className="brand-dot">.</span><small>JOURNEYS, MADE MEANINGFUL</small></span>
      </a>
      <nav id="mobile-navigation" className={menuOpen ? "mobile-nav open" : "mobile-nav"}>
        <a className="nav-active" href="#search" onClick={() => setMenuOpen(false)}>Pilih Hotel</a>
        <a href="#footer" onClick={() => setMenuOpen(false)}>Tentang</a>
      </nav>
      <button className="saved-button" type="button" onClick={() => document.getElementById("quotation")?.scrollIntoView({ behavior: "smooth" })}>
        Quotation <span>{savedQuotes}</span>
      </button>
      <button className={menuOpen ? "mobile-menu is-open" : "mobile-menu"} type="button" aria-label={menuOpen ? "Tutup menu" : "Buka menu"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen((open) => !open)}>
        <ChevronDown size={20} />
      </button>
    </header>
  );
}

export function HeroSection() {
  return (
    <section className="hero" id="top">
      <div className="hero-image" /><div className="hero-shade" />
      <div className="hero-content">
        <div className="eyebrow light"><span /> PERJALANAN IBADAH, DENGAN TENANG</div>
        <h1>Ruang untuk<br />perjalanan yang <i>berarti.</i></h1>
        <p>Temukan penginapan terbaik dekat Tanah Suci dan rencanakan perjalanan Anda, dengan sepenuh hati.</p>
        <a className="hero-link" href="#search">Mulai rencanakan <ArrowRight size={17} /></a>
      </div>
      <div className="hero-note"><Sparkles size={15} /> Disusun untuk setiap langkah perjalanan Anda</div>
      <div className="hero-count"><strong>01</strong><span> — 03</span><div /></div>
    </section>
  );
}

export function ClosingSection() {
  return (
    <section className="closing">
      <div className="closing-icon"><Compass size={24} /></div>
      <p>Setiap perjalanan punya ceritanya sendiri.</p>
      <h2>Semoga perjalanan Anda<br />penuh <i>ketenangan.</i></h2>
      <a href="#search">Jelajahi hotel <ArrowUpRight size={16} /></a>
      <div className="closing-ornament">۞</div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer id="footer">
      <a className="brand footer-brand" href="#top">
        <span className="brand-mark"><Compass size={19} /></span>
        <span>SYAFAR TOUR<span className="brand-dot">.</span><small>JOURNEYS, MADE MEANINGFUL</small></span>
      </a>
      <span>DIRANCANG DENGAN HATI · JAKARTA, INDONESIA</span>
      <span>© 2026 SYAFAR TOUR</span>
    </footer>
  );
}
