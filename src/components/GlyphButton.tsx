import type { ComponentPropsWithRef, ReactNode } from "react";
import cn from "@/utils/cn";
import styles from "./GlyphButton.module.scss";

type GlyphButtonProps = Omit<ComponentPropsWithRef<"button">, "children"> & {
  children: ReactNode;
  variant?: "hero" | "surface";
};

function GlyphButton({
  children,
  className,
  type = "button",
  variant = "hero",
  ref,
  ...props
}: GlyphButtonProps) {
  const resolvedClassName = cn(
    styles.button,
    variant === "hero" ? "hero-glass" : null,
    styles[variant],
    className,
  );

  return (
    <button ref={ref} type={type} className={resolvedClassName} {...props}>
      {children}
    </button>
  );
}

export default GlyphButton;
