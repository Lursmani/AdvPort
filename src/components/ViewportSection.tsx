"use client";

import type { ComponentPropsWithRef } from "react";
import cn from "@/utils/cn";

type ViewportSectionProps = ComponentPropsWithRef<"section"> & {
  width: "full" | "wide" | "narrow";
};

function ViewportSection({
  className = "",
  ref,
  width = "full",
  ...props
}: ViewportSectionProps) {
  return (
    <section
      ref={ref}
      {...props}
      className={cn(
        "relative min-h-svh w-full flex flex-col items-center self-center overflow-x-clip px-4 py-10 sm:px-6 lg:px-8",
        width === "wide" && "max-w-5xl",
        width === "narrow" && "max-w-3xl",
        className,
      )}
    />
  );
}

export default ViewportSection;
