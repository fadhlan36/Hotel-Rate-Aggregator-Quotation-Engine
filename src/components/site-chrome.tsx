"use client";

import { useEffect, useState } from "react";
import {
  ChevronDown,
  Compass,
  X,
} from "lucide-react";

type SavedQuotation = {
  id: string;
  hotel: { name: string };
  city: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  roomCount: number;
  roomType: string;
  sellingPriceIdr: string | number;
};

export function SiteHeader({ savedQuotes }: { savedQuotes: number }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [savedItems, setSavedItems] = useState<SavedQuotation[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [savedError, setSavedError] = useState("");

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

  useEffect(() => {
    if (!savedOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSavedOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [savedOpen]);

  async function openSavedQuotes() {
    setMenuOpen(false);
    setSavedOpen(true);
    setSavedLoading(true);
    setSavedError("");
    try {
      const response = await fetch("/api/quotations", { cache: "no-store" });
      const data = await response.json() as { quotations?: SavedQuotation[]; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Quotation tersimpan belum dapat dimuat.");
      setSavedItems(data.quotations ?? []);
      setSavedError(data.error ?? "");
    } catch (cause) {
      setSavedError(cause instanceof Error ? cause.message : "Quotation tersimpan belum dapat dimuat.");
    } finally {
      setSavedLoading(false);
    }
  }

  function goToQuotation() {
    setMenuOpen(false);
    const target = document.getElementById("quotation") ?? document.getElementById("search");
    target?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <header className={isScrolled ? "topbar is-scrolled" : "topbar"}>
      <a className="brand" href="#top">
        <span className="brand-mark"><Compass size={21} strokeWidth={1.8} /></span>
        <span>SYAFAR TOUR<span className="brand-dot">.</span><small>OPERATIONS WORKSPACE</small></span>
      </a>
      <nav id="mobile-navigation" className={menuOpen ? "mobile-nav open" : "mobile-nav"}>
        <a className="nav-active" href="#search" onClick={() => setMenuOpen(false)}>Hotel &amp; Tarif</a>
        <a href="#quotation" onClick={(event) => { event.preventDefault(); goToQuotation(); }}>Quotation</a>
        <button className="mobile-saved-link" type="button" onClick={() => void openSavedQuotes()}>Tersimpan <span>{Math.max(savedQuotes, savedItems.length)}</span></button>
      </nav>
      <button className="saved-button" type="button" onClick={() => void openSavedQuotes()} aria-haspopup="dialog" aria-expanded={savedOpen}>
        Daftar Quotation <span>{Math.max(savedQuotes, savedItems.length)}</span>
      </button>
      <button className={menuOpen ? "mobile-menu is-open" : "mobile-menu"} type="button" aria-label={menuOpen ? "Tutup menu" : "Buka menu"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen((open) => !open)}>
        <ChevronDown size={20} />
      </button>
      {savedOpen && (
        <div className="saved-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setSavedOpen(false); }}>
          <section className="saved-dialog" role="dialog" aria-modal="true" aria-labelledby="saved-title">
            <div className="saved-dialog-heading">
              <div><span>ARSIP OPERASIONAL</span><h2 id="saved-title">Quotation tersimpan</h2><p>Daftar estimasi yang sudah disimpan ke database.</p></div>
              <button type="button" className="saved-close" aria-label="Tutup daftar quotation" onClick={() => setSavedOpen(false)}><X size={18} /></button>
            </div>
            {savedLoading ? <div className="saved-state">Memuat quotation tersimpan...</div> : savedError ? <div className="saved-state saved-error" role="alert">{savedError}</div> : savedItems.length ? (
              <div className="saved-list">
                {savedItems.map((quote) => (
                  <article className="saved-item" key={quote.id}>
                    <div className="saved-item-top"><strong>{quote.hotel.name}</strong><span>{quote.city === "MAKKAH" ? "Makkah" : "Madinah"}</span></div>
                    <div className="saved-item-meta">{formatSavedDate(quote.checkIn)} – {formatSavedDate(quote.checkOut)} · {quote.guests} jamaah · {quote.roomCount} kamar {quote.roomType}</div>
                    <div className="saved-item-price">{formatSavedCurrency(quote.sellingPriceIdr)} <small>/ jamaah</small></div>
                  </article>
                ))}
              </div>
            ) : <div className="saved-state">Belum ada quotation tersimpan. Hitung estimasi lalu simpan untuk melihatnya di sini.</div>}
          </section>
        </div>
      )}
    </header>
  );
}

function formatSavedDate(value: string) {
  return new Date(value).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

function formatSavedCurrency(value: string | number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value));
}

export function HeroSection() {
  return (
    <section className="hero ops-hero" id="top">
      <div className="hero-content ops-hero-content">
        <div className="ops-breadcrumb"><span>WORKSPACE</span><span>/</span><span>PERJALANAN UMRAH</span></div>
        <div className="ops-title-row">
          <div>
            <h1>Hotel &amp; <i>Quotation</i></h1>
            <p>Temukan tarif hotel dan susun estimasi perjalanan jamaah.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer id="footer">
      <a className="brand footer-brand" href="#top">
        <span className="brand-mark"><Compass size={19} /></span>
        <span>SYAFAR TOUR<span className="brand-dot">.</span><small>OPERATIONS WORKSPACE</small></span>
      </a>
      <span>SYAFAR TOUR · OPERATIONS</span>
      <span>SYAFAR TOUR · 2026</span>
    </footer>
  );
}
