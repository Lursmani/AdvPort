import type { ComponentPropsWithRef, ReactNode } from "react";
import cn from "@/utils/cn";
import styles from "./GlyphButton.module.scss";

type GlyphButtonVariant = "hero" | "surface";

type GlyphButtonBaseProps = {
  children: ReactNode;
  className?: string;
  variant?: GlyphButtonVariant;
};

// Rendered as a <button> by default, or as an <a> when `href` is provided, so
// link-styled controls (e.g. the experience modal's external-project link)
// reuse the same glass surface recipe instead of duplicating it in SCSS.
type GlyphButtonAsButton = GlyphButtonBaseProps &
  Omit<ComponentPropsWithRef<"button">, keyof GlyphButtonBaseProps> & {
    href?: undefined;
  };

type GlyphButtonAsAnchor = GlyphButtonBaseProps &
  Omit<ComponentPropsWithRef<"a">, keyof GlyphButtonBaseProps> & {
    href: string;
  };

type GlyphButtonProps = GlyphButtonAsButton | GlyphButtonAsAnchor;

function GlyphButton({
  children,
  className,
  variant = "hero",
  ...props
}: GlyphButtonProps) {
  const resolvedClassName = cn(
    styles.button,
    variant === "hero" ? "hero-glass" : null,
    styles[variant],
    className,
  );

  if (props.href !== undefined) {
    return (
      <a className={resolvedClassName} {...props}>
        {children}
      </a>
    );
  }

  const { type = "button", ...buttonProps } = props;

  return (
    <button type={type} className={resolvedClassName} {...buttonProps}>
      {children}
    </button>
  );
}

export default GlyphButton;
