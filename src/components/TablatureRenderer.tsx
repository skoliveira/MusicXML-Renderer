// components/TablatureRenderer.tsx
import React from "react";
import { Note, ClefSign } from "../type";
import { STAFF_LINE_SPACING } from "./StavesRenderer";
import { RestRenderer } from "./RestRenderer";
import { DotsRenderer } from "./DotsRenderer";
import { Flag } from "./Flag";
import { TieRenderer } from "./TieRenderer";

interface TablatureRendererProps {
  note: Note;
  x: number;
  partYOffset: number;
  staff: number;
  activeClefSign?: ClefSign;
  tieEnd?: { x: number; y: number; duration: number };
  tieToNext?: { x: number; y: number; duration: number };
}

export const TablatureRenderer: React.FC<TablatureRendererProps> = ({
  note,
  x,
  partYOffset,
  staff,
  activeClefSign,
  tieEnd,
  tieToNext,
}) => {
  // Only render tablature for TAB clef
  if (activeClefSign !== "TAB") {
    return null;
  }

  // Calculate base Y position for the staff
  const staffYOffset = partYOffset + (staff - 1) * 120; // STAFF_SPACING
  const middleLineY = staffYOffset + 3 * STAFF_LINE_SPACING; // Center of the tab staff

  // Handle rests
  if (note.rest) {
    return (
      <>
        <RestRenderer
          type={note.type}
          measure={note.rest.measure}
          x={x}
          y={middleLineY}
        />
        {note.dots && <DotsRenderer x={x} y={middleLineY} dots={note.dots} />}
      </>
    );
  }

  // Get technical notation (string and fret info)
  const technical = note.notations?.find(
    (notation) => notation.technical && notation.technical.length > 0
  )?.technical?.[0];

  if (!technical) {
    return null;
  }

  const { string: stringNum, fret } = technical;

  // Position the fret number on the correct string line
  // String 1 should be on the bottom line (highest Y value)
  // String N should be on the top line (lowest Y value)
  const stringLineIndex = stringNum - 1; // Convert 1-based string number to 0-based index
  const stringY = staffYOffset + stringLineIndex * STAFF_LINE_SPACING;

  // Calculate stem properties
  const needsStem =
    note.type &&
    [
      "maxima",
      "long",
      "half",
      "quarter",
      "eighth",
      "16th",
      "32nd",
      "64th",
      "128th",
      "256th",
      "512th",
      "1024th",
    ].includes(note.type);

  const needsFlag =
    note.type &&
    [
      "eighth",
      "16th",
      "32nd",
      "64th",
      "128th",
      "256th",
      "512th",
      "1024th",
    ].includes(note.type);

  const stemLength = 30; // Default stem length
  const stemX = x; // Slightly offset from the note center
  const lowestStringY = staffYOffset + 5 * STAFF_LINE_SPACING; // Y position of the lowest string
  const stemStartY = lowestStringY + 10; // Start stem slightly below the lowest string

  // Calculate tie positions - ties should be at the string level
  const tieYOffset = 8; // Offset from the string line for tie positioning

  return (
    <g>
      <circle cx={x} cy={stringY} r="5" fill={`#E0E0E0`} stroke="none" />
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
      {needsStem && (
        <>
          <line
            x1={stemX}
            y1={stemStartY + (note.type === "half" ? stemLength / 2 : 0)}
            x2={stemX}
            y2={stemStartY + stemLength}
            stroke="black"
            strokeWidth="1"
          />
          {needsFlag && note.type && (
            <g
              transform={`scale(1, -1) translate(0, ${
                -2 * (stemStartY + stemLength)
              })`}
            >
              <Flag type={note.type} x={stemX} y={stemStartY + stemLength} />
            </g>
          )}
        </>
      )}
      {note.dots && (
        <DotsRenderer x={stemX - 7} y={stemStartY + 10} dots={note.dots} />
      )}

      {/* Render ties at the string level for tablature */}
      {tieEnd && (
        <TieRenderer
          startX={tieEnd.x + 6}
          startY={tieEnd.y - tieYOffset}
          endX={x - 6}
          endY={stringY - tieYOffset}
          curveHeight={-6 * tieEnd.duration}
          thickness={7}
        />
      )}
      {tieToNext && (
        <TieRenderer
          startX={x + 6}
          startY={stringY - tieYOffset}
          endX={tieToNext.x - 6}
          endY={tieToNext.y - tieYOffset}
          curveHeight={-6 * note.duration}
          thickness={7}
        />
      )}
    </g>
  );
};
