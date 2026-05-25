"use client";

import Image from "next/image";
import type { MouseEvent } from "react";
import cn from "@/utils/cn";
import {
  getExperienceToneStyle,
  type ExperienceProject,
} from "./experience-data";
import styles from "./ExperienceSection.module.css";

type ExperienceCarouselCardProps = {
  project: ExperienceProject;
  cardRef: (element: HTMLLIElement | null) => void;
  onOpenProject: (
    project: ExperienceProject,
    triggerElement: HTMLElement,
  ) => void;
};

function ExperienceCarouselCard({
  project,
  cardRef,
  onOpenProject,
}: ExperienceCarouselCardProps) {
  const handleOpenProject = (event: MouseEvent<HTMLButtonElement>) => {
    onOpenProject(project, event.currentTarget);
  };

  return (
    <li ref={cardRef} className={styles.cardItem}>
      <article
        data-experience-card
        className={styles.card}
        style={getExperienceToneStyle(project.tone)}
      >
        <div className={styles.cardGlow} />

        <button
          type="button"
          className={styles.pictureButton}
          aria-label={project.openImageLabel}
          onClick={handleOpenProject}
        >
          <Image
            src={project.imageSources[0]}
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
              onClick={handleOpenProject}
            >
              <span className={styles.titleText}>{project.title}</span>
            </button>
          </div>

          <p className={styles.subtitle}>{project.subtitle}</p>

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
