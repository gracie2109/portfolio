import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import I18nProvider from "@/i18n/I18nProvider";
import LanguageSync from "@/i18n/LanguageSync";
import "./globals.css";

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
    <html lang={initialLang}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <I18nProvider initialLang={initialLang}>
          <LanguageSync />
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
