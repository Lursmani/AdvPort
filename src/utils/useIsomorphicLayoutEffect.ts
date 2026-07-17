import { useEffect, useLayoutEffect } from "react";

/**
 * `useLayoutEffect` on the client, `useEffect` on the server. Lets a component
 * read layout and commit derived state before the browser paints (avoiding a
 * flash of wrong UI) without triggering React's SSR warning for
 * `useLayoutEffect`.
 */
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export default useIsomorphicLayoutEffect;
