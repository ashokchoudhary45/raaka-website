import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import RaakaMusic from "@/components/RaakaMusic";
import LiveAudienceTracker from "@/components/LiveAudienceTracker";
import GlobalLiveCounter from "@/components/GlobalLiveCounter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://worldofraaka.online"),

  title: {
    default: "World of RAAKA",
    template: "%s | World of RAAKA",
  },

  description:
    "The ultimate fan-created destination for RAAKA — movie updates, cast, crew, posters, videos, songs, timeline, box office and more.",

  keywords: [
    "RAAKA",
    "Raaka movie",
    "RAAKA Telugu movie",
    "Raaka Allu Arjun",
    "World of Raaka",
    "Raaka movie updates",
    "Raaka cast",
    "Raaka box office",
  ],

  authors: [
    {
      name: "Ashok Choudhary",
    },
  ],

  creator: "Ashok Choudhary",
  publisher: "World of RAAKA",

  alternates: {
    canonical: "https://worldofraaka.online",
  },

  openGraph: {
    type: "website",
    url: "https://worldofraaka.online",
    siteName: "World of RAAKA",
    title: "World of RAAKA",
    description:
      "The ultimate fan-created destination for RAAKA — movie updates, cast, crew, posters, videos, songs, timeline, box office and more.",
    locale: "en_IN",
  },

  twitter: {
    card: "summary_large_image",
    title: "World of RAAKA",
    description:
      "The ultimate fan-created destination for RAAKA — movie updates, cast, crew, posters, videos, songs, timeline, box office and more.",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  category: "entertainment",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "dark",
  themeColor: "#050505",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden bg-[#050505] text-[#f5f5f5]">
        <a
          href="#home"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100000] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-xs focus:font-semibold focus:uppercase focus:tracking-[0.2em] focus:text-black"
        >
          Skip to content
        </a>
        <LiveAudienceTracker />
        <GlobalLiveCounter />
        {children}
        <RaakaMusic />
      </body>
    </html>
  );
}