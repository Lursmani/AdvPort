import { useTranslations } from "next-intl";
import SectionIntro from "@/components/SectionIntro";
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

function SkillsSection() {
  const t = useTranslations("SkillsSection");

  const languageSkills = [
    t("languageProficiency.georgian"),
    t("languageProficiency.english"),
    t("languageProficiency.dutch"),
    t("languageProficiency.russian"),
  ];

  const cards = [
    {
      title: t("cards.frontend.title"),
      description: t("cards.frontend.description"),
      tone: "firstCardTone" as const,
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
      tone: "secondCardTone" as const,
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
      tone: "thirdCardTone" as const,
      className: "xl:translate-y-9",
      groups: [
        {
          title: t("groups.toolsPlatforms"),
          skills: TOOLING_SKILLS,
        },
        {
          title: t("groups.languages"),
          skills: languageSkills,
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
        <SectionIntro
          eyebrow={t("eyebrow")}
          title={t("title")}
          auraClassName="inset-x-10 top-10 h-56"
          auraGradient="radial-gradient(circle at center, color-mix(in oklab, var(--accent-three) 22%, transparent) 0%, transparent 72%)"
        />

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
