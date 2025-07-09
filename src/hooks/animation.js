import { useEffect, useRef, useCallback } from "react";

export const useAnimationFrame = (callback, shouldAnimate = false) => {
  const frameRef = useRef(0);
  const timeRef = useRef();

  const animate = useCallback(
    (time) => {
      if (timeRef.current !== undefined) {
        const deltaTime = time - timeRef.current;
        callback(deltaTime);
      }

      timeRef.current = time;
      frameRef.current = requestAnimationFrame(animate);
    },
    [callback]
  );

  useEffect(() => {
    if (shouldAnimate) {
      frameRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(frameRef.current);
    }

    return () => cancelAnimationFrame(frameRef.current);
  }, [shouldAnimate, animate]);
};
