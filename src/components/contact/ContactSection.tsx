import type { CSSProperties } from "react";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Download,
  GitBranch,
  Mail,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Reveal from "@/components/Reveal";
import ViewportSection from "@/components/ViewportSection";
import styles from "./ContactSection.module.css";

type ContactActionKey = "linkedin" | "github" | "email" | "cv";

type ContactAction = {
  key: ContactActionKey;
  href: string;
  icon: LucideIcon;
  accentStyle: CSSProperties;
  external?: boolean;
  download?: string;
};

const CONTACT_ACTIONS: readonly ContactAction[] = [
  {
    key: "linkedin",
    href: "https://www.linkedin.com/in/davit-lursmanashvili/",
    icon: BriefcaseBusiness,
    external: true,
    accentStyle: {
      "--contact-accent":
        "color-mix(in oklab, var(--hero-three) 82%, white 18%)",
    } as CSSProperties,
  },
  {
    key: "github",
    href: "https://github.com/Lursmani",
    icon: GitBranch,
    external: true,
    accentStyle: {
      "--contact-accent":
        "color-mix(in oklab, var(--hero-four) 86%, white 14%)",
    } as CSSProperties,
  },
  {
    key: "email",
    href: "mailto:lursmanashvilidavit@gmail.com",
    icon: Mail,
    accentStyle: {
      "--contact-accent": "color-mix(in oklab, var(--hero-two) 78%, white 22%)",
    } as CSSProperties,
  },
  {
    key: "cv",
    href: "/documents/Davit-Lursmanashvili-CV.pdf",
    icon: Download,
    download: "Davit-Lursmanashvili-CV.pdf",
    accentStyle: {
      "--contact-accent":
        "color-mix(in oklab, var(--foreground) 72%, var(--hero-one) 28%)",
    } as CSSProperties,
  },
] as const;

function ContactSection() {
  const t = useTranslations("ContactSection");

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
              "radial-gradient(circle at center, color-mix(in oklab, var(--hero-four) 24%, transparent) 0%, transparent 74%)",
          }}
        />

        <Reveal className="max-w-3xl" delay={0.04} viewportAmount={0.3}>
          <p className="text-foreground-soft text-xs font-semibold uppercase tracking-[0.24em] sm:text-sm">
            {t("eyebrow")}
          </p>
          <h2 className="mt-6 max-w-4xl text-4xl font-semibold leading-none text-foreground">
            {t("title")}
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-7 text-foreground-soft sm:text-lg">
            {t("description")}
          </p>
        </Reveal>

        <Reveal
          className="mt-12"
          from="bottom"
          delay={0.1}
          viewportAmount={0.2}
        >
          <div className={styles.grid}>
            {CONTACT_ACTIONS.map((action) => {
              const ActionIcon = action.icon;
              const TrailingIcon = action.download ? Download : ArrowUpRight;

              return (
                <a
                  key={action.key}
                  href={action.href}
                  className={styles.cardLink}
                  style={action.accentStyle}
                  target={action.external ? "_blank" : undefined}
                  rel={action.external ? "noopener noreferrer" : undefined}
                  download={action.download}
                >
                  <span className={styles.content}>
                    <span className={styles.iconShell} aria-hidden="true">
                      <ActionIcon
                        className={styles.actionIcon}
                        strokeWidth={1.85}
                      />
                    </span>

                    <span className={styles.copy}>
                      <span className={styles.label}>
                        {t(`actions.${action.key}.label`)}
                      </span>
                      <span className={styles.detail}>
                        {t(`actions.${action.key}.detail`)}
                      </span>
                    </span>

                    <span className={styles.trailingShell} aria-hidden="true">
                      <TrailingIcon
                        className={styles.trailingIcon}
                        strokeWidth={1.85}
                      />
                    </span>
                  </span>
                </a>
              );
            })}
          </div>
        </Reveal>
      </div>
    </ViewportSection>
  );
}

export default ContactSection;
