"use client";

import { m as motion } from "framer-motion";
import type { ComponentPropsWithoutRef, PointerEvent } from "react";
import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/providers/ThemeProvider";
import cn from "@/utils/cn";
import styles from "./SkillCard.module.css";

export type SkillCardGroup = {
  title?: string;
  skills: readonly string[];
};

type SkillCardTone = "firstCardTone" | "secondCardTone" | "thirdCardTone";

type SkillCardProps = ComponentPropsWithoutRef<"article"> & {
  index?: number;
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

const ACTIVE_GLOW_OPACITY = "1";
const CARD_REVEAL_TRANSITION = {
  duration: 0.58,
  ease: [0.22, 1, 0.36, 1],
} as const;

const cardClasses =
  "relative flex h-full flex-col overflow-hidden rounded-4xl p-6 sm:p-8";

const chipClasses =
  "inline-flex rounded-full border border-[color-mix(in_oklab,var(--foreground)_10%,transparent)] bg-[color-mix(in_oklab,var(--background)_78%,transparent)] px-3 py-1.5 text-sm font-medium text-foreground shadow-[inset_0_1px_0_color-mix(in_oklab,var(--foreground)_8%,transparent)]";

const toneClasses: Record<SkillCardTone, string> = {
  firstCardTone:
    "[--skills-card-accent:color-mix(in_oklab,var(--accent-two)_66%,transparent)]",
  secondCardTone:
    "[--skills-card-accent:color-mix(in_oklab,var(--accent-three)_68%,transparent)]",
  thirdCardTone:
    "[--skills-card-accent:color-mix(in_oklab,var(--accent-four)_66%,transparent)]",
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
  element.style.removeProperty("--skills-card-glow-x");
  element.style.removeProperty("--skills-card-glow-y");
  element.style.removeProperty("--skills-card-glow-opacity");
}

function SkillCard({
  className,
  index = 0,
  title,
  description,
  groups,
  tone = "firstCardTone",
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
    <motion.div
      className={cn("h-full", styles.revealFrame)}
      data-reveal-index={index % 3}
      initial={
        prefersReducedMotion
          ? false
          : {
              opacity: 0,
              x: "var(--skills-card-enter-x)",
              y: "var(--skills-card-enter-y)",
            }
      }
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.28 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { ...CARD_REVEAL_TRANSITION, delay: index * 0.12 }
      }
    >
      <div className="h-full">
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
              {groups.map((group, groupIndex) => (
                <div key={group.title ?? `${title}-${groupIndex}`}>
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
      </div>
    </motion.div>
  );
}

export default SkillCard;
