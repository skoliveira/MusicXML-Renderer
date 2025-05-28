import React from "react";
import { Pitch, ScorePartwise, Clef, ClefSign, Unpitched } from "../type";
import { NoteRenderer } from "./NoteRenderer";
import {
  StavesRenderer,
  renderMeasureLine,
  STAFF_SPACING,
  STAFF_LINE_SPACING,
} from "./StavesRenderer";
import { ClefRenderer } from "./ClefRenderer";
import { KeySignatureRenderer } from "./KeySignatureRenderer";
import { TimeSignatureRenderer } from "./TimeSignatureRenderer";

interface Props {
  score: ScorePartwise;
}

const DURATION_SPACING_UNIT = 40; // Pixels per duration unit

// Get the vertical offset for a pitch based on the clef type
const getClefOffset = (
  clefSign: ClefSign,
  line: number = 2,
  octaveChange?: number
): number => {
  // Reference point is middle C (C4)
  let offset = 0;
  switch (clefSign) {
    case "G":
      // G-clef (treble): G4 is on the second line (line=2)
      // G4 is 7 semitones above C4, so the offset is -7 semitones * STAFF_LINE_SPACING/2
      offset = (2 - line) * STAFF_LINE_SPACING;
      break;
    case "F":
      // F-clef (bass): F3 is on the fourth line (line=4)
      // F3 is 7 semitones below C4, so the offset is +7 semitones * STAFF_LINE_SPACING/2
      offset = (4 - line) * STAFF_LINE_SPACING - 60;
      break;
    case "C":
      // C-clef (alto/tenor): Middle C (C4) is on the specified line
      offset = (3 - line) * STAFF_LINE_SPACING - 30;
      break;
    case "percussion":
      offset = (2 - line) * STAFF_LINE_SPACING;
      break;
    case "TAB":
      offset = (5 - line) * STAFF_LINE_SPACING - 35;
      break;
    default:
      offset = 0;
  }

  // Apply octave change adjustment
  if (octaveChange) {
    offset += octaveChange * 7 * (STAFF_LINE_SPACING / 2); // 7 steps per octave
  }

  return offset;
};

// Convert a musical pitch to a vertical Y position
const scale = ["C", "D", "E", "F", "G", "A", "B"];
const scaleIndexCache: Record<string, number> = {};

// Memoized function to get index of step in scale
const getStepIndex = (step: string): number => {
  if (scaleIndexCache[step] !== undefined) {
    return scaleIndexCache[step];
  }
  const index = scale.indexOf(step);
  scaleIndexCache[step] = index;
  return index;
};

// Calculate vertical offset from middle C
const getOffsetFromMiddleC = (step: string, octave: number): number => {
  return (octave - 4) * 7 + getStepIndex(step);
};

// Convert a musical pitch to a vertical Y position
const pitchToY = (
  pitch?: Pitch,
  staff = 1,
  activeClef?: Clef,
  partYOffset = 0,
  unpitched?: Unpitched
): number => {
  if (!pitch && !unpitched) return 0;

  const step = unpitched?.displayStep || pitch?.step;
  const octave = unpitched?.displayOctave ?? pitch?.octave;

  if (step === undefined || octave === undefined) return 0;

  const offsetFromMiddleC = getOffsetFromMiddleC(step, octave);
  const baseY = 50 - offsetFromMiddleC * (STAFF_LINE_SPACING / 2);
  const staffOffset = (staff - 1) * STAFF_SPACING;
  const clefOffset = activeClef
    ? getClefOffset(
        activeClef.sign,
        activeClef.line,
        activeClef.clefOctaveChange
      )
    : 0;

  return baseY + staffOffset + clefOffset + partYOffset;
};

