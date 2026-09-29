import { PrismaClient, City } from "@prisma/client";

const prisma = new PrismaClient();

const hotels = [
  {
    id: "fairmont-makkah",
    name: "Fairmont Makkah",
    city: City.MAKKAH,
    pricePerNight: 1500,
    rating: 4.9,
    distance: "50 m dari Masjidil Haram",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=85",
    amenities: ["Wi-Fi", "Sarapan", "City view"],
  },
  {
    id: "pullman-zamzam-makkah",
    name: "Pullman Zamzam Makkah",
    city: City.MAKKAH,
    pricePerNight: 1100,
    rating: 4.8,
    distance: "100 m dari Masjidil Haram",
    image:
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=85",
    amenities: ["Wi-Fi", "Restoran", "City view"],
  },
  {
    id: "m-venpick-makkah",
    name: "M\u00f6venpick Makkah",
    city: City.MAKKAH,
    pricePerNight: 1250,
    rating: 4.7,
    distance: "120 m dari Masjidil Haram",
    image:
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=85",
    amenities: ["Wi-Fi", "Sarapan", "Gym"],
  },
  {
    id: "anwar-al-madinah-m-venpick",
    name: "Anwar Al Madinah M\u00f6venpick",
    city: City.MADINAH,
    pricePerNight: 900,
    rating: 4.8,
    distance: "150 m dari Masjid Nabawi",
    image:
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=85",
    amenities: ["Wi-Fi", "Restoran", "City view"],
  },
  {
    id: "emaar-royal-madinah",
    name: "Emaar Royal Madinah",
    city: City.MADINAH,
    pricePerNight: 650,
    rating: 4.5,
    distance: "300 m dari Masjid Nabawi",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=85",
    amenities: ["Wi-Fi", "Sarapan", "AC"],
  },
  {
    id: "saja-al-madinah",
    name: "Saja Al Madinah",
    city: City.MADINAH,
    pricePerNight: 720,
    rating: 4.6,
    distance: "400 m dari Masjid Nabawi",
    image:
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=85",
    amenities: ["Wi-Fi", "Restoran", "AC"],
  },
];

async function main() {
  for (const { id, ...hotel } of hotels) {
    await prisma.hotel.upsert({
      where: { id },
      update: hotel,
      create: { id, ...hotel },
    });
  }
}

main().finally(() => prisma.$disconnect());
