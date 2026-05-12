"use client";

import type {
  CSSProperties,
  ComponentPropsWithoutRef,
  PointerEvent,
} from "react";
import { usePrefersReducedMotion } from "@/providers/ThemeProvider";
import cn from "@/utils/cn";

export type SkillCardGroup = {
  title?: string;
  skills: readonly string[];
};

type SkillCardTone = "amber" | "teal" | "slate";

type SkillCardProps = ComponentPropsWithoutRef<"article"> & {
  title: string;
  description: string;
  groups: readonly SkillCardGroup[];
  tone?: SkillCardTone;
};

type SkillCardStyle = CSSProperties & {
  "--skills-card-glow-x"?: string;
  "--skills-card-glow-y"?: string;
  "--skills-card-glow-opacity"?: string;
};

const DEFAULT_GLOW_X = "calc(100% - 4.5rem)";
const DEFAULT_GLOW_Y = "2rem";
const DEFAULT_GLOW_OPACITY = "0.95";
const ACTIVE_GLOW_OPACITY = "1";

const cardClasses =
  "relative flex h-full flex-col overflow-hidden rounded-4xl border border-[color-mix(in_oklab,var(--foreground)_12%,transparent)] bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_76%,transparent)_0%,color-mix(in_oklab,var(--background)_92%,transparent)_100%)] p-6 shadow-[0_28px_80px_color-mix(in_oklab,var(--background)_76%,transparent)] [-webkit-backdrop-filter:blur(24px)] backdrop-blur-[24px] before:pointer-events-none before:absolute before:left-[var(--skills-card-glow-x)] before:top-[var(--skills-card-glow-y)] before:h-56 before:w-56 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:bg-[var(--skills-card-accent)] before:[opacity:var(--skills-card-glow-opacity)] before:blur-[42px] before:transition-[left,top,opacity] before:duration-300 before:ease-out before:content-[''] motion-reduce:before:transition-none after:pointer-events-none after:absolute after:inset-px after:rounded-[inherit] after:bg-[linear-gradient(135deg,color-mix(in_oklab,var(--foreground)_8%,transparent)_0%,transparent_34%),linear-gradient(180deg,transparent_58%,color-mix(in_oklab,var(--foreground)_5%,transparent)_100%)] after:opacity-70 after:content-[''] sm:p-8";

const gridClasses =
  "pointer-events-none absolute inset-0 rounded-[inherit] opacity-35 [background-image:linear-gradient(to_right,color-mix(in_oklab,var(--foreground)_6%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--foreground)_6%,transparent)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(180deg,rgba(0,0,0,0.65),transparent_72%)]";

const gridHighlightClasses =
  "pointer-events-none absolute inset-0 rounded-[inherit] opacity-80 [background-image:linear-gradient(to_right,color-mix(in_oklab,var(--skills-card-accent)_18%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--skills-card-accent)_58%,transparent)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:radial-gradient(circle_9rem_at_var(--skills-card-glow-x)_var(--skills-card-glow-y),rgba(0,0,0,0.96)_0%,rgba(0,0,0,0.72)_30%,transparent_68%)]";

const chipClasses =
  "inline-flex rounded-full border border-[color-mix(in_oklab,var(--foreground)_10%,transparent)] bg-[color-mix(in_oklab,var(--background)_78%,transparent)] px-3 py-1.5 text-sm font-medium text-foreground shadow-[inset_0_1px_0_color-mix(in_oklab,var(--foreground)_8%,transparent)]";

const toneClasses: Record<SkillCardTone, string> = {
  amber:
    "[--skills-card-accent:color-mix(in_oklab,var(--hero-two)_66%,transparent)]",
  teal: "[--skills-card-accent:color-mix(in_oklab,var(--hero-three)_68%,transparent)]",
  slate:
    "[--skills-card-accent:color-mix(in_oklab,var(--hero-four)_66%,transparent)]",
};

function setGlowPosition(
  element: HTMLElement,
  clientX: number,
  clientY: number,
) {
  const bounds = element.getBoundingClientRect();

  element.style.setProperty(
    "--skills-card-glow-x",
    `${clientX - bounds.left}px`,
  );
  element.style.setProperty(
    "--skills-card-glow-y",
    `${clientY - bounds.top}px`,
  );
  element.style.setProperty("--skills-card-glow-opacity", ACTIVE_GLOW_OPACITY);
}

function resetGlowPosition(element: HTMLElement) {
  element.style.setProperty("--skills-card-glow-x", DEFAULT_GLOW_X);
  element.style.setProperty("--skills-card-glow-y", DEFAULT_GLOW_Y);
  element.style.setProperty("--skills-card-glow-opacity", DEFAULT_GLOW_OPACITY);
}

function SkillCard({
  className,
  title,
  description,
  groups,
  tone = "amber",
  onPointerEnter,
  onPointerLeave,
  onPointerMove,
  style,
  ...props
}: SkillCardProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const mergedStyle: SkillCardStyle = {
    "--skills-card-glow-x": DEFAULT_GLOW_X,
    "--skills-card-glow-y": DEFAULT_GLOW_Y,
    "--skills-card-glow-opacity": DEFAULT_GLOW_OPACITY,
    ...style,
  };

  const handlePointerEnter = (event: PointerEvent<HTMLElement>) => {
    onPointerEnter?.(event);

    if (prefersReducedMotion || event.pointerType === "touch") {
      return;
    }

    setGlowPosition(event.currentTarget, event.clientX, event.clientY);
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    onPointerMove?.(event);

    if (prefersReducedMotion || event.pointerType === "touch") {
      return;
    }

    setGlowPosition(event.currentTarget, event.clientX, event.clientY);
  };

  const handlePointerLeave = (event: PointerEvent<HTMLElement>) => {
    onPointerLeave?.(event);
    resetGlowPosition(event.currentTarget);
  };

  return (
    <article
      {...props}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      style={mergedStyle}
      className={cn(cardClasses, toneClasses[tone], className)}
    >
      <div className={gridClasses} />
      <div className={gridHighlightClasses} />

      <div className="relative z-10 flex h-full flex-col">
        <h3 className="max-w-xs text-2xl font-semibold tracking-tight text-foreground sm:text-[2rem]">
          {title}
        </h3>
        <p className="text-foreground-muted mt-4 max-w-sm text-sm leading-6 sm:text-base">
          {description}
        </p>

        <div className="mt-8 space-y-6">
          {groups.map((group, index) => (
            <div key={group.title ?? `${title}-${index}`}>
              {group.title ? (
                <p className="text-foreground-soft text-xs font-semibold uppercase tracking-[0.24em]">
                  {group.title}
                </p>
              ) : null}

              <ul className="mt-3 flex flex-wrap gap-2.5">
                {group.skills.map((skill) => (
                  <li key={skill}>
                    <span className={chipClasses}>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

export default SkillCard;
