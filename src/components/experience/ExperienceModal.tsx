"use client";

import { m as motion, useIsPresent, type Transition } from "framer-motion";
import { X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import GlyphButton from "@/components/GlyphButton";
import { BREAKPOINTS } from "@/styles/breakpoints";
import { usePrefersReducedMotion } from "@/providers/ThemeProvider";
import cn from "@/utils/cn";
import { trapOverlayFocus } from "@/utils/overlayFocus";
import ExperienceModalDetails from "./ExperienceModalDetails";
import ExperienceModalGallery from "./ExperienceModalGallery";
import {
  getExperienceToneStyle,
  type ExperienceModalLabels,
  type ExperienceProject,
  type ExperienceRect,
} from "./experience-data";
import styles from "./ExperienceSection.module.scss";

type ExperienceModalProps = {
  project: ExperienceProject;
  sourceRect: ExperienceRect;
  labels: ExperienceModalLabels;
  onClose: () => void;
  /** The card that opened the modal; focus returns to it when the modal unmounts. */
  triggerRef: RefObject<HTMLElement | null>;
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
  const horizontalMargin = viewportSize.width < BREAKPOINTS.sm ? 12 : 24;
  const verticalMargin =
    viewportSize.width < BREAKPOINTS.sm
      ? 12
      : viewportSize.width < BREAKPOINTS.lg
        ? 16
        : 20;
  const width = Math.min(viewportSize.width - horizontalMargin * 2, 1040);
  const maxHeight =
    viewportSize.width < BREAKPOINTS.md
      ? 760
      : viewportSize.width < BREAKPOINTS.lg
        ? 820
        : 720;
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
  triggerRef,
}: ExperienceModalProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isPresent = useIsPresent();
  // The translucent glass background needs backdrop-filter, which is too
  // expensive to recompute while the rect spring relayouts the panel every
  // frame. The panel flies with a near-opaque background instead, and the
  // glass style is applied only once the open animation settles (and removed
  // again the moment AnimatePresence starts the exit). Reduced motion has no
  // flight, so the glass applies immediately.
  const [isSettled, setIsSettled] = useState(prefersReducedMotion);
  const [viewportSize, setViewportSize] = useState<ViewportSize>(() => ({
    width: typeof window === "undefined" ? 1280 : window.innerWidth,
    height: typeof window === "undefined" ? 720 : window.innerHeight,
  }));
  // The close animation flies the panel back to the triggering card. The rect
  // is captured at click time, but a resize/orientation change relayouts the
  // carousel, so we re-measure the card while the modal is open to keep the
  // exit target aligned with where the card actually is now.
  const [currentSourceRect, setCurrentSourceRect] =
    useState<ExperienceRect>(sourceRect);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const measureTriggerRect = useCallback((): ExperienceRect | null => {
    const card = triggerRef.current?.closest<HTMLElement>(
      "[data-experience-card]",
    );

    if (!card) {
      return null;
    }

    const bounds = card.getBoundingClientRect();

    return {
      top: bounds.top,
      left: bounds.left,
      width: bounds.width,
      height: bounds.height,
    };
  }, [triggerRef]);

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
        initial: { ...currentSourceRect, borderRadius: 28, opacity: 1 },
        animate: { ...targetRect, borderRadius: 36, opacity: 1 },
        exit: { ...currentSourceRect, borderRadius: 28, opacity: 0 },
      };

  useEffect(() => {
    const updateViewportSize = () => {
      setViewportSize((previous) =>
        previous.width === window.innerWidth &&
        previous.height === window.innerHeight
          ? previous
          : { width: window.innerWidth, height: window.innerHeight },
      );

      const measuredSourceRect = measureTriggerRect();

      if (measuredSourceRect) {
        setCurrentSourceRect((previous) =>
          previous.top === measuredSourceRect.top &&
          previous.left === measuredSourceRect.left &&
          previous.width === measuredSourceRect.width &&
          previous.height === measuredSourceRect.height
            ? previous
            : measuredSourceRect,
        );
      }
    };

    updateViewportSize();
    window.addEventListener("resize", updateViewportSize);

    return () => {
      window.removeEventListener("resize", updateViewportSize);
    };
  }, [measureTriggerRect]);

  useEffect(() => {
    const root = document.documentElement;
    const previousModalState = root.dataset.experienceModalOpen;

    // The header watches this attribute and hides/inerts itself, so the modal
    // only needs to inert the page content directly.
    root.dataset.experienceModalOpen = "true";

    const releaseOverlay = trapOverlayFocus({
      containerRef: panelRef,
      inertTargets: [document.getElementById("page-content")],
      initialFocusRef: closeButtonRef,
      onEscape: onClose,
      // Focus returns to the triggering card. trapOverlayFocus un-inerts
      // #page-content before restoring, which is what makes the card focusable
      // again — restoring from the parent via AnimatePresence's
      // onExitComplete, which fires while `inert` is still set, does not work
      // because `.focus()` inside an inert subtree is a silent no-op.
      getRestoreFocusTarget: () => triggerRef.current,
    });

    return () => {
      releaseOverlay();

      if (previousModalState) {
        root.dataset.experienceModalOpen = previousModalState;
      } else {
        delete root.dataset.experienceModalOpen;
      }
    };
  }, [onClose, triggerRef]);

  const toneStyle = getExperienceToneStyle(project.tone);

  return createPortal(
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
        className={cn(
          styles.modalPanel,
          isSettled && isPresent && styles.modalPanelSettled,
        )}
        style={toneStyle}
        initial={panelMotion.initial}
        animate={panelMotion.animate}
        exit={panelMotion.exit}
        transition={panelTransition}
        onAnimationComplete={() => {
          setIsSettled(true);
        }}
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
    </div>,
    document.body,
  );
}

export default ExperienceModal;
