import { motion, useReducedMotion, useTransform } from "framer-motion";
import { useRef, type CSSProperties, type ReactNode } from "react";
import { useSmoothScroll } from "../lib/motion";

interface ParallaxProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Vertical drift in px across the full pass-through. Positive = element
   * moves down slower than scroll (recedes); negative = moves up faster. */
  y?: number;
  /** Optional horizontal drift in px across the pass-through. */
  x?: number;
  /** Optional continuous scale change (e.g. 1.15 → subtle push-in). */
  scaleTo?: number;
  /** Optional continuous rotation in degrees. */
  rotate?: number;
  as?: "div" | "span";
}

/**
 * Wraps content in a layer whose transform is bound to how far it has
 * travelled through the viewport. Stack several at different `y`/`x`
 * speeds to get the depth-of-field parallax seen on reference sites.
 */
export default function Parallax({
  children,
  className,
  style,
  y = 0,
  x = 0,
  scaleTo,
  rotate,
  as = "div",
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const progress = useSmoothScroll(ref);

  // Centre the drift on the midpoint of the pass so the element sits at its
  // "natural" position when it's dead-centre in the viewport.
  const ty = useTransform(progress, [0, 1], [y, -y]);
  const tx = useTransform(progress, [0, 1], [x, -x]);
  const scale = useTransform(progress, [0, 0.5, 1], [scaleTo ?? 1, 1, scaleTo ?? 1]);
  const rotateZ = useTransform(progress, [0, 1], [rotate ?? 0, -(rotate ?? 0)]);

  const Comp = as === "span" ? motion.span : motion.div;

  if (reduced) {
    const Static = as === "span" ? "span" : "div";
    return (
      <Static className={className} style={style}>
        {children}
      </Static>
    );
  }

  return (
    <Comp
      ref={ref as never}
      className={className}
      style={{
        ...style,
        y: ty,
        ...(x ? { x: tx } : {}),
        ...(scaleTo ? { scale } : {}),
        ...(rotate ? { rotate: rotateZ } : {}),
      }}
    >
      {children}
    </Comp>
  );
}
