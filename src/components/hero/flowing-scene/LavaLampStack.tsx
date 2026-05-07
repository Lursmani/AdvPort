import { useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import type { FlowingScenePointer } from "@/components/hero/HeroBanner";
import { createLayerModels } from "./layer-models";
import { LayerBlob } from "./LayerBlob";
import { LIGHT_PALETTE } from "./palette";
import type { LayerPalette } from "./types";

const SCENE_GROUP_Y = -0.1;

type LavaLampStackProps = {
  palette: LayerPalette;
  pointer: FlowingScenePointer;
};

export function LavaLampStack({ palette, pointer }: LavaLampStackProps) {
  const { viewport } = useThree();
  const keyLightPosition = useMemo(
    () => [viewport.width * -0.3, viewport.height * -0.4, 2.2] as const,
    [viewport.height, viewport.width],
  );
  const baseLayers = useMemo(
    () => createLayerModels(viewport.width, LIGHT_PALETTE),
    [viewport.width],
  );
  const layerColors = useMemo(
    () => [
      palette.heroOne,
      palette.heroTwo,
      palette.heroThree,
      palette.heroFour,
    ],
    [palette],
  );
  const layers = useMemo(
    () =>
      baseLayers.map((layer, index) => ({
        ...layer,
        color: layerColors[index] ?? layer.color,
      })),
    [baseLayers, layerColors],
  );

  useEffect(() => {
    return () => {
      baseLayers.forEach((layer) => {
        layer.geometry.dispose();
      });
    };
  }, [baseLayers]);

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
