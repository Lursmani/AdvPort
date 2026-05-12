"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ExternalLink, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/providers/ThemeProvider";
import cn from "@/utils/cn";
import ExperienceArtwork from "./ExperienceArtwork";
import {
  getExperienceToneStyle,
  type ExperienceModalLabels,
  type ExperienceProject,
  type ExperienceRect,
} from "./experience-data";
import styles from "./ExperienceSection.module.css";

type ExperienceModalProps = {
  project: ExperienceProject;
  sourceRect: ExperienceRect;
  labels: ExperienceModalLabels;
  onClose: () => void;
};

type ViewportSize = {
  width: number;
  height: number;
};

const PANEL_TRANSITION = {
  type: "spring",
  stiffness: 250,
  damping: 30,
  mass: 0.92,
} as const;

const FADE_TRANSITION = {
  duration: 0.2,
  ease: [0.22, 1, 0.36, 1],
} as const;

function computeTargetRect(viewportSize: ViewportSize): ExperienceRect {
  const horizontalMargin = viewportSize.width < 640 ? 12 : 24;
  const verticalMargin = viewportSize.width < 640 ? 12 : 20;
  const width = Math.min(viewportSize.width - horizontalMargin * 2, 1040);
  const maxHeight = viewportSize.width < 768 ? 760 : 720;
  const height = Math.min(viewportSize.height - verticalMargin * 2, maxHeight);

  return {
    top: Math.max(verticalMargin, (viewportSize.height - height) / 2),
    left: (viewportSize.width - width) / 2,
    width,
    height,
  };
}

function getTabbableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter(
    (element) =>
      !element.hasAttribute("disabled") &&
      element.getAttribute("aria-hidden") !== "true",
  );
}

