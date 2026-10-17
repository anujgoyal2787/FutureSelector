export default function ShinyText({
  text,
  children,
  disabled = false,
  speed = 4,
  className = "",
  shimmerColor = "rgba(197, 160, 89, 0.9)" // Gold accent shimmer
}) {
  const content = text || children;
  const animationDuration = `${speed}s`;

  return (
    <span
      className={`inline-block bg-clip-text transition-all ${
        disabled ? "" : "animate-shiny-text"
      } ${className}`}
      style={{
        backgroundImage: `linear-gradient(120deg, currentColor 0%, currentColor 38%, ${shimmerColor} 50%, currentColor 62%, currentColor 100%)`,
        backgroundSize: "220% 100%",
        WebkitBackgroundClip: "text",
        animationDuration: animationDuration,
        display: "inline-block",
      }}
    >
      {content}
    </span>
  );
}
