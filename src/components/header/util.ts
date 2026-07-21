import { Dispatch, RefObject, SetStateAction } from "react";
import { BREAKPOINTS } from "@/styles/breakpoints";
import { trapOverlayFocus } from "@/utils/overlayFocus";

export const handleHeaderFocus = ({
  isDrawerOpen,
  headerShellRef,
  openDrawerButtonRef,
  closeDrawerButtonRef,
  drawerRef,
  shouldRestoreFocusRef,
  setIsDrawerOpen,
}: {
  isDrawerOpen: boolean;
  headerShellRef: RefObject<HTMLDivElement | null>;
  openDrawerButtonRef: RefObject<HTMLButtonElement | null>;
  closeDrawerButtonRef: RefObject<HTMLButtonElement | null>;
  drawerRef: RefObject<HTMLElement | null>;
  shouldRestoreFocusRef: RefObject<boolean>;
  setIsDrawerOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  if (!isDrawerOpen) {
    return;
  }

  const openDrawerButtonElement = openDrawerButtonRef.current;

  const releaseOverlay = trapOverlayFocus({
    containerRef: drawerRef,
    inertTargets: [
      headerShellRef.current,
      document.getElementById("page-content"),
    ],
    initialFocusRef: closeDrawerButtonRef,
    onEscape: () => {
      shouldRestoreFocusRef.current = true;
      setIsDrawerOpen(false);
    },
    getRestoreFocusTarget: () =>
      shouldRestoreFocusRef.current ? openDrawerButtonElement : null,
  });

  // The drawer only exists below the md breakpoint; closing on resize keeps
  // it from lingering as an invisible focus trap. Focus is deliberately not
  // restored here — the open button is hidden at desktop widths.
  const handleResize = () => {
    if (window.innerWidth >= BREAKPOINTS.md) {
      shouldRestoreFocusRef.current = false;
      setIsDrawerOpen(false);
    }
  };

  window.addEventListener("resize", handleResize);

  return () => {
    window.removeEventListener("resize", handleResize);
    releaseOverlay();

    // The skip flag is one-shot: re-arm restoration for the next open.
    shouldRestoreFocusRef.current = true;
  };
};
