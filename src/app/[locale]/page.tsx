import { setRequestLocale } from "next-intl/server";
import Header from "@/components/Header";
import ContactSection from "@/components/contact/ContactSection";
import SkillsSection from "@/components/skills/SkillsSection";
import HeroBanner from "@/components/hero/HeroBanner";
import HeroContent from "@/components/hero/HeroContent";
import ExperienceSection from "@/components/experience/ExperienceSection";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // Locale validation is owned by the [locale] layout (the locale boundary);
  // an invalid segment never reaches this page as a 200.
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <Header />
      <main id="page-content" className="flex flex-col">
        <HeroBanner>
          <HeroContent />
        </HeroBanner>
        <SkillsSection />
        <ExperienceSection />
        <ContactSection />
      </main>
    </>
  );
}
