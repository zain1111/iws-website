import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Returns a handler for in-page section anchors that works across routes:
 * smooth-scrolls when already on the home page, otherwise navigates home
 * with a hash so ScrollManager can complete the scroll.
 */
export function useSectionNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(
    (id: string, onDone?: () => void) => {
      onDone?.();
      if (location.pathname !== "/") {
        navigate(`/#${id}`);
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }
    },
    [navigate, location.pathname],
  );
}
