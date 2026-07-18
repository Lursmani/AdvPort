import type { BufferGeometry } from "three";

export const DEFORMATION_SOURCE_ATTRIBUTE = "deformationSource";

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
  /** Frequency multiplier for the procedural noise field. */
  noiseScale: number;
  /** Number of points used to build the blob contour, clamped to a minimum of 32. */
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

/**
 * Blueprint plus generated geometry and runtime motion sources. Color is added
 * separately at render time from the active theme palette, so this built form
 * is theme-independent and can be memoized on viewport width alone.
 */
export type BuiltLayerModel = LayerBlueprint & {
  /** Explicit boundary metadata for the pinned top edge. */
  anchorConstraint: LayerAnchorConstraint;
  /** Precomputed shape geometry for the blob mesh. */
  geometry: BufferGeometry;
  /** Local pivot used for subtle motion around the pinned edge. */
  motionOrigin: Vec3;
  /** Noise source used to drive layer motion over time. */
  motionNoise: NoiseField;
};

/** Fully resolved layer model with its theme color applied, ready to render. */
export type LayerModel = BuiltLayerModel & {
  /** Fill color used by the visible blob material, from the active palette. */
  color: string;
};
