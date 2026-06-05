"use client";

import { useCallback, useEffect, useId, useState } from "react";
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
  copyLabel?: string;
  copySuccessMessage?: string;
  copyErrorMessage?: string;
  activated?: boolean;
  activationDelay?: number;
};

export default function ContactCard({
  action,
  label,
  subtitle,
  copyButton,
  copyLabel,
  copySuccessMessage,
  copyErrorMessage,
  activated,
  activationDelay = 0,
}: ContactCardProps) {
  const ActionIcon = action.icon;
  const TrailingIcon = action.download ? Download : ArrowUpRight;
  const [copyStatus, setCopyStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const statusMessageId = useId();

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(subtitle);
      setCopyStatus("success");
    } catch {
      setCopyStatus("error");
    }
  }, [subtitle]);

  useEffect(() => {
    if (copyStatus === "idle") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCopyStatus("idle");
    }, 2400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [copyStatus]);

  const copyStatusMessage =
    copyStatus === "success"
      ? copySuccessMessage
      : copyStatus === "error"
        ? copyErrorMessage
        : undefined;

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
              <>
                <button
                  type="button"
                  className={cn(styles.copyButton, "ml-4")}
                  onClick={handleCopy}
                  aria-label={copyLabel}
                  title={copyLabel}
                  aria-describedby={
                    copyStatusMessage ? statusMessageId : undefined
                  }
                >
                  <Copy
                    className={styles.trailingIcon}
                    strokeWidth={1.85}
                    aria-hidden="true"
                  />
                </button>

                <span
                  id={statusMessageId}
                  className={styles.copyStatus}
                  role="status"
                  aria-live="polite"
                >
                  {copyStatusMessage ?? ""}
                </span>
              </>
            )}
          </span>
        </span>
      </span>
    </div>
  );
}
