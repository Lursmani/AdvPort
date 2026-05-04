export type Theme = "light" | "dark";

export const DEFAULT_THEME: Theme = "dark";
export const THEME_STORAGE_KEY = "theme";

export const THEME_BOOTSTRAP_SCRIPT = `(function(){var theme='${DEFAULT_THEME}';try{var stored=null;try{stored=localStorage.getItem('${THEME_STORAGE_KEY}');}catch(storageError){}var storedTheme=stored==='light'||stored==='dark'?stored:null;theme=storedTheme||(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');}catch(error){}document.documentElement.dataset.theme=theme;})();`;

export function parseTheme(
  value: string | null | undefined,
): Theme | undefined {
  return value === "light" || value === "dark" ? value : undefined;
}
