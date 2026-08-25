"use client";

import { useState, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { createI18nInstance } from "./i18n";

export default function I18nProvider({
  initialLang,
  children,
}: {
  initialLang: string;
  children: ReactNode;
}) {
  const [instance] = useState(() => createI18nInstance(initialLang));

  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
}
