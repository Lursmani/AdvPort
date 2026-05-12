"use client";

import type { ComponentPropsWithoutRef, PointerEvent } from "react";
import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/providers/ThemeProvider";
import cn from "@/utils/cn";
import styles from "./SkillCard.module.css";

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

type PointerCoordinates = {
  clientX: number;
  clientY: number;
};

type SkillCardBounds = {
  left: number;
  top: number;
};

const DEFAULT_GLOW_X = "calc(100% + 2rem)";
const DEFAULT_GLOW_Y = "2rem";
const DEFAULT_GLOW_OPACITY = "0.95";
const ACTIVE_GLOW_OPACITY = "1";

const cardClasses =
  "relative flex h-full flex-col overflow-hidden rounded-4xl p-6 sm:p-8";

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
  bounds: SkillCardBounds,
  clientX: number,
  clientY: number,
) {
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

function readCardBounds(element: HTMLElement): SkillCardBounds {
  const bounds = element.getBoundingClientRect();

  return {
    left: bounds.left,
    top: bounds.top,
  };
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
  const boundsRef = useRef<SkillCardBounds | null>(null);
  const frameRef = useRef<number | null>(null);
  const pointerRef = useRef<PointerCoordinates | null>(null);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const flushGlowPosition = (element: HTMLElement) => {
    frameRef.current = null;

    if (!boundsRef.current || !pointerRef.current) {
      return;
    }

    setGlowPosition(
      element,
      boundsRef.current,
      pointerRef.current.clientX,
      pointerRef.current.clientY,
    );
  };

  const queueGlowPosition = (
    element: HTMLElement,
    clientX: number,
    clientY: number,
  ) => {
    pointerRef.current = { clientX, clientY };

    if (frameRef.current !== null) {
      return;
    }

    frameRef.current = window.requestAnimationFrame(() => {
      flushGlowPosition(element);
    });
  };

  const handlePointerEnter = (event: PointerEvent<HTMLElement>) => {
    onPointerEnter?.(event);

    if (prefersReducedMotion || event.pointerType === "touch") {
      return;
    }

    boundsRef.current = readCardBounds(event.currentTarget);
    queueGlowPosition(event.currentTarget, event.clientX, event.clientY);
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    onPointerMove?.(event);

    if (prefersReducedMotion || event.pointerType === "touch") {
      return;
    }

    if (!boundsRef.current) {
      boundsRef.current = readCardBounds(event.currentTarget);
    }

    queueGlowPosition(event.currentTarget, event.clientX, event.clientY);
  };

  const handlePointerLeave = (event: PointerEvent<HTMLElement>) => {
    onPointerLeave?.(event);

    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    boundsRef.current = null;
    pointerRef.current = null;
    resetGlowPosition(event.currentTarget);
  };

  return (
    <article
      {...props}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      style={style}
      className={cn(
        cardClasses,
        styles.cardEffect,
        toneClasses[tone],
        className,
      )}
    >
      <div className={styles.effects}>
        <div className={styles.glow} />
        <div className={styles.grid} />
        <div className={styles.gridHighlight} />
      </div>

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
