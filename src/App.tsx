import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import Demo2 from "./pages/Demo2";

function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: 0.6,
          ease: "power3.out",
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} style={{ willChange: "transform, opacity" }}>
      <Demo2 />
    </div>
  );
}

export default App;
