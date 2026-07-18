# Hero Animation Architecture

This hero effect is a React Three Fiber scene that builds blob geometry on the CPU once and deforms it every frame in a patched vertex shader on the GPU. It is not a baked animation: the silhouette is generated deterministically at build time, and the runtime displacement (ambient wobble, hover and click bumps) is driven by a handful of per-layer uniforms. The moving background is assembled from a small set of files that each own a specific step of the pipeline.

## File map

| File                                                        | Responsibility                                                                                                                    |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/[locale]/page.tsx`                                 | Mounts the localized hero section on the home page.                                                                               |
| `src/components/hero/HeroBanner.tsx`                        | Captures pointer state, reduced-motion preference, and section visibility.                                                        |
| `src/components/hero/FlowingScene.tsx`                      | Creates the transparent React Three Fiber canvas and pauses or resumes the render loop.                                           |
| `src/components/hero/flowing-scene/LavaLampStack.tsx`       | Builds the layer models and their materials, derives the entrance order, injects lighting, and renders one `LayerBlob` per layer. |
| `src/components/hero/flowing-scene/layer-models.ts`         | Defines each layer blueprint and generates the blob geometry, anchor data, and seeded noise sources.                              |
| `src/components/hero/flowing-scene/LayerBlob.tsx`           | Runs the one-time entrance and per-frame group motion, and feeds the deformation uniforms.                                        |
| `src/components/hero/flowing-scene/deformation-material.ts` | Patches `MeshLambertMaterial` with the GPU displacement shader and owns its uniform contract.                                     |
| `src/components/hero/flowing-scene/noise.ts`                | Provides deterministic seeded simplex noise used by shape generation and CPU-side layer motion.                                   |
| `src/components/hero/flowing-scene/palette.ts`              | Defines the theme-aware layer colors.                                                                                             |
| `src/providers/ThemeProvider.tsx`                           | Supplies the current theme so the scene can swap palettes.                                                                        |

## High-level flow

```mermaid
flowchart TD
    Page[page.tsx] --> Hero[HeroBanner]
    Hero -->|active + pointer ref| Scene[FlowingScene]
    Scene --> Canvas[React Three Fiber Canvas]
    Canvas --> Stack[LavaLampStack]
    Theme[ThemeProvider] --> Stack
    Models[layer-models.ts] -->|BuiltLayerModel[]| Stack
    Stack --> BlobA[LayerBlob]
    Stack --> BlobB[LayerBlob]
    Stack --> BlobC[LayerBlob]
    Stack --> BlobD[LayerBlob]
    Hero -->|pointer.current| BlobA
    Hero -->|pointer.current| BlobB
    Hero -->|pointer.current| BlobC
    Hero -->|pointer.current| BlobD
