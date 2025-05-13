// MusicRenderer.tsx
import React, { JSX } from "react";
import { ScorePartwise, Pitch } from "../type";
import { Note } from "./Note";

interface Props {
  score: ScorePartwise;
}

const DURATION_SPACING_UNIT = 40; // Pixels per duration unit
const STAFF_SPACING = 80; // Vertical spacing between staves within a part
const PART_SPACING = 150; // Vertical spacing between parts

// Convert a musical pitch to a vertical Y position
const pitchToY = (pitch?: Pitch, staff = 1): number => {
  if (!pitch) return 0;

  const scale = ["C", "D", "E", "F", "G", "A", "B"];
  const pitchIndex = scale.indexOf(pitch.step);
  const offsetFromMiddleC = (pitch.octave - 4) * 7 + pitchIndex;

  // Add staff offset to Y position
  return 110 - offsetFromMiddleC * 5 + (staff - 1) * STAFF_SPACING;
};

// Render staff lines at a vertical offset, supports multiple staves per part
const renderStaffLines = (yOffset: number, staves = 1): JSX.Element[] => {
  return Array.from({ length: staves }, (_, staffIndex) => {
    const staffYOffset = yOffset + staffIndex * STAFF_SPACING;

    return Array.from({ length: 5 }, (_, lineIndex) => {
      const lineY = lineIndex * 10 + staffYOffset;
      return (
        <line
          key={`staff-line-${staffIndex}-${lineIndex}`}
          x1={0}
          y1={lineY}
          x2={1000}
          y2={lineY}
          stroke="black"
        />
      );
    });
  }).flat();
};

// Render a measure line connecting all staves in a part
const renderMeasureLine = (
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

export const MusicRenderer: React.FC<Props> = ({ score }) => {
  return (
    <svg width={1000} height={score.parts.length * PART_SPACING}>
      {score.parts.map((part, partIndex) => {
        const partYOffset = 60 + partIndex * PART_SPACING;
        // Get number of staves from part's first measure's attributes
        const staveCount = part.measures[0]?.attributes?.staves || 1;

        return (
          <g key={`part-${partIndex}`}>
            {renderStaffLines(partYOffset, staveCount)}

            {part.measures.map((measure, measureIndex) => {
              const measureX = measureIndex * 220 + 50;
              let currentX = measureX;
              let spacing = 0;

              // Render measure line
              const elements = [
                renderMeasureLine(measureX, partYOffset, staveCount),
              ];

              // Render notes
              measure.elements.forEach((element, elementIndex) => {
                if (element.note) {
                  const { note } = element;
                  const staffNum = note.staff || 1;
                  const noteY = note.rest
                    ? partYOffset + 80 + (staffNum - 1) * STAFF_SPACING
                    : pitchToY(note.pitch, staffNum);

                  if (!note.chord) currentX += spacing;
                  spacing = note.duration * DURATION_SPACING_UNIT;

                  const key = `${
                    note.rest ? "rest" : "note"
                  }-${partIndex}-${measureIndex}-${elementIndex}`;

                  elements.push(
                    <Note note={note} x={currentX} y={noteY} elementKey={key} />
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
