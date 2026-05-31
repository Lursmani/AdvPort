# Hero Animation Architecture

This hero effect is a React Three Fiber scene that builds blob geometry on the CPU and deforms its vertices every frame. It is not shader-driven and it is not a baked animation. The moving background is assembled from a small set of files that each own a specific step of the pipeline.

## File map

| File                                                  | Responsibility                                                                                              |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `src/app/[locale]/page.tsx`                           | Mounts the localized hero section on the home page.                                                          |
| `src/components/hero/HeroBanner.tsx`                  | Captures pointer state, reduced-motion preference, and section visibility.                                  |
| `src/components/hero/FlowingScene.tsx`                | Creates the transparent React Three Fiber canvas and pauses or resumes the render loop.                     |
| `src/components/hero/flowing-scene/LavaLampStack.tsx` | Builds the layer list, derives the entrance order, injects lighting, and renders one `LayerBlob` per layer. |
| `src/components/hero/flowing-scene/layer-models.ts`   | Defines each layer blueprint and generates the blob geometry, anchor data, and seeded noise sources.        |
| `src/components/hero/flowing-scene/LayerBlob.tsx`     | Runs the one-time entrance, per-frame motion, and vertex deformation loop.                                  |
| `src/components/hero/flowing-scene/noise.ts`          | Provides deterministic seeded simplex noise used by both shape generation and animation.                    |
| `src/components/hero/flowing-scene/palette.ts`        | Defines the theme-aware layer colors.                                                                       |
| `src/providers/ThemeProvider.tsx`                     | Supplies the current theme so the scene can swap palettes.                                                  |

## High-level flow

```mermaid
flowchart TD
    Page[page.tsx] --> Hero[HeroBanner]
    Hero -->|active + pointer ref| Scene[FlowingScene]
    Scene --> Canvas[React Three Fiber Canvas]
    Canvas --> Stack[LavaLampStack]
    Theme[ThemeProvider] --> Stack
    Models[layer-models.ts] -->|LayerModel[]| Stack
    Stack --> BlobA[LayerBlob]
    Stack --> BlobB[LayerBlob]
    Stack --> BlobC[LayerBlob]
    Stack --> BlobD[LayerBlob]
    Hero -->|pointer.current| BlobA
    Hero -->|pointer.current| BlobB
    Hero -->|pointer.current| BlobC
    Hero -->|pointer.current| BlobD
```

## 1. Mounting and scene gating

The home page mounts `HeroBanner`, and `HeroBanner` is where all non-Three scene control starts.

- `FlowingScene` is dynamically imported with `ssr: false`, so the WebGL canvas only exists in the browser.
- Pointer movement is converted into two coordinate systems and stored in a mutable ref:
  - `u` and `v`: normalized section coordinates from `0` to `1`
  - `x` and `y`: signed coordinates from `-1` to `1`, centered in the hero
- Pointer down also stores `clickU`, `clickV`, and increments `clickToken`. The layer animation loop treats that token bump as a new impulse.
- `prefers-reduced-motion: reduce` disables the scene entirely by not rendering `FlowingScene`.
- `IntersectionObserver` toggles `isInView`, which is passed down as `active` so the canvas can pause when the hero scrolls offscreen.

This means the hero animation has three top-level gates before any frame work happens:

1. The browser must support the client-only canvas path.
2. The user must not request reduced motion.
3. The hero section must be in view for the frame loop to run continuously.

## 2. Canvas and scene composition

`FlowingScene` creates a transparent `Canvas` with a fixed camera and controlled frame loop.

- Camera: `fov: 45`, `position: [0, 0.05, 6.6]`
- Device pixel ratio: `[1, 1.5]` to cap GPU cost on dense displays
- `frameloop`: `"always"` while active, `"never"` while inactive
- Clear color: transparent, so the scene sits over the hero backdrop instead of painting a solid canvas background

Inside that canvas, `LavaLampStack` owns scene assembly.

- It reads the current theme from `ThemeProvider`.
- It picks either `LIGHT_PALETTE` or `DARK_PALETTE`.
- It rebuilds the layer models when the theme changes or when `viewport.width` changes.
- It derives a reverse entrance order so `wave-4` starts first and `wave-1` enters last.
- It injects one ambient light and one directional light.
- It offsets the whole blob stack with `SCENE_GROUP_Y = -0.1`.
- It disposes each generated geometry when the layer list is replaced or the component unmounts.

## 3. How each blob is built

The geometry for each animated layer is created in `createLayerModels` inside `layer-models.ts`.

### 3.1 Blueprint stage

Each layer starts as a `LayerBlueprint`. Those blueprint fields are the main authoring surface for the effect.

- `depth`: base Z placement for stacking
- `radiusX` and `radiusY`: base blob size
- `color`: material color from the current palette
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

That attribute matters because runtime animation does not want to use already-deformed vertices as the source of truth. The code keeps two separate coordinate spaces around:

- `position`: the live, mutable vertex positions that the frame loop edits
- `deformationSource`: the original centered contour-space basis used to calculate stable deformations

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

