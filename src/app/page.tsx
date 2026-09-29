"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { City, HotelRecord } from "@/lib/hotels";
import { HotelSearchSection } from "@/components/hotel-search-section";
import {
  QuotationSection,
  type QuotationInput,
  type QuoteResult,
} from "@/components/quotation-section";
import { HeroSection, SiteFooter, SiteHeader } from "@/components/site-chrome";

const dateAfter = (days: number) =>
  new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

export default function Home() {
  const [cityFilter, setCityFilter] = useState<"ALL" | City>("ALL");
  const [checkIn, setCheckIn] = useState(dateAfter(14));
  const [checkOut, setCheckOut] = useState(dateAfter(18));
  const [guests, setGuests] = useState(8);
  const [roomType, setRoomType] = useState("Quad");

  const [hotels, setHotels] = useState<HotelRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("distance");
  const [maxPrice, setMaxPrice] = useState(2000);
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

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(`${checkIn}T00:00:00`).getTime();
    const end = new Date(`${checkOut}T00:00:00`).getTime();
    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 0;
    return Math.round((end - start) / 86400000);
  }, [checkIn, checkOut]);

  const capacity = roomType === "Double" ? 2 : roomType === "Triple" ? 3 : 4;
  const rooms = Math.ceil(guests / capacity);

  const searchHotels = useCallback(async () => {
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
      const response = await fetch("/api/hotels");
      if (!response.ok) {
        throw new Error("Hotel belum dapat dimuat. Coba lagi sebentar.");
      }
      const data = (await response.json()) as { hotels: HotelRecord[] };
      setHotels(data.hotels ?? []);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Terjadi kesalahan saat mengambil data hotel.",
      );
    } finally {
      setLoading(false);
    }
  }, [checkIn, checkOut, guests]);

  useEffect(() => {
    void searchHotels();
  }, [searchHotels]);

  const visibleHotels = useMemo(() => {
    const filtered = hotels.filter(
      (hotel) =>
        (cityFilter === "ALL" || hotel.city === cityFilter) &&
        hotel.name.toLowerCase().includes(query.toLowerCase()) &&
        hotel.pricePerNight <= maxPrice,
    );
    return sort === "price"
      ? [...filtered].sort((a, b) => a.pricePerNight - b.pricePerNight)
      : [...filtered].sort((a, b) => distanceInMeters(a.distance) - distanceInMeters(b.distance));
  }, [hotels, cityFilter, query, sort, maxPrice]);

  function chooseHotel(hotel: HotelRecord) {
    setSelected(hotel);
    setResult(null);
    setQuoteError("");
    window.setTimeout(() => {
      document
        .getElementById("quotation")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
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
      if (!response.ok) {
        throw new Error(data.error ?? "Quotation belum dapat dihitung.");
      }

      setResult(data);
    } catch (cause) {
      setQuoteError(
        cause instanceof Error
          ? cause.message
          : "Terjadi kesalahan. Silakan coba lagi.",
      );
    }
  }

  return (
    <main>
      <SiteHeader />
      <HeroSection />
      <HotelSearchSection
        cityFilter={cityFilter}
        setCityFilter={setCityFilter}
        checkIn={checkIn}
        setCheckIn={setCheckIn}
        checkOut={checkOut}
        setCheckOut={setCheckOut}
        guests={guests}
        setGuests={setGuests}
        roomType={roomType}
        setRoomType={setRoomType}
        nights={nights}
        visibleHotels={visibleHotels}
        loading={loading}
        searched={searched}
        error={error}
        searchHotels={searchHotels}
        query={query}
        setQuery={setQuery}
        sort={sort}
        setSort={setSort}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        chooseHotel={chooseHotel}
      />
      {selected && (
        <QuotationSection
          hotel={selected}
          checkIn={checkIn}
          checkOut={checkOut}
          guests={guests}
          setGuests={setGuests}
          roomType={roomType}
          setRoomType={setRoomType}
          rooms={rooms}
          capacity={capacity}
          nights={nights}
          inputs={inputs}
          setInputs={setInputs}
          result={result}
          error={quoteError}
          onChangeHotel={() => {
            setSelected(null);
            setResult(null);
          }}
          onCalculate={calculateQuote}
        />
      )}
      <SiteFooter />
    </main>
  );
}

function distanceInMeters(distance: string) {
  const match = distance.match(/(\d+(?:[.,]\d+)?)\s*(km|kilometer|m|meter)\b/i);
  if (!match) return Number.POSITIVE_INFINITY;
  const amount = Number(match[1].replace(",", "."));
  return /^km|kilometer$/i.test(match[2]) ? amount * 1000 : amount;
}
