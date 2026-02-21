import type { Metadata } from "next";
import localFont from 'next/font/local';
import "./globals.css";

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: "スポぐり講師管理システム | Spogli Coach",
  description: "スポーツイングリッシュプログラム「スポぐり」の講師管理・レッスン管理・生徒評価を一元管理",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
