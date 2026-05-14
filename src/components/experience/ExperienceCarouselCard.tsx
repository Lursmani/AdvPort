"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import cn from "@/utils/cn";
import ExperienceArtwork from "./ExperienceArtwork";
import {
  getExperienceToneStyle,
  type ExperienceProject,
} from "./experience-data";
import styles from "./ExperienceSection.module.css";

type ExperienceCarouselCardProps = {
  project: ExperienceProject;
  isActive: boolean;
  isFocusSuppressed: boolean;
  cardRef: (element: HTMLLIElement | null) => void;
  onActivate: () => void;
  onDeactivate: () => void;
  onClearFocusSuppression: () => void;
  onOpenProject: (
    project: ExperienceProject,
    triggerElement: HTMLElement,
  ) => void;
};

function ExperienceCarouselCard({
  project,
  isActive,
  isFocusSuppressed,
  cardRef,
  onActivate,
  onDeactivate,
  onClearFocusSuppression,
  onOpenProject,
}: ExperienceCarouselCardProps) {
  const subtitle = project.subtitle.trim();

  return (
    <li ref={cardRef} className={styles.cardItem}>
      <article
        data-experience-card
        className={cn(
          styles.card,
          isActive && styles.cardActive,
          isFocusSuppressed && styles.cardFocusSuppressed,
        )}
        style={getExperienceToneStyle(project.tone)}
        onPointerEnter={() => {
          if (isFocusSuppressed) {
            onClearFocusSuppression();
          }

          onActivate();
        }}
        onPointerLeave={onDeactivate}
        onFocusCapture={() => {
          if (!isFocusSuppressed) {
            onActivate();
          }
        }}
        onBlurCapture={(event) => {
          if (
            !event.currentTarget.contains(event.relatedTarget as Node | null)
          ) {
            if (isFocusSuppressed) {
              onClearFocusSuppression();
            }

            onDeactivate();
          }
        }}
      >
        <div className={styles.cardGlow} />

        <button
          type="button"
          className={styles.pictureButton}
          aria-label={project.openImageLabel}
          onClick={(event) => {
            onOpenProject(project, event.currentTarget);
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

        <div className={styles.cardBody}>
          <div className={styles.titleRow}>
            <button
              type="button"
              className={styles.titleButton}
              aria-label={project.openProjectLabel}
              onClick={(event) => {
                onOpenProject(project, event.currentTarget);
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

          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </div>
      </article>
    </li>
  );
}

export default ExperienceCarouselCard;
