import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Form Builder - Constructeur de Formulaires Dynamiques",
  description:
    "Créez visuellement des data cards modulaires pour la gestion de notes étudiantes avec un système de graphes de paramètres, des conditions JSON-Logic et une prévisualisation en temps réel.",
  keywords: [
    "form builder",
    "dynamic forms",
    "graph builder",
    "data cards",
    "student grades",
    "JSON-Logic",
  ],
  authors: [{ name: "Form Builder Team" }],
  creator: "Form Builder Team",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
