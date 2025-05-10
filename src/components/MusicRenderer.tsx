// MusicRenderer.tsx
import React from "react";
import { ScorePartwise, Pitch } from "../type";

interface Props {
  score: ScorePartwise;
}

const DURATION_SPACING_UNIT = 40; // Pixels per duration unit

// Convert a musical pitch to a vertical Y position
const pitchToY = (pitch?: Pitch): number => {
  if (!pitch) return 0;

  const scale = ["C", "D", "E", "F", "G", "A", "B"];
  const pitchIndex = scale.indexOf(pitch.step);
  const offsetFromMiddleC = (pitch.octave - 4) * 7 + pitchIndex;

  return 110 - offsetFromMiddleC * 5;
};

// Render five horizontal staff lines at a vertical offset
const renderStaffLines = (yOffset: number): JSX.Element[] => {
  return Array.from({ length: 5 }, (_, i) => {
    const lineY = i * 10 + yOffset;
    return (
      <line
        key={`staff-line-${i}`}
        x1={0}
        y1={lineY}
        x2={1000}
        y2={lineY}
        stroke="black"
      />
    );
  });
};

export const MusicRenderer: React.FC<Props> = ({ score }) => {
  return (
    <svg width={1000} height={500}>
      {score.parts.map((part, partIndex) => {
        const partYOffset = 60 + partIndex * 110;

        return (
          <g key={`part-${partIndex}`}>
            {renderStaffLines(partYOffset)}

            {part.measures.flatMap((measure, measureIndex) => {
              let currentX = measureIndex * 220 + 50;
              let spacing = 0;

              return measure.elements.map((element, elementIndex) => {
                if (element.note) {
                  const { note } = element;
                  const noteY = note.rest ? 80 : pitchToY(note.pitch);

                  if (!note.chord) currentX += spacing;
                  spacing = note.duration * DURATION_SPACING_UNIT;

                  const key = `${
                    note.rest ? "rest" : "note"
                  }-${partIndex}-${measureIndex}-${elementIndex}`;

                  return note.rest ? (
                    <text key={key} x={currentX} y={noteY} fontSize="14px">
                      𝄽
                    </text>
                  ) : (
                    <ellipse
                      key={key}
                      cx={currentX}
                      cy={noteY}
                      rx={6}
                      ry={4}
                      fill="black"
                      transform={`rotate(-27, ${currentX}, ${noteY})`}
                    />
                  );
                }

                if (element.backup) {
                  currentX -= element.backup.duration * DURATION_SPACING_UNIT;
                }

                return null;
              });
            })}
          </g>
        );
      })}
    </svg>
  );
};
