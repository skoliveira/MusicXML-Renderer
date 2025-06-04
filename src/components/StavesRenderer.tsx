// components/StavesRenderer.tsx;
import React, { JSX } from "react";

export const STAFF_SPACING = 120; // Vertical spacing between staves within a part
export const STAFF_LINE_SPACING = 10; // Spacing between staff lines

interface StavesRendererProps {
  yOffset: number;
  staves?: number;
  width?: number | string | undefined;
  staffDetails?: Array<{
    staffNumber?: number;
    staffLines: number;
  }>;
}

export const StavesRenderer: React.FC<StavesRendererProps> = ({
  yOffset,
  staves = 1,
  width = 1000,
  staffDetails = [],
}) => {
  // Render staff lines at a vertical offset, supports multiple staves per part
  const renderStaffLines = (): JSX.Element[] => {
    return Array.from({ length: staves }, (_, staffIndex) => {
      const staffYOffset = yOffset + staffIndex * STAFF_SPACING;

      // Find staff details for this staff (1-indexed)
      const currentStaffDetails = staffDetails.find(
        (detail) => (detail.staffNumber || 1) === staffIndex + 1
      );

      // Use custom staff lines count if available, otherwise default to 5
      const numberOfLines = currentStaffDetails?.staffLines || 5;

      return Array.from({ length: numberOfLines }, (_, lineIndex) => {
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
  staves = 1,
  staffDetails: Array<{ staffNumber?: number; staffLines: number }> = []
): JSX.Element => {
  // Calculate total height based on staff details or default
  let totalHeight = 0;

  if (staffDetails.length > 0) {
    // Calculate height based on actual staff configurations
    for (let i = 0; i < staves; i++) {
      const currentStaffDetails = staffDetails.find(
        (detail) => (detail.staffNumber || 1) === i + 1
      );
      const numberOfLines = currentStaffDetails?.staffLines || 5;

      if (i === staves - 1) {
        // For the last staff, add the height from top to bottom line
        totalHeight += (numberOfLines - 1) * STAFF_LINE_SPACING;
      } else {
        // For other staves, add full staff spacing
        totalHeight += STAFF_SPACING;
      }
    }
  } else {
    // Default calculation
    totalHeight = (staves - 1) * STAFF_SPACING + 40;
  }

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
