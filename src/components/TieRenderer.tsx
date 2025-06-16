import React from "react";

interface TieRendererProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  curveHeight: number;
  thickness: number;
}

export const TieRenderer: React.FC<TieRendererProps> = ({
  startX,
  startY,
  endX,
  endY,
  curveHeight,
  thickness,
}) => {
  const cx = (startX + endX) / 2;
  const cy = (startY + endY) / 2 + curveHeight;

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
