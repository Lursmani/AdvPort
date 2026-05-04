import { useTranslations } from "next-intl";

function HeroContent() {
  const t = useTranslations();

  return (
    <div className="flex flex-1 items-end pb-8 pt-16 sm:pb-14 lg:pb-20">
      <div className="max-w-3xl">
        <h1 className="mt-7 text-5xl font-semibold leading-none tracking-[-0.06em] text-foreground sm:text-6xl lg:text-8xl">
          {t("HeroBanner.name")}
        </h1>
      </div>
    </div>
  );
}

export default HeroContent;
