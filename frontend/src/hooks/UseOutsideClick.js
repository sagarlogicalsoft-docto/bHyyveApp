import { useEffect } from "react";

const useOutsideClick = (
  target,
  callback,
  eventType = "mousedown",
  enableEscape = true
) => {
  useEffect(() => {
    const handleOutsideClick = (event) => {
      // -----------------------------------------
      // REF MODE
      // -----------------------------------------
      if (target?.current) {
        if (!target.current.contains(event.target)) {
          callback();
        }

        return;
      }

      // -----------------------------------------
      // SELECTOR MODE
      // -----------------------------------------
      if (typeof target === "string") {
        const clickedInside = event.target.closest(target);

        if (!clickedInside) {
          callback();
        }
      }
    };

    // -----------------------------------------
    // ESCAPE KEY
    // -----------------------------------------
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        callback();
      }
    };

    document.addEventListener(eventType, handleOutsideClick);

    if (enableEscape) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener(eventType, handleOutsideClick);

      if (enableEscape) {
        document.removeEventListener("keydown", handleEscape);
      }
    };
  }, [target, callback, eventType, enableEscape]);
};

export default useOutsideClick;