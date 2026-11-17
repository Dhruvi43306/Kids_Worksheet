import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LearnSpark — Fun Worksheets for Young Learners",
  description:
    "Premium educational worksheets for primary school students worldwide. Math, English, Science, Puzzles and more — printable, colourful, and curriculum-aligned.",
  keywords: [
    "kids worksheets",
    "educational printables",
    "math worksheets",
    "english worksheets",
    "primary school",
    "homeschooling",
    "free worksheets",
  ],
  openGraph: {
    title: "LearnSpark — Fun Worksheets for Young Learners",
    description: "Printable educational worksheets for curious young minds.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={nunito.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
