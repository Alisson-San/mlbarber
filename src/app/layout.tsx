import type { Metadata } from "next";
import { Syne, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const syne = Syne({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-display" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "ML Barber | Mateus Lopes — Barbearia em Carlos Barbosa, RS",
  description: "Cortes que elevam sua presença. Estilo, atitude e identidade em Carlos Barbosa - Serra Gaúcha. Agende seu horário online.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${syne.variable} ${jakarta.variable} scroll-smooth`}>
      <body className="font-sans antialiased selection:bg-fern selection:text-white">{children}</body>
    </html>
  );
}
