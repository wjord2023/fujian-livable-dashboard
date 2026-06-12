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
  const { value, duration = 0.8, delay = 0, options, className, style } = props;
  const fromVal = useRef({ current: 0 });
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const elRef = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    const formatValue = (nextValue: number) =>
      nextValue.toLocaleString("zh-CN", options);

    tweenRef.current?.kill();
    tweenRef.current = gsap.to(fromVal.current, {
      current: value,
      duration,
      delay,
      overwrite: "auto",
      ease: "power1.out",
      onUpdate() {
        elRef.current.textContent = formatValue(fromVal.current.current);
      },
      onComplete() {
        fromVal.current.current = value;
        elRef.current.textContent = formatValue(value);
      },
    });

    return () => {
      tweenRef.current?.kill();
    };
  }, [value, duration, delay, options]);

  return (
    <div ref={elRef} className={className} style={style}>
      0
    </div>
  );
}
