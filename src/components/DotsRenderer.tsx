import React from "react";

interface DotsRendererProps {
  x: number;
  y: number;
  dots: number;
}

const STAFF_LINE_SPACING = 10; // Matches the constant from musicConstants.ts
const DOT_RADIUS = 2;
const DOT_SPACING = 8;
const DOT_OFFSET_X = 15;

export const DotsRenderer: React.FC<DotsRendererProps> = ({ x, y, dots }) => {
  // Early return for invalid input
  if (dots <= 0) return null;

  // Determine if the note is on a staff line by checking if y is divisible by STAFF_LINE_SPACING
  const isOnLine = Math.round(y % STAFF_LINE_SPACING) === 0;

  // If the note is on a line, move the dot up by half a space
  const dotY = isOnLine ? y - STAFF_LINE_SPACING / 2 : y;

  return (
    <>
      {Array.from({ length: dots }, (_, index) => (
        <circle
          key={index}
          cx={x + DOT_OFFSET_X + index * DOT_SPACING}
          cy={dotY}
          r={DOT_RADIUS}
          fill="black"
        />
      ))}
    </>
  );
};
