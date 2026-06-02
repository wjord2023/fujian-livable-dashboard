import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export interface NumberAnimationProps {
  value: number;
  duration?: number;
  delay?: number;
  options?: Intl.NumberFormatOptions;
  className?: string;
  style?: React.CSSProperties;
}

export default function NumberAnimation(props: NumberAnimationProps) {
  const { value, duration = 2, delay, options, className, style } = props;
  const fromVal = useRef<number>(0);
  const elRef = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    let tween: gsap.core.Tween;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // 只在第一次进入视口时触发
        if (entry.isIntersecting) {
          tween = gsap.to(fromVal, {
            current: value,
            duration,
            delay,
            ease: "power1.out",
            onUpdate() {
              elRef.current.innerHTML = fromVal.current.toLocaleString(
                "zh-CN",
                options
              );
            },
          });
        }
      },
      {
        threshold: 0.1,
      }
    );

    observer.observe(elRef.current);

    return () => {
      tween?.kill();
      observer.disconnect();
    };
  }, [value, duration, delay, options]);

  return (
    <div ref={elRef} className={className} style={style}>
      0
    </div>
  );
}
