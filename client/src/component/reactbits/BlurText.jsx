import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function BlurText({
  text = "",
  delay = 100,
  className = "",
  animateBy = "words", // "words" | "letters"
  direction = "bottom", // "top" | "bottom"
  threshold = 0.1,
  rootMargin = "0px",
  onAnimationComplete,
}) {
  const elements = animateBy === "words" ? text.split(" ") : text.split("");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: rootMargin, amount: threshold });

  const yOffset = direction === "top" ? -24 : 24;

  return (
    <span ref={ref} className={`inline-block ${className}`}>
      {elements.map((segment, index) => (
        <motion.span
          key={index}
          initial={{ filter: "blur(12px)", opacity: 0, y: yOffset }}
          animate={isInView ? { filter: "blur(0px)", opacity: 1, y: 0 } : {}}
          transition={{
            duration: 0.55,
            delay: (index * delay) / 1000,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          onAnimationComplete={
            index === elements.length - 1 ? onAnimationComplete : undefined
          }
          className="inline-block will-change-transform will-change-filter"
          style={{ whiteSpace: "pre" }}
        >
          {segment}
          {animateBy === "words" && index < elements.length - 1 && "\u00A0"}
        </motion.span>
      ))}
    </span>
  );
}
