import { useLocale, useTranslations } from "next-intl";
import SectionIntro from "@/components/SectionIntro";
import ViewportSection from "@/components/ViewportSection";
import ExperienceCarousel from "./ExperienceCarousel";
import {
  EXPERIENCE_PROJECTS,
  getExperienceTimeline,
  type ExperienceCarouselLabels,
  type ExperienceProject,
} from "./experience-data";

type ExperienceProjectMessages = {
  title: string;
  subtitle: string;
  description: string;
};

function ExperienceSection() {
  const t = useTranslations("ExperienceSection");
  const locale = useLocale();

  const projects: ExperienceProject[] = EXPERIENCE_PROJECTS.map((project) => {
    const projectMessages = t.raw(
      `projects.${project.id}` as const,
    ) as ExperienceProjectMessages;
    const title = projectMessages.title;
    const subtitle = projectMessages.subtitle.trim();

    return {
      ...project,
      timeline: getExperienceTimeline(project.timeline, locale),
      title,
      subtitle,
      description: projectMessages.description,
      tags: project.tagIds.map((tagId) => t(`tags.${tagId}` as const)),
      href: project.externalLink ?? undefined,
      openProjectLabel: t("actions.openProject", { title }),
      openImageLabel: t("actions.openProjectImage", { title }),
      externalProjectLabel: t("actions.externalProject", { title }),
    };
  });

  const labels: ExperienceCarouselLabels = {
    closeModal: t("actions.closeModal"),
    previousProject: t("actions.previousProject"),
    nextProject: t("actions.nextProject"),
    previousImage: t("actions.previousImage"),
    nextImage: t("actions.nextImage"),
    galleryProgress: t("actions.galleryProgress"),
    carouselLabel: t("actions.carouselLabel"),
    carouselRoleDescription: t("actions.carouselRoleDescription"),
  };

  return (
    <ViewportSection
      id="experience"
      width="full"
      className="min-h-0 max-w-6xl justify-center py-18 sm:py-24"
    >
      <div className="relative isolate w-full">
        <SectionIntro
          eyebrow={t("eyebrow")}
          title={t("title")}
          auraClassName="inset-x-16 top-6 h-64"
          auraGradient="radial-gradient(circle at center, color-mix(in oklab, var(--accent-two) 20%, transparent) 0%, transparent 74%)"
        />

        <ExperienceCarousel projects={projects} labels={labels} />
      </div>
    </ViewportSection>
  );
}

export default ExperienceSection;
