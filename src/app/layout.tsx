import type { Metadata } from "next";
import {
  Red_Hat_Display,
  Red_Hat_Text,
} from "next/font/google";

import { Providers } from "@/components/Providers";
import { Toaster } from "sonner";

import "./globals.css";

import { NotificationProvider } from "./providers/NotificationProvider";
import { PostModalProvider } from "./providers/PostModalContext";

const redHatDisplay = Red_Hat_Display({
  variable: "--font-red-hat-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const redHatText = Red_Hat_Text({
  variable: "--font-red-hat-text",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ReDikma - Comunicando Cultura",
  description:
    "Plataforma de comunicação interna para engajamento e colaboração corporativa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`
        ${redHatDisplay.variable}
        ${redHatText.variable}
        h-full
        antialiased
        bg-white
      `}
    >
      <body
        suppressHydrationWarning
        className={`
          min-h-full
          flex
          flex-col
          bg-white
          font-(family-name:--font-red-hat-text)
        `}
        style={{
          fontFamily:
            "var(--font-red-hat-text), var(--font-red-hat-display), sans-serif",
        }}
      >
        <Providers>
          <NotificationProvider>
            <PostModalProvider>{children}</PostModalProvider>
          </NotificationProvider>
        </Providers>

        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}