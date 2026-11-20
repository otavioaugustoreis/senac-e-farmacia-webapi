import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MenuUsuario } from "@/components/MenuUsuario";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });
const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["italic", "normal"], variable: "--font-instrument" });

export const metadata: Metadata = {
  title: "E-Farmácia — compare preços e consulte a bula",
  description: "Pesquise medicamentos, consulte a bula, compare preços e encontre farmácias próximas.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${jakarta.variable} ${instrument.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-3 sm:px-5">
          <Header menuUsuario={<MenuUsuario />} />
          <main className="flex-1 py-6">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
