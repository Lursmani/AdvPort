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
      {/* aria-disabled (not disabled) keeps the button focusable so keyboard
          focus is never dropped to <body> when a control disables at a track
          end; the guarded onClick makes it a no-op while disabled. */}
      <GlyphButton
        type="button"
        variant="surface"
        className={styles.carouselControlButton}
        onClick={() => {
          if (canScrollPrev) {
            onPrevious();
          }
        }}
        aria-label={previousLabel}
        aria-disabled={!canScrollPrev}
      >
        <ChevronLeft className="size-4" strokeWidth={1.8} />
      </GlyphButton>

      <GlyphButton
        type="button"
        variant="surface"
        className={styles.carouselControlButton}
        onClick={() => {
          if (canScrollNext) {
            onNext();
          }
        }}
        aria-label={nextLabel}
        aria-disabled={!canScrollNext}
      >
        <ChevronRight className="size-4" strokeWidth={1.8} />
      </GlyphButton>
    </div>
  );
}

export default ExperienceCarouselControls;
