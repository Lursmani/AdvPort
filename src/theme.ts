export type Theme = "light" | "dark";

export const DEFAULT_THEME: Theme = "dark";
export const THEME_STORAGE_KEY = "theme";
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var cookie=document.cookie.match(/(?:^|; )${THEME_STORAGE_KEY}=([^;]+)/);if(cookie){return;}var stored=localStorage.getItem('${THEME_STORAGE_KEY}');var theme=stored==='light'||stored==='dark'?stored:(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');document.documentElement.dataset.theme=theme;document.cookie='${THEME_STORAGE_KEY}='+theme+'; path=/; max-age=${THEME_COOKIE_MAX_AGE}; SameSite=Lax';}catch(error){document.documentElement.dataset.theme='${DEFAULT_THEME}';}})();`;

export function parseTheme(
  value: string | null | undefined,
): Theme | undefined {
  return value === "light" || value === "dark" ? value : undefined;
}