export const MusicRenderer: React.FC<Props> = ({ score }) => {
  // Calculate total width needed for all parts
  const maxWidth = Math.max(
    ...score.parts.map((part) => {
      const totalWidth = part.measures.reduce((sum, measure) => {
        const attrs = measure.elements.find((e) => e.attributes)?.attributes;

        const divisions = attrs?.divisions ?? 1;
        const beats = attrs?.time?.find((t) => t.beats)?.beats ?? 4;
        const beatType = attrs?.time?.find((t) => t.beatType)?.beatType ?? 4;

        const measureWidth =
          (4 * beats * DURATION_SPACING_UNIT * divisions) / beatType;

        return sum + measureWidth;
      }, 0);

      return totalWidth;
    })
  );

  const svgWidth = maxWidth + 125;

  // Function to get part offset based on previous parts' staves
  const getPartYOffset = (partIndex: number): number => {
    if (partIndex === 0) return 60; // First part starts at 60px

    // Get number of staves in previous part
    const prevPartAttrs = score.parts[partIndex - 1].measures[0]?.elements.find(
      (e) => e.attributes
    )?.attributes;
    const prevPartStaves = prevPartAttrs?.staves ?? 1;

    // Get previous part's offset
    const prevOffset: number = getPartYOffset(partIndex - 1);

    // Return previous part offset + spacing based on its staves count
    return prevOffset + prevPartStaves * STAFF_SPACING;
  };

  return (
    <svg width={svgWidth} height={1000}>
      {score.parts.map((part, partIndex) => {
        const partYOffset = getPartYOffset(partIndex);

        // Get part-specific attributes from first measure
        const firstMeasureAttrs = part.measures[0]?.elements.find(
          (e) => e.attributes
        )?.attributes;
        let beats = firstMeasureAttrs?.time?.find((t) => t.beats)?.beats ?? 4;
        let beatType =
          firstMeasureAttrs?.time?.find((t) => t.beatType)?.beatType ?? 4;
        const divisions = firstMeasureAttrs?.divisions ?? 1;
        const staves = firstMeasureAttrs?.staves ?? 1;
        const initialClefs = firstMeasureAttrs?.clefs ?? [];

        // Initialize active clefs with initial clefs
        const globalActiveClefs: Record<number, Clef> = {};
        initialClefs.forEach((clef) => {
          globalActiveClefs[clef.staffNumber || 1] = clef;
        });

        return (
          <g key={`part-${partIndex}`}>
            <StavesRenderer
              width={svgWidth}
              yOffset={partYOffset}
              staves={staves}
            />

            {part.measures.map((measure, measureIndex) => {
              beats =
                measure.elements
                  .find((e) => e.attributes)
                  ?.attributes?.time?.find((t) => t.beats)?.beats ?? beats;
              beatType =
                measure.elements
                  .find((e) => e.attributes)
                  ?.attributes?.time?.find((t) => t.beatType)?.beatType ??
                beatType;

              const measureX =
                (4 * measureIndex * beats * DURATION_SPACING_UNIT * divisions) /
                  beatType +
                125;
              let currentX = measureX;
              let spacing = 0;

              const elements = [];

              // Add initial measure line for first measure
              if (measureIndex === 0) {
                elements.push(
                  renderMeasureLine(
                    125 - DURATION_SPACING_UNIT / 2,
                    partYOffset,
                    staves
                  )
                );
              }

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
                        x={currentX - 100}
                        y={y}
                        octaveChange={clef.clefOctaveChange}
                      />
                    );

                    // Update global active clefs
                    globalActiveClefs[clef.staffNumber || 1] = clef;
                  });
                }

                // Add key signature rendering after clefs
                if (element.attributes?.key) {
                  element.attributes.key.forEach((key, keyIndex) => {
                    for (let staff = 1; staff <= staves; staff++) {
                      const staffYOffset =
                        partYOffset + (staff - 1) * STAFF_SPACING + 50;
                      elements.push(
                        <KeySignatureRenderer
                          key={`key-${partIndex}-${measureIndex}-${elementIndex}-${keyIndex}-${staff}`}
                          fifths={key.fifths}
                          x={currentX - 65}
                          yOffset={staffYOffset}
                          activeClef={globalActiveClefs[staff]}
                        />
                      );
                    }
                  });
                }

                // Add time signature rendering after key signature
                if (element.attributes?.time) {
                  element.attributes.time.forEach((time, timeIndex) => {
                    for (let staff = 1; staff <= staves; staff++) {
                      const staffYOffset =
                        partYOffset + (staff - 1) * STAFF_SPACING + 50;
                      elements.push(
                        <TimeSignatureRenderer
                          key={`time-${partIndex}-${measureIndex}-${elementIndex}-${timeIndex}-${staff}`}
                          beats={time.beats}
                          beatType={time.beatType}
                          x={currentX - 45}
                          yOffset={staffYOffset - 35}
                        />
                      );
                    }
                  });
                }

                if (element.note) {
                  const { note } = element;
                  const staffNum = note.staff || 1;
                  const noteY = note.rest
                    ? partYOffset + 20 + (staffNum - 1) * STAFF_SPACING
                    : pitchToY(
                        note.pitch,
                        staffNum,
                        globalActiveClefs[staffNum],
                        partYOffset,
                        note.unpitched
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
                      partYOffset={partYOffset}
                    />
                  );
                }

                if (element.backup) {
                  currentX -= element.backup.duration * DURATION_SPACING_UNIT;
                }
              });

              // Add measure line at the end of current measure
              elements.push(
                renderMeasureLine(
                  measureX +
                    (4 * beats * DURATION_SPACING_UNIT * divisions) / beatType -
                    DURATION_SPACING_UNIT / 2,
                  partYOffset,
                  staves
                )
              );

              // Add final double bar line for the last measure
              if (measureIndex === part.measures.length - 1) {
                elements.push(
                  <g key={`final-barline-${partIndex}-${measureIndex}`}>
                    {renderMeasureLine(
                      measureX +
                        (4 * beats * DURATION_SPACING_UNIT * divisions) /
                          beatType -
                        DURATION_SPACING_UNIT / 2 +
                        1,
                      partYOffset,
                      staves
                    )}
                    {renderMeasureLine(
                      measureX +
                        (4 * beats * DURATION_SPACING_UNIT * divisions) /
                          beatType -
                        DURATION_SPACING_UNIT / 2 -
                        3,
                      partYOffset,
                      staves
                    )}
                  </g>
                );
              }

              return (
                <g key={`measure-${partIndex}-${measureIndex}`}>{elements}</g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
};
