import { MeshLambertMaterial, Vector2, Vector3, Vector4 } from "three";
import type { WebGLProgramParametersWithUniforms } from "three";
import { DEFORMATION_SOURCE_ATTRIBUTE } from "./types";
import type { BuiltLayerModel } from "./types";

type UniformValue<T> = { value: T };

export type HeroBlobDeformationUniforms = {
  /** Accumulated per-layer time pre-scaled by the layer's distortSpeed. */
  uAmbientTime: UniformValue<number>;
  /** Hover bump: focus.xy in deformation-source space, push direction in zw. */
  uHoverField: UniformValue<Vector4>;
  /** Hover bump shape: Gaussian radius in x, damped strength in y. */
  uHoverShape: UniformValue<Vector2>;
  /** Click bump field, packed like the hover field. */
  uClickField: UniformValue<Vector4>;
  /** Click bump shape, packed like the hover shape. */
  uClickShape: UniformValue<Vector2>;
  /** Ambient wobble amplitude: min(radiusX, radiusY) × distortAmount × 0.3. */
  uAmbientAmplitude: UniformValue<number>;
  /** Blueprint seed, used as a noise domain offset to decorrelate layers. */
  uSeed: UniformValue<number>;
  /** Finite-difference step for the displacement Jacobian. */
  uFdEpsilon: UniformValue<number>;
  /** Blob radii used to normalize deformation-source coordinates. */
  uRadii: UniformValue<Vector2>;
  /** x: anchored-edge local Y, y: pin tolerance, z: ambient fade band. */
  uAnchor: UniformValue<Vector3>;
};

// One cache key for every layer: the injected GLSL is identical across blobs
// (only uniform values differ), so all four materials share a single compiled
// WebGL program. Per-layer shader variants would need per-variant keys.
const PROGRAM_CACHE_KEY = "hero-blob-deformation";

const VERTEX_HEADER = /* glsl */ `
#include <common>

attribute vec3 ${DEFORMATION_SOURCE_ATTRIBUTE};

uniform float uAmbientTime;
uniform float uAmbientAmplitude;
uniform float uSeed;
uniform float uFdEpsilon;
uniform vec2 uRadii;
uniform vec3 uAnchor;
uniform vec4 uHoverField;
uniform vec2 uHoverShape;
uniform vec4 uClickField;
uniform vec2 uClickShape;

// 2D simplex noise adapted from webgl-noise (Ashima Arts / Stefan Gustavson,
// MIT). Statistically equivalent to the CPU SimplexNoise in noise.ts but not
// numerically identical: per-layer decorrelation comes from the seed-based
// domain offsets in heroDisplacement, not from a seeded permutation table.
vec3 heroPermute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float heroSnoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = heroPermute(heroPermute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

vec2 heroFieldOffset(vec2 source, vec4 field, vec2 shape) {
  if (shape.x <= 0.0 || shape.y <= 0.0) {
    return vec2(0.0);
  }

  vec2 toFocus = source - field.xy;
  float falloff = exp(-dot(toFocus, toFocus) / (shape.x * shape.x));

  return field.zw * (shape.y * falloff);
}

// GPU port of the retired CPU vertex loop in LayerBlob.tsx. The anchor clamp
// at the end mirrors getConstrainedVertexTargetY, which stays exported (and
// unit-tested) as the reference implementation — keep the two in sync.
vec2 heroDisplacement(vec2 source, float baseY) {
  vec2 offset = vec2(0.0);
  float radialLength = length(source);

  if (uAmbientAmplitude > 0.0 && radialLength > 0.0001) {
    vec2 normalizedSource = source / uRadii;
    float primaryWave = heroSnoise(vec2(
      normalizedSource.x * 1.1 + uAmbientTime * 0.32 + uSeed * 0.17,
      normalizedSource.y * 1.1 - uAmbientTime * 0.24 - uSeed * 0.13
    ));
    float rippleWave = heroSnoise(vec2(
      normalizedSource.x * 2.6 - uAmbientTime * 0.56 - uSeed * 0.09,
      normalizedSource.y * 2.6 + uAmbientTime * 0.41 + uSeed * 0.23
    ));
    float anchorAttenuation = smoothstep(uAnchor.y, uAnchor.y + uAnchor.z, abs(source.y - uAnchor.x));
    float ambientOffset = (primaryWave + rippleWave * 0.34) * uAmbientAmplitude * anchorAttenuation;

    offset += (source / radialLength) * ambientOffset;
  }

  offset += heroFieldOffset(source, uHoverField, uHoverShape);
  offset += heroFieldOffset(source, uClickField, uClickShape);

  // Anchored-edge vertices stay pinned; every other vertex may only sag.
  offset.y = abs(baseY - uAnchor.x) <= uAnchor.y ? 0.0 : min(offset.y, 0.0);

  return offset;
}
`;

