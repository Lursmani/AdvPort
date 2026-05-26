"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/providers/ThemeProvider";
import ExperienceCarouselCard from "./ExperienceCarouselCard";
import ExperienceCarouselControls from "./ExperienceCarouselControls";
import {
  type ExperienceCarouselLabels,
  type ExperienceProject,
  type ExperienceRect,
} from "./experience-data";
import styles from "./ExperienceSection.module.css";

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
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(projects.length > 1);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Record<string, HTMLLIElement | null>>({});

  const updateScrollButtons = () => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const maxScrollLeft = viewport.scrollWidth - viewport.clientWidth;

    setCanScrollPrev(viewport.scrollLeft > 4);
    setCanScrollNext(viewport.scrollLeft < maxScrollLeft - 4);
  };

  useEffect(() => {
    updateScrollButtons();

    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const handleViewportChange = () => {
      updateScrollButtons();
    };

    viewport.addEventListener("scroll", handleViewportChange, {
      passive: true,
    });
    window.addEventListener("resize", handleViewportChange);

    return () => {
      viewport.removeEventListener("scroll", handleViewportChange);
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
    const currentIndex = findClosestCardIndex();
    const targetIndex = Math.max(
      0,
      Math.min(projects.length - 1, currentIndex + direction),
    );

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
    <div className={styles.carouselShell}>
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
    </div>
  );
}

export default ExperienceCarouselViewport;
