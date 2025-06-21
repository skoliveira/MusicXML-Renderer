import React from "react";

interface SlurRendererProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  placement?: "above" | "below";
  curvature?: number; // Optional curvature adjustment
  thickness?: number;
}

export const SlurRenderer: React.FC<SlurRendererProps> = ({
  startX,
  startY,
  endX,
  endY,
  placement = "above",
  curvature = 20,
  thickness = 5,
}) => {
  // Control point for the curve
  const cx = (startX + endX) / 2;
  const cy = (startY + endY) / 2 + curvature;

  const halfThickness = thickness / 2;
  const topControlY = cy - halfThickness;
  const bottomControlY = cy + halfThickness;

  const pathData = `
      M ${startX} ${startY}
      Q ${cx} ${topControlY} ${endX} ${endY}
      L ${endX} ${endY}
      Q ${cx} ${bottomControlY} ${startX} ${startY}
      Z
    `.trim();

  return <path d={pathData} stroke="none" fill="black" />;
};
