import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Syafar Tour — Hotel & Umrah Planner", description: "Cari hotel pilihan dan susun estimasi biaya perjalanan umrah." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="id"><body>{children}</body></html>; }
