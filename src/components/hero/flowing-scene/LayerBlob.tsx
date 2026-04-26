import { MeshDistortMaterial } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { BufferAttribute, DoubleSide, Group, MathUtils, Mesh } from "three";
import type { FlowingScenePointer } from "@/components/hero/HeroBanner";
import type { LayerModel } from "./types";

type LayerBlobProps = {
  config: LayerModel;
  pointer: FlowingScenePointer;
  sceneOffsetY: number;
};

type InteractionField = {
  bumpRadius: number;
  bumpStrength: number;
  directionX: number;
  directionY: number;
  focusX: number;
  focusY: number;
};

function getAnchoredPositionY(
  viewportHeight: number,
  sceneOffsetY: number,
  config: LayerModel,
) {
  const anchorConstraint = config.anchorConstraint;

  if (!anchorConstraint || config.anchorMode === "none") {
    return config.basePosition[1];
  }

  const boundaryY =
    config.anchorMode === "top"
      ? viewportHeight * 0.5 - sceneOffsetY
      : -viewportHeight * 0.5 - sceneOffsetY;

  return boundaryY - anchorConstraint.edgeLocalY;
}

function getConstrainedDirectionY(config: LayerModel, directionY: number) {
  if (!config.anchorConstraint) {
    return directionY;
  }

  if (config.anchorMode === "top") {
    return Math.min(directionY, 0);
  }

  if (config.anchorMode === "bottom") {
    return Math.max(directionY, 0);
  }

  return directionY;
}

function getConstrainedVertexTargetY(
  config: LayerModel,
  baseY: number,
  proposedY: number,
) {
  const anchorConstraint = config.anchorConstraint;

  if (!anchorConstraint) {
    return proposedY;
  }

  if (
    Math.abs(baseY - anchorConstraint.edgeLocalY) <=
    anchorConstraint.edgeTolerance
  ) {
    return baseY;
  }

  if (config.anchorMode === "top") {
    return Math.min(baseY, proposedY);
  }

  if (config.anchorMode === "bottom") {
    return Math.max(baseY, proposedY);
  }

  return proposedY;
}

function createInteractionField(
  config: LayerModel,
  localPointerX: number,
  localPointerY: number,
  intensity: number,
  focusScale: number,
  anchoredFocusScale: number,
  radiusScale: number,
  anchoredStrengthScale: number,
  freeStrengthScale: number,
) {
  if (intensity <= 0) {
    return null;
  }

  const pointerDistance = Math.hypot(localPointerX, localPointerY);

  if (pointerDistance <= 0.0001) {
    return null;
  }

  const isAnchored = config.anchorMode !== "none";
  const directionX = localPointerX / pointerDistance;
  const rawDirectionY = localPointerY / pointerDistance;
  const directionY = getConstrainedDirectionY(config, rawDirectionY);
  const focusYScale = isAnchored ? anchoredFocusScale : focusScale;

  return {
    bumpRadius: Math.max(config.radiusX, config.radiusY) * radiusScale,
    bumpStrength:
      Math.min(config.radiusX, config.radiusY) *
      (isAnchored ? anchoredStrengthScale : freeStrengthScale) *
      intensity,
    directionX,
    directionY,
    focusX: directionX * config.radiusX * focusScale,
    focusY: directionY * config.radiusY * focusYScale,
  } satisfies InteractionField;
}

