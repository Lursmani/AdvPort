"use client";

import { BriefcaseBusiness, Download, GitBranch, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { siteEmail } from "@/app/site";
import Reveal from "@/components/Reveal";
import ViewportSection from "@/components/ViewportSection";
import ContactCard, { type ContactAction } from "./ContactCard";
import styles from "./ContactSection.module.scss";

const CONTACT_ACTIONS: readonly ContactAction[] = [
  {
    key: "linkedin",
    href: "https://www.linkedin.com/in/davit-lursmanashvili/",
    icon: BriefcaseBusiness,
    external: true,
    accentStyle: {
      "--contact-accent":
        "color-mix(in oklab, var(--accent-one) 82%, white 5%)",
    },
  },
  {
    key: "github",
    href: "https://github.com/Lursmani",
    icon: GitBranch,
    external: true,
    accentStyle: {
      "--contact-accent":
        "color-mix(in oklab, var(--accent-four) 65%, white 14%)",
    },
  },
  {
    key: "email",
    href: `mailto:${siteEmail}`,
    icon: Mail,
    accentStyle: {
      "--contact-accent":
        "color-mix(in oklab, var(--accent-two) 78%, white 22%)",
    },
  },
  {
    key: "cv",
    href: "/documents/Davit Lursmanashvili CV NL.pdf",
    icon: Download,
    download: "Davit Lursmanashvili CV NL.pdf",
    accentStyle: {
      "--contact-accent":
        "color-mix(in oklab, white 20%, var(--accent-three) 50%)",
    },
  },
] as const;

function ContactSection() {
  const t = useTranslations("ContactSection");
  const gridRef = useRef<HTMLDivElement>(null);
  const [activated, setActivated] = useState(false);
  const [isTouch] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(hover: none)").matches ||
        window.matchMedia("(pointer: coarse)").matches
      : false,
  );

  useEffect(() => {
    if (!isTouch) return;
    const grid = gridRef.current;
    if (!grid) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActivated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(grid);
    return () => observer.disconnect();
  }, [isTouch]);

  return (
    <ViewportSection
      id="contact"
      width="full"
      className="min-h-0 max-w-6xl justify-center py-18 pb-24 sm:py-24 sm:pb-32"
    >
      <div className="relative isolate w-full">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-8 top-10 -z-10 h-64 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle at center, color-mix(in oklab, var(--accent-four) 24%, transparent) 0%, transparent 74%)",
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

        <Reveal
          className="mt-12"
          from="bottom"
          delay={0.1}
          viewportAmount={0.2}
        >
          <div className={styles.grid} ref={gridRef}>
            {CONTACT_ACTIONS.map((action, index) => (
              <ContactCard
                key={action.key}
                action={action}
                label={t(`actions.${action.key}.label`)}
                subtitle={action.key === "email" ? siteEmail : ""}
                copyButton={action.key === "email"}
                copyLabel={
                  action.key === "email"
                    ? t("actions.email.copyLabel")
                    : undefined
                }
                copySuccessMessage={
                  action.key === "email"
                    ? t("actions.email.copySuccess")
                    : undefined
                }
                copyErrorMessage={
                  action.key === "email"
                    ? t("actions.email.copyError")
                    : undefined
                }
                activated={activated}
                activationDelay={index * 0.15}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </ViewportSection>
  );
}

export default ContactSection;
