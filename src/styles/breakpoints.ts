// Numeric mirror of the SCSS breakpoint scale in `src/styles/_breakpoints.scss`
// (the same values are exported as Tailwind `--breakpoint-*` tokens from
// `globals.scss`). This file exists so JS that must branch on viewport width or
// build a matchMedia query references the shared scale instead of hardcoding
// pixel values. Keep the numbers in sync with `_breakpoints.scss`.
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type BreakpointName = keyof typeof BREAKPOINTS;

export function mediaMinWidth(name: BreakpointName) {
  return `(min-width: ${BREAKPOINTS[name]}px)`;
}
