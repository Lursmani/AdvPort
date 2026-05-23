"use client";

import { AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import ExperienceModal from "./ExperienceModal";
import ExperienceCarouselViewport, {
  type ExperienceCarouselOpenProject,
} from "./ExperienceCarouselViewport";
import {
  type ExperienceCarouselLabels,
  type ExperienceProject,
  type ExperienceRect,
} from "./experience-data";

type ExperienceCarouselProps = {
  projects: readonly ExperienceProject[];
  labels: ExperienceCarouselLabels;
};

type OpenProjectState = {
  project: ExperienceProject;
  sourceRect: ExperienceRect;
};

function ExperienceCarousel({ projects, labels }: ExperienceCarouselProps) {
  const [openProject, setOpenProject] = useState<OpenProjectState | null>(null);
  const lastTriggerRef = useRef<HTMLElement | null>(null);

  const handleOpenProject = ({
    project,
    sourceRect,
    triggerElement,
  }: ExperienceCarouselOpenProject) => {
    lastTriggerRef.current = triggerElement;
    setOpenProject({
      project,
      sourceRect,
    });
  };

  const closeProject = () => {
    setOpenProject(null);

    const lastTrigger = lastTriggerRef.current;

    lastTriggerRef.current = null;

    if (!lastTrigger) {
      return;
    }

    window.requestAnimationFrame(() => {
      if (lastTrigger.isConnected) {
        lastTrigger.focus({ preventScroll: true });
      }
    });
  };

  return (
    <>
      <ExperienceCarouselViewport
        projects={projects}
        labels={labels}
        onOpenProject={handleOpenProject}
      />

      <AnimatePresence>
        {openProject ? (
          <ExperienceModal
            key={openProject.project.id}
            project={openProject.project}
            sourceRect={openProject.sourceRect}
            labels={labels}
            onClose={closeProject}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}

export default ExperienceCarousel;
