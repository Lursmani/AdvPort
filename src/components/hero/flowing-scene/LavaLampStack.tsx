import { useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import type { FlowingScenePointer } from "@/components/hero/HeroBanner";
import { useTheme } from "@/providers/ThemeProvider";
import { createLayerModels } from "./layer-models";
import { LayerBlob } from "./LayerBlob";
import { DARK_PALETTE, LIGHT_PALETTE } from "./palette";

const SCENE_GROUP_Y = -0.1;

type LavaLampStackProps = {
  pointer: FlowingScenePointer;
};

export function LavaLampStack({ pointer }: LavaLampStackProps) {
  const { viewport } = useThree();
  const { theme } = useTheme();
  const keyLightPosition = useMemo(
    () => [viewport.width * -0.3, viewport.height * -0.4, 2.2] as const,
    [viewport.height, viewport.width],
  );
  const scenePalette = theme === "light" ? LIGHT_PALETTE : DARK_PALETTE;
  const layers = useMemo(
    () => createLayerModels(viewport.width, scenePalette),
    [scenePalette, viewport.width],
  );

  useEffect(() => {
    return () => {
      layers.forEach((layer) => {
        layer.geometry.dispose();
      });
    };
  }, [layers]);

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight
        color="#ffffff"
        intensity={6.45}
        position={keyLightPosition}
      />
      <group position={[0, SCENE_GROUP_Y, 0]}>
        {layers.map((layer) => (
          <LayerBlob
            key={layer.id}
            config={layer}
            pointer={pointer}
            sceneOffsetY={SCENE_GROUP_Y}
          />
        ))}
      </group>
    </>
  );
}