function ExperienceModal({
  project,
  sourceRect,
  labels,
  onClose,
}: ExperienceModalProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [viewportSize, setViewportSize] = useState<ViewportSize>(() => ({
    width: typeof window === "undefined" ? 1280 : window.innerWidth,
    height: typeof window === "undefined" ? 720 : window.innerHeight,
  }));
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const targetRect = useMemo(
    () => computeTargetRect(viewportSize),
    [viewportSize],
  );

  const panelMotion = prefersReducedMotion
    ? {
        initial: { ...targetRect, borderRadius: 36, opacity: 1 },
        animate: { ...targetRect, borderRadius: 36, opacity: 1 },
        exit: { ...targetRect, borderRadius: 36, opacity: 0 },
      }
    : {
        initial: { ...sourceRect, borderRadius: 28, opacity: 1 },
        animate: { ...targetRect, borderRadius: 36, opacity: 1 },
        exit: { ...sourceRect, borderRadius: 28, opacity: 1 },
      };

  useEffect(() => {
    const updateViewportSize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateViewportSize();
    window.addEventListener("resize", updateViewportSize);

    return () => {
      window.removeEventListener("resize", updateViewportSize);
    };
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) {
        return;
      }

      const tabbableElements = getTabbableElements(panelRef.current);

      if (tabbableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = tabbableElements[0];
      const lastElement = tabbableElements[tabbableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }

      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const activeSlide = project.slides[activeSlideIndex];
  const toneStyle = getExperienceToneStyle(project.tone);

  const showPreviousSlide = () => {
    setActiveSlideIndex((currentIndex) => {
      if (currentIndex === 0) {
        return project.slides.length - 1;
      }

      return currentIndex - 1;
    });
  };

  const showNextSlide = () => {
    setActiveSlideIndex((currentIndex) =>
      currentIndex === project.slides.length - 1 ? 0 : currentIndex + 1,
    );
  };

  return (
    <>
      <motion.button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        className={styles.modalBackdrop}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={prefersReducedMotion ? { duration: 0 } : FADE_TRANSITION}
      />

      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`experience-modal-title-${project.id}`}
        className={styles.modalPanel}
        style={toneStyle}
        initial={panelMotion.initial}
        animate={panelMotion.animate}
        exit={panelMotion.exit}
        transition={prefersReducedMotion ? { duration: 0 } : PANEL_TRANSITION}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <motion.div
          className={styles.modalInner}
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{
            opacity: 1,
            transition: prefersReducedMotion
              ? { duration: 0 }
              : { delay: 0.12, duration: 0.2 },
          }}
          exit={{ opacity: 0, transition: { duration: 0.08 } }}
        >
          <div className="flex items-start justify-between gap-3">
            <span className={styles.timelineChip}>{project.timeline}</span>

            <button
              ref={closeButtonRef}
              type="button"
              className={styles.modalClose}
              onClick={onClose}
              aria-label={labels.closeModal}
            >
              <X className="size-4" strokeWidth={1.8} />
            </button>
          </div>

          <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)] lg:gap-5">
            <div className="flex min-h-0 flex-col gap-3">
              <div className={styles.galleryFrame}>
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={activeSlide.id}
                    className={styles.gallerySlide}
                    initial={
                      prefersReducedMotion
                        ? { opacity: 1 }
                        : { opacity: 0, x: 18 }
                    }
                    animate={{ opacity: 1, x: 0 }}
                    exit={
                      prefersReducedMotion
                        ? { opacity: 1 }
                        : { opacity: 0, x: -18 }
                    }
                    transition={
                      prefersReducedMotion ? { duration: 0 } : FADE_TRANSITION
                    }
                  >
                    <ExperienceArtwork
                      title={project.title}
                      timeline={project.timeline}
                      tone={project.tone}
                      pattern={activeSlide.pattern}
                      slideIndex={activeSlideIndex + 1}
                      className={styles.galleryArtwork}
                    />
                  </motion.div>
                </AnimatePresence>

                {project.slides.length > 1 ? (
                  <div className={styles.galleryControls}>
                    <button
                      type="button"
                      className={styles.galleryControl}
                      onClick={showPreviousSlide}
                      aria-label={labels.previousImage}
                    >
                      <ArrowLeft className="size-4" strokeWidth={1.8} />
                    </button>

                    <button
                      type="button"
                      className={styles.galleryControl}
                      onClick={showNextSlide}
                      aria-label={labels.nextImage}
                    >
                      <ArrowRight className="size-4" strokeWidth={1.8} />
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="flex items-center justify-between gap-3">
                <p className="text-foreground-soft text-xs font-semibold uppercase tracking-[0.2em]">
                  {labels.galleryProgress}: {activeSlideIndex + 1}/
                  {project.slides.length}
                </p>

                <div className={styles.indicatorRail}>
                  {project.slides.map((slide, index) => (
                    <button
                      key={slide.id}
                      type="button"
                      className={cn(
                        styles.indicatorButton,
                        index === activeSlideIndex &&
                          styles.indicatorButtonActive,
                      )}
                      onClick={() => {
                        setActiveSlideIndex(index);
                      }}
                      aria-label={`${labels.galleryProgress}: ${index + 1}`}
                      aria-pressed={index === activeSlideIndex}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex min-h-0 flex-col">
              <div className="flex flex-wrap items-center gap-3">
                {project.href ? (
                  <Link
                    href={project.href}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.modalLink}
                    aria-label={project.externalProjectLabel}
                  >
                    <span>{project.visitProjectLabel}</span>
                    <ExternalLink className="size-3.5" strokeWidth={1.8} />
                  </Link>
                ) : null}
              </div>

              <h3
                id={`experience-modal-title-${project.id}`}
                className="mt-5 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
              >
                {project.title}
              </h3>

              <p className="text-foreground-soft mt-4 text-base leading-7 sm:text-lg sm:leading-8">
                {project.subtitle}
              </p>

              <div className={cn(styles.modalDescription, "mt-6")}>
                <p className="text-foreground-muted text-sm leading-7 sm:text-base sm:leading-8">
                  {project.description}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}

export default ExperienceModal;