// The displacement is a z-independent 2D warp, so the deformed normal is the
// inverse-transpose of the warp's 2×2 Jacobian applied to the static normal
// (z picks up the determinant before renormalizing). A finite difference over
// uFdEpsilon supplies the Jacobian; this replaces the per-frame CPU
// computeVertexNormals() and keeps the rim lighting tracking the deformation.
const VERTEX_NORMAL_BLOCK = /* glsl */ `
vec2 heroSource = ${DEFORMATION_SOURCE_ATTRIBUTE}.xy;
vec2 heroOffset = heroDisplacement(heroSource, position.y);
vec2 heroDdx = (heroDisplacement(heroSource + vec2(uFdEpsilon, 0.0), position.y) - heroOffset) / uFdEpsilon;
vec2 heroDdy = (heroDisplacement(heroSource + vec2(0.0, uFdEpsilon), position.y + uFdEpsilon) - heroOffset) / uFdEpsilon;
#include <beginnormal_vertex>
float heroDet = (1.0 + heroDdx.x) * (1.0 + heroDdy.y) - heroDdy.x * heroDdx.y;
objectNormal = normalize(vec3(
  (1.0 + heroDdy.y) * objectNormal.x - heroDdx.y * objectNormal.y,
  -heroDdy.x * objectNormal.x + (1.0 + heroDdx.x) * objectNormal.y,
  heroDet * objectNormal.z
));
`;

const VERTEX_POSITION_BLOCK = /* glsl */ `
vec3 transformed = vec3(position.xy + heroOffset, position.z);
`;

function getAmbientFadeBand(model: BuiltLayerModel) {
  return Math.max(
    model.anchorConstraint.edgeTolerance * 10,
    model.radiusY * 0.12,
  );
}

/**
 * MeshLambertMaterial with the blob displacement moved into the vertex
 * shader. Geometry buffers stay static; LayerBlob animates the material by
 * writing the `deformation` uniforms once per frame per layer.
 */
export class HeroBlobMaterial extends MeshLambertMaterial {
  readonly deformation: HeroBlobDeformationUniforms;

  constructor(model: BuiltLayerModel) {
    super();

    this.deformation = {
      uAmbientTime: { value: 0 },
      uHoverField: { value: new Vector4() },
      uHoverShape: { value: new Vector2() },
      uClickField: { value: new Vector4() },
      uClickShape: { value: new Vector2() },
      uAmbientAmplitude: {
        value:
          Math.min(model.radiusX, model.radiusY) * model.distortAmount * 0.3,
      },
      uSeed: { value: model.seed },
      // Small relative to the ~0.4 × radius noise feature size, large enough
      // to stay above float32 rounding in the finite difference.
      uFdEpsilon: {
        value: Math.max(0.002, Math.min(model.radiusX, model.radiusY) * 0.02),
      },
      uRadii: {
        value: new Vector2(
          Math.max(0.0001, model.radiusX),
          Math.max(0.0001, model.radiusY),
        ),
      },
      uAnchor: {
        value: new Vector3(
          model.anchorConstraint.edgeLocalY,
          model.anchorConstraint.edgeTolerance,
          getAmbientFadeBand(model),
        ),
      },
    };
  }

  customProgramCacheKey() {
    return PROGRAM_CACHE_KEY;
  }

  onBeforeCompile(shader: WebGLProgramParametersWithUniforms) {
    Object.assign(shader.uniforms, this.deformation);

    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", VERTEX_HEADER)
      .replace("#include <beginnormal_vertex>", VERTEX_NORMAL_BLOCK)
      .replace("#include <begin_vertex>", VERTEX_POSITION_BLOCK);
  }
}