```

## TL/DR

The hero background ("lava lamp" of soft blobs) is a React Three Fiber scene. The key idea: the blob shapes are computed once on the CPU at build time, and every frame the vertices are deformed on the GPU in a patched vertex shader. It's not a baked animation — the silhouette is generated deterministically, and the movement is driven by a small set of per-layer uniforms.

1. Three gates before any work happens (HeroBanner.tsx)

The canvas is client-only (dynamic import with ssr: false) — WebGL never runs on the server.
If the user prefers reduced motion, the scene is never mounted and its JS chunk is never even downloaded.
An IntersectionObserver pauses the render loop (frameloop: "never") when the hero scrolls offscreen. 2. Building each blob once (layer-models.ts)

Four "wave" blueprints (wave-1…wave-4) each define size, noise, seed, depth, etc.
Seeded simplex noise samples an organic 2D contour, which starts with a flat pinned top edge, then gets extruded into a thin 3D mesh with a soft side profile (applyContinuousRoundover).
Crucially, before anything else the original vertex positions are copied into a custom attribute called deformationSource. So the geometry carries two coordinate spaces: position (the static base the shader displaces) and deformationSource (the pristine basis it samples noise/bumps from). Geometry is rebuilt only when the quantized viewport width changes; a theme change only remaps colors. 3. Per-frame CPU work is tiny (LayerBlob.tsx)

Each frame the CPU only updates the layer's outer group transforms (drift, float, wobble, breathing scale, entrance slide-in) and writes a handful of uniforms. It never touches vertex buffers.
Time is tracked by accumulating clamped frame deltas (timeRef), not by reading R3F's clock — because R3F resets the clock to zero every time frameloop toggles (which happens on every scroll in/out).
Pointer position is transformed into blob-local space (toMotionLocalSpace) and turned into a Gaussian hover field and a decaying click field. These field parameters are damped (λ = 10) so bumps glide and fade softly. 4. The actual shape animation runs on the GPU (deformation-material.ts)

MeshLambertMaterial is patched via onBeforeCompile. For each vertex, heroDisplacement sums up to three offsets: ambient wobble (two simplex samples advanced by time + seed), hover bump, and click bump.
Anchor protection: vertices on the pinned top edge get their Y offset zeroed; every other vertex is clamped to min(offsetY, 0), so the blob can only sag downward, never poke above its flat top.
Because the warp is 2D, the shader also bends the normals — it takes a finite-difference Jacobian of the displacement and applies its inverse-transpose, so the rim highlight tracks the deformation without any per-frame computeVertexNormals().
All four layers share one compiled shader program (constant customProgramCacheKey); only uniform values differ.

## 1. Mounting and scene gating

The home page mounts `HeroBanner`, and `HeroBanner` is where all non-Three scene control starts.

- `FlowingScene` is dynamically imported with `ssr: false`, so the WebGL canvas only exists in the browser.
- Pointer movement is converted into two coordinate systems and stored in a mutable ref:
  - `u` and `v`: normalized section coordinates from `0` to `1`
  - `x` and `y`: signed coordinates from `-1` to `1`, centered in the hero
- Pointer down also stores `clickU`, `clickV`, and increments `clickToken`. The layer animation loop treats that token bump as a new impulse.
- `prefers-reduced-motion: reduce` disables the scene entirely by not rendering `FlowingScene`. The preference is read synchronously (via `useSyncExternalStore` in `ThemeProvider`), so for reduced-motion users the scene is never mounted and its chunk is never downloaded.
- `IntersectionObserver` toggles `isInView`, which is passed down as `active` so the canvas can pause when the hero scrolls offscreen.

This means the hero animation has three top-level gates before any frame work happens:

1. The browser must support the client-only canvas path.
2. The user must not request reduced motion.
3. The hero section must be in view for the frame loop to run continuously.

## 2. Canvas and scene composition

`FlowingScene` reads the resolved theme and creates a transparent `Canvas` with a fixed camera and controlled frame loop.

- It waits for the resolved theme (`mounted`) before creating the canvas, so a light-theme user never sees a frame of the dark palette.
- Camera: `fov: 45`, `position: [0, 0.05, 6.6]`
- Device pixel ratio: `[1, 1.5]` to cap GPU cost on dense displays
- `frameloop`: `"always"` while active, `"never"` while inactive
- The canvas is transparent (R3F's default alpha). The visible background is the CSS `.hero-backdrop` element, painted with the `--gradient-start` token — the single source of truth for the hero background. A theme switch therefore recolors the background instantly through CSS even while the frame loop is paused, and an undrawn canvas composites as nothing rather than opaque black.
- `PaletteSync` forces one manual `gl.render` when the palette changes, so a theme switch performed while the hero is paused (`frameloop="never"`, where `invalidate()` is a no-op) repaints the blob colors instead of leaving a stale frame.

The layer fill colors are authoring inputs to the scene lighting and R3F's default ACES tone mapping, so the rendered blobs read slightly brighter and shifted from the raw palette hex values. `heroOne` is tuned to match the light `--gradient-start` exactly so the backmost wave blends into the backdrop.

Inside that canvas, `LavaLampStack` owns scene assembly.

- It receives the active palette from `FlowingScene` and maps one color onto each layer.
- Layer geometry is theme-independent, so a theme change only re-maps colors; it never rebuilds geometry.
- It rebuilds the layer models only when the quantized `viewport.width` changes (rounded to 0.25 world units so a drag-resize does not rebuild and dispose geometry on every pixel step).
- It creates one `HeroBlobMaterial` per layer. All four materials share a single compiled WebGL program (constant `customProgramCacheKey`); only their uniform values differ.
- It derives a reverse entrance order so `wave-4` starts first and `wave-1` enters last.
- It injects one ambient light and one directional light.
- It offsets the whole blob stack with `SCENE_GROUP_Y = -0.1`.
- It disposes each generated geometry and its paired material when the layer list is replaced or the component unmounts.

## 3. How each blob is built

The geometry for each animated layer is created in `createLayerModels` inside `layer-models.ts`.

### 3.1 Blueprint stage

Each layer starts as a `LayerBlueprint`. Those blueprint fields are the main authoring surface for the effect.

- `depth`: base Z placement for stacking
- `radiusX` and `radiusY`: base blob size
- `blobAmplitude`: how strongly contour noise changes the silhouette
- `noiseScale`: frequency of the silhouette noise samples
- `pointCount`: contour resolution, clamped to a minimum of `32`
- `edgeInset`: width of the pinned flat top edge
- `flatEdgeStrength`: how flat and high the anchored edge is
- `distortAmount`: runtime ambient deformation strength
- `distortSpeed`: runtime ambient deformation speed
- `driftX`: sideways drift amount
- `scale`: base layer scale
- `seed`: deterministic seed used for both shape and motion noise

`radiusX` is derived from the current viewport width, so the hero scales horizontally with the viewport.

The blueprint deliberately has no color field — the fill color comes from the active theme palette and is mapped onto each layer by `LavaLampStack` at render time, which is what keeps the built models theme-independent.

### 3.2 Contour generation

`createAnchoredBlobGeometry` converts a blueprint into a 2D shape before extrusion.

1. A seeded `SimplexNoise` instance is created from `config.seed`.
2. Two points are added first to form the flat anchored top edge.
3. The rest of the contour is sampled along a half-loop.
4. `sampleBlobNoise` returns a primary and secondary noise value.
5. Those noise values modulate width, depth, and lobe shape to keep the outline organic.

Important detail: `pointCount` is the intended total contour density, but the builder enforces `MIN_LAYER_POINT_COUNT = 32`, so very small values are rounded up.

### 3.3 Extrusion and deformation source capture

Once the 2D contour exists, `createExtrudedGeometry` turns it into a 3D mesh.

- The shape is extruded with `depth = 0.015`.
- Bevels are disabled.
- `steps = 6` is used to create enough Z slices for a soft profile.

Before the geometry is changed further, the original vertex positions are copied into a custom buffer attribute named `deformationSource`.

That attribute matters because the runtime displacement must not be computed from vertices the roundover has already scaled. The geometry keeps two separate coordinate spaces around:

- `position`: the static base vertex positions — never rewritten at runtime; the vertex shader displaces them per frame
- `deformationSource`: the original centered contour-space basis the vertex shader samples noise and bump fields from

### 3.4 Roundover and centering

After extrusion, the mesh gets a soft side profile.

- `applyContinuousRoundover` walks each vertex.
- It computes how far that vertex is through the extruded depth.
- Middle Z slices are scaled outward slightly using a sine-weighted curve.

Then the geometry is centered. Because centering would otherwise invalidate the stored source positions, `translateDeformationSource` applies the same center offset to the `deformationSource` attribute.

The centered geometry also produces the anchor metadata used later at runtime:

- `anchorConstraint.edgeLocalY`: where the pinned top edge sits in local space
- `anchorConstraint.edgeTolerance`: how close a vertex must be to that edge to count as anchored
- `motionOrigin`: the pivot used for subtle rotation and scale motion around the anchored edge

### 3.5 Layer model assembly

Each finished `BuiltLayerModel` includes:

- the generated geometry
- the anchor constraint
- the motion pivot
- one seeded noise field for motion (`seed + 101`)

Contour deformation noise no longer lives on the model: it is sampled inside the vertex shader, decorrelated per layer through seed-based domain offsets.

`LavaLampStack` then maps the active palette color onto each built model, producing the `LayerModel` that `LayerBlob` animates.

## 4. How runtime motion works

`LayerBlob` is the frame loop for one layer.

Timing is tracked per layer by accumulating clamped frame deltas (`timeRef`), not by reading the React Three Fiber clock. R3F resets the shared clock to zero whenever `frameloop` toggles — which happens every time the hero scrolls in or out of view — so an absolute clock read would restart the timeline mid-animation and replay old click impulses. Accumulated time keeps the entrance, click impulse, and drift continuous: while the hero is offscreen the frame loop is paused and time simply stops, then resumes exactly where it left off.

### 4.1 Setup work on mount

There is none for the geometry. The position buffer is static and never rewritten at runtime — the vertex shader reads `position` as the stable base and `deformationSource` as the deformation basis, so the CPU keeps no copies of either and nothing needs restoring on cleanup. The only per-layer runtime state is the accumulated time, the entrance and click trackers, and the damped interaction-field uniforms on the layer's `HeroBlobMaterial`.

### 4.2 Group motion

Every frame, `useFrame` updates the layer's outer transform before touching any vertices.

- On the first active frame only, each blob starts above the hero bounds, slides down into place, and finishes with a small bounce.
- The stagger is derived from the render order in reverse, so `wave-4`, `wave-3`, `wave-2`, and `wave-1` enter sequentially.
- Once a layer finishes that entrance, it stays in its normal anchored motion path and does not replay on later viewport re-entry.

- `positionGroup.position.x` drifts using `motionNoise` and `driftX`
- `positionGroup.position.y` is recomputed from the current viewport height, then combined with the temporary entrance offset so the top edge settles into the scene boundary
- `positionGroup.position.z` floats around `config.depth`
- `motionGroup.rotation.z` gets a subtle noise-driven wobble
- `motionGroup.scale` breathes slightly over time

The Y anchor is computed from:

- the current viewport height
- the scene group offset
- `anchorConstraint.edgeLocalY`

That is what keeps the blob visually attached to the top of the hero while the rest of the shape moves.

### 4.3 Click impulse lifecycle

`HeroBanner` increments `clickToken` on every pointer down. `LayerBlob` watches that token.

- The watcher is seeded with the live token on mount — the pointer ref outlives the scene, so a remount (e.g. reduced motion toggled back off) does not replay a click that happened before it.
- When the token changes, the layer records a new `startedAt` time.
- The click effect ramps in quickly with `smoothstep(0.02, 0.16)`.
- It then decays with `1 - smoothstep(0.24, 1.05)`.
- The final `clickBoost` value is the product of the ramp and decay curves.

This gives clicks a short-lived impulse rather than a permanent state.

### 4.4 Pointer and click fields

The pointer ref coming from `HeroBanner` is transformed several times before it affects any vertex.

1. Normalized hero coordinates are converted into world-space spans.
2. The layer's group position and its motion-origin pivot are subtracted.
3. The rotation and scale are inverted about that pivot so the interaction is evaluated in the same blob-local space as the deformation source. The full transform is `world = position + m + R·S·(v − m)` (with `m` the motion origin), and all of it is inverted — not just rotation and scale. This inversion is the exported `toMotionLocalSpace` helper in `LayerBlob.tsx`, covered by `tests/hero-scene.test.ts`.
4. `createInteractionField` turns that local pointer or click position into a directional bump field.

Each field contains:

- a focus point inside the blob
- a bump radius
- a bump strength
- a normalized push direction

There are two simultaneous fields:

- `hoverField`: active while the pointer is inside the hero
- `clickField`: active while the click impulse is still decaying

The Y direction is clamped with `Math.min(directionY, 0)`, which means interaction can pull the blob downward or sideways, but not push it upward past the pinned top edge.

The fields are not applied on the CPU. Each frame they are damped (`INTERACTION_DAMP_LAMBDA = 10`, matching the retired per-vertex damping) into the layer's material uniforms: focus and push direction into `uHoverField` / `uClickField`, Gaussian radius and strength into `uHoverShape` / `uClickShape`. When a field disappears, its strength fades toward zero while the focus and direction hold their last values, so the bump releases as softly as it appeared.

### 4.5 Vertex displacement on the GPU

The actual shape animation happens in the vertex shader that `deformation-material.ts` injects into `MeshLambertMaterial` via `onBeforeCompile`. For each vertex, `heroDisplacement` starts from the static base position and adds up to three offsets.

#### Ambient deformation

- The `deformationSource` coordinate is normalized by the layer radii (`uRadii`).
- Two simplex samples are taken from `heroSnoise`, advanced by `uAmbientTime` and offset by `uSeed`.
- Those samples are combined into an ambient offset, attenuated near the anchored edge.
- The offset is applied in the radial direction from the blob center.

The GPU noise is statistically equivalent to the CPU `SimplexNoise` in `noise.ts` but not numerically identical; layers stay decorrelated through their seed-based domain offsets. This is the continuous wobble that makes the layer look alive even when the pointer is idle — it runs on every in-view frame regardless of interaction.

#### Hover and click deformation

- The distance from the deformation source to the field's focus point is measured.
- A Gaussian falloff is applied (`uHoverShape.x` / `uClickShape.x` radius).
- The field's direction and damped strength are added to the offset.
- The click field uses a larger radius and a strength that decays with the impulse.

### 4.6 Anchor protection and normal response

After the raw offset is summed, the shader constrains it.

- If the vertex belongs to the anchored edge (`uAnchor`), its Y offset is zeroed.
- Every other vertex gets `min(offsetY, 0)`, so the shape can only sag below its base.

This mirrors `getConstrainedVertexTargetY` in `LayerBlob.tsx`, which stays exported and unit-tested as the reference implementation of the clamp — keep the GLSL and the TS helper in sync.

Because the displacement is a z-independent 2D warp, the shader also bends normals: it takes a finite-difference Jacobian of `heroDisplacement` (step `uFdEpsilon`) and applies its inverse-transpose to the static normal before lighting. That is what keeps the rim highlight along the lower contour redistributing as the blob deforms — it replaces the per-frame `computeVertexNormals()` of the retired CPU loop.

The softness of the motion comes from damping the interaction-field parameters on the CPU (section 4.4); ambient motion needs no extra smoothing because it is already continuous in time.

## 5. What controls the animation

If you want to tune the effect, these are the main control points.

### Top-level behavior switches

- Reduced motion: `HeroBanner.tsx`
- Visibility pause and resume: `HeroBanner.tsx` plus `FlowingScene.tsx`
- Theme palette swap: `ThemeProvider.tsx` plus `palette.ts`

### Scene-wide visual controls

- Camera and DPR: `FlowingScene.tsx`
- Lighting and vertical stack offset: `LavaLampStack.tsx`
- Viewport-based overall width: `createLayerModels` in `layer-models.ts`

### Per-layer authoring controls

- Shape silhouette: `blobAmplitude`, `noiseScale`, `pointCount`, `radiusX`, `radiusY`
- Top edge behavior: `edgeInset`, `flatEdgeStrength`, `anchorConstraint`
- Idle motion: `distortAmount`, `distortSpeed`, `driftX`, `scale`
- Layering: `depth`, `color`
- Determinism: `seed`

### Interaction feel controls

- Pointer span mapping: `horizontalSpan` and `verticalSpan` in `LayerBlob.tsx`
- Hover field shape: the `createInteractionField` call that builds `hoverField`
- Click field shape: the `createInteractionField` call that builds `clickField`
- Click timing: `clickRamp`, `clickDecay`, and `clickBoost`
- Field easing: `INTERACTION_DAMP_LAMBDA` in `LayerBlob.tsx`
- Wobble character: the ambient block of `heroDisplacement` in `deformation-material.ts`

## 6. Performance and lifecycle notes

The current implementation keeps cost under control in a few specific ways.

- The whole scene is skipped for reduced-motion users (never mounted, chunk never loaded).
- The frame loop pauses when the hero is offscreen, and per-layer accumulated time pauses with it.
- Geometry is regenerated only when the quantized viewport width changes; a theme change only re-maps colors.
- Old geometries and their paired materials are explicitly disposed.
- Vertex displacement and the normal response run entirely on the GPU; geometry buffers are uploaded once and never rewritten.
- The per-frame CPU cost per layer is a few group transforms and uniform writes.
- All four layers share one compiled shader program via a constant `customProgramCacheKey`.

## 7. If you need to change the effect

Use this as the shortest path to the right file.

- Want a different silhouette: edit `createAnchoredBlobGeometry` in `layer-models.ts`.
- Want more or less wobble: edit `distortAmount`, `distortSpeed`, or the ambient block of `heroDisplacement` in `deformation-material.ts`.
- Want stronger pointer response: edit the `hoverField` and `clickField` parameters in `LayerBlob.tsx`.
- Want a different displacement or lighting response: edit the GLSL in `deformation-material.ts`, keeping the anchor clamp in sync with `getConstrainedVertexTargetY`.
- Want a different stack composition: edit the `blueprints` array in `createLayerModels`.
- Want a different color system: edit `palette.ts` or the theme provider.
- Want a different pause policy: edit `HeroBanner.tsx` and `FlowingScene.tsx`.

## Summary

The animation is built from deterministic blob geometry plus a runtime GPU displacement shader.

- `HeroBanner` decides whether the scene should exist and captures interaction state.
- `FlowingScene` turns that state into a running or paused canvas.
- `LavaLampStack` rebuilds layer models and their materials from theme and viewport data.
- `layer-models.ts` generates the actual blob meshes and anchor metadata.
- `LayerBlob.tsx` runs the entrance and group motion and feeds the interaction uniforms.
- `deformation-material.ts` displaces vertices and bends normals on the GPU while protecting the pinned top edge.

That separation is what makes the effect easy to tune: shape generation, scene wiring, and runtime motion are all isolated in different files.
