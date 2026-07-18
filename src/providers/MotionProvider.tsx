"use client";

import { LazyMotion } from "framer-motion";
import type { ReactNode } from "react";

type MotionProviderProps = {
  children: ReactNode;
};

const loadDomAnimation = () =>
  import("./framer-motion-features").then((module) => module.default);

function MotionProvider({ children }: MotionProviderProps) {
  return (
    <LazyMotion features={loadDomAnimation} strict>
      {children}
    </LazyMotion>
  );
}

export default MotionProvider;
