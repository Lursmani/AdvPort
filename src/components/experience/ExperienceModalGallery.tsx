"use client";

import Image from "next/image";
import { type ExperienceProject } from "./experience-data";
import styles from "./ExperienceSection.module.css";

type ExperienceModalGalleryProps = {
  project: ExperienceProject;
};

function ExperienceModalGallery({ project }: ExperienceModalGalleryProps) {
  return (
    <div className="flex min-h-0 flex-col">
      <div className={styles.galleryFrame}>
        <Image
          src={project.imageSrc}
          alt={`${project.title} project preview`}
          fill
          sizes="(min-width: 1024px) 48vw, 100vw"
          className={styles.galleryImage}
        />
      </div>
    </div>
  );
}

export default ExperienceModalGallery;
