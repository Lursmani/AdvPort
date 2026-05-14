"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { usePrefersReducedMotion } from "@/providers/ThemeProvider";
import ExperienceArtwork from "./ExperienceArtwork";
import {
  type ExperienceModalLabels,
  type ExperienceProject,
} from "./experience-data";
import styles from "./ExperienceSection.module.css";

type ExperienceModalGalleryProps = {
  project: ExperienceProject;
  labels: ExperienceModalLabels;
};

function ExperienceModalGallery({
  project,
  labels,
}: ExperienceModalGalleryProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const activeSlide = project.slides[activeSlideIndex];

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
    <div className="flex min-h-0 flex-col gap-3">
      <div className={styles.galleryFrame}>
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={activeSlide.id}
            className={styles.gallerySlide}
            initial={
              prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: 18 }
            }
            animate={{ opacity: 1, x: 0 }}
            exit={
              prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: -18 }
            }
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.2, ease: [0.22, 1, 0.36, 1] }
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
              className={
                index === activeSlideIndex
                  ? `${styles.indicatorButton} ${styles.indicatorButtonActive}`
                  : styles.indicatorButton
              }
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
  );
}

export default ExperienceModalGallery;
