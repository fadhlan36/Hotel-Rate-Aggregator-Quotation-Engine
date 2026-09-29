import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mockHotels } from "@/lib/hotels";

export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const hotels = await prisma.hotel.findMany({ orderBy: { pricePerNight: "asc" } });
    if (hotels.length) return NextResponse.json({ hotels });
  } catch {
    // The mock endpoint remains usable before PostgreSQL is configured.
  }
  return NextResponse.json({ hotels: [...mockHotels].sort((a, b) => a.pricePerNight - b.pricePerNight) });
}
