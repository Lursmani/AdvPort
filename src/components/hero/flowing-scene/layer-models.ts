import { BufferAttribute, ExtrudeGeometry, Shape, Vector2 } from "three";
import { SimplexNoise } from "./noise";
import { DEFORMATION_SOURCE_ATTRIBUTE } from "./types";
import type {
  LayerAnchorConstraint,
  LayerBlueprint,
  LayerModel,
  LayerPalette,
} from "./types";

type BuiltLayerGeometry = {
  anchorConstraint?: LayerAnchorConstraint;
  geometry: ExtrudeGeometry;
  motionOrigin: [number, number, number];
};

const BLOB_DEPTH = 0.015;
const EXTRUDE_CURVE_SEGMENTS = 0;
const ROUNDOVER_SEGMENTS = 6;
const ROUNDOVER_SCALE = 0.015;

function smoothstep(min: number, max: number, value: number) {
  if (min === max) {
    return value < min ? 0 : 1;
  }

  const normalized = Math.min(1, Math.max(0, (value - min) / (max - min)));

  return normalized * normalized * (3 - 2 * normalized);
}

function getRoundoverInfluence(config: LayerBlueprint, y: number) {
  if (config.anchorMode === "none") {
    return 1;
  }

  const anchorY =
    config.anchorMode === "top"
      ? config.radiusY * config.flatEdgeStrength
      : -config.radiusY * config.flatEdgeStrength;

  return smoothstep(
    config.radiusY * 0.02,
    Math.max(config.radiusY * 0.22, 0.035),
    Math.abs(y - anchorY),
  );
}

function captureDeformationSource(geometry: ExtrudeGeometry) {
  const positionAttribute = geometry.getAttribute("position");

  if (!(positionAttribute instanceof BufferAttribute)) {
    return;
  }

  const deformationSource = new Float32Array(positionAttribute.array.length);

  deformationSource.set(positionAttribute.array as ArrayLike<number>);
  geometry.setAttribute(
    DEFORMATION_SOURCE_ATTRIBUTE,
    new BufferAttribute(deformationSource, 3),
  );
}

function translateDeformationSource(
  geometry: ExtrudeGeometry,
  offsetX: number,
  offsetY: number,
  offsetZ: number,
) {
  const deformationSourceAttribute = geometry.getAttribute(
    DEFORMATION_SOURCE_ATTRIBUTE,
  );

  if (!(deformationSourceAttribute instanceof BufferAttribute)) {
    return;
  }

  const deformationSource = deformationSourceAttribute.array;

  for (let index = 0; index < deformationSource.length; index += 3) {
    deformationSource[index] -= offsetX;
    deformationSource[index + 1] -= offsetY;
    deformationSource[index + 2] -= offsetZ;
  }

  deformationSourceAttribute.needsUpdate = true;
}

function centerGeometryWithDeformationSource(geometry: ExtrudeGeometry) {
  geometry.computeBoundingBox();

  const bounds = geometry.boundingBox;

  if (!bounds) {
    return null;
  }

  const centerX = (bounds.min.x + bounds.max.x) * 0.5;
  const centerY = (bounds.min.y + bounds.max.y) * 0.5;
  const centerZ = (bounds.min.z + bounds.max.z) * 0.5;

  geometry.center();
  translateDeformationSource(geometry, centerX, centerY, centerZ);

  return {
    bounds,
    centerX,
    centerY,
  };
}

function applyContinuousRoundover(
  geometry: ExtrudeGeometry,
  config: LayerBlueprint,
) {
  const positionAttribute = geometry.getAttribute("position");

  if (!(positionAttribute instanceof BufferAttribute)) {
    return;
  }

  const positions = positionAttribute.array;

  for (let index = 0; index < positions.length; index += 3) {
    const z = positions[index + 2];
    const sliceProgress = Math.min(1, Math.max(0, z / BLOB_DEPTH));
    const curveWeight = Math.sin(Math.PI * sliceProgress);

    if (curveWeight <= 0) {
      continue;
    }

    const roundoverInfluence = getRoundoverInfluence(
      config,
      positions[index + 1],
    );
    const scale = 1 + ROUNDOVER_SCALE * curveWeight * roundoverInfluence;

    positions[index] *= scale;
    positions[index + 1] *= scale;
  }

  positionAttribute.needsUpdate = true;
}

