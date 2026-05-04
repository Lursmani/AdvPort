import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type GlyphButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

const baseClassName =
  "hero-glass inline-flex size-11 items-center justify-center rounded-full text-foreground-muted transition duration-300 hover:-translate-y-0.5 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-70";

const GlyphButton = forwardRef<HTMLButtonElement, GlyphButtonProps>(
  ({ children, className, type = "button", ...props }, ref) => {
    const resolvedClassName = className
      ? `${baseClassName} ${className}`
      : baseClassName;

    return (
      <button ref={ref} type={type} className={resolvedClassName} {...props}>
        {children}
      </button>
    );
  },
);

GlyphButton.displayName = "GlyphButton";

export default GlyphButton;
