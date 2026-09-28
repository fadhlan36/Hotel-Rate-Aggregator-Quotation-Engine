# Syafar — Hotel Rate Aggregator

Aplikasi pencarian hotel Makkah/Madinah dan kalkulator quotation perjalanan umrah. Dibuat dengan Next.js App Router, TypeScript, PostgreSQL, dan Prisma ORM 6.

## Menjalankan aplikasi

1. Pasang Node.js 20.9 atau versi lebih baru dan buat project Supabase.
2. Salin `.env.example` menjadi `.env`, lalu ganti `YOUR_PASSWORD` pada kedua URL dengan database password Supabase. `DATABASE_URL` memakai shared transaction pooler untuk koneksi aplikasi, sedangkan `DIRECT_URL` memakai shared session pooler untuk migrasi. Jangan commit `.env`.
3. Pasang dependency: `npm install`.
4. Buat Prisma Client: `npm run db:generate`.
5. Terapkan skema database Supabase: `npm run db:migrate -- --name init`.
6. Muat data hotel contoh: `npm run db:seed`.
7. Jalankan aplikasi: `npm run dev`, lalu buka `http://localhost:3000`.

Endpoint `GET /api/hotels?city=MAKKAH` (atau `MADINAH`) menyediakan enam hotel contoh. Ketika PostgreSQL berisi data, endpoint memakai data database; jika database belum tersedia, endpoint memakai dummy data lokal agar demo tetap bisa dipakai. `POST /api/quotations` menghitung biaya dari tarif mock API dan menyimpan quotation saat database tersedia.

## Rumus quotation

- Kamar: pembulatan ke atas dari jumlah jamaah ÷ kapasitas tipe kamar (Double 2, Triple 3, Quad 4).
- Biaya hotel: tarif per kamar per malam × jumlah kamar × malam.
- Total SAR: biaya hotel + visa per jamaah × jumlah jamaah + transport total.
- Total biaya IDR: total SAR × kurs + tiket pesawat per jamaah × jumlah jamaah.
- Harga jual per jamaah: total biaya ÷ jumlah jamaah + margin per jamaah.

## Deployment

Untuk deployment serverless, ambil connection string Supavisor Transaction dari dashboard Supabase untuk `DATABASE_URL` dan gunakan direct/session connection string untuk `DIRECT_URL`. Jalankan `npx prisma migrate deploy` dan `npm run db:seed`, lalu deploy ke platform yang mendukung Next.js seperti Vercel. URL deployment harus dibuat dari akun pemilik dan tetap aktif untuk proses review; tidak ada akun deployment atau kredensial hosting pada workspace ini.
