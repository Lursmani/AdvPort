import Header from "@/components/Header";
import SkillsSection from "@/components/skills/SkillsSection";
import AboutMeBanner from "@/components/aboutMe/AboutMeBanner";
import HeroBanner from "@/components/hero/HeroBanner";
import HeroContent from "@/components/hero/HeroContent";
import ExperienceSection from "@/components/experience/ExperienceSection";

export default function Page() {
  return (
    <>
      <Header />
      <main id="page-content" className="flex flex-col">
        <HeroBanner>
          <HeroContent />
        </HeroBanner>
        <SkillsSection />
        <ExperienceSection /></main>
    </>
  );
}
