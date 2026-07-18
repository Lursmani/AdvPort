import { LayerPalette } from "./types";

// Layer fill colors per theme. These are authoring inputs to the scene's
// lighting and R3F's default ACES tone mapping, not literal on-screen colors —
// the rendered blob will read a little brighter/shifted than the raw hex.
//
// heroOne is the backmost, thinnest wave and is meant to blend into the hero
// backdrop, which is driven by the `--gradient-start` token in
// src/app/globals.scss. In light theme heroOne matches that token exactly
// (#F9E79F); in dark theme it stays in the same deep-teal family as the dark
// `--gradient-start` (#044552). Update heroOne together with `--gradient-start`.
export const LIGHT_PALETTE: LayerPalette = {
  heroOne: "#F9E79F",
  heroTwo: "#FFC300",
  heroThree: "#2a9d8f",
  heroFour: "#9e73b2",
};

export const DARK_PALETTE: LayerPalette = {
  heroOne: "#0f3143",
  heroTwo: "#22333b",
  heroThree: "#005f73",
  heroFour: "#264653",
};
