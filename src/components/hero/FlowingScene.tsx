"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import type { FlowingScenePointer } from "@/components/hero/HeroBanner";
import { LavaLampStack } from "@/components/hero/flowing-scene/LavaLampStack";

type FlowingSceneProps = {
  active: boolean;
  pointer: FlowingScenePointer;
};

export default function FlowingScene({ active, pointer }: FlowingSceneProps) {
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
          alpha: true,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
        performance={{ min: 0.65 }}
      >
        <LavaLampStack pointer={pointer} />
      </Canvas>
    </div>
  );
}
