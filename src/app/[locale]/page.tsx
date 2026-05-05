import Header from "@/components/Header";
import AboutMeBanner from "@/components/aboutMe/AboutMeBanner";
import HeroBanner from "@/components/hero/HeroBanner";
import HeroContent from "@/components/hero/HeroContent";

export default function Page() {
  return (
    <>
      <Header />
      <HeroBanner>
        <HeroContent />
      </HeroBanner>
      <AboutMeBanner />
    </>
  );
}
