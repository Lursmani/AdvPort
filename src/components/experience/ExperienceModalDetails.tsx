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
    <div className="flex min-h-0 flex-col">
      <div className="flex flex-wrap items-center gap-3">
        {project.href ? (
          <Link
            href={project.href}
            target="_blank"
            rel="noreferrer"
            className={styles.modalLink}
            aria-label={project.externalProjectLabel}
          >
            <span>{project.visitProjectLabel}</span>
            <ExternalLink className="size-3.5" strokeWidth={1.8} />
          </Link>
        ) : null}
      </div>

      <h3
        id={`experience-modal-title-${project.id}`}
        className="mt-5 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
      >
        {project.title}
      </h3>

      <p className="text-foreground-soft mt-4 text-base leading-7 sm:text-lg sm:leading-8">
        {project.subtitle}
      </p>

      <div className={cn(styles.modalDescription, "mt-6")}>
        <p className="text-foreground-muted text-sm leading-7 sm:text-base sm:leading-8">
          {project.description}
        </p>
      </div>
    </div>
  );
}

export default ExperienceModalDetails;
