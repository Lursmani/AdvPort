"use client";

import Image from "next/image";
import cn from "@/utils/cn";
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
          <Image
            src={project.imageSrc}
            alt=""
            fill
            sizes="(min-width: 1024px) 21rem, (min-width: 768px) 33vw, 78vw"
            className={styles.pictureImage}
          />
        </button>

        <div className={styles.cardBody}>
          <div className={styles.cardMeta}>
            <span className={styles.timelineChip}>{project.timeline}</span>
          </div>

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
          </div>

          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}

          {project.tags.length > 0 ? (
            <ul className={cn(styles.tagList, styles.cardTagList)}>
              {project.tags.map((tag) => (
                <li key={`${project.id}-${tag}`} className={styles.tagChip}>
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </article>
    </li>
  );
}

export default ExperienceCarouselCard;
