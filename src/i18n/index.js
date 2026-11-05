import { createI18n } from "vue-i18n";
import { th, en } from "./messages.js";

const saved = typeof localStorage !== "undefined" ? localStorage.getItem("md-lang") : null;
const defaultLocale = saved === "en" ? "en" : "th";

export const i18n = createI18n({
  legacy: false, // use Composition API mode
  locale: defaultLocale,
  fallbackLocale: "th",
  messages: { th, en },
});

export function setLocale(locale) {
  i18n.global.locale.value = locale;
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("md-lang", locale);
  }
}