function createExtrudedGeometry(shape: Shape, config: LayerBlueprint) {
  const geometry = new ExtrudeGeometry(shape, {
    bevelEnabled: false,
    curveSegments: EXTRUDE_CURVE_SEGMENTS,
    depth: BLOB_DEPTH,
    steps: ROUNDOVER_SEGMENTS,
  });

  captureDeformationSource(geometry);
  applyContinuousRoundover(geometry, config);
  geometry.computeVertexNormals();

  return geometry;
}

function sampleBlobNoise(
  noise: SimplexNoise,
  config: LayerBlueprint,
  sampleX: number,
  sampleY: number,
) {
  const primary = noise.noise2D(
    sampleX * config.noiseScale + config.seed * 0.13,
    sampleY * config.noiseScale - config.seed * 0.09,
  );
  const secondary = noise.noise2D(
    sampleX * config.noiseScale * 2.1 - config.seed * 0.07,
    sampleY * config.noiseScale * 2.1 + config.seed * 0.19,
  );

  return {
    primary,
    secondary,
  };
}

function createBlobShape(points: Vector2[]) {
  const shape = new Shape();
  shape.moveTo(points[0].x, points[0].y);

  for (let index = 1; index < points.length; index += 1) {
    shape.lineTo(points[index].x, points[index].y);
  }

  shape.closePath();

  return shape;
}

function createFreeBlobGeometry(config: LayerBlueprint) {
  const noise = new SimplexNoise(config.seed);
  const points: Vector2[] = [];

  for (let index = 0; index < config.pointCount; index += 1) {
    const progress = index / config.pointCount;
    const angle = progress * Math.PI * 2;
    const sampleX = Math.cos(angle);
    const sampleY = Math.sin(angle);
    const { primary, secondary } = sampleBlobNoise(
      noise,
      config,
      sampleX,
      sampleY,
    );
    const lobe = Math.sin(angle * 3 + config.seed * 0.37) * 0.05;
    const radial = 1 + primary * config.blobAmplitude + secondary * 0.11 + lobe;
    points.push(
      new Vector2(
        Math.cos(angle) * config.radiusX * radial,
        Math.sin(angle) * config.radiusY * radial,
      ),
    );
  }

  const geometry = createExtrudedGeometry(createBlobShape(points), config);
  centerGeometryWithDeformationSource(geometry);

  return {
    geometry,
    motionOrigin: [0, 0, 0],
    anchorConstraint: undefined,
  } satisfies BuiltLayerGeometry;
}

function createAnchoredBlobGeometry(config: LayerBlueprint) {
  const noise = new SimplexNoise(config.seed);
  const points: Vector2[] = [];
  const anchorSign = config.anchorMode === "top" ? 1 : -1;
  const flatWidth = config.radiusX * config.edgeInset;
  const flatY = anchorSign * config.radiusY * config.flatEdgeStrength;
  const flatEdgePoints = 2;
  const contourPoints = Math.max(32, config.pointCount - flatEdgePoints + 2);

  for (let index = 0; index < flatEdgePoints; index += 1) {
    const progress = index / (flatEdgePoints - 1);
    const x = -flatWidth + flatWidth * 2 * progress;
    points.push(new Vector2(x, flatY));
  }

  for (let index = 1; index < contourPoints - 1; index += 1) {
    const progress = index / (contourPoints - 1);
    const curvedProgress =
      progress + Math.sin(progress * Math.PI * 2) / (Math.PI * 2);
    const angle = curvedProgress * Math.PI;
    const inwardBlend = Math.pow(Math.sin(angle), 1.08);
    const { primary, secondary } = sampleBlobNoise(
      noise,
      config,
      Math.cos(angle),
      -anchorSign * Math.sin(angle),
    );
    const width =
      flatWidth +
      (config.radiusX - flatWidth) * Math.pow(Math.sin(angle), 0.78);
    const x = Math.cos(angle) * width * (1 + secondary * 0.06 * inwardBlend);
    const lobe = Math.sin(angle * 2.7 + config.seed * 0.29) * 0.04;
    const depth = config.radiusY * (config.flatEdgeStrength + 0.98);
    const y =
      flatY -
      anchorSign *
        inwardBlend *
        depth *
        (1 +
          primary * config.blobAmplitude * 0.82 +
          secondary * 0.08 +
          lobe * inwardBlend);

    points.push(new Vector2(x, y));
  }

  const geometry = createExtrudedGeometry(createBlobShape(points), config);
  const centeredGeometry = centerGeometryWithDeformationSource(geometry);
  const bounds = centeredGeometry?.bounds;

  if (!bounds) {
    return {
      geometry,
      motionOrigin: [0, 0, 0],
    } satisfies BuiltLayerGeometry;
  }

  const { centerX, centerY } = centeredGeometry;

  // The geometry stays centered for rendering, while the anchored edge Y is
  // preserved explicitly so runtime motion can pin that flat edge to the scene.
  const anchoredEdgeLocalY =
    config.anchorMode === "top"
      ? bounds.max.y - centerY
      : bounds.min.y - centerY;

  return {
    anchorConstraint: {
      edgeLocalY: anchoredEdgeLocalY,
      edgeTolerance: Math.max(config.radiusY * 0.01, 0.002),
    },
    geometry,
    motionOrigin: [-centerX, anchoredEdgeLocalY, 0],
  } satisfies BuiltLayerGeometry;
}

