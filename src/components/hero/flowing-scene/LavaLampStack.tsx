import { useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import type { FlowingScenePointer } from "@/components/hero/HeroBanner";
import { createLayerModels } from "./layer-models";
import { LayerBlob } from "./LayerBlob";
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
  // Quantize the width the geometry is built from so a continuous drag-resize
  // does not rebuild and dispose four ExtrudeGeometries on every pixel step.
  // 0.25 world units is imperceptible at the blob scale (radiusX ≈ 0.8 × width).
  // Allocating in render means a discarded render (e.g. StrictMode's dev
  // double-render) leaks its geometry set — the disposal effect below only
  // covers committed layers. Accepted trade-off; keep allocation and disposal
  // keyed to the same memo value.
  const geometryWidth = Math.round(viewport.width * 4) / 4;
  const baseLayers = useMemo(
    () => createLayerModels(geometryWidth),
    [geometryWidth],
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
        color: layerColors[index],
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
        {layers.map((layer, index) => (
          <LayerBlob
            key={layer.id}
            config={layer}
            entranceIndex={layers.length - 1 - index}
            pointer={pointer}
            sceneOffsetY={SCENE_GROUP_Y}
          />
        ))}
      </group>
    </>
  );
}
