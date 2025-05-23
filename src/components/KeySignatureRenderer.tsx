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
  { step: "F", line: 0 }, // F5 in treble, F4 in bass
  { step: "C", line: -3 }, // C5 in treble, C4 in bass
  { step: "G", line: 1 }, // G5 in treble, G4 in bass
  { step: "D", line: -2 }, // D5 in treble, D4 in bass
  { step: "A", line: -5 }, // A5 in treble, A4 in bass
  { step: "E", line: -1 }, // E5 in treble, E4 in bass
  { step: "B", line: -4 }, // B4 in treble, B3 in bass
];

const flatsOrder = [
  { step: "B", line: -4 }, // B4 in treble, B3 in bass
  { step: "E", line: -1 }, // E5 in treble, E4 in bass
  { step: "A", line: -5 }, // A5 in treble, A4 in bass
  { step: "D", line: -2 }, // D5 in treble, D4 in bass
  { step: "G", line: -6 }, // G5 in treble, G4 in bass
  { step: "C", line: -3 }, // C5 in treble, C4 in bass
  { step: "F", line: -7 }, // F5 in treble, F4 in bass
];

// Convert line positions based on clef
const adjustLineForClef = (baseLine: number, clef: ClefSign) => {
  switch (clef) {
    case "G":
      // For G clef (treble), use positions as is
      return baseLine + 10;
    case "F":
      // For F clef (bass), shift positions down by an octave
      return baseLine + 8;
    case "C":
      // For C clef (alto/tenor), shift positions based on middle C
      return baseLine + 9;
    default:
      return baseLine;
  }
};

export const KeySignatureRenderer: React.FC<KeySignatureRendererProps> = ({
  fifths,
  x,
  yOffset,
  activeClef,
}) => {
  const absCount = Math.abs(fifths);
  const isSharp = fifths > 0;
  const accidentals = isSharp ? sharpsOrder : flatsOrder;

  return (
    <g>
      {Array.from({ length: absCount }, (_, i) => {
        const { line } = accidentals[i];
        const adjustedLine = adjustLineForClef(line, activeClef?.sign || "G");

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
