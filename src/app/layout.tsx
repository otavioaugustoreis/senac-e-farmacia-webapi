import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MenuUsuario } from "@/components/MenuUsuario";
import { NavInferior } from "@/components/NavInferior";
import { obterContainer } from "@/infrastructure/container";
import { listarCategorias } from "@/application/casos-de-uso/buscar-medicamentos";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });
const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["italic", "normal"], variable: "--font-instrument" });

export const metadata: Metadata = {
  title: "E-Farmácia — compare preços e consulte a bula",
  description: "Pesquise medicamentos, consulte a bula, compare preços e encontre farmácias próximas.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#114029",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { repos, usuarioAtual } = await obterContainer();
  const [usuario, categorias] = await Promise.all([usuarioAtual(), listarCategorias(repos)()]);

  return (
    <html lang="pt-BR" className={`${jakarta.variable} ${instrument.variable}`}>
      <body className="min-h-dvh font-sans antialiased">
        <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[2000] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:font-semibold">
          Pular para o conteúdo
        </a>
        <div className="mx-auto flex min-h-dvh w-full max-w-[90rem] flex-col px-3 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:px-6 md:pb-0 lg:px-10">
          <Header menuUsuario={<MenuUsuario usuario={usuario} />} categorias={categorias} />
          <main id="conteudo" className="flex-1 py-5 sm:py-6">{children}</main>
          <Footer />
        </div>
        <NavInferior admin={usuario?.role === "admin"} />
      </body>
    </html>
  );
}
