"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import cn from "@/utils/cn";
import { type ExperienceProject } from "./experience-data";
import styles from "./ExperienceSection.module.css";

type ExperienceModalDetailsProps = {
  project: ExperienceProject;
};

function ExperienceModalDetails({ project }: ExperienceModalDetailsProps) {
  return (
    <div className={cn(styles.modalDetails, "flex min-h-0 flex-col")}>
      <div className={styles.modalTitleRow}>
        <h3
          id={`experience-modal-title-${project.id}`}
          className="flex-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        >
          {project.title}
        </h3>

        {project.href ? (
          <Link
            href={project.href}
            target="_blank"
            rel="noreferrer"
            className={styles.externalLink}
            aria-label={project.externalProjectLabel}
          >
            <ExternalLink className="size-4" strokeWidth={1.8} />
          </Link>
        ) : null}
      </div>

      <p className="text-foreground-soft mt-4 text-base leading-7 sm:text-lg sm:leading-8">
        {project.subtitle}
      </p>

      {project.tags.length > 0 ? (
        <ul className={cn(styles.tagList, styles.modalTagList)}>
          {project.tags.map((tag) => (
            <li key={`${project.id}-${tag}`} className={styles.tagChip}>
              {tag}
            </li>
          ))}
        </ul>
      ) : null}

      <p className="text-foreground-muted mt-6 text-sm leading-7 sm:text-base sm:leading-8">
        {project.description}
      </p>
    </div>
  );
}

export default ExperienceModalDetails;
