"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import type { FlowingScenePointer } from "@/components/hero/HeroBanner";
import { LavaLampStack } from "@/components/hero/flowing-scene/LavaLampStack";
import {
  DARK_PALETTE,
  LIGHT_PALETTE,
} from "@/components/hero/flowing-scene/palette";
import { useTheme } from "@/providers/ThemeProvider";

type FlowingSceneProps = {
  active: boolean;
  pointer: FlowingScenePointer;
};

function ClearColorUpdater({ color }: { color: number }) {
  const { gl } = useThree();

  useEffect(() => {
    gl.setClearColor(color);
  }, [color, gl]);

  return null;
}

export default function FlowingScene({ active, pointer }: FlowingSceneProps) {
  const { theme } = useTheme();
  const scenePalette = theme === "light" ? LIGHT_PALETTE : DARK_PALETTE;
  const clearColor = theme === "light" ? 0xf9e79f : 0x044552;

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <Canvas
        camera={{
          fov: 45,
          position: [0, 0.05, 6.6],
        }}
        dpr={[1, 1.5]}
        frameloop={active ? "always" : "never"}
        gl={{
          alpha: false,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(clearColor);
        }}
        performance={{ min: 0.65 }}
      >
        <ClearColorUpdater color={clearColor} />
        <LavaLampStack pointer={pointer} palette={scenePalette} />
      </Canvas>
    </div>
  );
}
