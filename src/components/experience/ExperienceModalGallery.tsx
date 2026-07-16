"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import GlyphButton from "@/components/GlyphButton";
import { usePrefersReducedMotion } from "@/providers/ThemeProvider";
import {
  type ExperienceModalLabels,
  type ExperienceProject,
} from "./experience-data";
import styles from "./ExperienceSection.module.scss";

type ExperienceModalGalleryProps = {
  project: ExperienceProject;
  labels: ExperienceModalLabels;
};

type ScrollAxis = "x" | "y";

const DESKTOP_GALLERY_MEDIA = "(min-width: 1024px)";

function isDesktopGallery() {
  return window.matchMedia(DESKTOP_GALLERY_MEDIA).matches;
}

function clampScrollOffset(
  viewport: HTMLDivElement,
  axis: ScrollAxis,
  nextScrollOffset: number,
) {
  const maxScrollOffset = Math.max(
    0,
    axis === "y"
      ? viewport.scrollHeight - viewport.clientHeight
      : viewport.scrollWidth - viewport.clientWidth,
  );

  return Math.min(Math.max(nextScrollOffset, 0), maxScrollOffset);
}

function getSlideScrollOffset(
  viewport: HTMLDivElement,
  slide: HTMLLIElement,
  axis: ScrollAxis,
) {
  const slideOffset = axis === "y" ? slide.offsetTop : slide.offsetLeft;
  const slideSize = axis === "y" ? slide.offsetHeight : slide.offsetWidth;
  const viewportSize =
    axis === "y" ? viewport.clientHeight : viewport.clientWidth;
  const snapAlign = window.getComputedStyle(slide).scrollSnapAlign;
  const nextScrollOffset = snapAlign.includes("center")
    ? slideOffset - (viewportSize - slideSize) / 2
    : slideOffset;

  return clampScrollOffset(viewport, axis, nextScrollOffset);
}

function ExperienceModalGallery({
  project,
  labels,
}: ExperienceModalGalleryProps) {
  const t = useTranslations("ExperienceSection");
  const prefersReducedMotion = usePrefersReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(
    project.imageSources.length > 1,
  );
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<Array<HTMLLIElement | null>>([]);
  const hasMultipleImages = project.imageSources.length > 1;

  const findClosestSlideIndex = (
    viewport: HTMLDivElement,
    axis: ScrollAxis,
    currentOffset: number | undefined = axis === "y"
      ? viewport.scrollTop
      : viewport.scrollLeft,
  ) => {
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    slideRefs.current.forEach((slide, index) => {
      if (!slide) {
        return;
      }

      const distance = Math.abs(
        getSlideScrollOffset(viewport, slide, axis) - currentOffset,
      );

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  };

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const updateViewportState = () => {
      const axis: ScrollAxis = isDesktopGallery() ? "y" : "x";
      const currentOffset =
        axis === "y" ? viewport.scrollTop : viewport.scrollLeft;
      const maxScrollOffset = Math.max(
        0,
        axis === "y"
          ? viewport.scrollHeight - viewport.clientHeight
          : viewport.scrollWidth - viewport.clientWidth,
      );

      setCanScrollPrev(currentOffset > 4);
      setCanScrollNext(currentOffset < maxScrollOffset - 4);
      setActiveIndex(findClosestSlideIndex(viewport, axis, currentOffset));
    };

    updateViewportState();
    viewport.addEventListener("scroll", updateViewportState, { passive: true });
    window.addEventListener("resize", updateViewportState);

    return () => {
      viewport.removeEventListener("scroll", updateViewportState);
      window.removeEventListener("resize", updateViewportState);
    };
  }, [project.imageSources.length]);

  const scrollToImage = (index: number) => {
    const viewport = viewportRef.current;
    const targetSlide = project.imageSources[index]
      ? slideRefs.current[index]
      : null;

    if (!viewport || !targetSlide) {
      return;
    }

    const axis: ScrollAxis = isDesktopGallery() ? "y" : "x";
    const nextScrollOffset = getSlideScrollOffset(viewport, targetSlide, axis);

    viewport.scrollTo({
      top: axis === "y" ? nextScrollOffset : 0,
      left: axis === "x" ? nextScrollOffset : 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  const scrollByDirection = (direction: -1 | 1) => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const axis: ScrollAxis = isDesktopGallery() ? "y" : "x";
    const currentIndex = findClosestSlideIndex(viewport, axis);
    const targetIndex = Math.max(
      0,
      Math.min(project.imageSources.length - 1, currentIndex + direction),
    );

    scrollToImage(targetIndex);
  };

  return (
    <div className={styles.modalGallery}>
      <div className={styles.modalGalleryCarousel}>
        <div ref={viewportRef} className={styles.modalGalleryViewport}>
          <ul className={styles.modalGalleryTrack}>
            {project.imageSources.map((imageSrc, index) => (
              <li
                key={`${project.id}-${imageSrc}-${index}`}
                ref={(element) => {
                  slideRefs.current[index] = element;
                }}
                className={styles.modalGallerySlide}
              >
                <div className={styles.galleryFrame}>
                  <Image
                    src={imageSrc}
                    alt={t("actions.imageAlt", {
                      title: project.title,
                      index: index + 1,
                    })}
                    fill
                    sizes="(min-width: 1024px) 48vw, (min-width: 768px) 42vw, 100vw"
                    className={styles.galleryImage}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        {hasMultipleImages ? (
          <div className={styles.modalGalleryControls}>
            <GlyphButton
              type="button"
              variant="surface"
              className={styles.modalGalleryButton}
              onClick={() => {
                scrollByDirection(-1);
              }}
              aria-label={labels.previousImage}
              disabled={!canScrollPrev}
            >
              <ChevronLeft className="size-4" strokeWidth={1.8} />
            </GlyphButton>

            <GlyphButton
              type="button"
              variant="surface"
              className={styles.modalGalleryButton}
              onClick={() => {
                scrollByDirection(1);
              }}
              aria-label={labels.nextImage}
              disabled={!canScrollNext}
            >
              <ChevronRight className="size-4" strokeWidth={1.8} />
            </GlyphButton>
          </div>
        ) : null}
      </div>

      {hasMultipleImages ? (
        <p className={styles.modalGalleryProgress} aria-live="polite">
          <span className="sr-only">{labels.galleryProgress}: </span>
          <span aria-hidden="true">
            {activeIndex + 1} / {project.imageSources.length}
          </span>
        </p>
      ) : null}
    </div>
  );
}

export default ExperienceModalGallery;
