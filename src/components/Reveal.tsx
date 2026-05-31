"use client";

import { m as motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/providers/ThemeProvider";

const REVEAL_TRANSITION = {
  duration: 0.64,
  ease: [0.22, 1, 0.36, 1],
} as const;

type RevealDirection = "left" | "right" | "bottom";

type RevealProps = Omit<
  HTMLMotionProps<"div">,
  "animate" | "initial" | "viewport" | "whileInView"
> & {
  children: ReactNode;
  from?: RevealDirection;
  distance?: number;
  delay?: number;
  viewportAmount?: number;
};

function getHiddenState(direction: RevealDirection, distance: number) {
  switch (direction) {
    case "left":
      return { opacity: 0, x: -distance, y: 0 };
    case "right":
      return { opacity: 0, x: distance, y: 0 };
    case "bottom":
      return { opacity: 0, x: 0, y: distance };
    default:
      return { opacity: 0, x: distance, y: 0 };
  }
}

function Reveal({
  children,
  from = "right",
  distance = from === "bottom" ? 56 : 64,
  delay = 0,
  viewportAmount = 0.3,
  transition,
  ...props
}: RevealProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <motion.div
      {...props}
      initial={prefersReducedMotion ? false : getHiddenState(from, distance)}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: viewportAmount }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { ...REVEAL_TRANSITION, ...(transition ?? {}), delay }
      }
    >
      {children}
    </motion.div>
  );
}

export default Reveal;
