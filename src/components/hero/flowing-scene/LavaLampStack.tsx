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
  const { size, viewport } = useThree();
  const palette = theme === "light" ? LIGHT_PALETTE : DARK_PALETTE;
  const showContactShadows = size.width >= 768;
  const keyLightPosition = useMemo(
    () => [viewport.width * 0.5, viewport.height * 0.5, 3.2] as const,
    [viewport.height, viewport.width],
  );
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
      {showContactShadows ? (
        <ContactShadows
          blur={1.6}
          color={palette.shadow}
          far={3.6}
          opacity={0.18}
          position={[0, -viewport.height * 0.35, -1.1]}
          resolution={128}
          scale={[viewport.width * 1.35, viewport.height * 0.9]}
          smooth
        />
      ) : null}
    </>
  );
}
