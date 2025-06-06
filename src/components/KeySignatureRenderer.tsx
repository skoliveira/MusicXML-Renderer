import React from "react";
import { Clef, ClefSign } from "../type";
import { AccidentalRenderer } from "./AccidentalRenderer";
import { STAFF_LINE_SPACING } from "./StavesRenderer";

interface KeySignatureRendererProps {
  fifths: number;
  x: number;
  yOffset: number;
  activeClef?: Clef;
}

const sharpsOrder = [
  { step: "F", line: 0 },
  { step: "C", line: -3 },
  { step: "G", line: 1 },
  { step: "D", line: -2 },
  { step: "A", line: -5 },
  { step: "E", line: -1 },
  { step: "B", line: -4 },
];

const flatsOrder = [
  { step: "B", line: -4 },
  { step: "E", line: -1 },
  { step: "A", line: -5 },
  { step: "D", line: -2 },
  { step: "G", line: -6 },
  { step: "C", line: -3 },
  { step: "F", line: -7 },
];

// Convert line positions based on clef
const adjustLineForClef = (
  baseLine: number,
  clefSign: ClefSign,
  clefLine: number | string | undefined
): number => {
  // Convert clefLine to number if it's a string
  const lineNumber =
    typeof clefLine === "string" ? parseInt(clefLine, 10) : clefLine || 2;

  switch (clefSign) {
    case "G":
      // For G clef (treble)
      return baseLine + 10;
    case "F":
      // For F clef (bass)
      return baseLine + 8;
    case "C":
      switch (lineNumber) {
        case 5:
          return baseLine + 6; // For C Clef (baritone)
        case 4:
          return baseLine + 4; // For C Clef (tenor)
        case 3:
          return baseLine + 9; // For C Clef (alto)
        case 2:
          return baseLine + 7; // For C Clef (mezzo-soprano)
        case 1:
          return baseLine + 5; // For C Clef (soprano)
        default:
          return baseLine + 9; // Default to alto clef positioning
      }
    default:
      // Default to treble clef positioning
      return baseLine + 10;
  }
};

export const KeySignatureRenderer: React.FC<KeySignatureRendererProps> = ({
  fifths,
  x,
  yOffset,
  activeClef,
}) => {
  // Handle edge cases
  if (fifths === 0) {
    return null; // No key signature to render
  }

  // Only render key signature for G, F, and C clefs
  const clefSign = activeClef?.sign;
  if (clefSign !== "G" && clefSign !== "F" && clefSign !== "C") {
    return null; // Don't render key signature for other clef types
  }

  const absCount = Math.abs(fifths);
  const isSharp = fifths > 0;
  const accidentals = isSharp ? sharpsOrder : flatsOrder;

  // Ensure we don't exceed the maximum number of accidentals
  const maxAccidentals = Math.min(absCount, 7);

  return (
    <g>
      {Array.from({ length: maxAccidentals }, (_, i) => {
        const { line } = accidentals[i];
        const adjustedLine = adjustLineForClef(
          line,
          activeClef?.sign || "G",
          activeClef?.line
        );

        // Calculate Y position: each line is STAFF_LINE_SPACING/2 apart
        const y = yOffset - adjustedLine * (STAFF_LINE_SPACING / 2);

        return (
          <AccidentalRenderer
            key={`accidental-${i}`}
            type={isSharp ? "sharp" : "flat"}
            x={x + i * 12}
            y={y}
          />
        );
      })}
    </g>
  );
};
