import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mockHotels, type City } from "@/lib/hotels";

export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  const cityParam = request.nextUrl.searchParams.get("city");
  if (cityParam && cityParam !== "MAKKAH" && cityParam !== "MADINAH") return NextResponse.json({ error: "Kota tidak valid." }, { status: 400 });
  const city = cityParam as City | null;
  try {
    const hotels = await prisma.hotel.findMany({ where: city ? { city } : undefined, orderBy: { pricePerNight: "asc" } });
    if (hotels.length) return NextResponse.json({ hotels });
  } catch {
    // The mock endpoint remains usable before PostgreSQL is configured.
  }
  return NextResponse.json({ hotels: mockHotels.filter((hotel) => !city || hotel.city === city).sort((a, b) => a.pricePerNight - b.pricePerNight) });
}
