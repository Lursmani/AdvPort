"use client";

import { AnimatePresence } from "framer-motion";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/providers/ThemeProvider";
import cn from "@/utils/cn";
import ExperienceArtwork from "./ExperienceArtwork";
import ExperienceModal from "./ExperienceModal";
import {
  getExperienceToneStyle,
  type ExperienceModalLabels,
  type ExperienceProject,
  type ExperienceRect,
} from "./experience-data";
import styles from "./ExperienceSection.module.css";

type ExperienceCarouselProps = {
  projects: readonly ExperienceProject[];
  labels: ExperienceModalLabels;
};

type OpenProjectState = {
  project: ExperienceProject;
  sourceRect: ExperienceRect;
};

function toRect(bounds: DOMRect): ExperienceRect {
  return {
    top: bounds.top,
    left: bounds.left,
    width: bounds.width,
    height: bounds.height,
  };
}

function ExperienceCarousel({ projects, labels }: ExperienceCarouselProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [activeCardKey, setActiveCardKey] = useState<string | null>(null);
  const [openProject, setOpenProject] = useState<OpenProjectState | null>(null);
  const lastTriggerRef = useRef<HTMLElement | null>(null);

  const isPaused =
    prefersReducedMotion || activeCardKey !== null || openProject !== null;

  const activateCard = (instanceKey: string) => {
    setActiveCardKey(instanceKey);
  };

  const deactivateCard = (instanceKey: string) => {
    setActiveCardKey((currentKey) =>
      currentKey === instanceKey ? null : currentKey,
    );
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

    lastTriggerRef.current = triggerElement;
    setOpenProject({
      project,
      sourceRect: toRect(cardElement.getBoundingClientRect()),
    });
  };

  const closeProject = () => {
    setOpenProject(null);
    setActiveCardKey(null);

    const lastTrigger = lastTriggerRef.current;

    if (!lastTrigger) {
      return;
    }

    window.requestAnimationFrame(() => {
      if (lastTrigger.isConnected) {
        lastTrigger.focus();
      }
    });
  };

  const renderCard = (project: ExperienceProject, instanceKey: string) => {
    const isActive = activeCardKey === instanceKey;

    return (
      <li key={instanceKey} className={styles.cardItem}>
        <article
          data-experience-card
          className={cn(styles.card, isActive && styles.cardActive)}
          style={getExperienceToneStyle(project.tone)}
          onPointerEnter={() => {
            activateCard(instanceKey);
          }}
          onPointerLeave={() => {
            deactivateCard(instanceKey);
          }}
          onFocusCapture={() => {
            activateCard(instanceKey);
          }}
          onBlurCapture={(event) => {
            if (
              !event.currentTarget.contains(event.relatedTarget as Node | null)
            ) {
              deactivateCard(instanceKey);
            }
          }}
        >
          <div className={styles.cardGlow} />

          <button
            type="button"
            className={styles.pictureButton}
            aria-label={project.openImageLabel}
            onClick={(event) => {
              handleOpenProject(project, event.currentTarget);
            }}
          >
            <ExperienceArtwork
              title={project.title}
              timeline={project.timeline}
              tone={project.tone}
              pattern={project.slides[0].pattern}
              slideIndex={1}
              className={styles.pictureArtwork}
            />
          </button>

          <div className="relative z-10 flex flex-col gap-4">
            <div className={styles.titleRow}>
              <button
                type="button"
                className={styles.titleButton}
                aria-label={project.openProjectLabel}
                onClick={(event) => {
                  handleOpenProject(project, event.currentTarget);
                }}
              >
                <span className={styles.titleText}>{project.title}</span>
              </button>

              {project.href ? (
                <Link
                  href={project.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={project.externalProjectLabel}
                  className={styles.externalLink}
                >
                  <ExternalLink className="size-4" strokeWidth={1.8} />
                </Link>
              ) : null}
            </div>

            <p className={styles.subtitle}>{project.subtitle}</p>
          </div>
        </article>
      </li>
    );
  };

  return (
    <>
      <div className={styles.carouselShell}>
        <div
          className={cn(
            styles.carouselViewport,
            prefersReducedMotion && styles.carouselViewportReduced,
          )}
        >
          {prefersReducedMotion ? (
            <ul className={cn(styles.trackGroup, styles.trackGroupReduced)}>
              {projects.map((project) => renderCard(project, project.id))}
            </ul>
          ) : (
            <div
              className={cn(
                styles.track,
                styles.trackAnimated,
                isPaused && styles.trackPaused,
              )}
            >
              <ul className={styles.trackGroup}>
                {projects.map((project) =>
                  renderCard(project, `${project.id}-primary`),
                )}
              </ul>
              <ul className={styles.trackGroup}>
                {projects.map((project) =>
                  renderCard(project, `${project.id}-clone`),
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {openProject ? (
          <ExperienceModal
            key={openProject.project.id}
            project={openProject.project}
            sourceRect={openProject.sourceRect}
            labels={labels}
            onClose={closeProject}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}

export default ExperienceCarousel;
