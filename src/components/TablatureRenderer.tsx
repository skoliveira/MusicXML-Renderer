// components/TablatureRenderer.tsx
import React from "react";
import { Note, ClefSign } from "../type";
import { STAFF_LINE_SPACING } from "./StavesRenderer";

interface TablatureRendererProps {
  note: Note;
  x: number;
  partYOffset: number;
  staff: number;
  activeClefSign?: ClefSign;
}

export const TablatureRenderer: React.FC<TablatureRendererProps> = ({
  note,
  x,
  partYOffset,
  staff,
  activeClefSign,
}) => {
  // Only render tablature for TAB clef
  if (activeClefSign !== "TAB") {
    return null;
  }

  // Get technical notation (string and fret info)
  const technical = note.notations?.find(
    (notation) => notation.technical && notation.technical.length > 0
  )?.technical?.[0];

  if (!technical) {
    return null;
  }

  const { string: stringNum, fret } = technical;

  // Calculate Y position based on string number and actual staff lines
  // In tablature, string 1 is typically the highest pitched string (should appear on bottom line)
  // String numbers increase going toward lower pitched strings (higher Y values in SVG)
  const staffYOffset = partYOffset + (staff - 1) * 120; // STAFF_SPACING

  // Position the fret number on the correct string line
  // String 1 should be on the bottom line (highest Y value)
  // String N should be on the top line (lowest Y value)
  const stringLineIndex = stringNum - 1; // Convert 1-based string number to 0-based index
  const stringY = staffYOffset + stringLineIndex * STAFF_LINE_SPACING;

  return (
    <g>
      {/* Render fret number */}
      {<circle cx={x} cy={stringY} r="5" fill={`#E0E0E0`} stroke="none" />} */
      <text
        x={x}
        y={stringY + 4} // Slight vertical adjustment to center on line
        textAnchor="middle"
        fontSize="14"
        fontFamily="Arial, sans-serif"
        fill="black"
      >
        {fret}
      </text>
    </g>
  );
};
