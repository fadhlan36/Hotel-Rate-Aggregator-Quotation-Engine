"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { City, HotelRecord } from "@/lib/hotels";
import { HotelSearchSection } from "@/components/hotel-search-section";
import {
  QuotationSection,
  type QuotationInput,
  type QuoteResult,
} from "@/components/quotation-section";
import {
  ClosingSection,
  HeroSection,
  SiteFooter,
  SiteHeader,
} from "@/components/site-chrome";

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
  const [savedQuotes, setSavedQuotes] = useState(0);

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
      const response = await fetch(`/api/hotels?city=${city}`);
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
  }, [city, checkIn, checkOut, guests]);

  useEffect(() => {
    void searchHotels();
  }, [city, searchHotels]);

  const visibleHotels = useMemo(() => {
    const filtered = hotels.filter(
      (hotel) =>
        hotel.name.toLowerCase().includes(query.toLowerCase()) &&
        hotel.pricePerNight <= maxPrice,
    );
    return sort === "price"
      ? [...filtered].sort((a, b) => a.pricePerNight - b.pricePerNight)
      : filtered;
  }, [hotels, query, sort, maxPrice]);

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

  function toggleFavorite(hotelId: string) {
    setFavorites((current) =>
      current.includes(hotelId)
        ? current.filter((id) => id !== hotelId)
        : [...current, hotelId],
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
      if (!response.ok) {
        throw new Error(data.error ?? "Quotation belum dapat dihitung.");
      }

      setResult(data);
      if (data.saved) setSavedQuotes((count) => count + 1);
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
      <SiteHeader savedQuotes={savedQuotes} />
      <HeroSection />
      <HotelSearchSection
        city={city}
        setCity={setCity}
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
        favorites={favorites}
        toggleFavorite={toggleFavorite}
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
      <ClosingSection />
      <SiteFooter />
    </main>
  );
}
