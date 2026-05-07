import type { ComponentPropsWithRef, ReactNode } from "react";

type GlyphButtonProps = Omit<ComponentPropsWithRef<"button">, "children"> & {
  children: ReactNode;
};

const baseClassName =
  "hero-glass inline-flex size-11 items-center justify-center rounded-full text-foreground-muted transition duration-300 hover:-translate-y-0.5 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-70";

function GlyphButton({
  children,
  className,
  type = "button",
  ref,
  ...props
}: GlyphButtonProps) {
  const resolvedClassName = className
    ? `${baseClassName} ${className}`
    : baseClassName;

  return (
    <button ref={ref} type={type} className={resolvedClassName} {...props}>
      {children}
    </button>
  );
}

export default GlyphButton;
