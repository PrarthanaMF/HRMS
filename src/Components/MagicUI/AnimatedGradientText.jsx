import React from "react";

const AnimatedGradientText = ({
  children,
  className = "",
  colorFrom = "#2563eb",
  colorTo = "#7c3aed",
  speed = 4,
}) => (
  <span
    className={`inline-block bg-clip-text text-transparent ${className}`}
    style={{
      backgroundImage: `linear-gradient(90deg,${colorFrom},${colorTo},${colorFrom})`,
      backgroundSize: "200% 100%",
      animation: `attendance-gradient-text ${speed}s linear infinite`,
    }}
  >
    {children}
  </span>
);

export default AnimatedGradientText;
