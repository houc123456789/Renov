import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VerifRenov - Le comparateur anti-arnaque pour la rénovation énergétique",
  description: "Obtenez les vrais prix du marché pour vos travaux de rénovation énergétique. Maximum 2 entreprises certifiées vous contactent. Zéro spam, 100% transparent.",
  keywords: "rénovation énergétique, pompe à chaleur, isolation, panneaux solaires, devis, comparateur, anti-arnaque, RGE, MaPrimeRénov",
  authors: [{ name: "VerifRenov" }],
  openGraph: {
    title: "VerifRenov - Comparateur anti-arnaque rénovation énergétique",
    description: "Les vrais prix du marché, entreprises vérifiées, maximum 2 contacts.",
    type: "website",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "VerifRenov - Comparateur anti-arnaque",
    description: "Rénovation énergétique transparente et sans spam",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
