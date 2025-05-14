import React from "react";
import { Pitch, ScorePartwise, Clef, ClefSign } from "../type";
import { NoteRenderer } from "./NoteRenderer";
import {
  StaveRenderer,
  renderMeasureLine,
  STAFF_SPACING,
  STAFF_LINE_SPACING,
} from "./StaveRenderer";
import { ClefRenderer } from "./ClefRenderer";

interface Props {
  score: ScorePartwise;
}

const DURATION_SPACING_UNIT = 40; // Pixels per duration unit
const PART_SPACING = 160; // Vertical spacing between parts

// Get the vertical offset for a pitch based on the clef type
const getClefOffset = (clefSign: ClefSign, line: number = 2): number => {
  // Reference point is middle C (C4)
  switch (clefSign) {
    case "G":
      // G-clef (treble): G4 is on the second line (line=2)
      // G4 is 7 semitones above C4, so the offset is -7 semitones * STAFF_LINE_SPACING/2
      return (line - 2) * STAFF_LINE_SPACING;
    case "F":
      // F-clef (bass): F3 is on the fourth line (line=4)
      // F3 is 7 semitones below C4, so the offset is +7 semitones * STAFF_LINE_SPACING/2
      return (line - 4) * STAFF_LINE_SPACING - 60;
    case "C":
      // C-clef (alto/tenor): Middle C (C4) is on the specified line
      return (line - 3) * STAFF_LINE_SPACING - 40;
    default:
      return 0;
  }
};

// Convert a musical pitch to a vertical Y position
const pitchToY = (pitch?: Pitch, staff = 1, activeClef?: Clef): number => {
  if (!pitch) return 0;

  const scale = ["C", "D", "E", "F", "G", "A", "B"];
  const pitchIndex = scale.indexOf(pitch.step);
  const offsetFromMiddleC = (pitch.octave - 4) * 7 + pitchIndex;

  // Calculate base position
  const baseY = 110 - offsetFromMiddleC * (STAFF_LINE_SPACING / 2);

  // Add staff offset and clef adjustment
  const staffOffset = (staff - 1) * STAFF_SPACING;
  const clefOffset = activeClef
    ? getClefOffset(activeClef.sign, activeClef.line)
    : 0;

  return baseY + staffOffset + clefOffset;
};

export const MusicRenderer: React.FC<Props> = ({ score }) => {
  return (
    <svg width={1000} height={1000}>
      {score.parts.map((part, partIndex) => {
        const partYOffset = 60 + partIndex * PART_SPACING;
        // Get initial clefs and number of staves
        const firstMeasure = part.measures[0];
        const staveCount =
          firstMeasure?.elements.find((e) => e.attributes)?.attributes
            ?.staves ?? 1;
        const initialClefs =
          firstMeasure?.elements.find((e) => e.attributes?.clefs)?.attributes
            ?.clefs || [];

        // Initialize active clefs with initial clefs
        const globalActiveClefs: Record<number, Clef> = {};
        initialClefs.forEach((clef) => {
          globalActiveClefs[clef.staffNumber || 1] = clef;
        });

        return (
          <g key={`part-${partIndex}`}>
            <StaveRenderer yOffset={partYOffset} staves={staveCount} />

            {part.measures.map((measure, measureIndex) => {
              const beats =
                measure.elements
                  .find((e) => e.attributes)
                  ?.attributes?.time?.find((t) => t.beats)?.beats ?? 4;

              const measureX =
                measureIndex * beats * DURATION_SPACING_UNIT + 50;
              let currentX = measureX;
              let spacing = 0;

              // Render measure line
              const elements = [
                renderMeasureLine(measureX, partYOffset, staveCount),
              ];

              // Process elements in order
              measure.elements.forEach((element, elementIndex) => {
                if (element.attributes?.clefs) {
                  // Render clefs where they appear in the music
                  element.attributes.clefs.forEach((clef) => {
                    const staffIndex = (clef.staffNumber || 1) - 1;
                    const staffYOffset =
                      partYOffset + staffIndex * STAFF_SPACING;
                    // Calculate y position from bottom up (5 is total number of staff lines)
                    const y =
                      staffYOffset +
                      (5 - (clef.line || 2)) * STAFF_LINE_SPACING;

                    elements.push(
                      <ClefRenderer
                        key={`clef-${partIndex}-${measureIndex}-${elementIndex}-${clef.staffNumber}`}
                        sign={clef.sign}
                        x={currentX - 25}
                        y={y}
                      />
                    );

                    // Update global active clefs
                    globalActiveClefs[clef.staffNumber || 1] = clef;
                  });
                } else if (element.note) {
                  const { note } = element;
                  const staffNum = note.staff || 1;
                  const noteY = note.rest
                    ? partYOffset + 80 + (staffNum - 1) * 80 // Using the same staff spacing as in StaveRenderer
                    : pitchToY(
                        note.pitch,
                        staffNum,
                        globalActiveClefs[staffNum]
                      );

                  if (!note.chord) currentX += spacing;
                  spacing = note.duration * DURATION_SPACING_UNIT;

                  const key = `${
                    note.rest ? "rest" : "note"
                  }-${partIndex}-${measureIndex}-${elementIndex}`;

                  elements.push(
                    <NoteRenderer
                      key={key}
                      note={note}
                      x={currentX}
                      y={noteY}
                      elementKey={key}
                    />
                  );
                }

                if (element.backup) {
                  currentX -= element.backup.duration * DURATION_SPACING_UNIT;
                }
              });

              // Add final measure line for the last measure
              if (measureIndex === part.measures.length - 1) {
                elements.push(
                  renderMeasureLine(currentX + spacing, partYOffset, staveCount)
                );
              }

              return elements;
            })}
          </g>
        );
      })}
    </svg>
  );
};
