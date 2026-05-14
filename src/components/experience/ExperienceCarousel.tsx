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
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [openProject, setOpenProject] = useState<OpenProjectState | null>(null);
  const [suppressedFocusCardId, setSuppressedFocusCardId] = useState<
    string | null
  >(null);
  const lastTriggerRef = useRef<HTMLElement | null>(null);

  const handleOpenProject = ({
    project,
    sourceRect,
    triggerElement,
  }: ExperienceCarouselOpenProject) => {
    lastTriggerRef.current = triggerElement;
    setSuppressedFocusCardId(null);
    setActiveCardId(project.id);
    setOpenProject({
      project,
      sourceRect,
    });
  };

  const closeProject = () => {
    const closingProjectId = openProject?.project.id ?? null;

    setOpenProject(null);
    setActiveCardId(null);
    setSuppressedFocusCardId(closingProjectId);

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
        activeCardId={activeCardId}
        suppressedFocusCardId={suppressedFocusCardId}
        onActivateCard={setActiveCardId}
        onDeactivateCard={(projectId) => {
          setActiveCardId((currentKey) =>
            currentKey === projectId ? null : currentKey,
          );
        }}
        onClearSuppressedFocus={(projectId) => {
          setSuppressedFocusCardId((currentProjectId) =>
            currentProjectId === projectId ? null : currentProjectId,
          );
        }}
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
