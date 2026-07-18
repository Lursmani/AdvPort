import { describe, expect, it } from "vitest";
import { SimplexNoise } from "../src/components/hero/flowing-scene/noise";
import { createLayerModels } from "../src/components/hero/flowing-scene/layer-models";
import {
  getConstrainedDirectionY,
  getConstrainedVertexTargetY,
  getEntranceOffset,
  toMotionLocalSpace,
} from "../src/components/hero/flowing-scene/LayerBlob";
import { LIGHT_PALETTE } from "../src/components/hero/flowing-scene/palette";

describe("SimplexNoise", () => {
  it("is deterministic for a given seed", () => {
    const a = new SimplexNoise(53);
    const b = new SimplexNoise(53);
    const points: Array<[number, number]> = [
      [0, 0],
      [0.5, 0.5],
      [1.3, -2.1],
      [3.7, 4.2],
      [-1.1, 0.9],
    ];

    for (const [x, y] of points) {
      expect(a.noise2D(x, y)).toBe(b.noise2D(x, y));
    }
  });

  it("produces different output for different seeds", () => {
    const a = new SimplexNoise(53);
    const b = new SimplexNoise(54);

    // A handful of lattice points (e.g. the origin) are seed-independent, so
    // assert the fields differ somewhere across a sampled range rather than at
    // a single point.
    let differsSomewhere = false;

    for (let i = 1; i <= 20; i += 1) {
      if (a.noise2D(i * 0.3, i * 0.7) !== b.noise2D(i * 0.3, i * 0.7)) {
        differsSomewhere = true;
        break;
      }
    }

    expect(differsSomewhere).toBe(true);
  });

  // Locks the exact output of the optimized implementation (Fix 19). A change
  // that shifts these beyond floating-point noise is a behavioral regression.
  it("matches the known sample sequence for seed 53", () => {
    const noise = new SimplexNoise(53);
    const expected = [
      { x: 0, y: 0, value: 0 },
      { x: 0.5, y: 0.5, value: -0.614313027254 },
      { x: 1.3, y: -2.1, value: 0.488705093012 },
      { x: 3.7, y: 4.2, value: -0.007397990114 },
      { x: -1.1, y: 0.9, value: 0.37158912 },
    ];

    for (const { x, y, value } of expected) {
      expect(noise.noise2D(x, y)).toBeCloseTo(value, 10);
    }
  });

  it("stays within the simplex output range", () => {
    const noise = new SimplexNoise(7);

    for (let i = 0; i < 200; i += 1) {
      const value = noise.noise2D(i * 0.37, i * -0.19);
      expect(value).toBeGreaterThanOrEqual(-1.0001);
      expect(value).toBeLessThanOrEqual(1.0001);
    }
  });
});

describe("createLayerModels", () => {
  it("builds one model per palette hero color", () => {
    const models = createLayerModels(10);
    const heroColorCount = Object.keys(LIGHT_PALETTE).length;

    expect(models).toHaveLength(heroColorCount);
    expect(models).toHaveLength(4);
  });

  it("gives every layer a distinct motion seed", () => {
    const seeds = createLayerModels(10).map((model) => model.seed);

    expect(new Set(seeds).size).toBe(seeds.length);
  });

  it("produces width-invariant vertex counts", () => {
    const narrow = createLayerModels(6).map(
      (model) => model.geometry.getAttribute("position").array.length,
    );
    const wide = createLayerModels(30).map(
      (model) => model.geometry.getAttribute("position").array.length,
    );

    expect(wide).toEqual(narrow);
  });

  it("keeps the anchored edge at the geometry's top bound", () => {
    for (const model of createLayerModels(12)) {
      model.geometry.computeBoundingBox();
      const boundingBox = model.geometry.boundingBox;

      expect(boundingBox).not.toBeNull();
      expect(boundingBox!.max.y).toBeCloseTo(
        model.anchorConstraint.edgeLocalY,
        5,
      );
    }
  });

  it("builds theme-independent models without a baked color", () => {
    const model = createLayerModels(10)[0];

    expect("color" in model).toBe(false);
    expect("deformationSourceAttribute" in model).toBe(false);
  });
});