export function LayerBlob({ config, pointer, sceneOffsetY }: LayerBlobProps) {
  const { viewport } = useThree();
  const positionRef = useRef<Group>(null);
  const motionRef = useRef<Group>(null);
  const shadowRef = useRef<Mesh>(null);
  const basePositionsRef = useRef<Float32Array | null>(null);
  const clickStateRef = useRef({
    startedAt: -100,
    token: 0,
  });

  useEffect(() => {
    const positionAttribute = config.geometry.getAttribute("position");

    if (!(positionAttribute instanceof BufferAttribute)) {
      basePositionsRef.current = null;
      return;
    }

    basePositionsRef.current = new Float32Array(positionAttribute.array);

    return () => {
      if (!basePositionsRef.current) {
        return;
      }

      positionAttribute.array.set(basePositionsRef.current);
      positionAttribute.needsUpdate = true;
    };
  }, [config.geometry]);

  useFrame(({ clock }, delta) => {
    const positionGroup = positionRef.current;
    const motionGroup = motionRef.current;
    const shadow = shadowRef.current;
    const basePositions = basePositionsRef.current;
    const isAnchored = config.anchorMode !== "none";

    if (!positionGroup || !motionGroup || !basePositions) {
      return;
    }

    const positionAttribute = config.geometry.getAttribute("position");

    if (!(positionAttribute instanceof BufferAttribute)) {
      return;
    }

    const elapsed = clock.getElapsedTime();

    if (pointer.current.clickToken !== clickStateRef.current.token) {
      clickStateRef.current.token = pointer.current.clickToken;
      clickStateRef.current.startedAt = elapsed;
    }

    const clickAge =
      clickStateRef.current.startedAt >= 0
        ? elapsed - clickStateRef.current.startedAt
        : 100;
    const clickRamp = MathUtils.smoothstep(clickAge, 0.02, 0.16);
    const clickDecay = 1 - MathUtils.smoothstep(clickAge, 0.24, 1.05);
    const clickBoost = clickRamp * clickDecay;
    const driftTime = elapsed * 0.08;
    const driftX =
      config.motionNoise.noise2D(driftTime + config.seed * 0.11, config.seed) *
      config.drift[0];
    const driftY =
      config.motionNoise.noise2D(config.seed * 0.19, driftTime + config.seed) *
      config.drift[1];
    const resolvedDriftX = isAnchored ? driftX * 0.72 : driftX;
    const resolvedDriftY = isAnchored ? 0 : driftY;
    const floatZ =
      config.motionNoise.noise2D(
        config.seed * 0.07 + driftTime * 0.8,
        config.seed * 0.31,
      ) * (isAnchored ? 0.08 : 0.12);
    const rotationFloat =
      config.motionNoise.noise2D(
        config.seed * 0.13,
        config.seed * 0.27 + driftTime * 0.7,
      ) * 0.06;
    const scaleFloat =
      config.motionNoise.noise2D(
        config.seed * 0.23,
        config.seed * 0.41 + driftTime * 0.45,
      ) * 0.028;

    positionGroup.position.x = MathUtils.damp(
      positionGroup.position.x,
      config.basePosition[0] + resolvedDriftX,
      3.6,
      delta,
    );
    const nextPositionY = MathUtils.damp(
      positionGroup.position.y,
      config.basePosition[1] + resolvedDriftY,
      3.6,
      delta,
    );
    positionGroup.position.y = isAnchored
      ? getAnchoredPositionY(viewport.height, sceneOffsetY, config)
      : nextPositionY;
    positionGroup.position.z = MathUtils.damp(
      positionGroup.position.z,
      config.basePosition[2] + floatZ,
      3.8,
      delta,
    );
    motionGroup.rotation.z = MathUtils.damp(
      motionGroup.rotation.z,
      isAnchored ? rotationFloat * 0.16 : config.rotation + rotationFloat,
      3.4,
      delta,
    );

    const nextScale = MathUtils.damp(
      motionGroup.scale.x,
      config.scale * (1 + scaleFloat * (isAnchored ? 0.3 : 1)),
      4.2,
      delta,
    );
    motionGroup.scale.setScalar(nextScale);

    const horizontalSpan = viewport.width * 0.34;
    const verticalSpan = viewport.height * 0.32;
    const pointerWorldX = pointer.current.x * horizontalSpan;
    const pointerWorldY = pointer.current.y * verticalSpan - sceneOffsetY;
    const clickWorldX = (pointer.current.clickU - 0.5) * 2 * horizontalSpan;
    const clickWorldY =
      (0.5 - pointer.current.clickV) * 2 * verticalSpan - sceneOffsetY;
    const pointerDeltaX = pointerWorldX - positionGroup.position.x;
    const pointerDeltaY = pointerWorldY - positionGroup.position.y;
    const clickDeltaX = clickWorldX - positionGroup.position.x;
    const clickDeltaY = clickWorldY - positionGroup.position.y;
    const inverseAngle = -motionGroup.rotation.z;
    const cosine = Math.cos(inverseAngle);
    const sine = Math.sin(inverseAngle);
    const inverseScale = 1 / Math.max(0.0001, motionGroup.scale.x);
    const localPointerX =
      (pointerDeltaX * cosine - pointerDeltaY * sine) * inverseScale;
    const localPointerY =
      (pointerDeltaX * sine + pointerDeltaY * cosine) * inverseScale;
    const localClickX =
      (clickDeltaX * cosine - clickDeltaY * sine) * inverseScale;
    const localClickY =
      (clickDeltaX * sine + clickDeltaY * cosine) * inverseScale;
    const pointerInfluence = pointer.current.active
      ? Math.min(1, Math.hypot(pointer.current.x, pointer.current.y) + 0.22)
      : 0;
    const hoverField = createInteractionField(
      config,
      localPointerX,
      localPointerY,
      pointerInfluence,
      0.82,
      0.76,
      0.42,
      0.055,
      0.07,
    );
    const clickField = createInteractionField(
      config,
      localClickX,
      localClickY,
      clickBoost,
      0.94,
      0.88,
      0.58,
      0.042,
      0.05,
    );
    const positions = positionAttribute.array;

    for (let index = 0; index < positions.length; index += 3) {
      const baseX = basePositions[index];
      const baseY = basePositions[index + 1];
      const baseZ = basePositions[index + 2];
      let offsetX = 0;
      let offsetY = 0;

      if (hoverField) {
        const hoverDistanceToFocus = Math.hypot(
          baseX - hoverField.focusX,
          baseY - hoverField.focusY,
        );
        const hoverFalloff = Math.exp(
          -(hoverDistanceToFocus * hoverDistanceToFocus) /
            (hoverField.bumpRadius * hoverField.bumpRadius),
        );

        offsetX +=
          hoverField.directionX * hoverField.bumpStrength * hoverFalloff;
        offsetY +=
          hoverField.directionY * hoverField.bumpStrength * hoverFalloff;
      }

      if (clickField) {
        const clickDistanceToFocus = Math.hypot(
          baseX - clickField.focusX,
          baseY - clickField.focusY,
        );
        const clickFalloff = Math.exp(
          -(clickDistanceToFocus * clickDistanceToFocus) /
            (clickField.bumpRadius * clickField.bumpRadius),
        );

        offsetX +=
          clickField.directionX * clickField.bumpStrength * clickFalloff;
        offsetY +=
          clickField.directionY * clickField.bumpStrength * clickFalloff;
      }

      const targetX = baseX + offsetX;
      const targetY = getConstrainedVertexTargetY(
        config,
        baseY,
        baseY + offsetY,
      );

      positions[index] = MathUtils.damp(positions[index], targetX, 10, delta);
      positions[index + 1] = MathUtils.damp(
        positions[index + 1],
        targetY,
        10,
        delta,
      );
      positions[index + 2] = baseZ;
    }

    positionAttribute.needsUpdate = true;

    if (!shadow || !config.shadow) {
      return;
    }

    const shadowDriftScale = isAnchored ? 0.06 : 0.12;

    shadow.position.x = MathUtils.damp(
      shadow.position.x,
      config.shadow.offset[0] - resolvedDriftX * shadowDriftScale,
      4,
      delta,
    );
    shadow.position.y = MathUtils.damp(
      shadow.position.y,
      config.shadow.offset[1] - resolvedDriftY * shadowDriftScale,
      4,
      delta,
    );
    shadow.position.z = MathUtils.damp(
      shadow.position.z,
      config.shadow.offset[2],
      4,
      delta,
    );

    const shadowScale = MathUtils.damp(shadow.scale.x, 1.04, 4, delta);
    shadow.scale.setScalar(shadowScale);
  });

  const initialPosition = [
    config.basePosition[0],
    config.anchorConstraint
      ? getAnchoredPositionY(viewport.height, sceneOffsetY, config)
      : config.basePosition[1],
    config.basePosition[2],
  ] as const;

  return (
    <group ref={positionRef} position={initialPosition}>
      <group ref={motionRef} position={config.motionOrigin}>
        <group
          position={[
            -config.motionOrigin[0],
            -config.motionOrigin[1],
            -config.motionOrigin[2],
          ]}
        >
          {config.shadow ? (
            <mesh
              ref={shadowRef}
              geometry={config.geometry}
              position={config.shadow.offset}
              renderOrder={config.index * 2}
            >
              <meshBasicMaterial
                color={config.shadow.color}
                depthWrite={false}
                opacity={config.shadow.opacity}
                toneMapped={false}
                transparent
              />
            </mesh>
          ) : null}
          <mesh geometry={config.geometry} renderOrder={config.index * 2 + 1}>
            <MeshDistortMaterial
              clearcoat={0}
              color={config.color}
              depthWrite
              emissive={config.color}
              emissiveIntensity={0.18}
              factor={config.distortAmount}
              metalness={0}
              reflectivity={0}
              roughness={1}
              side={DoubleSide}
              specularIntensity={0}
              speed={config.distortSpeed}
              toneMapped={false}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
}
