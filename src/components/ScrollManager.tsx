import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * On navigation: jump to the top for a fresh route, or smooth-scroll to a
 * hash target (e.g. arriving at "/#services" from the portfolio page).
 */
export default function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.slice(1);
      // Wait a frame so the target section has mounted.
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      });
    } else {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [pathname, hash]);

  return null;
}