describe("getEntranceOffset", () => {
  const [model] = createLayerModels(12);
  const viewportHeight = 5;

  it("parks the layer above the scene before its entrance begins", () => {
    const parked = getEntranceOffset(0, 0, viewportHeight, model);

    expect(parked).toBeGreaterThan(0);
    expect(getEntranceOffset(-1, 0, viewportHeight, model)).toBe(parked);
  });

  it("settles to zero once the entrance and bounce complete", () => {
    expect(getEntranceOffset(100, 0, viewportHeight, model)).toBe(0);
  });

  it("descends during the entrance", () => {
    const parked = getEntranceOffset(0, 0, viewportHeight, model);
    const midway = getEntranceOffset(0.1, 0, viewportHeight, model);

    expect(midway).toBeGreaterThan(0);
    expect(midway).toBeLessThan(parked);
  });

  it("delays each layer by its stagger index", () => {
    const parked = getEntranceOffset(0, 0, viewportHeight, model);

    // A staggered layer is still parked at t=0.1 because its clock has not
    // started yet (0.1 - 2 * 0.08 < 0).
    expect(getEntranceOffset(0.1, 2, viewportHeight, model)).toBe(parked);
  });
});

describe("toMotionLocalSpace", () => {
  const [model] = createLayerModels(12);

  // The forward transform the helper inverts:
  // world = position + m + R·S·(v − m), with m = motionOrigin.
  function toWorldSpace(
    localX: number,
    localY: number,
    groupPositionX: number,
    groupPositionY: number,
    rotationZ: number,
    scale: number,
  ): [number, number] {
    const cosine = Math.cos(rotationZ);
    const sine = Math.sin(rotationZ);
    const relativeX = (localX - model.motionOrigin[0]) * scale;
    const relativeY = (localY - model.motionOrigin[1]) * scale;

    return [
      groupPositionX + model.motionOrigin[0] + relativeX * cosine - relativeY * sine,
      groupPositionY + model.motionOrigin[1] + relativeX * sine + relativeY * cosine,
    ];
  }

  it("is the identity for an untransformed group", () => {
    const [localX, localY] = toMotionLocalSpace(model, 1.2, -0.7, 0, 0, 0, 1);

    expect(localX).toBeCloseTo(1.2, 10);
    expect(localY).toBeCloseTo(-0.7, 10);
  });

  it("removes the group translation", () => {
    const [localX, localY] = toMotionLocalSpace(model, 1.2, -0.7, 2, -3, 0, 1);

    expect(localX).toBeCloseTo(1.2 - 2, 10);
    expect(localY).toBeCloseTo(-0.7 - -3, 10);
  });

  it("round-trips a point through the full pivot-sandwiched transform", () => {
    const localPoint: [number, number] = [0.35, -0.85];
    const [worldX, worldY] = toWorldSpace(
      localPoint[0],
      localPoint[1],
      0.4,
      -2.1,
      0.12,
      0.92,
    );
    const [localX, localY] = toMotionLocalSpace(
      model,
      worldX,
      worldY,
      0.4,
      -2.1,
      0.12,
      0.92,
    );

    expect(localX).toBeCloseTo(localPoint[0], 10);
    expect(localY).toBeCloseTo(localPoint[1], 10);
  });

  it("stays finite when the scale collapses to zero", () => {
    const [localX, localY] = toMotionLocalSpace(model, 1.2, -0.7, 0.4, -2.1, 0.12, 0);

    expect(Number.isFinite(localX)).toBe(true);
    expect(Number.isFinite(localY)).toBe(true);
  });
});

describe("vertex constraint helpers", () => {
  const [model] = createLayerModels(12);
  const edgeY = model.anchorConstraint.edgeLocalY;
  const tolerance = model.anchorConstraint.edgeTolerance;

  it("never lets interaction push a vertex upward", () => {
    expect(getConstrainedDirectionY(0.7)).toBe(0);
    expect(getConstrainedDirectionY(0)).toBe(0);
    expect(getConstrainedDirectionY(-0.3)).toBe(-0.3);
  });

  it("pins vertices on the anchored edge to their base Y", () => {
    expect(getConstrainedVertexTargetY(model, edgeY, edgeY + 10)).toBe(edgeY);
  });

  it("clamps other vertices to at most their base Y", () => {
    const baseY = edgeY - (tolerance + 1);

    expect(getConstrainedVertexTargetY(model, baseY, baseY + 5)).toBe(baseY);
    expect(getConstrainedVertexTargetY(model, baseY, baseY - 5)).toBe(
      baseY - 5,
    );
  });
});
