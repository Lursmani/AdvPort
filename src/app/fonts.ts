import { Geist } from "next/font/google";

export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const rootHtmlClassName = `${geistSans.variable} h-full antialiased`;
