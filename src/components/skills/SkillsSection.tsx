import Reveal from "@/components/Reveal";
import { useTranslations } from "next-intl";
import ViewportSection from "@/components/ViewportSection";
import SkillCard from "@/components/skills/SkillCard";

const FRONTEND_SKILLS = [
  "JavaScript",
  "TypeScript",
  "React",
  "React Native",
  "Next.js",
  "Figma",
  "HTML",
  "CSS",
  "Tailwind CSS",
  "Sass",
] as const;

const STATE_AND_DATA_SKILLS = [
  "Redux",
  "React Query",
  "SWR",
  "GraphQL",
  "Context API",
] as const;

const BACKEND_SKILLS = ["SQL", "Node.js"] as const;

const TOOLING_SKILLS = [
  "Git",
  "GitHub",
  "CI/CD",
  "Jenkins",
  "Vercel",
  "Sentry",
  "Contentful",
  "GitHub Copilot",
] as const;

const LANGUAGE_SKILLS = [
  "Georgian (Native)",
  "English (C2)",
  "Dutch (B2)",
  "Russian (B2)",
] as const;

function SkillsSection() {
  const t = useTranslations("SkillsSection");

  const cards = [
    {
      title: t("cards.frontend.title"),
      description: t("cards.frontend.description"),
      tone: "firstCardTone",
      className: "xl:translate-y-5",
      groups: [
        {
          title: t("groups.frontend"),
          skills: FRONTEND_SKILLS,
        },
      ],
    },
    {
      title: t("cards.data.title"),
      description: t("cards.data.description"),
      tone: "secondCardTone",
      className: "xl:-translate-y-3",
      groups: [
        {
          title: t("groups.stateData"),
          skills: STATE_AND_DATA_SKILLS,
        },
        {
          title: t("groups.backend"),
          skills: BACKEND_SKILLS,
        },
      ],
    },
    {
      title: t("cards.delivery.title"),
      description: t("cards.delivery.description"),
      tone: "thirdCardTone",
      className: "xl:translate-y-9",
      groups: [
        {
          title: t("groups.toolsPlatforms"),
          skills: TOOLING_SKILLS,
        },
        {
          title: t("groups.languages"),
          skills: LANGUAGE_SKILLS,
        },
      ],
    },
  ];

  return (
    <ViewportSection
      id="skills"
      width="full"
      className="min-h-0 max-w-6xl justify-center py-18 sm:py-24"
    >
      <div className="relative isolate w-full">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-10 top-10 -z-10 h-56 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle at center, color-mix(in oklab, var(--accent-three) 22%, transparent) 0%, transparent 72%)",
          }}
        />

        <Reveal className="max-w-3xl" delay={0.04} viewportAmount={0.3}>
          <p className="text-foreground-soft text-xs font-semibold uppercase tracking-[0.24em] sm:text-sm">
            {t("eyebrow")}
          </p>
          <h2 className="mt-6 max-w-4xl text-4xl font-semibold leading-none text-foreground">
            {t("title")}
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-3 lg:items-start">
          {cards.map((card, index) => (
            <SkillCard
              key={card.title}
              index={index}
              title={card.title}
              description={card.description}
              tone={card.tone}
              className={card.className}
              groups={card.groups}
            />
          ))}
        </div>
      </div>
    </ViewportSection>
  );
}

export default SkillsSection;
