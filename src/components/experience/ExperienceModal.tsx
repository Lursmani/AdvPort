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
import { usePrefersReducedMotion } from "@/providers/ThemeProvider";
import cn from "@/utils/cn";
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
    const body = document.body;
    const computedBodyStyle = window.getComputedStyle(body);
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const previousModalState = root.dataset.experienceModalOpen;
    const pageContent = document.getElementById("page-content");
    const hadPageContentInert = pageContent?.hasAttribute("inert") ?? false;
    const previousPageContentAriaHidden =
      pageContent?.getAttribute("aria-hidden") ?? null;
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

    if (pageContent) {
      pageContent.setAttribute("inert", "");
      pageContent.setAttribute("aria-hidden", "true");
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

      if (!panelRef.current.contains(document.activeElement)) {
        event.preventDefault();

        if (event.shiftKey) {
          lastElement.focus();
        } else {
          firstElement.focus();
        }

        return;
      }

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

      if (pageContent) {
        if (!hadPageContentInert) {
          pageContent.removeAttribute("inert");
        }

        if (previousPageContentAriaHidden === null) {
          pageContent.removeAttribute("aria-hidden");
        } else {
          pageContent.setAttribute(
            "aria-hidden",
            previousPageContentAriaHidden,
          );
        }
      }

      if (previousModalState) {
        root.dataset.experienceModalOpen = previousModalState;
      } else {
        delete root.dataset.experienceModalOpen;
      }

      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  // Restore focus to the triggering card when the modal unmounts. This effect
  // must be declared after the inert/scroll-lock effect above: React destroys
  // effects in declaration order, so by the time this cleanup runs `inert` has
  // been removed from #page-content and the card is focusable again. (Inside an
  // inert subtree `.focus()` is a silent no-op, which is why restoring from the
  // parent via AnimatePresence's onExitComplete — which fires before the
  // unmount commit, while `inert` is still set — does not work.)
  useEffect(() => {
    const trigger = triggerRef.current;

    return () => {
      if (trigger?.isConnected) {
        trigger.focus({ preventScroll: true });
      }
    };
  }, [triggerRef]);

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
