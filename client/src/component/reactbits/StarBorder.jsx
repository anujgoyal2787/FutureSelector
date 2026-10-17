export default function StarBorder({
  as: Component = "button",
  className = "",
  innerClassName = "",
  color = "#C5A059",
  speed = "5s",
  children,
  onClick,
  ...rest
}) {
  return (
    <Component
      onClick={onClick}
      className={`relative inline-block p-[1.5px] overflow-hidden rounded-2xl group cursor-pointer transition-transform active:scale-[0.98] ${className}`}
      {...rest}
    >
      {/* Animated bottom trace */}
      <div
        className="pointer-events-none absolute w-[300%] h-[50%] opacity-85 bottom-[-12px] right-[-250%] rounded-full animate-star-movement-bottom z-0"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 12%)`,
          animationDuration: speed,
        }}
      />
      {/* Animated top trace */}
      <div
        className="pointer-events-none absolute w-[300%] h-[50%] opacity-85 top-[-12px] left-[-250%] rounded-full animate-star-movement-top z-0"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 12%)`,
          animationDuration: speed,
        }}
      />
      {/* Inner container */}
      <div className={`relative z-1 rounded-[14px] transition-all duration-200 ${innerClassName}`}>
        {children}
      </div>
    </Component>
  );
}
