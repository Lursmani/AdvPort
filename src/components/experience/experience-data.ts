import type { CSSProperties } from "react";
import { defaultLocale, isValidLocale, type AppLocale } from "@/i18n/config";

export type ExperienceTone = "amber" | "teal" | "slate";

export type ExperienceTimeline = Record<AppLocale, string>;

const EXPERIENCE_PROJECT_IMAGE_SOURCES = [
  "/images/projects/energygrip-1.jpg",
  "/images/projects/energygrip-1.jpg",
  "/images/projects/energygrip-1.jpg",
] as const;

export const EXPERIENCE_TAG_IDS = [
  "nextjs",
  "react",
  "typescript",
  "swr",
  "iotIntegration",
  "dataVisualization",
  "ciCd",
  "reactNative",
  "figma",
  "appStoreDeployment",
  "gatsby",
  "graphQl",
  "contentful",
  "performanceOptimization",
  "apiIntegration",
  "realTimeData",
  "materialUi",
] as const;

export type ExperienceTagId = (typeof EXPERIENCE_TAG_IDS)[number];

export type ExperienceProjectConfig = {
  id: string;
  timeline: ExperienceTimeline;
  tone: ExperienceTone;
  tagIds: readonly ExperienceTagId[];
  imageSources: readonly [string, ...string[]];
};

export type ExperienceProject = Omit<ExperienceProjectConfig, "timeline"> & {
  timeline: string;
  title: string;
  subtitle: string;
  description: string;
  tags: readonly string[];
  href?: string;
  openProjectLabel: string;
  openImageLabel: string;
  externalProjectLabel: string;
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

export function getExperienceTimeline(
  timelineByLocale: ExperienceTimeline,
  locale: string,
) {
  const currentLocale = isValidLocale(locale) ? locale : defaultLocale;

  return timelineByLocale[currentLocale];
}

export const EXPERIENCE_PROJECTS = [
  {
    id: "energyGrip",
    timeline: {
      en: "2023-Present",
      nl: "2023-Heden",
      ka: "2023-დღემდე",
    },
    tone: "amber",
    tagIds: [
      "nextjs",
      "react",
      "typescript",
      "swr",
      "iotIntegration",
      "dataVisualization",
      "ciCd",
    ],
    imageSources: EXPERIENCE_PROJECT_IMAGE_SOURCES,
  },
  {
    id: "energyFlip",
    timeline: {
      en: "2023-Present",
      nl: "2023-Heden",
      ka: "2023-დღემდე",
    },
    tone: "teal",
    tagIds: [
      "reactNative",
      "typescript",
      "dataVisualization",
      "figma",
      "appStoreDeployment",
      "ciCd",
    ],
    imageSources: EXPERIENCE_PROJECT_IMAGE_SOURCES,
  },
  {
    id: "consultancyWork",
    timeline: {
      en: "2022-2023",
      nl: "2022-2023",
      ka: "2022-2023",
    },
    tone: "slate",
    tagIds: [
      "nextjs",
      "gatsby",
      "graphQl",
      "contentful",
      "performanceOptimization",
    ],
    imageSources: EXPERIENCE_PROJECT_IMAGE_SOURCES,
  },
  {
    id: "universalTransit",
    timeline: {
      en: "2021-2022",
      nl: "2021-2022",
      ka: "2021-2022",
    },
    tone: "amber",
    tagIds: [
      "react",
      "typescript",
      "apiIntegration",
      "realTimeData",
      "materialUi",
    ],
    imageSources: EXPERIENCE_PROJECT_IMAGE_SOURCES,
  },
] as const satisfies readonly ExperienceProjectConfig[];

export type ExperienceProjectId = (typeof EXPERIENCE_PROJECTS)[number]["id"];
