"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, Language } from "@/lib/i18n/translations";

interface I18nContextType {
  lang: Language;
  changeLanguage: (newLang: Language) => void;
  t: (path: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("bb_lang") as Language;
    const supported = Object.keys(translations);
    if (saved && supported.includes(saved)) {
      setLang(saved);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  const changeLanguage = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("bb_lang", newLang);
  };

  const t = (path: string) => {
    const keys = path.split(".");

    // 1. Try exact language match
    let langObj = translations[lang];

    // 2. Try base language (e.g. en-US -> en)
    if (!langObj && lang.includes('-')) {
        const baseLang = lang.split('-')[0] as Language;
        langObj = translations[baseLang];
    }

    // 3. Fallback to English
    if (!langObj) {
        langObj = translations['en'];
    }

    let result: any = langObj;
    for (const key of keys) {
      // Case-insensitive lookup
      if (result && typeof result === 'object') {
          const foundKey = Object.keys(result).find(k => k.toLowerCase() === key.toLowerCase());
          result = foundKey ? result[foundKey] : undefined;
      } else {
          result = undefined;
      }
    }

    // Fallback to English if key missing in current language
    if (!result && lang !== 'en') {
        result = translations['en'];
        for (const key of keys) {
            result = result?.[key];
        }
    }

    if (!result) {
        // console.warn(`Translation key not found: ${path} for lang: ${lang}`);
    }

    return result || path;
  };

  return (
    <I18nContext.Provider value={{ lang, changeLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
