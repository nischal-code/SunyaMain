import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

/**
 * useGsapReveal
 * Small reusable entrance-animation hook built on GSAP. Attach the
 * returned ref to a container element; on mount (and whenever `deps`
 * changes) it fades/slides the container in, and — if `stagger` is set
 * — staggers in its immediate children individually. This is the shared
 * primitive behind the page/section entrance animations used across the
 * dashboard, projects, tasks, and productivity pages.
 *
 * Options:
 *  - y:        number  — starting vertical offset in px (default 18)
 *  - duration: number  — seconds (default 0.6)
 *  - stagger:  number  — seconds between each direct child's animation.
 *              When 0/falsy, the container itself animates as one block.
 *  - delay:    number  — seconds before the animation starts (default 0)
 *  - selector: string  — CSS selector (relative to the container) picking
 *              which descendants to stagger. Defaults to direct children.
 *  - deps:     array   — re-run the animation when these change (e.g. a
 *              route pathname, so it replays on navigation)
 */
const useGsapReveal = ({
  y = 18,
  duration = 0.6,
  stagger = 0,
  delay = 0,
  selector = ":scope > *",
  deps = [],
} = {}) => {
  const containerRef = useRef(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    const node = containerRef.current;
    if (!node) return undefined;

    const targets = stagger ? node.querySelectorAll(selector) : node;
    if (stagger && (!targets || !targets.length)) return undefined;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration,
          delay,
          stagger: stagger || 0,
          ease: "power3.out",
          clearProps: "transform",
        }
      );
    }, node);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return containerRef;
};

export default useGsapReveal;
