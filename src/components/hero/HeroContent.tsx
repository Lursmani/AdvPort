import { useTranslations } from "next-intl";

function HeroContent() {
  const t = useTranslations("HeroBanner");

  return (
    <div className="flex flex-1 items-end pb-8 pt-16 sm:pb-14 lg:pb-20">
      <div className="max-w-3xl">
        <p className="text-foreground-soft text-xs font-semibold uppercase tracking-[0.24em] sm:text-sm">
          {t("intro1")}
        </p>
        <h1 className="mt-7 text-5xl font-semibold leading-none tracking-[-0.06em] text-foreground sm:text-6xl lg:text-8xl">
          {t("name")}
        </h1>
        <p className="text-foreground-soft mt-6 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8">
          {t("intro2")}
        </p>
      </div>
    </div>
  );
}

export default HeroContent;
