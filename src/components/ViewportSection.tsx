"use client";

import { forwardRef, type ComponentPropsWithoutRef } from "react";

type ViewportSectionProps = ComponentPropsWithoutRef<"section">;

const ViewportSection = forwardRef<HTMLElement, ViewportSectionProps>(
  function ViewportSection({ className = "", ...props }, ref) {
    return (
      <section
        ref={ref}
        {...props}
        className={`relative min-h-svh w-full ${className}`.trim()}
      />
    );
  },
);

export default ViewportSection;
