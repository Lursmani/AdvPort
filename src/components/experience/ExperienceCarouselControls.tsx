"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./ExperienceSection.module.css";

type ExperienceCarouselControlsProps = {
  onPrevious: () => void;
  onNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  previousLabel: string;
  nextLabel: string;
};

function ExperienceCarouselControls({
  onPrevious,
  onNext,
  canScrollPrev,
  canScrollNext,
  previousLabel,
  nextLabel,
}: ExperienceCarouselControlsProps) {
  return (
    <div className={styles.carouselControls}>
      <button
        type="button"
        className={styles.carouselButton}
        onClick={onPrevious}
        aria-label={previousLabel}
        disabled={!canScrollPrev}
      >
        <ChevronLeft className="size-4" strokeWidth={1.8} />
      </button>

      <button
        type="button"
        className={styles.carouselButton}
        onClick={onNext}
        aria-label={nextLabel}
        disabled={!canScrollNext}
      >
        <ChevronRight className="size-4" strokeWidth={1.8} />
      </button>
    </div>
  );
}

export default ExperienceCarouselControls;
