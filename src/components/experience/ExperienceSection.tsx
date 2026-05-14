import { useTranslations } from "next-intl";
import ViewportSection from "@/components/ViewportSection";
import ExperienceCarousel from "./ExperienceCarousel";
import {
  EXPERIENCE_PROJECTS,
  type ExperienceCarouselLabels,
  type ExperienceProject,
} from "./experience-data";

function ExperienceSection() {
  const t = useTranslations("ExperienceSection");

  const projects: ExperienceProject[] = EXPERIENCE_PROJECTS.map((project) => {
    const title = t(`projects.${project.id}.title` as const);

    return {
      ...project,
      title,
      subtitle: t(`projects.${project.id}.subtitle` as const),
      description: t(`projects.${project.id}.description` as const),
      openProjectLabel: t("actions.openProject", { title }),
      openImageLabel: t("actions.openProjectImage", { title }),
      externalProjectLabel: t("actions.externalProject", { title }),
      visitProjectLabel: t("actions.visitProject", { title }),
    };
  });

  const labels: ExperienceCarouselLabels = {
    closeModal: t("actions.closeModal"),
    previousImage: t("actions.previousImage"),
    nextImage: t("actions.nextImage"),
    galleryProgress: t("actions.galleryProgress"),
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
          <h2 className="mt-6 max-w-4xl text-4xl font-semibold leading-none text-foreground sm:text-5xl lg:text-6xl">
            {t("title")}
          </h2>
          <p className="text-foreground-soft mt-6 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8">
            {t("description")}
          </p>
        </div>

        <ExperienceCarousel projects={projects} labels={labels} />
      </div>
    </ViewportSection>
  );
}

export default ExperienceSection;
