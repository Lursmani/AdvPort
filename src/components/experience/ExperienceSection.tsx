import { useLocale, useTranslations } from "next-intl";
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
  externalLink?: string;
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
      href: projectMessages.externalLink,
      openProjectLabel: t("actions.openProject", { title }),
      openImageLabel: t("actions.openProjectImage", { title }),
      externalProjectLabel: t("actions.externalProject", { title }),
    };
  });

  const labels: ExperienceCarouselLabels = {
    closeModal: t("actions.closeModal"),
    previousProject: t("actions.previousProject"),
    nextProject: t("actions.nextProject"),
  };

  return (
    <ViewportSection
      id="experience"
      width="full"
      className="min-h-0 max-w-6xl justify-center py-18 sm:py-24"
    >
      <div className="relative isolate w-full">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-16 top-6 -z-10 h-64 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle at center, color-mix(in oklab, var(--hero-two) 20%, transparent) 0%, transparent 74%)",
          }}
        />

        <div className="max-w-3xl">
          <p className="text-foreground-soft text-xs font-semibold uppercase tracking-[0.24em] sm:text-sm">
            {t("eyebrow")}
          </p>
          <h2 className="mt-6 max-w-4xl text-4xl font-semibold leading-none text-foreground">
            {t("title")}
          </h2>
        </div>

        <ExperienceCarousel projects={projects} labels={labels} />
      </div>
    </ViewportSection>
  );
}

export default ExperienceSection;
