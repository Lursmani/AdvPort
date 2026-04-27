import { Color } from "three";
import type { LayerPalette } from "./types";

function mixHexColor(from: string, to: string, amount: number) {
  const color = new Color(from);
  color.lerp(new Color(to), amount);
  return `#${color.getHexString()}`;
}

function createPalette(base: Omit<LayerPalette, "layers">): LayerPalette {
  return {
    ...base,
    layers: [
      mixHexColor(base.background, base.midA, 0.16),
      mixHexColor(base.background, base.midA, 0.42),
      base.midA,
      mixHexColor(base.midA, base.midB, 0.56),
      base.midB,
      base.foreground,
    ],
  };
}

export const LIGHT_PALETTE = createPalette({
  background: "#E69500",
  foreground: "#F9E79F",
  midA: "#FFC300",
  midB: "#F4D03F",
  shadow: "#8C4300",
});

export const DARK_PALETTE = createPalette({
  background: "#B56500",
  foreground: "#E9D689",
  midA: "#D78F00",
  midB: "#D9B131",
  shadow: "#5A2800",
});
