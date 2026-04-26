import { ContactShadows } from "@react-three/drei";
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
  const layers = useMemo(
    () => createLayerModels(viewport.width, viewport.height, palette),
    [palette, viewport.height, viewport.width],
  );
  const anchoredLayers = useMemo(
    () => layers.filter((layer) => layer.anchorMode !== "none"),
    [layers],
  );
  const freeLayers = useMemo(
    () => layers.filter((layer) => layer.anchorMode === "none"),
    [layers],
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
      <ambientLight intensity={1.7} />
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
      <ContactShadows
        blur={1.9}
        color={palette.shadow}
        far={3.6}
        opacity={0.16}
        position={[0, -viewport.height * 0.35, -1.1]}
        resolution={256}
        scale={[viewport.width * 1.35, viewport.height * 0.9]}
        smooth
      />
    </>
  );
}
