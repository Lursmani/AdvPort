import Reveal from "@/components/Reveal";
import cn from "@/utils/cn";

type SectionIntroProps = {
  eyebrow: string;
  title: string;
  /** Position + size utilities for the blurred decorative aura behind the heading. */
  auraClassName: string;
  /** CSS `background` value for the aura (a radial-gradient built from an accent token). */
  auraGradient: string;
};

// Shared heading for the Skills / Experience / Contact sections: the blurred
// accent aura plus the revealed eyebrow + title. Keeps the eyebrow/title type
// scale and the aura markup defined once instead of copied per section.
function SectionIntro({
  eyebrow,
  title,
  auraClassName,
  auraGradient,
}: SectionIntroProps) {
  return (
    <>
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -z-10 rounded-full blur-3xl",
          auraClassName,
        )}
        style={{ background: auraGradient }}
      />

      <Reveal className="max-w-3xl" delay={0.04} viewportAmount={0.3}>
        <p className="text-foreground-soft text-xs font-semibold uppercase tracking-eyebrow sm:text-sm">
          {eyebrow}
        </p>
        <h2 className="mt-6 max-w-4xl text-4xl font-semibold leading-none text-foreground">
          {title}
        </h2>
      </Reveal>
    </>
  );
}

export default SectionIntro;
