import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useState } from "react";
import { Group, MathUtils } from "three";
import type { BufferGeometry, Mesh, Vector2, Vector4 } from "three";
import type { FlowingScenePointer } from "@/components/hero/HeroBanner";
import type { HeroBlobMaterial } from "./deformation-material";
import type { BuiltLayerModel, LayerModel, Vec2 } from "./types";

type LayerBlobProps = {
  config: LayerModel;
  entranceIndex: number;
  material: HeroBlobMaterial;
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

function getEntranceTravelDistance(
  viewportHeight: number,
  config: BuiltLayerModel,
) {
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

// Reference implementation of the anchor clamp that now runs on the GPU
// (heroDisplacement in deformation-material.ts). This stays exported and
// unit-tested; keep the GLSL in sync with it.
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

// The retired CPU loop damped every vertex toward its target with λ = 10.
// With displacement on the GPU there is no per-vertex state, so the same
// damping is applied to the interaction-field parameters instead — the
// Gaussian bump then glides and fades as softly as the vertices did.
const INTERACTION_DAMP_LAMBDA = 10;

function applyInteractionFieldUniforms(
  field: Vector4,
  shape: Vector2,
  target: InteractionField | null,
  delta: number,
) {
  if (!target) {
    // Keep the last focus and direction while the bump strength fades out.
    shape.y = MathUtils.damp(shape.y, 0, INTERACTION_DAMP_LAMBDA, delta);

    if (shape.y < 0.0001) {
      shape.y = 0;
    }

    return;
  }

  field.set(
    MathUtils.damp(field.x, target.focusX, INTERACTION_DAMP_LAMBDA, delta),
    MathUtils.damp(field.y, target.focusY, INTERACTION_DAMP_LAMBDA, delta),
    MathUtils.damp(field.z, target.directionX, INTERACTION_DAMP_LAMBDA, delta),
    MathUtils.damp(field.w, target.directionY, INTERACTION_DAMP_LAMBDA, delta),
  );
  shape.x = target.bumpRadius;
  shape.y = MathUtils.damp(
    shape.y,
    target.bumpStrength,
    INTERACTION_DAMP_LAMBDA,
    delta,
  );
}

export function LayerBlob({
  config,
  entranceIndex,
  material,
  pointer,
  sceneOffsetY,
}: LayerBlobProps) {
  const { viewport } = useThree();
  const positionRef = useRef<Group>(null);
  const motionRef = useRef<Group>(null);
  const meshRef = useRef<Mesh<BufferGeometry, HeroBlobMaterial>>(null);
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

  useFrame((_state, delta) => {
    const positionGroup = positionRef.current;
    const motionGroup = motionRef.current;
    const mesh = meshRef.current;

    if (!positionGroup || !motionGroup || !mesh) {
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
    // The per-vertex work (ambient noise, bump fields, anchor clamp, normal
    // response) runs in the vertex shader; per frame the CPU only writes the
    // field uniforms. Geometry buffers are never touched at runtime. The
    // material is reached through the mesh ref because the frame loop
    // mutates it, matching the ref-based mutation idiom of the groups above.
    const deformation = mesh.material.deformation;

    deformation.uAmbientTime.value =
      elapsed * Math.max(0.12, config.distortSpeed);
    applyInteractionFieldUniforms(
      deformation.uHoverField.value,
      deformation.uHoverShape.value,
      hoverField,
      delta,
    );
    applyInteractionFieldUniforms(
      deformation.uClickField.value,
      deformation.uClickShape.value,
      clickField,
      delta,
    );
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
          <mesh ref={meshRef} geometry={config.geometry}>
            <primitive
              object={material}
              attach="material"
              color={config.color}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
}
