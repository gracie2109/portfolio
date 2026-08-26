import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import I18nProvider from "@/i18n/I18nProvider";
import LanguageSync from "@/i18n/LanguageSync";
import "./globals.css";

// App.css already defines --font-main/--font-display/--font-mono as CSS
// variables (with these families as their literal fallback names) — bind
// each font to that same variable name instead of forcing a className
// font-family, so the existing per-element var(--font-*) usage picks up
// the self-hosted font automatically.
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-main",
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Gracie | Portfolio | Creative Developer",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const initialLang = cookieStore.get("portfolio-lang")?.value ?? "vi";

  return (
    <html
      lang={initialLang}
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <I18nProvider initialLang={initialLang}>
          <LanguageSync />
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
