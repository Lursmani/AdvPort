"use client";

import Header from "@/components/Header";
import dynamic from "next/dynamic";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type MutableRefObject,
  type PointerEvent,
} from "react";
import HeroContent from "./HeroContent";

const FlowingScene = dynamic(() => import("@/components/hero/FlowingScene"), {
  ssr: false,
});

function subscribeToBrowserCapability() {
  return () => {};
}

export type PointerState = {
  active: boolean;
  clickToken: number;
  clickU: number;
  clickV: number;
  u: number;
  v: number;
  x: number;
  y: number;
};

function HeroBanner() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const pointer = useRef<PointerState>({
    active: false,
    clickToken: 0,
    clickU: 0.5,
    clickV: 0.5,
    u: 0.5,
    v: 0.5,
    x: 0,
    y: 0,
  });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const supportsIntersectionObserver = useSyncExternalStore(
    subscribeToBrowserCapability,
    () => typeof IntersectionObserver !== "undefined",
    () => false,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    updateMotionPreference();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateMotionPreference);

      return () => {
        mediaQuery.removeEventListener("change", updateMotionPreference);
      };
    }

    mediaQuery.addListener(updateMotionPreference);

    return () => {
      mediaQuery.removeListener(updateMotionPreference);
    };
  }, []);

  useEffect(() => {
    if (!supportsIntersectionObserver || !sectionRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        threshold: 0.14,
      },
    );

    observer.observe(sectionRef.current);

    return () => {
      observer.disconnect();
    };
  }, [supportsIntersectionObserver]);

  const sceneActive = supportsIntersectionObserver ? isInView : true;

  const getPointerPosition = (event: PointerEvent<HTMLElement>) => {
    if (!sectionRef.current) {
      return null;
    }

    const bounds = sectionRef.current.getBoundingClientRect();
    const u = Math.min(
      Math.max((event.clientX - bounds.left) / bounds.width, 0),
      1,
    );
    const v = Math.min(
      Math.max((event.clientY - bounds.top) / bounds.height, 0),
      1,
    );

    return {
      u,
      v,
      x: (u - 0.5) * 2,
      y: (0.5 - v) * 2,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const nextPointer = getPointerPosition(event);

    if (!nextPointer) {
      return;
    }

    pointer.current.active = true;
    pointer.current.x = nextPointer.x;
    pointer.current.y = nextPointer.y;
    pointer.current.u = nextPointer.u;
    pointer.current.v = nextPointer.v;
  };

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    const nextPointer = getPointerPosition(event);

    if (!nextPointer) {
      return;
    }

    pointer.current.active = true;
    pointer.current.x = nextPointer.x;
    pointer.current.y = nextPointer.y;
    pointer.current.u = nextPointer.u;
    pointer.current.v = nextPointer.v;
    pointer.current.clickU = nextPointer.u;
    pointer.current.clickV = nextPointer.v;
    pointer.current.clickToken += 1;
  };

  const handlePointerLeave = () => {
    pointer.current.active = false;
    pointer.current.x = 0;
    pointer.current.y = 0;
    pointer.current.u = 0.5;
    pointer.current.v = 0.5;
  };

  return (
    <section
      id="top"
      ref={sectionRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative isolate min-h-svh overflow-hidden"
    >
      <div className="hero-backdrop absolute inset-0" />
      {!prefersReducedMotion ? (
        <FlowingScene active={sceneActive} pointer={pointer} />
      ) : null}

      <div className="hero-bottom-fade absolute inset-x-0 bottom-0 h-40 z-10" />

      <div className="relative z-20 mx-auto flex min-h-svh w-full max-w-7xl flex-col px-6 pb-12 pt-5 sm:px-10 lg:px-12">
        <Header />
        <HeroContent />
      </div>
    </section>
  );
}

export default HeroBanner;

export type FlowingScenePointer = MutableRefObject<PointerState>;
