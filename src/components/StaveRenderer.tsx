import React, { JSX } from "react";

export const STAFF_SPACING = 120; // Vertical spacing between staves within a part
export const STAFF_LINE_SPACING = 10; // Spacing between staff lines

interface StaveRendererProps {
  yOffset: number;
  staves?: number;
  width?: number;
}

export const StaveRenderer: React.FC<StaveRendererProps> = ({
  yOffset,
  staves = 1,
  width = 1000,
}) => {
  // Render staff lines at a vertical offset, supports multiple staves per part
  const renderStaffLines = (): JSX.Element[] => {
    return Array.from({ length: staves }, (_, staffIndex) => {
      const staffYOffset = yOffset + staffIndex * STAFF_SPACING;

      return Array.from({ length: 5 }, (_, lineIndex) => {
        const lineY = lineIndex * STAFF_LINE_SPACING + staffYOffset;
        return (
          <line
            key={`staff-line-${staffIndex}-${lineIndex}`}
            x1={0}
            y1={lineY}
            x2={width}
            y2={lineY}
            stroke="black"
          />
        );
      });
    }).flat();
  };

  return <g>{renderStaffLines()}</g>;
};

// Render a measure line connecting all staves in a part
export const renderMeasureLine = (
  x: number,
  yOffset: number,
  staves = 1
): JSX.Element => {
  const totalHeight = (staves - 1) * STAFF_SPACING + 40;
  return (
    <line
      key={`measure-line-${x}`}
      x1={x}
      y1={yOffset}
      x2={x}
      y2={yOffset + totalHeight}
      stroke="black"
    />
  );
};
