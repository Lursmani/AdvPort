import { Shape, ShapeGeometry, Vector2 } from "three";
import { SimplexNoise } from "./noise";
import type {
  LayerAnchorConstraint,
  LayerBlueprint,
  LayerModel,
  LayerPalette,
} from "./types";

type BuiltLayerGeometry = {
  anchorConstraint?: LayerAnchorConstraint;
  geometry: ShapeGeometry;
  motionOrigin: [number, number, number];
};

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

function createShapeGeometry(points: Vector2[]) {
  const shape = new Shape();
  shape.moveTo(points[0].x, points[0].y);

  for (let index = 1; index < points.length; index += 1) {
    shape.lineTo(points[index].x, points[index].y);
  }

  shape.closePath();

  return new ShapeGeometry(shape);
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

  const geometry = createShapeGeometry(points);
  geometry.center();

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
  const curveBias = 0.35 + Math.min(0.35, config.inwardPointDensity * 0.35);

  for (let index = 0; index < flatEdgePoints; index += 1) {
    const progress = index / (flatEdgePoints - 1);
    const x = -flatWidth + flatWidth * 2 * progress;
    points.push(new Vector2(x, flatY));
  }

  for (let index = 1; index < contourPoints - 1; index += 1) {
    const progress = index / (contourPoints - 1);
    const curvedProgress =
      progress + (Math.sin(progress * Math.PI * 2) * curveBias) / (Math.PI * 2);
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

  const geometry = createShapeGeometry(points);
  geometry.computeBoundingBox();
  const bounds = geometry.boundingBox;

  if (!bounds) {
    geometry.center();

    return {
      geometry,
      motionOrigin: [0, 0, 0],
    } satisfies BuiltLayerGeometry;
  }

  const centerX = (bounds.min.x + bounds.max.x) * 0.5;
  const centerY = (bounds.min.y + bounds.max.y) * 0.5;

  geometry.center();

  // The geometry stays centered for rendering, while the anchored edge Y is
  // preserved explicitly so runtime motion can pin that flat edge to the scene.
  const anchoredEdgeLocalY = flatY - centerY;

  return {
    anchorConstraint: {
      edgeLocalY: anchoredEdgeLocalY,
      edgeTolerance: Math.max(config.radiusY * 0.01, 0.002),
    },
    geometry,
    motionOrigin: [-centerX, anchoredEdgeLocalY, 0],
  } satisfies BuiltLayerGeometry;
}

function createBlobGeometry(config: LayerBlueprint) {
  if (config.anchorMode === "none") {
    return createFreeBlobGeometry(config);
  }

  return createAnchoredBlobGeometry(config);
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
  const shadowColor = palette.shadow;
  const blueprints: LayerBlueprint[] = [
    {
      id: "upper-bottom-wave",
      anchorMode: "top",
      basePosition: [horizontalSpan * 0, verticalSpan * 1, 0.4],
      blobAmplitude: 0.26,
      color: palette.layers[2],
      distortAmount: 0.48,
      distortSpeed: 0.22,
      drift: [0.14, 0.1],
      edgeInset: 0.72,
      flatEdgeStrength: 0.86,
      index: 3,
      inwardPointDensity: 1,
      noiseScale: 1,
      pointCount: 132,
      radiusX: widthUnit,
      radiusY: heightUnit * 0.25,
      rotation: 0,
      scale: 0.92,
      seed: 41,
      shadow: {
        color: shadowColor,
        offset: [0.16, -0.12, -0.14],
        opacity: 0.18,
      },
    },
    {
      id: "lower-bottom-wave",
      anchorMode: "bottom",
      basePosition: [horizontalSpan * 0, verticalSpan * 1, 0.4],
      blobAmplitude: 0.26,
      color: palette.layers[2],
      distortAmount: 0.48,
      distortSpeed: 0.22,
      drift: [0.14, 0.1],
      edgeInset: 0.72,
      flatEdgeStrength: 0.86,
      index: 3,
      inwardPointDensity: 1,
      noiseScale: 1,
      pointCount: 132,
      radiusX: widthUnit,
      radiusY: heightUnit * 0.25,
      rotation: 0,
      scale: 0.92,
      seed: 41,
      shadow: {
        color: shadowColor,
        offset: [0.1, 0.12, -0.14],
        opacity: 0.18,
      },
    },
    {
      id: "upper-mid-wave",
      anchorMode: "top",
      basePosition: [0, 0, 0.7],
      blobAmplitude: 0.26,
      color: palette.layers[3],
      distortAmount: 0.48,
      distortSpeed: 0.22,
      drift: [0.14, 0.1],
      edgeInset: 0.72,
      flatEdgeStrength: 0.86,
      index: 3,
      inwardPointDensity: 1,
      noiseScale: 1,
      pointCount: 132,
      radiusX: widthUnit,
      radiusY: heightUnit * 0.15,
      rotation: 0,
      scale: 0.92,
      seed: 41,
      shadow: {
        color: shadowColor,
        offset: [0.16, -0.12, -0.14],
        opacity: 0.18,
      },
    },
    {
      id: "lower-mid-wave",
      anchorMode: "bottom",
      basePosition: [0, 0, 0.7],
      blobAmplitude: 0.21,
      color: palette.layers[3],
      distortAmount: 1,
      distortSpeed: 0.99,
      drift: [0.16, 0.13],
      edgeInset: 1,
      flatEdgeStrength: 1,
      index: 2,
      inwardPointDensity: 0.5,
      noiseScale: 0.2,
      pointCount: 136,
      radiusX: widthUnit,
      radiusY: heightUnit * 0.12,
      rotation: 0,
      scale: 1,
      seed: 29,
      shadow: {
        color: shadowColor,
        offset: [0.16, 0, -0.05],
        opacity: 0.18,
      },
    },
    {
      id: "upper-top-wave",
      anchorMode: "top",
      basePosition: [0, 0, 1],
      blobAmplitude: 0.1,
      color: palette.layers[5],
      distortAmount: 0.16,
      distortSpeed: 0.65,
      drift: [0, 0],
      edgeInset: 0.76,
      flatEdgeStrength: 1,
      index: 4,
      inwardPointDensity: 0,
      noiseScale: 0.54,
      pointCount: 2,
      radiusX: widthUnit,
      radiusY: heightUnit * 0.1,
      rotation: 0,
      scale: 1,
      seed: 53,
      shadow: {
        color: shadowColor,
        offset: [0.14, -0.11, -0.22],
        opacity: 0.19,
        opacity: 0.19,
    },
    {
      id: "lower-top-wave",
      anchorMode: "bottom",
      basePosition: [0, 0, 1],
      blobAmplitude: 0.28,
      color: palette.layers[5],
      distortAmount: 0,
      distortSpeed: 0.29,
      drift: [0.1, 0.1],
      edgeInset: 1,
      flatEdgeStrength: 1,
      index: 5,
      inwardPointDensity: 0.5,
      noiseScale: 1.96,
      pointCount: 122,
      radiusX: widthUnit,
      radiusY: heightUnit * 0.1,
      rotation: 0,
      scale: 1,
      seed: 88,
      shadow: {
        color: shadowColor,
        offset: [0.16, 0, -0.05],
        opacity: 0.18,
      },
    },
  ];

  return blueprints.map((blueprint): LayerModel => {
    const { anchorConstraint, geometry, motionOrigin } =
      createBlobGeometry(blueprint);

    return {
      ...blueprint,
      anchorConstraint,
      geometry,
      motionOrigin,
      motionNoise: new SimplexNoise(blueprint.seed + 101),
    };
  });
}
