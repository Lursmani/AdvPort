import type { CSSProperties } from "react";

export type ExperienceTone = "amber" | "teal" | "slate";

export type ExperiencePattern =
  | "dashboard"
  | "workflow"
  | "mobile"
  | "metrics"
  | "library"
  | "network";

export type ExperienceSlideConfig = {
  id: string;
  pattern: ExperiencePattern;
};

export type ExperienceProjectConfig = {
  id: string;
  timeline: string;
  tone: ExperienceTone;
  href?: string;
  slides: readonly ExperienceSlideConfig[];
};

export type ExperienceProject = ExperienceProjectConfig & {
  title: string;
  subtitle: string;
  description: string;
  openProjectLabel: string;
  openImageLabel: string;
  externalProjectLabel: string;
  visitProjectLabel: string;
};

export type ExperienceModalLabels = {
  closeModal: string;
  previousImage: string;
  nextImage: string;
  galleryProgress: string;
};

export type ExperienceCarouselLabels = ExperienceModalLabels & {
  previousProject: string;
  nextProject: string;
};

export type ExperienceRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

const TONE_STYLES: Record<ExperienceTone, CSSProperties> = {
  amber: {
    "--experience-accent":
      "color-mix(in oklab, var(--hero-two) 78%, transparent)",
    "--experience-accent-strong":
      "color-mix(in oklab, var(--hero-two) 86%, white 14%)",
  } as CSSProperties,
  teal: {
    "--experience-accent":
      "color-mix(in oklab, var(--hero-three) 82%, transparent)",
    "--experience-accent-strong":
      "color-mix(in oklab, var(--hero-three) 84%, white 16%)",
  } as CSSProperties,
  slate: {
    "--experience-accent":
      "color-mix(in oklab, var(--hero-four) 82%, transparent)",
    "--experience-accent-strong":
      "color-mix(in oklab, var(--hero-four) 86%, white 14%)",
  } as CSSProperties,
};

export function getExperienceToneStyle(tone: ExperienceTone) {
  return TONE_STYLES[tone];
}

export const EXPERIENCE_PROJECTS = [
  {
    id: "commerceReplatform",
    timeline: "2024-2025",
    tone: "amber",
    slides: [
      { id: "commerce-overview", pattern: "dashboard" },
      { id: "commerce-metrics", pattern: "metrics" },
      { id: "commerce-library", pattern: "library" },
    ],
  },
  {
    id: "operationsWorkbench",
    timeline: "2023-2025",
    tone: "teal",
    slides: [
      { id: "operations-flow", pattern: "workflow" },
      { id: "operations-mobile", pattern: "mobile" },
      { id: "operations-network", pattern: "network" },
    ],
  },
  {
    id: "servicePortal",
    timeline: "2022-2024",
    tone: "slate",
    slides: [
      { id: "service-library", pattern: "library" },
      { id: "service-dashboard", pattern: "dashboard" },
      { id: "service-metrics", pattern: "metrics" },
    ],
  },
] as const satisfies readonly ExperienceProjectConfig[];

export type ExperienceProjectId = (typeof EXPERIENCE_PROJECTS)[number]["id"];
