"use client";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownUp,
  ArrowRight,
  ArrowUpRight,
  BedDouble,
  CalendarDays,
  Check,
  ChevronDown,
  Compass,
  Heart,
  MapPin,
  Minus,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Users,
  X,
} from "lucide-react";
import type { City, HotelRecord } from "@/lib/hotels";
type QuotationInput = {
  exchangeRate: number;
  visaPerPersonSar: number;
  transportTotalSar: number;
  flightPerPersonIdr: number;
  marginPerPersonIdr: number;
};
type QuoteResult = {
  hotelTotalSar: number;
  totalSar: number;
  totalCostIdr: number;
  costPerPersonIdr: number;
  sellingPriceIdr: number;
  nights: number;
  saved: boolean;
};
const idr = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
const sar = (value: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
const dateAfter = (days: number) =>
  new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
export default function Home() {
  const [city, setCity] = useState<City>("MAKKAH");
  const [checkIn, setCheckIn] = useState(dateAfter(14));
  const [checkOut, setCheckOut] = useState(dateAfter(18));
  const [guests, setGuests] = useState(8);
  const [roomType, setRoomType] = useState("Quad");
  const [hotels, setHotels] = useState<HotelRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recommended");
  const [maxPrice, setMaxPrice] = useState(2000);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selected, setSelected] = useState<HotelRecord | null>(null);
  const [inputs, setInputs] = useState<QuotationInput>({
    exchangeRate: 4500,
    visaPerPersonSar: 500,
    transportTotalSar: 2000,
    flightPerPersonIdr: 13000000,
    marginPerPersonIdr: 1000000,
  });
  const [result, setResult] = useState<QuoteResult | null>(null);
  const [quoteError, setQuoteError] = useState("");
  const [savedQuotes, setSavedQuotes] = useState<number>(0);
  const nights = Math.max(
    0,
    Math.round(
      (new Date(`${checkOut}T00:00:00`).getTime() -
        new Date(`${checkIn}T00:00:00`).getTime()) /
        86400000,
    ),
  );
  const capacity = roomType === "Double" ? 2 : roomType === "Triple" ? 3 : 4;
  const rooms = Math.ceil(guests / capacity);
  async function searchHotels() {
    if (
      !checkIn ||
      !checkOut ||
      new Date(checkOut) <= new Date(checkIn) ||
      guests < 1
    ) {
      setError(
        "Tanggal check-out harus setelah check-in dan jumlah jamaah minimal 1.",
      );
      return;
    }
    setError("");
    setLoading(true);
    setSearched(true);
    setSelected(null);
    setResult(null);
    try {
      const response = await fetch(`/api/hotels?city=${city}`);
      if (!response.ok)
        throw new Error("Hotel belum dapat dimuat. Coba lagi sebentar.");
      const data = (await response.json()) as { hotels: HotelRecord[] };
      setHotels(data.hotels);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Terjadi kesalahan saat mengambil data hotel.",
      );
    } finally {
      setLoading(false);
    }
  }
  const visibleHotels = useMemo(() => {
    const rows = hotels.filter(
      (hotel) =>
        hotel.name.toLowerCase().includes(query.toLowerCase()) &&
        hotel.pricePerNight <= maxPrice,
    );
    return sort === "price"
      ? [...rows].sort((a, b) => a.pricePerNight - b.pricePerNight)
      : rows;
  }, [hotels, query, sort, maxPrice]);
  function chooseHotel(hotel: HotelRecord) {
    setSelected(hotel);
    setResult(null);
    setQuoteError("");
    setTimeout(
      () =>
        document
          .getElementById("quotation")
          ?.scrollIntoView({ behavior: "smooth" }),
      100,
    );
  }
  async function calculateQuote() {
    setQuoteError("");
    setResult(null);
    if (!selected) return;
    const payload = {
      hotelId: selected.id,
      checkIn,
      checkOut,
      guests,
      roomType,
      roomCount: rooms,
      ...inputs,
    };
    try {
      const response = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as QuoteResult & { error?: string };
      if (!response.ok)
        throw new Error(data.error ?? "Quotation belum dapat dihitung.");
      setResult(data);
      if (data.saved) setSavedQuotes((count) => count + 1);
    } catch (e) {
      setQuoteError(
        e instanceof Error
          ? e.message
          : "Terjadi kesalahan. Silakan coba lagi.",
      );
    }
  }
  useEffect(() => {
    searchHotels(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const field = (key: keyof QuotationInput, label: string, suffix: string) => (
    <label className="field" key={key}>
      <span>{label}</span>
      <div className="input-wrap">
        <input
          type="number"
          min="0"
          step="any"
          value={inputs[key]}
          onChange={(e) =>
            setInputs({ ...inputs, [key]: Math.max(0, Number(e.target.value)) })
          }
        />
        <small>{suffix}</small>
      </div>
    </label>
  );
  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top">
          <span className="brand-mark">
            <Compass size={21} strokeWidth={1.8} />
          </span>
          <span>
            SAFAR<span className="brand-dot">.</span>
            <small>JOURNEYS, MADE MEANINGFUL</small>
          </span>
        </a>
        <nav>
          <a className="nav-active" href="#search">
            Hotel
          </a>
          <a href="#quotation">Rencanakan perjalanan</a>
          <a href="#footer">Tentang</a>
        </nav>
        <button
          className="saved-button"
          onClick={() =>
            document
              .getElementById("quotation")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          Quotation <span>{savedQuotes}</span>
        </button>
        <button className="mobile-menu" aria-label="Buka menu">
          <ChevronDown size={20} />
        </button>
      </header>
      <section className="hero" id="top">
        <div className="hero-image" />
        <div className="hero-shade" />
        <div className="hero-content">
          <div className="eyebrow light">
            <span /> PERJALANAN IBADAH, DENGAN TENANG
          </div>
          <h1>
            Ruang untuk
            <br />
            perjalanan yang <i>berarti.</i>
          </h1>
          <p>
            Temukan penginapan terbaik dekat Tanah Suci dan rencanakan
            perjalanan Anda, dengan sepenuh hati.
          </p>
          <a className="hero-link" href="#search">
            Mulai rencanakan <ArrowRight size={17} />
          </a>
        </div>
        <div className="hero-note">
          <Sparkles size={15} /> Disusun untuk setiap langkah perjalanan Anda
        </div>
        <div className="hero-count">
          <strong>01</strong>
          <span> — 03</span>
          <div />
        </div>
      </section>
      <section className="search-section" id="search">
        <div className="section-kicker">
          01 <span>/</span> TEMUKAN PENGINAPAN
        </div>
        <div className="search-heading">
          <div>
            <h2>
              Perjalanan dimulai <i>di sini.</i>
            </h2>
            <p>
              Pilih kota tujuan dan tanggal perjalanan untuk menemukan tempat
              istirahat yang tepat.
            </p>
          </div>
          <span className="secure-note">
            <span /> HARGA LANGSUNG DARI SUPPLIER
          </span>
        </div>
        <div className="search-panel">
          <div className="field city-field">
            <span>DESTINASI</span>
            <div className="city-choice">
              <button
                className={
                  city === "MAKKAH" ? "city-option active" : "city-option"
                }
                onClick={() => setCity("MAKKAH")}
              >
                <MapPin size={17} />
                <span>Makkah</span>
              </button>
              <button
                className={
                  city === "MADINAH" ? "city-option active" : "city-option"
                }
                onClick={() => setCity("MADINAH")}
              >
                <MapPin size={17} />
                <span>Madinah</span>
              </button>
            </div>
          </div>
          <label className="field">
            <span>CHECK-IN</span>
            <div className="input-wrap">
              <CalendarDays size={17} className="input-icon" />
              <input
                type="date"
                min={tomorrow}
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>
          </label>
          <label className="field">
            <span>CHECK-OUT</span>
            <div className="input-wrap">
              <CalendarDays size={17} className="input-icon" />
              <input
                type="date"
                min={checkIn || tomorrow}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>
          </label>
          <div className="field guest-field">
            <span>JUMLAH JAMAAH</span>
            <div className="stepper">
              <button
                aria-label="Kurangi jamaah"
                onClick={() => setGuests(Math.max(1, guests - 1))}
              >
                <Minus size={14} />
              </button>
              <Users size={17} />
              <strong>{guests}</strong>
              <span>orang</span>
              <button
                aria-label="Tambah jamaah"
                onClick={() => setGuests(guests + 1)}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
          <label className="field room-type-field">
            <span>TIPE KAMAR</span>
            <div className="input-wrap">
              <BedDouble size={17} className="input-icon" />
              <select
                className="room-select"
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
              >
                <option>Double</option>
                <option>Triple</option>
                <option>Quad</option>
              </select>
            </div>
          </label>
          <button
            className="search-button"
            onClick={searchHotels}
            disabled={loading}
          >
            <Search size={17} />
            {loading ? "Mencari..." : "CARI HOTEL"}
            <ArrowUpRight size={17} />
          </button>
        </div>
        {error && (
          <p className="error-banner" role="alert">
            <X size={16} />
            {error}
          </p>
        )}
        <div className="results-head">
          <div>
            <div className="section-kicker">PILIHAN UNTUK ANDA</div>
            <h3>
              {city === "MAKKAH" ? "Makkah" : "Madinah"}{" "}
              <span>· {visibleHotels.length} hotel</span>
            </h3>
          </div>
          <div className="result-controls">
            <label className="search-inline">
              <Search size={15} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari nama hotel"
              />
            </label>
            <label className="sort-control">
              <ArrowDownUp size={15} />
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="recommended">Rekomendasi</option>
                <option value="price">Harga terendah</option>
              </select>
            </label>
          </div>
        </div>
        <div className="filter-line">
          <span>
            <SlidersHorizontal size={15} /> FILTER HARGA
          </span>
          <input
            aria-label="Filter harga maksimum"
            type="range"
            min="500"
            max="2000"
            step="50"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
          />
          <b>
            Hingga SAR {sar(maxPrice)} <ChevronDown size={14} />
          </b>
          <span className="date-summary">
            {nights || 0} malam · {guests} jamaah
          </span>
        </div>
        {loading ? (
          <div className="loading-state">
            <span className="spinner" />
            Menemukan tempat terbaik untuk Anda...
          </div>
        ) : visibleHotels.length ? (
          <div className="hotel-grid">
            {visibleHotels.map((hotel, i) => (
              <article className="hotel-card" key={hotel.id}>
                <div
                  className="hotel-photo"
                  style={{ backgroundImage: `url('${hotel.image}')` }}
                >
                  <span className="hotel-number">0{i + 1}</span>
                  <button
                    className={
                      favorites.includes(hotel.id)
                        ? "favorite favorited"
                        : "favorite"
                    }
                    aria-label="Simpan hotel favorit"
                    onClick={() =>
                      setFavorites(
                        favorites.includes(hotel.id)
                          ? favorites.filter((id) => id !== hotel.id)
                          : [...favorites, hotel.id],
                      )
                    }
                  >
                    <Heart
                      size={17}
                      fill={
                        favorites.includes(hotel.id) ? "currentColor" : "none"
                      }
                    />
                  </button>
                </div>
                <div className="hotel-info">
                  <div className="hotel-location">
                    <MapPin size={13} />
                    {hotel.distance}
                  </div>
                  <h4>{hotel.name}</h4>
                  <div className="hotel-meta">
                    <span>
                      <Star size={14} fill="currentColor" /> {hotel.rating}{" "}
                      <small>(ulasan tamu)</small>
                    </span>
                    <span>
                      {hotel.amenities[0]} <i /> {hotel.amenities[1]}
                    </span>
                  </div>
                  <div className="hotel-bottom">
                    <div>
                      <strong>SAR {sar(hotel.pricePerNight)}</strong>
                      <small> / kamar · malam</small>
                    </div>
                    <button onClick={() => chooseHotel(hotel)}>
                      PILIH HOTEL <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Search size={22} />
            <h4>
              {searched
                ? "Belum ada hotel yang cocok"
                : "Pilih penginapan Anda"}
            </h4>
            <p>Coba ubah kata pencarian atau rentang harga.</p>
          </div>
        )}
      </section>
      {selected && (
        <section className="quote-section" id="quotation">
          <div className="section-kicker">
            02 <span>/</span> ESTIMASI PERJALANAN
          </div>
          <div className="quote-heading">
            <div>
              <h2>
                Rencanakan dengan <i>lebih pasti.</i>
              </h2>
              <p>
                Lengkapi komponen biaya, lalu dapatkan estimasi harga per jamaah
                secara langsung.
              </p>
            </div>
            <button
              className="change-hotel"
              onClick={() => {
                setSelected(null);
                setResult(null);
              }}
            >
              Ganti hotel <ArrowRight size={15} />
            </button>
          </div>
          <div className="quote-layout">
            <div className="quote-form">
              <div className="selected-hotel">
                <div
                  className="selected-thumb"
                  style={{ backgroundImage: `url('${selected.image}')` }}
                />
                <div>
                  <small>
                    HOTEL PILIHAN ·{" "}
                    {selected.city === "MAKKAH" ? "MAKKAH" : "MADINAH"}
                  </small>
                  <h3>{selected.name}</h3>
                  <span>
                    {nights} malam · SAR {sar(selected.pricePerNight)} / kamar /
                    malam
                  </span>
                </div>
                <Check size={18} />
              </div>
              <div className="stay-summary">
                <div>
                  <span>TANGGAL PERJALANAN</span>
                  <b>
                    {new Date(`${checkIn}T12:00:00`).toLocaleDateString(
                      "id-ID",
                      { day: "numeric", month: "short" },
                    )}{" "}
                    —{" "}
                    {new Date(`${checkOut}T12:00:00`).toLocaleDateString(
                      "id-ID",
                      { day: "numeric", month: "short", year: "numeric" },
                    )}
                  </b>
                </div>
                <div>
                  <span>JAMAAH &amp; KAMAR</span>
                  <b>
                    {guests} jamaah · {rooms} kamar · {roomType}
                  </b>
                </div>
              </div>
              <div className="room-picker">
                <div>
                  <span>TIPE KAMAR</span>
                  <small>Jumlah kamar menyesuaikan kapasitas jamaah</small>
                </div>
                <div className="select-wrap">
                  <BedDouble size={16} />
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                  >
                    <option>Double</option>
                    <option>Triple</option>
                    <option>Quad</option>
                  </select>
                  <ChevronDown size={14} />
                </div>
                <div className="room-count">
                  <button
                    onClick={() => setGuests(Math.max(1, guests - capacity))}
                    aria-label="Kurangi kamar"
                  >
                    <Minus size={13} />
                  </button>
                  <b>{rooms} kamar</b>
                  <button
                    onClick={() => setGuests(guests + capacity)}
                    aria-label="Tambah kamar"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>
              <div className="form-divider">
                <span>KOMPONEN BIAYA TAMBAHAN</span>
              </div>
              <div className="fields-grid">
                {field("exchangeRate", "Kurs SAR ke IDR", "IDR / SAR")}
                {field("visaPerPersonSar", "Visa per jamaah", "SAR / pax")}
                {field("transportTotalSar", "Transport total", "SAR total")}
                {field("flightPerPersonIdr", "Tiket pesawat", "IDR / pax")}
                {field("marginPerPersonIdr", "Margin keuntungan", "IDR / pax")}
              </div>
              <p className="calculation-hint">
                Estimasi hotel menggunakan {rooms} kamar × {nights} malam
                berdasarkan tarif mock API.
              </p>
              <button className="calculate-button" onClick={calculateQuote}>
                HITUNG ESTIMASI <ArrowRight size={17} />
              </button>
              {quoteError && (
                <p className="error-banner" role="alert">
                  {quoteError}
                </p>
              )}
            </div>
            <aside className="quote-result">
              <div className="result-top">
                <span>RINGKASAN ESTIMASI</span>
                <Sparkles size={17} />
              </div>
              {result ? (
                <>
                  <div className="result-hotel">
                    {selected.name}
                    <small>
                      {result.nights} malam · {guests} jamaah
                    </small>
                  </div>
                  <div className="cost-rows">
                    <div>
                      <span>Hotel · {rooms} kamar</span>
                      <b>SAR {sar(result.hotelTotalSar)}</b>
                    </div>
                    <div>
                      <span>Visa · {guests} jamaah</span>
                      <b>SAR {sar(inputs.visaPerPersonSar * guests)}</b>
                    </div>
                    <div>
                      <span>Transport</span>
                      <b>SAR {sar(inputs.transportTotalSar)}</b>
                    </div>
                    <div>
                      <span>Total dalam SAR</span>
                      <b>SAR {sar(result.totalSar)}</b>
                    </div>
                    <div>
                      <span>Biaya dalam rupiah</span>
                      <b>{idr(result.totalCostIdr)}</b>
                    </div>
                    <div>
                      <span>Tiket pesawat · {guests} pax</span>
                      <b>{idr(inputs.flightPerPersonIdr * guests)}</b>
                    </div>
                  </div>
                  <div className="per-pax">
                    <span>HARGA JUAL PER JAMAAH</span>
                    <strong>{idr(result.sellingPriceIdr)}</strong>
                    <small>
                      Biaya {idr(result.costPerPersonIdr)} + margin{" "}
                      {idr(inputs.marginPerPersonIdr)}
                    </small>
                  </div>
                  <div className="saved-note">
                    <Check size={15} />
                    {result.saved
                      ? "Quotation tersimpan di database"
                      : "Estimasi selesai · hubungkan database untuk menyimpan"}
                  </div>
                </>
              ) : (
                <div className="result-placeholder">
                  <div className="placeholder-icon">
                    <Sparkles size={22} />
                  </div>
                  <h3>
                    Perjalanan yang bermakna
                    <br />
                    <i>dimulai dengan perencanaan.</i>
                  </h3>
                  <p>
                    Isi biaya perjalanan Anda, lalu lihat ringkasan estimasi per
                    jamaah di sini.
                  </p>
                  <div className="placeholder-line" />
                  <small>ESTIMASI BIAYA · HARGA PER JAMAAH</small>
                  <strong>— — —</strong>
                </div>
              )}
              <div className="result-foot">
                <span>
                  ESTIMASI DALAM {idr(1).split(" ")[0]} · KURS{" "}
                  {sar(inputs.exchangeRate)} / SAR
                </span>
                <span>01 / 01</span>
              </div>
            </aside>
          </div>
        </section>
      )}
      <section className="closing">
        <div className="closing-icon">
          <Compass size={24} />
        </div>
        <p>Setiap perjalanan punya ceritanya sendiri.</p>
        <h2>
          Semoga perjalanan Anda
          <br />
          penuh <i>ketenangan.</i>
        </h2>
        <a href="#search">
          Jelajahi hotel <ArrowUpRight size={16} />
        </a>
        <div className="closing-ornament">۞</div>
      </section>
      <footer id="footer">
        <a className="brand footer-brand" href="#top">
          <span className="brand-mark">
            <Compass size={19} />
          </span>
          <span>
            SAFAR<span className="brand-dot">.</span>
            <small>JOURNEYS, MADE MEANINGFUL</small>
          </span>
        </a>
        <span>DIRANCANG DENGAN HATI · JAKARTA, INDONESIA</span>
        <span>© 2025 SAFAR JOURNEYS</span>
      </footer>
    </main>
  );
}
