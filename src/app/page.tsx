import HeroBanner from "@/components/hero/HeroBanner";

export default function Page() {
  return (
    <main className="w-full">
      <HeroBanner />
      <section
        id="details"
        className="mx-auto w-full max-w-7xl px-6 py-20 sm:px-10 lg:px-12"
      >
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-foreground/56">
            First Build Pass
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
            The banner is wired as a narrow client island instead of turning the
            whole route interactive.
          </h2>
        </div>
        <div id="process" className="mt-10 grid gap-5 lg:grid-cols-3">
          <article className="hero-glass rounded-[2rem] p-7">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-foreground/56">
              Layer Stack
            </p>
            <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-foreground">
              One coherent field sliced into soft vertical bands.
            </h3>
            <p className="mt-4 text-sm leading-7 text-foreground/72">
              The ribbons now come from the same evolving displacement field, so
              spacing, thickness, and curvature stay related across the whole
              surface instead of behaving like separate floating planes.
            </p>
          </article>
          <article className="hero-glass rounded-[2rem] p-7">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-foreground/56">
              Motion Model
            </p>
            <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-foreground">
              Slow lateral drift with evolving noise, not random float.
            </h3>
            <p className="mt-4 text-sm leading-7 text-foreground/72">
              The field slides sideways as a whole while the internal contour
              shape changes gradually, so the banner stays calm and hypnotic
              instead of looking like detached layers moving independently.
            </p>
          </article>
          <article className="hero-glass rounded-[2rem] p-7">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-foreground/56">
              Runtime Guardrails
            </p>
            <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-foreground">
              Dynamic loading, reduced-motion fallback, and paused frames.
            </h3>
            <p className="mt-4 text-sm leading-7 text-foreground/72">
              The page remains server-rendered, the scene loads only on the
              client, animation is skipped for reduced motion, and the canvas
              stops rendering when the hero leaves the viewport.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
