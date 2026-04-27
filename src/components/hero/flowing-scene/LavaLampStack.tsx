import { useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { useTheme } from "@/providers/ThemeProvider";
import type { FlowingScenePointer } from "@/components/hero/HeroBanner";
import { BackdropPlane } from "./BackdropPlane";
import { createLayerModels } from "./layer-models";
import { LayerBlob } from "./LayerBlob";
import { DARK_PALETTE, LIGHT_PALETTE } from "./palette";

const SCENE_GROUP_Y = -0.1;

type LavaLampStackProps = {
  pointer: FlowingScenePointer;
};

export function LavaLampStack({ pointer }: LavaLampStackProps) {
  const { theme } = useTheme();
  const { viewport } = useThree();
  const palette = theme === "light" ? LIGHT_PALETTE : DARK_PALETTE;
  const keyLightPosition = useMemo(
    () => [viewport.width * 0.5, viewport.height * 0.5, 3.2] as const,
    [viewport.height, viewport.width],
  );
  const layers = useMemo(
    () => createLayerModels(viewport.width, viewport.height, palette),
    [palette, viewport.height, viewport.width],
  );
  const { anchoredLayers, freeLayers } = useMemo(() => {
    const anchoredLayers: typeof layers = [];
    const freeLayers: typeof layers = [];

    layers.forEach((layer) => {
      if (layer.anchorMode === "none") {
        freeLayers.push(layer);
        return;
      }

      anchoredLayers.push(layer);
    });

    return {
      anchoredLayers,
      freeLayers,
    };
  }, [layers]);

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
        color="#f6f5ee"
        intensity={4.85}
        position={keyLightPosition}
      />
      <BackdropPlane color={palette.background} />
      <group position={[0, SCENE_GROUP_Y, 0]}>
        <group rotation={[0.06, -0.12, 0]}>
          {freeLayers.map((layer) => (
            <LayerBlob
              key={layer.id}
              config={layer}
              pointer={pointer}
              sceneOffsetY={SCENE_GROUP_Y}
            />
          ))}
        </group>
        <group>
          {anchoredLayers.map((layer) => (
            <LayerBlob
              key={layer.id}
              config={layer}
              pointer={pointer}
              sceneOffsetY={SCENE_GROUP_Y}
            />
          ))}
        </group>
      </group>
    </>
  );
}
