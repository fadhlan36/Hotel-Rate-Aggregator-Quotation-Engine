import {
  ArrowDownUp, ArrowRight, ArrowUpRight, BedDouble, CalendarDays,
  ChevronDown, MapPin, Minus, Plus, Search, SlidersHorizontal,
  Star, Users, X,
} from "lucide-react";
import type { City, HotelRecord } from "@/lib/hotels";
import { formatSar } from "@/lib/format";

type Props = {
  cityFilter: "ALL" | City; setCityFilter: (city: "ALL" | City) => void;
  checkIn: string; setCheckIn: (date: string) => void;
  checkOut: string; setCheckOut: (date: string) => void;
  guests: number; setGuests: (guests: number) => void;
  roomType: string; setRoomType: (type: string) => void;
  nights: number; visibleHotels: HotelRecord[];
  loading: boolean; searched: boolean; error: string; searchHotels: () => void;
  query: string; setQuery: (query: string) => void;
  sort: string; setSort: (sort: string) => void;
  maxPrice: number; setMaxPrice: (price: number) => void;
  chooseHotel: (hotel: HotelRecord) => void;
};

const dateAfter = (days: number) =>
  new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

export function HotelSearchSection(props: Props) {
  return (
    <section className="search-section" id="search">

      <div className="search-panel">
        <div className="field city-field">
          <span>TAMPILKAN HOTEL</span>
          <div className="city-choice">
            <button type="button" className={props.cityFilter === "ALL" ? "city-option active" : "city-option"} aria-pressed={props.cityFilter === "ALL"} onClick={() => props.setCityFilter("ALL")}>Semua</button>
            <button type="button" className={props.cityFilter === "MAKKAH" ? "city-option active" : "city-option"} aria-pressed={props.cityFilter === "MAKKAH"} onClick={() => props.setCityFilter("MAKKAH")}><MapPin size={17} />Makkah</button>
            <button type="button" className={props.cityFilter === "MADINAH" ? "city-option active" : "city-option"} aria-pressed={props.cityFilter === "MADINAH"} onClick={() => props.setCityFilter("MADINAH")}><MapPin size={17} />Madinah</button>
          </div>
        </div>

        <label className="field">
          <span>CHECK-IN</span>
          <div className="input-wrap"><CalendarDays size={17} className="input-icon" /><input type="date" min={dateAfter(1)} value={props.checkIn} onChange={(event) => props.setCheckIn(event.target.value)} /></div>
        </label>
        <label className="field">
          <span>CHECK-OUT</span>
          <div className="input-wrap"><CalendarDays size={17} className="input-icon" /><input type="date" min={props.checkIn || dateAfter(1)} value={props.checkOut} onChange={(event) => props.setCheckOut(event.target.value)} /></div>
        </label>
        <div className="field guest-field">
          <span>JUMLAH JAMAAH</span>
          <div className="stepper">
            <button type="button" aria-label="Kurangi jamaah" onClick={() => props.setGuests(Math.max(1, props.guests - 1))}><Minus size={14} /></button>
            <Users size={17} /><strong>{props.guests}</strong><span>orang</span>
            <button type="button" aria-label="Tambah jamaah" onClick={() => props.setGuests(props.guests + 1)}><Plus size={14} /></button>
          </div>
        </div>
        <label className="field room-type-field">
          <span>TIPE KAMAR</span>
          <div className="input-wrap"><BedDouble size={17} className="input-icon" />
            <select className="room-select" value={props.roomType} onChange={(event) => props.setRoomType(event.target.value)}>
              <option value="Double">Double</option><option value="Triple">Triple</option><option value="Quad">Quad</option>
            </select>
            <ChevronDown className="room-select-chevron" size={14} aria-hidden="true" />
          </div>
        </label>
        <button type="button" className="search-button" onClick={props.searchHotels} disabled={props.loading}>
          <Search size={17} />{props.loading ? "Mencari..." : "CARI HOTEL"}<ArrowUpRight size={17} />
        </button>
      </div>

      {props.error && <p className="error-banner" role="alert" style={{ marginTop: "1rem" }}><X size={16} />{props.error}</p>}

      <div className="results-head" style={{ marginTop: "3rem" }}>
        <div>
          <div className="section-kicker">HASIL PENCARIAN</div>
          <h3>{props.cityFilter === "ALL" ? "Hotel Makkah & Madinah" : `Hotel ${props.cityFilter === "MAKKAH" ? "Makkah" : "Madinah"}`} <span>· {props.visibleHotels.length} hotel</span></h3>
        </div>
        <div className="result-controls">
          <label className="search-inline"><Search size={15} /><input value={props.query} onChange={(event) => props.setQuery(event.target.value)} placeholder="Cari nama hotel" /></label>
          <label className="sort-control"><ArrowDownUp size={15} /><select value={props.sort} onChange={(event) => props.setSort(event.target.value)}><option value="recommended">Rekomendasi</option><option value="price">Harga terendah</option></select></label>
        </div>
      </div>

      <div className="filter-line">
        <span><SlidersHorizontal size={15} /> FILTER HARGA</span>
        <input aria-label="Filter harga maksimum" type="range" min="500" max="2000" step="50" value={props.maxPrice} onChange={(event) => props.setMaxPrice(Number(event.target.value))} />
        <b>Hingga SAR {formatSar(props.maxPrice)} <ChevronDown size={14} /></b>
        <span className="date-summary">{props.nights} malam · {props.guests} jamaah</span>
      </div>

      {props.loading ? (
        <div className="loading-state"><span className="spinner" />Memuat tarif hotel...</div>
      ) : props.visibleHotels.length ? (
        <div className="hotel-grid">
          {props.visibleHotels.map((hotel, index) => (
            <HotelCard key={hotel.id} hotel={hotel} onChoose={() => props.chooseHotel(hotel)} />
          ))}
        </div>
      ) : (
        <div className="empty-state"><Search size={22} /><h4>{props.searched ? "Hotel tidak ditemukan" : "Siap mencari hotel"}</h4><p>Ubah filter nama atau rentang tarif, lalu coba lagi.</p></div>
      )}
    </section>
  );
}

function HotelCard({ hotel, onChoose }: {
  hotel: HotelRecord; onChoose: () => void;
}) {
  return (
    <article className="hotel-card">
      <div className="hotel-photo" style={{ backgroundImage: `url('${hotel.image}')` }}>
      </div>
      <div className="hotel-info">
        <div className="hotel-location"><MapPin size={13} />{hotel.city === "MAKKAH" ? "Makkah" : "Madinah"} · {hotel.distance}</div>
        <h4>{hotel.name}</h4>
        <div className="hotel-meta">
          <span><Star size={14} fill="currentColor" /> {hotel.rating} <small>(ulasan tamu)</small></span>
          <span>{hotel.amenities[0]} <i /> {hotel.amenities[1]}</span>
        </div>
        <div className="hotel-bottom">
          <div><strong>SAR {formatSar(hotel.pricePerNight)}</strong><small> / kamar · malam</small></div>
          <button type="button" onClick={onChoose}>PILIH HOTEL <ArrowRight size={15} /></button>
        </div>
      </div>
    </article>
  );
}
