import {
  ArrowRight, BedDouble, Check, ChevronDown, Minus, Plus, Sparkles,
} from "lucide-react";
import type { HotelRecord } from "@/lib/hotels";
import { formatIdr, formatSar } from "@/lib/format";

export type QuotationInput = {
  exchangeRate: number;
  visaPerPersonSar: number;
  transportTotalSar: number;
  flightPerPersonIdr: number;
  marginPerPersonIdr: number;
};

export type QuoteResult = {
  hotelTotalSar: number;
  totalSar: number;
  totalCostIdr: number;
  costPerPersonIdr: number;
  sellingPriceIdr: number;
  nights: number;
  saved: boolean;
};

type Props = {
  hotel: HotelRecord;
  checkIn: string;
  checkOut: string;
  guests: number;
  setGuests: (guests: number) => void;
  roomType: string;
  setRoomType: (type: string) => void;
  rooms: number;
  capacity: number;
  nights: number;
  inputs: QuotationInput;
  setInputs: (inputs: QuotationInput) => void;
  result: QuoteResult | null;
  error: string;
  onChangeHotel: () => void;
  onCalculate: () => void;
};

export function QuotationSection(props: Props) {
  const field = (key: keyof QuotationInput, label: string, suffix: string) => (
    <label className="field" key={key}>
      <span>{label}</span>
      <div className="input-wrap">
        <input type="number" min="0" step="any" value={props.inputs[key]} onChange={(event) => props.setInputs({ ...props.inputs, [key]: Math.max(0, Number(event.target.value)) })} />
        <small>{suffix}</small>
      </div>
    </label>
  );

  return (
    <section className="quote-section" id="quotation">
      <div className="section-kicker">02 <span>/</span> ESTIMASI PERJALANAN</div>
      <div className="quote-heading">
        <div>
          <h2>Rencanakan dengan <i>lebih pasti.</i></h2>
          <p>Lengkapi komponen biaya, lalu dapatkan estimasi harga per jamaah secara langsung.</p>
        </div>
        <button type="button" className="change-hotel" onClick={props.onChangeHotel}>Ganti hotel <ArrowRight size={15} /></button>
      </div>

      <div className="quote-layout">
        <div className="quote-form">
          <div className="selected-hotel">
            <div className="selected-thumb" style={{ backgroundImage: `url('${props.hotel.image}')` }} />
            <div>
              <small>HOTEL PILIHAN · {props.hotel.city === "MAKKAH" ? "MAKKAH" : "MADINAH"}</small>
              <h3>{props.hotel.name}</h3>
              <span>{props.nights} malam · SAR {formatSar(props.hotel.pricePerNight)} / kamar / malam</span>
            </div>
            <Check size={18} />
          </div>

          <div className="stay-summary">
            <div>
              <span>TANGGAL PERJALANAN</span>
              <b>{formatDate(props.checkIn)} — {formatDate(props.checkOut, true)}</b>
            </div>
            <div>
              <span>JAMAAH &amp; KAMAR</span>
              <b>{props.guests} jamaah · {props.rooms} kamar · {props.roomType}</b>
            </div>
          </div>

          <div className="room-picker">
            <div><span>TIPE KAMAR</span><small>Jumlah kamar menyesuaikan kapasitas jamaah</small></div>
            <div className="select-wrap">
              <BedDouble size={16} />
              <select value={props.roomType} onChange={(event) => props.setRoomType(event.target.value)}>
                <option value="Double">Double</option><option value="Triple">Triple</option><option value="Quad">Quad</option>
              </select>
              <ChevronDown size={14} />
            </div>
            <div className="room-count">
              <button type="button" onClick={() => props.setGuests(Math.max(1, props.guests - props.capacity))} aria-label="Kurangi kamar"><Minus size={13} /></button>
              <b>{props.rooms} kamar</b>
              <button type="button" onClick={() => props.setGuests(props.guests + props.capacity)} aria-label="Tambah kamar"><Plus size={13} /></button>
            </div>
          </div>

          <div className="form-divider"><span>KOMPONEN BIAYA TAMBAHAN</span></div>
          <div className="fields-grid">
            {field("exchangeRate", "Kurs SAR ke IDR", "IDR / SAR")}
            {field("visaPerPersonSar", "Visa per jamaah", "SAR / pax")}
            {field("transportTotalSar", "Transport total", "SAR total")}
            {field("flightPerPersonIdr", "Tiket pesawat", "IDR / pax")}
            {field("marginPerPersonIdr", "Margin keuntungan", "IDR / pax")}
          </div>
          <p className="calculation-hint">Estimasi hotel menggunakan {props.rooms} kamar × {props.nights} malam berdasarkan tarif API.</p>
          <button type="button" className="calculate-button" onClick={props.onCalculate}>HITUNG ESTIMASI <ArrowRight size={17} /></button>
          {props.error && <p className="error-banner" role="alert">{props.error}</p>}
        </div>

        <QuoteSummary hotel={props.hotel} guests={props.guests} rooms={props.rooms} inputs={props.inputs} result={props.result} />
      </div>
    </section>
  );
}

function QuoteSummary({ hotel, guests, rooms, inputs, result }: {
  hotel: HotelRecord; guests: number; rooms: number;
  inputs: QuotationInput; result: QuoteResult | null;
}) {
  return (
    <aside className="quote-result">
      <div className="result-top"><span>RINGKASAN ESTIMASI</span></div>
      {result ? (
        <>
          <div className="result-hotel">{hotel.name}<small>{result.nights} malam · {guests} jamaah</small></div>
          <div className="cost-rows">
            <CostRow label={`Hotel · ${rooms} kamar`} value={`SAR ${formatSar(result.hotelTotalSar)}`} />
            <CostRow label={`Visa · ${guests} jamaah`} value={`SAR ${formatSar(inputs.visaPerPersonSar * guests)}`} />
            <CostRow label="Transport" value={`SAR ${formatSar(inputs.transportTotalSar)}`} />
            <CostRow label="Total dalam SAR" value={`SAR ${formatSar(result.totalSar)}`} />
            <CostRow label="Biaya dalam rupiah" value={formatIdr(result.totalCostIdr)} />
            <CostRow label={`Tiket pesawat · ${guests} pax`} value={formatIdr(inputs.flightPerPersonIdr * guests)} />
          </div>
          <div className="per-pax">
            <span>HARGA JUAL PER JAMAAH</span>
            <strong>{formatIdr(result.sellingPriceIdr)}</strong>
            <small>Biaya {formatIdr(result.costPerPersonIdr)} + margin {formatIdr(inputs.marginPerPersonIdr)}</small>
          </div>
          <div className="saved-note"><Check size={15} />{result.saved ? "Quotation tersimpan di database" : "Estimasi selesai · hubungkan database untuk menyimpan"}</div>
        </>
      ) : (
        <div className="result-placeholder">
          <h3>Perjalanan yang bermakna<br /><i>dimulai dengan perencanaan.</i></h3>
          <p>Isi biaya perjalanan Anda, lalu lihat ringkasan estimasi per jamaah di sini.</p>
          <div className="placeholder-line" />
          <small>ESTIMASI BIAYA · HARGA PER JAMAAH</small>
          <strong>— — —</strong>
        </div>
      )}
      <div className="result-foot"><span>ESTIMASI DALAM IDR · KURS {formatSar(inputs.exchangeRate)} / SAR</span><span>01 / 01</span></div>
    </aside>
  );
}

function CostRow({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><b>{value}</b></div>;
}

function formatDate(value: string, includeYear = false) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", ...(includeYear ? { year: "numeric" } : {}),
  });
}
