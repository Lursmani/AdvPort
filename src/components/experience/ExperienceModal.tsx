"use client";

import { m as motion, type Transition } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import GlyphButton from "@/components/GlyphButton";
import { usePrefersReducedMotion } from "@/providers/ThemeProvider";
import {
  getScrollbarWidth,
  getTabbableElements,
} from "@/utils/domAccessibility";
import ExperienceModalDetails from "./ExperienceModalDetails";
import ExperienceModalGallery from "./ExperienceModalGallery";
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

const PANEL_FADE_OUT_TRANSITION = {
  duration: 0.16,
  ease: [0.4, 0, 1, 1],
  delay: 0.08,
} as const;

function computeTargetRect(viewportSize: ViewportSize): ExperienceRect {
  const horizontalMargin = viewportSize.width < 640 ? 12 : 24;
  const verticalMargin =
    viewportSize.width < 640 ? 12 : viewportSize.width < 1024 ? 16 : 20;
  const width = Math.min(viewportSize.width - horizontalMargin * 2, 1040);
  const maxHeight =
    viewportSize.width < 768 ? 760 : viewportSize.width < 1024 ? 820 : 720;
  const height = Math.min(viewportSize.height - verticalMargin * 2, maxHeight);

  return {
    top: Math.max(verticalMargin, (viewportSize.height - height) / 2),
    left: (viewportSize.width - width) / 2,
    width,
    height,
  };
}

function ExperienceModal({
  project,
  sourceRect,
  labels,
  onClose,
}: ExperienceModalProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
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

  const panelTransition: Transition = prefersReducedMotion
    ? { duration: 0 }
    : {
        ...PANEL_TRANSITION,
        opacity: PANEL_FADE_OUT_TRANSITION,
      };

  const panelMotion = prefersReducedMotion
    ? {
        initial: { ...targetRect, borderRadius: 36, opacity: 1 },
        animate: { ...targetRect, borderRadius: 36, opacity: 1 },
        exit: { ...targetRect, borderRadius: 36, opacity: 0 },
      }
    : {
        initial: { ...sourceRect, borderRadius: 28, opacity: 1 },
        animate: { ...targetRect, borderRadius: 36, opacity: 1 },
        exit: { ...sourceRect, borderRadius: 28, opacity: 0 },
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
    const root = document.documentElement;
    const body = document.body;
    const computedBodyStyle = window.getComputedStyle(body);
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const previousModalState = root.dataset.experienceModalOpen;
    const scrollbarWidth = getScrollbarWidth();
    const currentPaddingRight = Number.isNaN(
      Number.parseFloat(computedBodyStyle.paddingRight),
    )
      ? 0
      : Number.parseFloat(computedBodyStyle.paddingRight);

    body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;
    }

    root.dataset.experienceModalOpen = "true";
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
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;

      if (previousModalState) {
        root.dataset.experienceModalOpen = previousModalState;
      } else {
        delete root.dataset.experienceModalOpen;
      }

      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);
  const toneStyle = getExperienceToneStyle(project.tone);

  return (
    <div className={styles.modalRoot}>
      <motion.div
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
        transition={panelTransition}
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
          <div className={styles.modalHeader}>
            <span className={styles.timelineChip}>{project.timeline}</span>

            <GlyphButton
              ref={closeButtonRef}
              type="button"
              variant="surface"
              className={styles.modalCloseButton}
              onClick={onClose}
              aria-label={labels.closeModal}
            >
              <X className="size-4" strokeWidth={1.8} />
            </GlyphButton>
          </div>

          <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)] lg:gap-5">
            <ExperienceModalGallery project={project} labels={labels} />
            <ExperienceModalDetails project={project} />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default ExperienceModal;
