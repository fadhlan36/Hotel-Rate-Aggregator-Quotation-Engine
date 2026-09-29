# Syafar Tour — Hotel Rate Aggregator

Workspace internal untuk staf operasional, agent, dan admin Syafar Tour. Aplikasi membantu membandingkan tarif hotel di Makkah dan Madinah, memilih konfigurasi kamar, lalu menghitung estimasi biaya perjalanan umrah per jamaah. Dibuat dengan Next.js App Router, TypeScript, Supabase PostgreSQL, dan Prisma ORM 6.

> **Live demo:** https://hotel-rate-aggregator-quotation-eng.vercel.app

## Fitur

- Form pencarian dengan pilihan kota, tanggal perjalanan, jumlah jamaah, dan tipe kamar; jumlah kamar dihitung dari kapasitas tipe yang dipilih.
- Pilihan kamar Double, Triple, dan Quad dengan kapasitas 2, 3, dan 4 orang.
- Daftar hotel dengan tarif dalam SAR, rating, lokasi, dan fasilitas.
- Pencarian nama hotel, pengurutan harga termurah, dan filter harga maksimum.
- Kalkulasi quotation yang menampilkan total biaya dan harga jual per jamaah.
- Validasi tanggal, jumlah jamaah, jumlah kamar, kurs, dan nominal biaya.
- Tampilan responsif untuk desktop dan perangkat mobile, termasuk navigasi mobile.
- Enam hotel contoh dari mock API; aplikasi tidak terhubung langsung ke Trip.com.
- Penyimpanan hotel dan quotation ke Supabase PostgreSQL melalui Prisma ketika database tersedia.

## Teknologi

| Bagian | Teknologi |
| --- | --- |
| Web dan API | Next.js App Router 15, React 19, TypeScript |
| Database | Supabase PostgreSQL |
| ORM | Prisma ORM 6 |
| Ikon | Lucide React |

## Menjalankan secara lokal

### Prasyarat

- Node.js 20.9 atau lebih baru dan npm.
- Project Supabase dengan akses ke database PostgreSQL.

### Konfigurasi database

1. Salin `.env.example` menjadi `.env`.
2. Di dashboard Supabase, buka **Connect** dan salin connection string untuk shared pooler **Transaction** dan **Session**.
3. Isi `DATABASE_URL` dengan connection string Transaction dan `DIRECT_URL` dengan connection string Session. Template ini sudah berisi host project dan region yang diberikan.
4. Ganti `YOUR_PASSWORD` dengan database password Supabase. Jika password berisi karakter khusus, URL-encode karakter tersebut.

### Instalasi dan menjalankan

```bash
npm ci
npm run db:generate
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Buka `http://localhost:3000`.

Seed dapat dijalankan kembali dengan aman: data hotel contoh menggunakan `upsert` berdasarkan ID stabil yang juga dipakai mock API.

## Endpoint API

### `GET /api/hotels`

Mengembalikan daftar hotel berdasarkan kota dan harga termurah.

```http
GET /api/hotels?city=MAKKAH
GET /api/hotels?city=MADINAH
```

Parameter `city` opsional; nilai yang diterima adalah `MAKKAH` dan `MADINAH`. Respons berbentuk `{ "hotels": [...] }`. Endpoint memakai data PostgreSQL saat data tersedia, lalu memakai mock data lokal jika database belum tersedia atau belum memiliki hasil untuk kota tersebut.

### `POST /api/quotations`

Menghitung quotation, lalu menyimpannya di PostgreSQL jika koneksi database dan data hotel tersedia.

```json
{
  "hotelId": "fairmont-makkah",
  "checkIn": "2026-11-10",
  "checkOut": "2026-11-14",
  "guests": 8,
  "roomType": "Quad",
  "roomCount": 2,
  "exchangeRate": 4500,
  "visaPerPersonSar": 500,
  "transportTotalSar": 2000,
  "flightPerPersonIdr": 13000000,
  "marginPerPersonIdr": 1000000
}
```

Respons berisi `hotelTotalSar`, `totalSar`, `totalCostIdr`, `costPerPersonIdr`, `sellingPriceIdr`, jumlah malam, dan status penyimpanan (`saved`). Input tidak valid menghasilkan HTTP 400; hotel yang tidak dikenal menghasilkan HTTP 404.

### `GET /api/quotations`

Mengembalikan hingga 20 quotation terakhir beserta data hotelnya. Jika database belum tersedia, endpoint mengembalikan daftar kosong dan pesan error.

## Aturan perhitungan

Jumlah kamar dibulatkan ke atas agar seluruh jamaah mendapat kapasitas kamar:

```text
jumlah kamar = ceil(jumlah jamaah / kapasitas tipe kamar)
```

```text
malam             = tanggal check-out − tanggal check-in
biaya hotel (SAR) = tarif hotel per kamar per malam × jumlah kamar × malam
total SAR         = biaya hotel + (visa per jamaah × jumlah jamaah) + transport total
total biaya (IDR) = (total SAR × kurs SAR ke IDR) + (tiket per jamaah × jumlah jamaah)
biaya per jamaah  = total biaya (IDR) / jumlah jamaah
harga jual/pax    = biaya per jamaah + margin per jamaah
```

Validasi mencegah check-out sebelum atau sama dengan check-in, jumlah jamaah nol, jumlah kamar yang tidak sesuai kapasitas, kurs nol, serta nominal negatif atau tidak valid.

## Struktur kode

```text
src/
├── app/
│   ├── api/hotels/       # Mock API dan pembacaan data hotel
│   ├── api/quotations/   # Validasi, kalkulasi, dan penyimpanan quotation
│   ├── globals.css       # Gaya dan breakpoint responsif
│   └── page.tsx          # State dan orkestrasi halaman
├── components/
│   ├── hotel-search-section.tsx
│   ├── quotation-section.tsx
│   └── site-chrome.tsx   # Navbar, hero, dan footer
└── lib/
    ├── format.ts         # Formatter SAR dan IDR
    ├── hotels.ts         # Mock hotel dan tipe data
    └── prisma.ts         # Prisma Client singleton

prisma/
├── migrations/
├── schema.prisma
└── seed.ts
```
