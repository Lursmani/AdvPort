"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

import ViewportSection from "@/components/ViewportSection";

function AboutMeBanner() {
  const t = useTranslations("HeroBanner");

  return (
    <ViewportSection width="wide" id="about" className="flex items-center">
      <div className="grid w-full items-center gap-10 py-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)] lg:gap-14 lg:py-16">
        <div className="max-w-3xl">
          <p className="text-foreground-soft text-xs font-semibold uppercase tracking-[0.24em] sm:text-sm">
            {t("intro1")}
          </p>
          <h2 className="mt-7 text-5xl font-semibold leading-none text-foreground sm:text-6xl lg:text-6xl">
            {t("name")}
          </h2>
          <p className="text-foreground-soft mt-6 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8">
            {t("intro2")}
          </p>
        </div>

        <div className="hero-glass mx-auto w-full max-w-md rounded-[2rem] p-3 lg:mx-0 lg:justify-self-end">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem]">
            <Image
              src="/images/davit%20ski.jpg"
              alt={`${t("name")} portrait`}
              fill
              priority
              sizes="(min-width: 1024px) 28rem, (min-width: 640px) 24rem, 90vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </ViewportSection>
  );
}

export default AboutMeBanner;
