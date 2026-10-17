import { useEffect, useRef, useState } from "react";
import { useInView, animate } from "framer-motion";

export default function CountUp({
  to,
  from = 0,
  duration = 2,
  delay = 0,
  decimals = 0,
  separator = ",",
  prefix = "",
  suffix = "",
  className = "",
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -50px 0px" });
  const [displayValue, setDisplayValue] = useState(
    Number(from).toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  );

  useEffect(() => {
    if (!isInView) return;

    const target = typeof to === "string" ? parseFloat(to.replace(/[^0-9.]/g, "")) : to;
    if (isNaN(target)) return;

    const timeout = setTimeout(() => {
      const controls = animate(from, target, {
        duration,
        ease: [0.16, 1, 0.3, 1], // easeOutExpo
        onUpdate: (latest) => {
          const formatted = latest.toLocaleString("en-US", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          });
          setDisplayValue(separator ? formatted.replace(/,/g, separator) : formatted);
        },
      });

      return () => controls.stop();
    }, delay * 1000);

    return () => clearTimeout(timeout);
  }, [isInView, to, from, duration, delay, decimals, separator]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}