export function createLayerModels(
  viewportWidth: number,
  viewportHeight: number,
  palette: LayerPalette,
) {
  const widthUnit = viewportWidth * 0.8;

  const heightUnit = 5;
  const horizontalSpan = viewportWidth * 0.34;
  const verticalSpan = viewportHeight * 0.32;
  const blueprints: LayerBlueprint[] = [
    {
      id: "wave-1",
      anchorMode: "top",
      basePosition: [0, 0, 1],
      blobAmplitude: 0.1,
      color: palette.heroOne,
      distortAmount: 0.16,
      distortSpeed: 0.65,
      drift: [0, 0],
      edgeInset: 1,
      flatEdgeStrength: 1,
      index: 0,
      noiseScale: 0.54,
      pointCount: 2,
      radiusX: widthUnit,
      radiusY: heightUnit * 0.1,
      rotation: 0,
      scale: 1,
      seed: 53,
    },
    {
      id: "wave-2",
      anchorMode: "top",
      basePosition: [0, 0, 0.7],
      blobAmplitude: 0.26,
      color: palette.heroTwo,
      distortAmount: 0.48,
      distortSpeed: 0.22,
      drift: [0.14, 0.1],
      edgeInset: 0.72,
      flatEdgeStrength: 0,
      index: 1,
      noiseScale: 0.2,
      pointCount: 88,
      radiusX: widthUnit,
      radiusY: heightUnit * 0.18,
      rotation: 0,
      scale: 0.92,
      seed: 41,
    },
    {
      id: "wave-3",
      anchorMode: "top",
      basePosition: [horizontalSpan * 0, verticalSpan * 1, 0.4],
      blobAmplitude: 0.46,
      color: palette.heroThree,
      distortAmount: 0.2,
      distortSpeed: 0.22,
      drift: [0.14, 0.1],
      edgeInset: 1,
      flatEdgeStrength: 0,
      index: 2,
      noiseScale: 1,
      pointCount: 96,
      radiusX: widthUnit,
      radiusY: heightUnit * 0.25,
      rotation: 0,
      scale: 0.92,
      seed: 41,
    },

    {
      id: "wave-4",
      anchorMode: "top",
      basePosition: [0, 0, 0],
      blobAmplitude: 0.26,
      color: palette.heroFour,
      distortAmount: 0.35,
      distortSpeed: 0.22,
      drift: [0.14, 0.1],
      edgeInset: 0.85,
      flatEdgeStrength: 0,
      index: 3,
      noiseScale: 0.8,
      pointCount: 88,
      radiusX: widthUnit,
      radiusY: heightUnit * 0.38,
      rotation: 0,
      scale: 0.92,
      seed: 41,
    },
  ];

  return blueprints.map((blueprint): LayerModel => {
    const { anchorConstraint, geometry, motionOrigin } =
      blueprint.anchorMode === "none"
        ? createFreeBlobGeometry(blueprint)
        : createAnchoredBlobGeometry(blueprint);

    return {
      ...blueprint,
      anchorConstraint,
      deformationSourceAttribute: DEFORMATION_SOURCE_ATTRIBUTE,
      deformationNoise: new SimplexNoise(blueprint.seed + 211),
      geometry,
      motionOrigin,
      motionNoise: new SimplexNoise(blueprint.seed + 101),
    };
  });
}
