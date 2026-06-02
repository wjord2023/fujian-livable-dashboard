import { useEffect, useRef } from "react";

export function useRafInterval(
  callback: () => void,
  delay: number,
  immediate = false
) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay == null || delay <= 0) return;

    let lastTime = performance.now();
    let rafId: number;

    if (immediate) {
      savedCallback.current();
      lastTime = performance.now();
    }

    function tick(currentTime: number) {
      let delta = currentTime - lastTime;

      while (delta >= delay) {
        savedCallback.current();
        delta -= delay;
        lastTime += delay;
      }

      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [delay, immediate]);
}

export default useRafInterval;
