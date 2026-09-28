import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mockHotels } from "@/lib/hotels";

type Body = { hotelId: string; checkIn: string; checkOut: string; guests: number; roomType: string; roomCount: number; exchangeRate: number; visaPerPersonSar: number; transportTotalSar: number; flightPerPersonIdr: number; marginPerPersonIdr: number };
const validAmount = (n: number) => Number.isFinite(n) && n >= 0;

export async function POST(request: NextRequest) {
  let body: Body;

  try {
    body = await request.json() as Body;
  } catch {
    return NextResponse.json({ error: "Format permintaan tidak valid." }, { status: 400 });
  }

  const checkIn = new Date(`${body.checkIn}T00:00:00Z`), checkOut = new Date(`${body.checkOut}T00:00:00Z`);
  const nums = [body.guests, body.roomCount, body.exchangeRate, body.visaPerPersonSar, body.transportTotalSar, body.flightPerPersonIdr, body.marginPerPersonIdr];
  const capacities: Record<string, number> = { Double: 2, Triple: 3, Quad: 4 };

  if (!body.hotelId || !Number.isFinite(body.guests) || body.guests < 1 || !Number.isInteger(body.guests) || !Number.isInteger(body.roomCount) || body.roomCount < 1 || !capacities[body.roomType] || body.roomCount !== Math.ceil(body.guests / capacities[body.roomType]) || !nums.every(validAmount) || body.exchangeRate <= 0 || !Number.isFinite(checkIn.getTime()) || !Number.isFinite(checkOut.getTime()) || checkOut <= checkIn) return NextResponse.json({ error: "Periksa kembali input quotation. Tanggal, jumlah pax, kamar, kurs, dan nominal harus valid." }, { status: 400 });

  const hotel = mockHotels.find((item) => item.id === body.hotelId);
  if (!hotel) return NextResponse.json({ error: "Hotel tidak ditemukan." }, { status: 404 });
  const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000);
  const hotelTotalSar = hotel.pricePerNight * body.roomCount * nights;
  const totalSar = hotelTotalSar + body.visaPerPersonSar * body.guests + body.transportTotalSar;
  const totalCostIdr = totalSar * body.exchangeRate + body.flightPerPersonIdr * body.guests;
  const costPerPersonIdr = totalCostIdr / body.guests;
  const result = { hotelTotalSar, totalSar, totalCostIdr, costPerPersonIdr, sellingPriceIdr: costPerPersonIdr + body.marginPerPersonIdr, nights };

  try {
    const dbHotel = await prisma.hotel.findUnique({ where: { id: body.hotelId } });
    if (!dbHotel) return NextResponse.json({ error: "Hotel belum tersedia di database. Jalankan seed database dahulu." }, { status: 404 });
    const quotation = await prisma.quotation.create({ data: { hotelId: dbHotel.id, city: dbHotel.city, checkIn, checkOut, guests: body.guests, roomType: body.roomType, roomCount: body.roomCount, exchangeRate: body.exchangeRate, visaPerPersonSar: body.visaPerPersonSar, transportTotalSar: body.transportTotalSar, flightPerPersonIdr: body.flightPerPersonIdr, marginPerPersonIdr: body.marginPerPersonIdr, hotelTotalSar, totalCostIdr, costPerPersonIdr, sellingPriceIdr: result.sellingPriceIdr } });
    return NextResponse.json({ ...result, quotationId: quotation.id, saved: true });
  } catch {
    return NextResponse.json({ ...result, saved: false });
  }
}

export async function GET() {
  try { const quotations = await prisma.quotation.findMany({ include: { hotel: true }, orderBy: { createdAt: "desc" }, take: 20 }); return NextResponse.json({ quotations }); }
  catch { return NextResponse.json({ quotations: [], error: "Hubungkan database PostgreSQL untuk melihat quotation tersimpan." }); }
}
