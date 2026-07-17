"use client";

import { m as motion } from "framer-motion";
import { useRef, useState } from "react";
import useIsomorphicLayoutEffect from "@/utils/useIsomorphicLayoutEffect";
import { usePrefersReducedMotion } from "@/providers/ThemeProvider";
import ExperienceCarouselCard from "./ExperienceCarouselCard";
import ExperienceCarouselControls from "./ExperienceCarouselControls";
import {
  type ExperienceCarouselLabels,
  type ExperienceProject,
  type ExperienceRect,
} from "./experience-data";
import styles from "./ExperienceSection.module.scss";

export type ExperienceCarouselOpenProject = {
  project: ExperienceProject;
  sourceRect: ExperienceRect;
  triggerElement: HTMLElement;
};

type ExperienceCarouselViewportProps = {
  projects: readonly ExperienceProject[];
  labels: ExperienceCarouselLabels;
  onOpenProject: (payload: ExperienceCarouselOpenProject) => void;
};

const CAROUSEL_REVEAL_VARIANTS = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
} as const;

function toRect(bounds: DOMRect): ExperienceRect {
  return {
    top: bounds.top,
    left: bounds.left,
    width: bounds.width,
    height: bounds.height,
  };
}

function clampScrollLeft(viewport: HTMLDivElement, nextScrollLeft: number) {
  const maxScrollLeft = Math.max(
    0,
    viewport.scrollWidth - viewport.clientWidth,
  );

  return Math.min(Math.max(nextScrollLeft, 0), maxScrollLeft);
}

function getCardScrollLeft(viewport: HTMLDivElement, card: HTMLLIElement) {
  const snapAlign = window.getComputedStyle(card).scrollSnapAlign;
  const nextScrollLeft = snapAlign.includes("center")
    ? card.offsetLeft - (viewport.clientWidth - card.offsetWidth) / 2
    : card.offsetLeft;

  return clampScrollLeft(viewport, nextScrollLeft);
}

function ExperienceCarouselViewport({
  projects,
  labels,
  onOpenProject,
}: ExperienceCarouselViewportProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  // Both start false and are corrected by the layout effect below before the
  // browser paints, so the buttons never flash a wrong enabled/disabled state
  // (e.g. an enabled Next on a viewport wide enough to fit every card).
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Record<string, HTMLLIElement | null>>({});
  // Target index of an in-flight Prev/Next scroll, so rapid clicks accumulate
  // (double-click Next advances two cards) instead of all resolving against the
  // same measured position mid-animation.
  const pendingIndexRef = useRef<number | null>(null);

  const updateScrollButtons = () => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const maxScrollLeft = viewport.scrollWidth - viewport.clientWidth;

    setCanScrollPrev(viewport.scrollLeft > 4);
    setCanScrollNext(viewport.scrollLeft < maxScrollLeft - 4);
  };

  useIsomorphicLayoutEffect(() => {
    updateScrollButtons();

    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const handleViewportChange = () => {
      updateScrollButtons();
    };

    // A manual scroll (wheel, touch, or pointer drag) supersedes any queued
    // click target, so the next Prev/Next resumes from the real position.
    const resetPendingIndex = () => {
      pendingIndexRef.current = null;
    };

    viewport.addEventListener("scroll", handleViewportChange, {
      passive: true,
    });
    viewport.addEventListener("wheel", resetPendingIndex, { passive: true });
    viewport.addEventListener("touchstart", resetPendingIndex, {
      passive: true,
    });
    viewport.addEventListener("pointerdown", resetPendingIndex, {
      passive: true,
    });
    window.addEventListener("resize", handleViewportChange);

    return () => {
      viewport.removeEventListener("scroll", handleViewportChange);
      viewport.removeEventListener("wheel", resetPendingIndex);
      viewport.removeEventListener("touchstart", resetPendingIndex);
      viewport.removeEventListener("pointerdown", resetPendingIndex);
      window.removeEventListener("resize", handleViewportChange);
    };
  }, [projects.length]);

  const findClosestCardIndex = () => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return 0;
    }

    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    projects.forEach((project, index) => {
      const card = cardRefs.current[project.id];

      if (!card) {
        return;
      }

      const distance = Math.abs(
        getCardScrollLeft(viewport, card) - viewport.scrollLeft,
      );

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  };

  const scrollToCardIndex = (index: number) => {
    const viewport = viewportRef.current;
    const targetProject = projects[index];
    const targetCard = targetProject
      ? cardRefs.current[targetProject.id]
      : null;

    if (!viewport || !targetCard) {
      return;
    }

    viewport.scrollTo({
      left: getCardScrollLeft(viewport, targetCard),
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  const scrollByDirection = (direction: -1 | 1) => {
    const baseIndex = pendingIndexRef.current ?? findClosestCardIndex();
    const targetIndex = Math.max(
      0,
      Math.min(projects.length - 1, baseIndex + direction),
    );

    if (targetIndex === baseIndex) {
      return;
    }

    pendingIndexRef.current = targetIndex;
    scrollToCardIndex(targetIndex);
  };

  const handleOpenProject = (
    project: ExperienceProject,
    triggerElement: HTMLElement,
  ) => {
    const cardElement = triggerElement.closest<HTMLElement>(
      "[data-experience-card]",
    );

    if (!cardElement) {
      return;
    }

    onOpenProject({
      project,
      sourceRect: toRect(cardElement.getBoundingClientRect()),
      triggerElement,
    });
  };

  return (
    <motion.div
      className={styles.carouselShell}
      // The carousel region wraps the shell (controls + slides) so assistive
      // tech announces the Previous/Next buttons as part of the carousel, per
      // the APG carousel pattern.
      role="region"
      aria-roledescription={labels.carouselRoleDescription}
      aria-label={labels.carouselLabel}
      initial={prefersReducedMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={CAROUSEL_REVEAL_VARIANTS}
    >
      <ExperienceCarouselControls
        onPrevious={() => {
          scrollByDirection(-1);
        }}
        onNext={() => {
          scrollByDirection(1);
        }}
        canScrollPrev={canScrollPrev}
        canScrollNext={canScrollNext}
        previousLabel={labels.previousProject}
        nextLabel={labels.nextProject}
      />

      <div ref={viewportRef} className={styles.carouselViewport}>
        <ul className={styles.track}>
          {projects.map((project) => (
            <ExperienceCarouselCard
              key={project.id}
              project={project}
              cardRef={(element) => {
                cardRefs.current[project.id] = element;
              }}
              onOpenProject={handleOpenProject}
            />
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

export default ExperienceCarouselViewport;
