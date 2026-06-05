"use client";

import { useCallback } from "react";
import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, Download, Copy } from "lucide-react";
import styles from "./ContactSection.module.scss";
import cn from "@/utils/cn";

type ContactAccentStyle = CSSProperties & {
  "--contact-accent": string;
  "--activation-delay"?: string;
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
  subtitle: string;
  copyButton?: boolean;
  activated?: boolean;
  activationDelay?: number;
};

export default function ContactCard({
  action,
  label,
  subtitle,
  copyButton,
  activated,
  activationDelay = 0,
}: ContactCardProps) {
  const ActionIcon = action.icon;
  const TrailingIcon = action.download ? Download : ArrowUpRight;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(subtitle);
    } catch {
      // Clipboard API unavailable — silently ignore
    }
  }, [subtitle]);

  return (
    <div
      className={cn(styles.card, activated && styles.cardActive)}
      style={{
        ...action.accentStyle,
        ...(activated ? { "--activation-delay": `${activationDelay}s` } : {}),
      }}
    >
      <span className={styles.content}>
        <span className={styles.iconShell} aria-hidden="true">
          <ActionIcon className={styles.actionIcon} strokeWidth={1.85} />
        </span>

        <span className={styles.copy}>
          <span className="flex flex-row gap-2">
            <a
              href={action.href}
              className={styles.label}
              target={action.external ? "_blank" : undefined}
              rel={action.external ? "noopener noreferrer" : undefined}
              download={action.download}
            >
              {label}
            </a>
            <TrailingIcon
              className={styles.trailingIcon}
              strokeWidth={1.85}
              aria-hidden="true"
            />
          </span>
          <span className={styles.detailRow}>
            {subtitle && <span className={styles.detail}>{subtitle}</span>}

            {copyButton && (
              <button
                type="button"
                className={cn(styles.copyButton, "ml-4")}
                onClick={handleCopy}
              >
                <Copy
                  className={styles.trailingIcon}
                  strokeWidth={1.85}
                  aria-hidden="true"
                />
              </button>
            )}
          </span>
        </span>
      </span>
    </div>
  );
}
