import type { Metadata } from "next";
import ConditionalFooter from "./components/ConditionalFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: "АНГИЖРАЛ | Бариа заслын сургалтын төв",
  description: "Мэргэжлийн бариа засалч бэлтгэх сургалтын төв"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mn">
      <body>
        {children}
        <ConditionalFooter />
      </body>
    </html>
  );
}
