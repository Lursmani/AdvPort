import type { BufferGeometry } from "three";

export const DEFORMATION_SOURCE_ATTRIBUTE = "deformationSource";

export type LayerGeometryAttributeName = typeof DEFORMATION_SOURCE_ATTRIBUTE;

/** Two-dimensional normalized coordinates. */
export type Vec2 = [number, number];

/** Three-dimensional coordinates used for positions and offsets. */
export type Vec3 = [number, number, number];

/** Runtime anchor metadata used to keep a blob's top edge pinned to the scene bounds. */
export type LayerAnchorConstraint = {
  /** Local Y coordinate of the flattened anchored edge after geometry centering. */
  edgeLocalY: number;
  /** Small tolerance used when pinning edge vertices during runtime deformation. */
  edgeTolerance: number;
};

/** Minimal noise contract used by the layer animation code. */
export type NoiseField = {
  /** Returns a deterministic 2D noise sample for the provided coordinates. */
  noise2D: (x: number, y: number) => number;
};

/** Color tokens used to build the layered hero palette. */
export type LayerPalette = {
  heroOne: string;
  heroTwo: string;
  heroThree: string;
  heroFour: string;
};

/** Static configuration for a single blob layer. */
export type LayerBlueprint = {
  /** Human-readable id for quickly identifying the layer in code and debugging. */
  id: string;
  /** Default Z position before motion offsets are applied. */
  depth: number;
  /** Strength of the procedural bulge added to the blob contour. */
  blobAmplitude: number;
  /** Fill color used by the visible blob material. */
  color: string;
  /** Ambient contour deformation strength applied at runtime. */
  distortAmount: number;
  /** Ambient contour deformation speed applied at runtime. */
  distortSpeed: number;
  /** Horizontal drift multiplier used for ambient motion. */
  driftX: number;
  /** Horizontal inset for the flattened edge of anchored blobs. */
  edgeInset: number;
  /** How flat the anchored edge should be. */
  flatEdgeStrength: number;
  /** Layer index used for ordering and render timing. */
  index: number;
  /** Frequency multiplier for the procedural noise field. */
  noiseScale: number;
  /** Number of points used to build the blob contour. */
  pointCount: number;
  /** Horizontal radius of the blob geometry. */
  radiusX: number;
  /** Vertical radius of the blob geometry. */
  radiusY: number;
  /** Base scale applied to the layer group. */
  scale: number;
  /** Seed used to keep the shape and motion deterministic. */
  seed: number;
};

/** Fully built layer model with geometry and runtime motion sources attached. */
export type LayerModel = LayerBlueprint & {
  /** Explicit boundary metadata for the pinned top edge. */
  anchorConstraint: LayerAnchorConstraint;
  /** Geometry attribute name containing the shared contour-space deformation basis. */
  deformationSourceAttribute: LayerGeometryAttributeName;
  /** Noise source used to drive ambient contour deformation over time. */
  deformationNoise: NoiseField;
  /** Precomputed shape geometry for the blob mesh. */
  geometry: BufferGeometry;
  /** Local pivot used for subtle motion around the pinned edge. */
  motionOrigin: Vec3;
  /** Noise source used to drive layer motion over time. */
  motionNoise: NoiseField;
};
