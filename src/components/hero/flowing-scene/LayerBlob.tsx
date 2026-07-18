import { useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useRef, useState } from "react";
import { BufferAttribute, DynamicDrawUsage, Group, MathUtils } from "three";
import type { FlowingScenePointer } from "@/components/hero/HeroBanner";
import { DEFORMATION_SOURCE_ATTRIBUTE } from "./types";
import type { BuiltLayerModel, LayerModel, Vec2 } from "./types";

type LayerBlobProps = {
  config: LayerModel;
  entranceIndex: number;
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

const ENTRANCE_DURATION_SECONDS = 0.55;
const ENTRANCE_STAGGER_SECONDS = 0.08;
const ENTRANCE_BOUNCE_AMPLITUDE = 0.02;
const ENTRANCE_BOUNCE_CYCLES = 1.35;
const ENTRANCE_BOUNCE_DURATION_SECONDS = 0.34;

// Frame deltas can spike when the tab is backgrounded or the frame loop resumes
// after the hero scrolls back into view. Clamp the accumulated-time step so a
// single large delta cannot fast-forward the entrance or click impulses.
const MAX_TIME_STEP_SECONDS = 0.1;

function getAnchoredPositionY(
  viewportHeight: number,
  sceneOffsetY: number,
  config: BuiltLayerModel,
) {
  const boundaryY = viewportHeight * 0.5 - sceneOffsetY;

  return boundaryY - config.anchorConstraint.edgeLocalY;
}

function getGeometryHeight(config: BuiltLayerModel) {
  const bounds = config.geometry.boundingBox;

  if (!bounds) {
    return config.radiusY * 2.2;
  }

  return bounds.max.y - bounds.min.y;
}

function getEntranceTravelDistance(viewportHeight: number, config: BuiltLayerModel) {
  const geometryHeight = getGeometryHeight(config);

  return geometryHeight + Math.max(viewportHeight * 0.12, config.radiusY * 0.6);
}

export function getEntranceOffset(
  entranceElapsed: number,
  entranceIndex: number,
  viewportHeight: number,
  config: BuiltLayerModel,
) {
  const layerElapsed =
    entranceElapsed - entranceIndex * ENTRANCE_STAGGER_SECONDS;
  const travelDistance = getEntranceTravelDistance(viewportHeight, config);

  if (layerElapsed <= 0) {
    return travelDistance;
  }

  if (layerElapsed < ENTRANCE_DURATION_SECONDS) {
    const progress = MathUtils.smoothstep(
      layerElapsed,
      0,
      ENTRANCE_DURATION_SECONDS,
    );

    return (1 - progress) * travelDistance;
  }

  if (
    layerElapsed >=
    ENTRANCE_DURATION_SECONDS + ENTRANCE_BOUNCE_DURATION_SECONDS
  ) {
    return 0;
  }

  const bounceProgress =
    (layerElapsed - ENTRANCE_DURATION_SECONDS) /
    ENTRANCE_BOUNCE_DURATION_SECONDS;
  const damping = Math.pow(1 - bounceProgress, 2);
  const bouncePhase = bounceProgress * Math.PI * 2 * ENTRANCE_BOUNCE_CYCLES;

  return (
    -Math.sin(bouncePhase) *
    travelDistance *
    ENTRANCE_BOUNCE_AMPLITUDE *
    damping
  );
}

export function getConstrainedDirectionY(directionY: number) {
  return Math.min(directionY, 0);
}

// Invert the full pivot-sandwiched world transform
// (world = position + m + R·S·(v − m), m = motionOrigin) so interaction
// positions land in the same local space as the deformation source.
export function toMotionLocalSpace(
  config: BuiltLayerModel,
  worldX: number,
  worldY: number,
  groupPositionX: number,
  groupPositionY: number,
  rotationZ: number,
  scale: number,
): Vec2 {
  const motionOriginX = config.motionOrigin[0];
  const motionOriginY = config.motionOrigin[1];
  const cosine = Math.cos(-rotationZ);
  const sine = Math.sin(-rotationZ);
  const inverseScale = 1 / Math.max(0.0001, scale);
  const deltaX = worldX - groupPositionX - motionOriginX;
  const deltaY = worldY - groupPositionY - motionOriginY;

  return [
    motionOriginX + (deltaX * cosine - deltaY * sine) * inverseScale,
    motionOriginY + (deltaX * sine + deltaY * cosine) * inverseScale,
  ];
}

export function getConstrainedVertexTargetY(
  config: BuiltLayerModel,
  baseY: number,
  proposedY: number,
) {
  const { anchorConstraint } = config;

  if (
    Math.abs(baseY - anchorConstraint.edgeLocalY) <=
    anchorConstraint.edgeTolerance
  ) {
    return baseY;
  }

  return Math.min(baseY, proposedY);
}

function getAmbientAnchorAttenuation(config: BuiltLayerModel, sourceY: number) {
  const { anchorConstraint } = config;

  const distanceToEdge = Math.abs(sourceY - anchorConstraint.edgeLocalY);
  const fadeBand = Math.max(
    anchorConstraint.edgeTolerance * 10,
    config.radiusY * 0.12,
  );

  return MathUtils.smoothstep(
    distanceToEdge,
    anchorConstraint.edgeTolerance,
    anchorConstraint.edgeTolerance + fadeBand,
  );
}

function createInteractionField(
  config: BuiltLayerModel,
  localPointerX: number,
  localPointerY: number,
  intensity: number,
  focusXScale: number,
  focusYScale: number,
  radiusScale: number,
  strengthScale: number,
) {
  if (intensity <= 0) {
    return null;
  }

  const pointerDistance = Math.hypot(localPointerX, localPointerY);

  if (pointerDistance <= 0.0001) {
    return null;
  }

  const directionX = localPointerX / pointerDistance;
  const directionY = getConstrainedDirectionY(localPointerY / pointerDistance);

  return {
    bumpRadius: Math.max(config.radiusX, config.radiusY) * radiusScale,
    bumpStrength:
      Math.min(config.radiusX, config.radiusY) * strengthScale * intensity,
    directionX,
    directionY,
    focusX: directionX * config.radiusX * focusXScale,
    focusY: directionY * config.radiusY * focusYScale,
  } satisfies InteractionField;
}

export function LayerBlob({
  config,
  entranceIndex,
  pointer,
  sceneOffsetY,
}: LayerBlobProps) {
  const { viewport } = useThree();
  const positionRef = useRef<Group>(null);
  const motionRef = useRef<Group>(null);
  const basePositionsRef = useRef<Float32Array | null>(null);
  const deformationSourcesRef = useRef<Float32Array | null>(null);
  // Monotonic per-blob time. R3F resets the shared clock to zero every time the
  // frame loop toggles (visibility gating flips frameloop between "always" and
  // "never"), so clock.getElapsedTime() is not a stable timeline. Accumulating
  // clamped deltas here keeps entrance, click, and drift timing continuous
  // across pauses.
  const timeRef = useRef(0);
  const [initialPosition] = useState<readonly [number, number, number]>(
    () =>
      [
        0,
        getAnchoredPositionY(viewport.height, sceneOffsetY, config) +
          getEntranceTravelDistance(viewport.height, config),
        config.depth,
      ] as const,
  );
  const entranceStateRef = useRef<{
    completed: boolean;
    startedAt: number | null;
  }>({
    completed: false,
    startedAt: null,
  });
  // Seed with the live token: the pointer ref is owned by HeroBanner and
  // outlives this scene, so a remount (e.g. reduced-motion toggled back off)
  // must not mistake a click that happened before the remount for a new one.
  const clickStateRef = useRef<{ startedAt: number | null; token: number }>({
    startedAt: null,
    token: pointer.current.clickToken,
  });

  useLayoutEffect(() => {
    const positionAttribute = config.geometry.getAttribute("position");
    const deformationSourceAttribute = config.geometry.getAttribute(
      DEFORMATION_SOURCE_ATTRIBUTE,
    );

    if (!(positionAttribute instanceof BufferAttribute)) {
      basePositionsRef.current = null;
      deformationSourcesRef.current = null;
      return;
    }

    positionAttribute.setUsage(DynamicDrawUsage);

    basePositionsRef.current = new Float32Array(positionAttribute.array);
    deformationSourcesRef.current =
      deformationSourceAttribute instanceof BufferAttribute
        ? new Float32Array(deformationSourceAttribute.array)
        : new Float32Array(positionAttribute.array);

    return () => {
      if (!basePositionsRef.current) {
        return;
      }

      deformationSourcesRef.current = null;
      positionAttribute.array.set(basePositionsRef.current);
      positionAttribute.needsUpdate = true;
    };
  }, [config.geometry]);

  useFrame((_state, delta) => {
    const positionGroup = positionRef.current;
    const motionGroup = motionRef.current;
    const basePositions = basePositionsRef.current;
    const deformationSources = deformationSourcesRef.current;
    const geometry = config.geometry;

    if (
      !positionGroup ||
      !motionGroup ||
      !basePositions ||
      !deformationSources
    ) {
      return;
    }

    const positionAttribute = geometry.getAttribute("position");

    if (!(positionAttribute instanceof BufferAttribute)) {
      return;
    }

    const timeStep = Math.min(delta, MAX_TIME_STEP_SECONDS);
    timeRef.current += timeStep;
    const elapsed = timeRef.current;
    const entranceState = entranceStateRef.current;

    if (entranceState.startedAt === null) {
      entranceState.startedAt = elapsed;
    }

    const anchoredPositionY = getAnchoredPositionY(
      viewport.height,
      sceneOffsetY,
      config,
    );
    const entranceElapsed = elapsed - entranceState.startedAt;
    const entranceDuration =
      entranceIndex * ENTRANCE_STAGGER_SECONDS +
      ENTRANCE_DURATION_SECONDS +
      ENTRANCE_BOUNCE_DURATION_SECONDS;
    const entranceOffset = entranceState.completed
      ? 0
      : getEntranceOffset(
          entranceElapsed,
          entranceIndex,
          viewport.height,
          config,
        );

    if (!entranceState.completed && entranceElapsed >= entranceDuration) {
      entranceState.completed = true;
    }

    if (pointer.current.clickToken !== clickStateRef.current.token) {
      clickStateRef.current.token = pointer.current.clickToken;
      clickStateRef.current.startedAt = elapsed;
    }

    const clickAge =
      clickStateRef.current.startedAt === null
        ? Number.POSITIVE_INFINITY
        : elapsed - clickStateRef.current.startedAt;
    const clickRamp = MathUtils.smoothstep(clickAge, 0.02, 0.16);
    const clickDecay = 1 - MathUtils.smoothstep(clickAge, 0.24, 1.05);
    const clickBoost = clickRamp * clickDecay;
    const driftTime = elapsed * 0.08;
    const driftX =
      config.motionNoise.noise2D(driftTime + config.seed * 0.11, config.seed) *
      config.driftX *
      0.72;
    const floatZ =
      config.motionNoise.noise2D(
        config.seed * 0.07 + driftTime * 0.8,
        config.seed * 0.31,
      ) * 0.08;
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
      driftX,
      3.6,
      delta,
    );
    positionGroup.position.y = anchoredPositionY + entranceOffset;
    positionGroup.position.z = MathUtils.damp(
      positionGroup.position.z,
      config.depth + floatZ,
      3.8,
      delta,
    );
    motionGroup.rotation.z = MathUtils.damp(
      motionGroup.rotation.z,
      rotationFloat * 0.16,
      3.4,
      delta,
    );

    const nextScale = MathUtils.damp(
      motionGroup.scale.x,
      config.scale * (1 + scaleFloat * 0.3),
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
    const [localPointerX, localPointerY] = toMotionLocalSpace(
      config,
      pointerWorldX,
      pointerWorldY,
      positionGroup.position.x,
      positionGroup.position.y,
      motionGroup.rotation.z,
      motionGroup.scale.x,
    );
    const [localClickX, localClickY] = toMotionLocalSpace(
      config,
      clickWorldX,
      clickWorldY,
      positionGroup.position.x,
      positionGroup.position.y,
      motionGroup.rotation.z,
      motionGroup.scale.x,
    );
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
    );
    const ambientAmplitude =
      Math.min(config.radiusX, config.radiusY) * config.distortAmount * 0.3;
    const ambientTime = elapsed * Math.max(0.12, config.distortSpeed);
    const positions = positionAttribute.array;
    let positionsDidChange = false;

    for (let index = 0; index < positions.length; index += 3) {
      const baseX = basePositions[index];
      const baseY = basePositions[index + 1];
      const baseZ = basePositions[index + 2];
      const deformationSourceX = deformationSources[index];
      const deformationSourceY = deformationSources[index + 1];
      let offsetX = 0;
      let offsetY = 0;

      if (ambientAmplitude > 0) {
        const radialLength = Math.hypot(deformationSourceX, deformationSourceY);

        if (radialLength > 0.0001) {
          const normalizedSourceX =
            deformationSourceX / Math.max(0.0001, config.radiusX);
          const normalizedSourceY =
            deformationSourceY / Math.max(0.0001, config.radiusY);
          const primaryWave = config.deformationNoise.noise2D(
            normalizedSourceX * 1.1 + ambientTime * 0.32 + config.seed * 0.17,
            normalizedSourceY * 1.1 - ambientTime * 0.24 - config.seed * 0.13,
          );
          const rippleWave = config.deformationNoise.noise2D(
            normalizedSourceX * 2.6 - ambientTime * 0.56 - config.seed * 0.09,
            normalizedSourceY * 2.6 + ambientTime * 0.41 + config.seed * 0.23,
          );
          const ambientOffset =
            (primaryWave + rippleWave * 0.34) *
            ambientAmplitude *
            getAmbientAnchorAttenuation(config, deformationSourceY);
          const radialDirectionX = deformationSourceX / radialLength;
          const radialDirectionY = deformationSourceY / radialLength;

          offsetX += radialDirectionX * ambientOffset;
          offsetY += radialDirectionY * ambientOffset;
        }
      }

      if (hoverField) {
        const hoverDistanceToFocus = Math.hypot(
          deformationSourceX - hoverField.focusX,
          deformationSourceY - hoverField.focusY,
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
          deformationSourceX - clickField.focusX,
          deformationSourceY - clickField.focusY,
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
      const nextX = MathUtils.damp(positions[index], targetX, 10, delta);
      const nextY = MathUtils.damp(positions[index + 1], targetY, 10, delta);

      if (
        Math.abs(nextX - positions[index]) > 0.0001 ||
        Math.abs(nextY - positions[index + 1]) > 0.0001
      ) {
        positionsDidChange = true;
      }

      positions[index] = nextX;
      positions[index + 1] = nextY;
      positions[index + 2] = baseZ;
    }

    if (!positionsDidChange) {
      return;
    }

    positionAttribute.needsUpdate = true;
    geometry.computeVertexNormals();
  });

  return (
    <group ref={positionRef} position={initialPosition}>
      <group
        ref={motionRef}
        position={config.motionOrigin}
        scale={config.scale}
      >
        <group
          position={[
            -config.motionOrigin[0],
            -config.motionOrigin[1],
            -config.motionOrigin[2],
          ]}
        >
          <mesh geometry={config.geometry}>
            <meshLambertMaterial color={config.color} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
