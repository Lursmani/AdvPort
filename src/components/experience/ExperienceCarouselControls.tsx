"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import GlyphButton from "@/components/GlyphButton";
import styles from "./ExperienceSection.module.scss";

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
      <GlyphButton
        type="button"
        variant="surface"
        className={styles.carouselControlButton}
        onClick={onPrevious}
        aria-label={previousLabel}
        disabled={!canScrollPrev}
      >
        <ChevronLeft className="size-4" strokeWidth={1.8} />
      </GlyphButton>

      <GlyphButton
        type="button"
        variant="surface"
        className={styles.carouselControlButton}
        onClick={onNext}
        aria-label={nextLabel}
        disabled={!canScrollNext}
      >
        <ChevronRight className="size-4" strokeWidth={1.8} />
      </GlyphButton>
    </div>
  );
}

export default ExperienceCarouselControls;
