import React from "react";

/**
 * BorderBeam - High-End Glowing Border Tracer
 * Travels smoothly along the perimeter of rounded pills or containers.
 */
export default function BorderBeam({
  size = 240,
  duration = 8,
  borderWidth = 2,
  colorFrom = "#10B981", // Emerald
  colorTo = "#F59E0B",   // Warm Gold
  delay = 0,
  className = "",
  secondBeam = true,
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        "--size": size,
        "--duration": `${duration}s`,
        "--border-width": `${borderWidth}px`,
        "--color-from": colorFrom,
        "--color-to": colorTo,
        "--delay": `${delay}s`,
      }}
      className={`border-beam-container z-20 ${className}`}
    >
      {/* Primary Laser Tracer */}
      <div className="border-beam-tracer" />

      {/* Secondary Laser Tracer (offset for continuous ambient loop) */}
      {secondBeam && (
        <div 
          className="border-beam-tracer" 
          style={{ animationDelay: `-${duration / 2}s` }}
        />
      )}
    </div>
  );
}
