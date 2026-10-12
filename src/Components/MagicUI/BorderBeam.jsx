import React from "react";

const BorderBeam = ({
  duration = 14,
  delay = 0,
  size = 160,
  colorFrom = "#38bdf8",
  colorTo = "#2dd4bf",
  borderWidth = 1,
}) => (
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
    style={{
      padding: borderWidth,
      WebkitMask:
        "linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0)",
      WebkitMaskComposite: "xor",
      maskComposite: "exclude",
    }}
  >
    <div
      className="absolute"
      style={{
        width: size,
        height: size,
        top: "50%",
        left: "50%",
        background: `linear-gradient(90deg,transparent,${colorFrom},${colorTo},transparent)`,
        animation: `attendance-border-beam ${duration}s linear ${delay}s infinite`,
      }}
    />
  </div>
);

export default BorderBeam;
