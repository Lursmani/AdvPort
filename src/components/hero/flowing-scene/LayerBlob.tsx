import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import {
  BufferAttribute,
  DynamicDrawUsage,
  FrontSide,
  Group,
  MathUtils,
} from "three";
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
  const boundaryY = viewportHeight * 0.5 - sceneOffsetY;

  return boundaryY - config.anchorConstraint.edgeLocalY;
}

function getConstrainedDirectionY(directionY: number) {
  return Math.min(directionY, 0);
}

function getConstrainedVertexTargetY(
  config: LayerModel,
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

function getAmbientAnchorAttenuation(config: LayerModel, sourceY: number) {
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
  config: LayerModel,
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

export function LayerBlob({ config, pointer, sceneOffsetY }: LayerBlobProps) {
  const { viewport } = useThree();
  const positionRef = useRef<Group>(null);
  const motionRef = useRef<Group>(null);
  const basePositionsRef = useRef<Float32Array | null>(null);
  const deformationSourcesRef = useRef<Float32Array | null>(null);
  const deformationActiveRef = useRef(false);
  const clickStateRef = useRef({
    startedAt: -100,
    token: 0,
  });

  useEffect(() => {
    const positionAttribute = config.geometry.getAttribute("position");
    const deformationSourceAttribute = config.geometry.getAttribute(
      config.deformationSourceAttribute,
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
      deformationActiveRef.current = false;
      positionAttribute.array.set(basePositionsRef.current);
      positionAttribute.needsUpdate = true;
    };
  }, [config.deformationSourceAttribute, config.geometry]);

  useFrame(({ clock }, delta) => {
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
    positionGroup.position.y = getAnchoredPositionY(
      viewport.height,
      sceneOffsetY,
      config,
    );
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

    const shouldUpdateDeformation =
      pointer.current.active ||
      clickBoost > 0.0005 ||
      deformationActiveRef.current;

    if (!shouldUpdateDeformation) {
      return;
    }

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
    const hasActiveField = hoverField !== null || clickField !== null;
    const ambientAmplitude =
      Math.min(config.radiusX, config.radiusY) * config.distortAmount * 0.3;
    const ambientTime = elapsed * Math.max(0.12, config.distortSpeed);
    const positions = positionAttribute.array;
    let normalsNeedUpdate = false;
    let positionsDidChange = false;
    let deformationStillActive = hasActiveField;

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
      const positionChanged =
        Math.abs(nextX - positions[index]) > 0.0001 ||
        Math.abs(nextY - positions[index + 1]) > 0.0001;

      if (positionChanged) {
        positionsDidChange = true;
        normalsNeedUpdate = true;
      }

      if (
        !deformationStillActive &&
        (Math.abs(nextX - baseX) > 0.00025 || Math.abs(nextY - baseY) > 0.00025)
      ) {
        deformationStillActive = true;
      }

      positions[index] = nextX;
      positions[index + 1] = nextY;
      positions[index + 2] = baseZ;
    }

    deformationActiveRef.current = deformationStillActive;

    if (!positionsDidChange) {
      return;
    }

    positionAttribute.needsUpdate = true;

    if (normalsNeedUpdate) {
      geometry.computeVertexNormals();

      const normalAttribute = geometry.getAttribute("normal");

      if (normalAttribute instanceof BufferAttribute) {
        normalAttribute.needsUpdate = true;
      }
    }
  });

  const initialPosition = [
    0,
    getAnchoredPositionY(viewport.height, sceneOffsetY, config),
    config.depth,
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
          <mesh geometry={config.geometry} renderOrder={config.index * 2 + 1}>
            <meshLambertMaterial color={config.color} side={FrontSide} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