Each finished `LayerModel` includes:

- the generated geometry
- the anchor constraint
- the motion pivot
- one seeded noise field for motion (`seed + 101`)
- one seeded noise field for contour deformation (`seed + 211`)

That `LayerModel` is what `LayerBlob` animates.

## 4. How runtime motion works

`LayerBlob` is the frame loop for one layer.

### 4.1 Setup work on mount

On mount, it reads the geometry attributes and stores copies of two arrays in refs:

- `basePositionsRef`: the stable base vertex positions
- `deformationSourcesRef`: the stable deformation-space coordinates

It also marks the live position buffer as `DynamicDrawUsage`, because the component rewrites vertex positions on many frames.

On cleanup, it restores the original positions and clears its refs.

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

- When the token changes, the layer records a new `startedAt` time.
- The click effect ramps in quickly with `smoothstep(0.02, 0.16)`.
- It then decays with `1 - smoothstep(0.24, 1.05)`.
- The final `clickBoost` value is the product of the ramp and decay curves.

This gives clicks a short-lived impulse rather than a permanent state.

### 4.4 Pointer and click fields

The pointer ref coming from `HeroBanner` is transformed several times before it affects any vertex.

1. Normalized hero coordinates are converted into world-space spans.
2. The layer's current group position is subtracted.
3. The current rotation and scale are inverted so the interaction is evaluated in blob-local space.
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

### 4.5 Vertex deformation loop

The actual shape animation happens in a single loop over the live position buffer.

For each vertex, the code starts from the stable base position and adds three possible offsets.

#### Ambient deformation

- The deformation source coordinate is normalized by the layer radii.
- Two noise samples are taken from `deformationNoise`.
- Those samples are combined into an `ambientOffset`.
- The offset is applied in the radial direction from the blob center.

This is the continuous wobble that makes the layer look alive even when the pointer is idle.

#### Hover deformation

- The distance to the hover field's focus point is measured.
- A Gaussian falloff is applied.
- The field's direction and strength are added to the offset.

#### Click deformation

- The same Gaussian falloff logic is used.
- The click field uses a larger radius and decaying strength.

### 4.6 Anchor protection and damping

After the raw target offset is computed, the vertex is constrained.

- If the vertex belongs to the anchored edge, its Y value is locked to its base Y.
- For every other vertex, `targetY` is clamped with `Math.min(baseY, proposedY)`.

In practice, that means:

- the pinned top edge does not move
- the rest of the shape can sag downward
- the runtime loop never pushes vertices above their base Y

That constraint is reinforced by `getAmbientAnchorAttenuation`, which fades ambient motion down near the anchored edge.

The final step is smoothing:

- current positions are damped toward the target positions with `MathUtils.damp`
- normals are recomputed only if the positions actually changed

This is why the effect feels soft instead of twitchy.

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
- Layering: `depth`, `index`, `color`
- Determinism: `seed`

### Interaction feel controls

- Pointer span mapping: `horizontalSpan` and `verticalSpan` in `LayerBlob.tsx`
- Hover field shape: the `createInteractionField` call that builds `hoverField`
- Click field shape: the `createInteractionField` call that builds `clickField`
- Click timing: `clickRamp`, `clickDecay`, and `clickBoost`
- Vertex easing: the `MathUtils.damp` calls in the frame loop

## 6. Performance and lifecycle notes

The current implementation keeps cost under control in a few specific ways.

- The whole scene is skipped for reduced-motion users.
- The frame loop pauses when the hero is offscreen.
- Geometry is regenerated only when viewport width or theme changes.
- Old geometries are explicitly disposed.
- Vertex writes happen against a dynamic draw buffer.
- Normals are recomputed only when vertices actually move.

## 7. If you need to change the effect

Use this as the shortest path to the right file.

- Want a different silhouette: edit `createAnchoredBlobGeometry` in `layer-models.ts`.
- Want more or less wobble: edit `distortAmount`, `distortSpeed`, or the ambient noise block in `LayerBlob.tsx`.
- Want stronger pointer response: edit the `hoverField` and `clickField` parameters in `LayerBlob.tsx`.
- Want a different stack composition: edit the `blueprints` array in `createLayerModels`.
- Want a different color system: edit `palette.ts` or the theme provider.
- Want a different pause policy: edit `HeroBanner.tsx` and `FlowingScene.tsx`.

## Summary

The animation is built from deterministic blob geometry plus a runtime CPU deformation loop.

- `HeroBanner` decides whether the scene should exist and captures interaction state.
- `FlowingScene` turns that state into a running or paused canvas.
- `LavaLampStack` rebuilds layer models from theme and viewport data.
- `layer-models.ts` generates the actual blob meshes and anchor metadata.
- `LayerBlob.tsx` applies idle motion, click impulses, and hover deformation while protecting the pinned top edge.

That separation is what makes the effect easy to tune: shape generation, scene wiring, and runtime motion are all isolated in different files.
