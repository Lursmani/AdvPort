"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import type { FlowingScenePointer } from "@/components/hero/HeroBanner";
import { LavaLampStack } from "@/components/hero/flowing-scene/LavaLampStack";
import {
  DARK_PALETTE,
  LIGHT_PALETTE,
} from "@/components/hero/flowing-scene/palette";
import type { LayerPalette } from "@/components/hero/flowing-scene/types";
import { useTheme } from "@/providers/ThemeProvider";

type FlowingSceneProps = {
  active: boolean;
  pointer: FlowingScenePointer;
};

// The frame loop is paused (frameloop="never") whenever the hero is offscreen,
// and R3F's invalidate() is a no-op in that state. Force a single manual render
// when the palette changes so a theme switch performed while the hero is paused
// repaints the blob colors instead of leaving a stale frame on screen.
function PaletteSync({ palette }: { palette: LayerPalette }) {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    gl.render(scene, camera);
  }, [palette, gl, scene, camera]);

  return null;
}

export default function FlowingScene({ active, pointer }: FlowingSceneProps) {
  const { theme, mounted } = useTheme();

  // Wait for the resolved theme before creating the canvas. useTheme falls back
  // to "dark" until next-themes resolves, so rendering early could paint the
  // dark palette for a light-theme user for a frame.
  if (!mounted) {
    return null;
  }

  const scenePalette = theme === "light" ? LIGHT_PALETTE : DARK_PALETTE;

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <Canvas
        camera={{
          fov: 45,
          position: [0, 0.05, 6.6],
        }}
        dpr={[1, 1.5]}
        frameloop={active ? "always" : "never"}
      >
        <PaletteSync palette={scenePalette} />
        <LavaLampStack pointer={pointer} palette={scenePalette} />
      </Canvas>
    </div>
  );
}
