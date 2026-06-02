import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, Download } from "lucide-react";
import styles from "./ContactSection.module.scss";

type ContactAccentStyle = CSSProperties & {
  "--contact-accent": string;
};

export type ContactAction = {
  key: "linkedin" | "github" | "email" | "cv";
  href: string;
  icon: LucideIcon;
  accentStyle: ContactAccentStyle;
  external?: boolean;
  download?: string;
};

type ContactCardProps = {
  action: ContactAction;
  label: string;
  detail: string;
  copyButton?: boolean;
};

export default function ContactCard({
  action,
  label,
  detail,
  copyButton,
}: ContactCardProps) {
  const ActionIcon = action.icon;
  const TrailingIcon = action.download ? Download : ArrowUpRight;

  return (
    <a
      href={action.href}
      className={styles.cardLink}
      style={action.accentStyle}
      target={action.external ? "_blank" : undefined}
      rel={action.external ? "noopener noreferrer" : undefined}
      download={action.download}
    >
      <span className={styles.content}>
        <span className={styles.iconShell} aria-hidden="true">
          <ActionIcon className={styles.actionIcon} strokeWidth={1.85} />
        </span>

        <span className={styles.copy}>
          <span className={styles.label}>{label}</span>
          <span className={styles.detail}>{detail}</span>
        </span>

        <span className={styles.trailingShell} aria-hidden="true">
          <TrailingIcon className={styles.trailingIcon} strokeWidth={1.85} />
          {copyButton && (
            <span className={styles.copyButton} aria-hidden="true">
              Copy
            </span>
          )}
        </span>
      </span>
    </a>
  );
}
