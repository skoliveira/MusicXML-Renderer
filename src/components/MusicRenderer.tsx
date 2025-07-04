// components/MusicRenderer.tsx
import React from "react";
import { Pitch, ScorePartwise, Clef, ClefSign, Unpitched, Note } from "../type";
import { NoteRenderer } from "./NoteRenderer";
import { ChordSymbolRenderer } from "./ChordSymbolRenderer";
import { SlurRenderer } from "./SlurRenderer";
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

interface ChordGroup {
  notes: Note[];
  x: number;
  duration: number;
  elementIndices: number[];
}

interface ChordNoteWithPosition {
  note: Note;
  y: number;
}

interface SlurInfo {
  startX: number;
  startY: number;
  placement?: "above" | "below";
  staff: number;
}

interface CompletedSlur {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  placement?: "above" | "below";
  staff: number;
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
      offset = (2 - line) * STAFF_LINE_SPACING;
      break;
    case "F":
      // F-clef (bass): F3 is on the fourth line (line=4)
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

// Helper function to get tablature Y position for a note
const getTablatureY = (note: Note, partYOffset: number): number => {
  const staffYOffset = partYOffset + ((note.staff || 1) - 1) * 120; // STAFF_SPACING

  // Get technical notation (string and fret info)
  const technical = note.notations?.find(
    (notation) => notation.technical && notation.technical.length > 0
  )?.technical?.[0];

  if (!technical) {
    return staffYOffset + 3 * STAFF_LINE_SPACING; // Default to middle line
  }

  const { string: stringNum } = technical;

  // Position the fret number on the correct string line
  // String 1 should be on the bottom line (highest Y value)
  // String N should be on the top line (lowest Y value)
  const stringLineIndex = stringNum - 1; // Convert 1-based string number to 0-based index
  return staffYOffset + stringLineIndex * STAFF_LINE_SPACING;
};

interface MeasureElement {
  note?: Note;
}

// Function to group notes into chords
const groupNotesIntoChords = (elements: MeasureElement[]): ChordGroup[] => {
  const chordGroups: ChordGroup[] = [];
  let currentChord: ChordGroup | null = null;

  elements.forEach((element, index) => {
    if (element.note) {
      const note = element.note;

      if (note.chord && currentChord) {
        // This note is part of the current chord
        currentChord.notes.push(note);
        currentChord.elementIndices.push(index);
      } else {
        // This is either a new single note or the start of a new chord
        if (currentChord) {
          chordGroups.push(currentChord);
        }

        currentChord = {
          notes: [note],
          x: 0, // Will be set later
          duration: note.duration,
          elementIndices: [index],
        };
      }
    }
  });

  // Don't forget the last chord group
  if (currentChord) {
    chordGroups.push(currentChord);
  }

  return chordGroups;
};

export const MusicRenderer: React.FC<Props> = ({ score }) => {
  // Calculate total width needed for all parts
  const maxWidth = Math.max(
    ...score.parts.map((part) => {
      // Get part-specific attributes from first measure
      const firstMeasureAttrs = part.measures[0]?.elements.find(
        (e) => e.attributes
      )?.attributes;
      const divisions = firstMeasureAttrs?.divisions ?? 1;
      let beats = firstMeasureAttrs?.time?.find((t) => t.beats)?.beats ?? 4;
      let beatType =
        firstMeasureAttrs?.time?.find((t) => t.beatType)?.beatType ?? 4;

      const totalWidth = part.measures.reduce((sum, measure) => {
        const attrs = measure.elements.find((e) => e.attributes)?.attributes;

        beats = attrs?.time?.find((t) => t.beats)?.beats ?? beats;
        beatType = attrs?.time?.find((t) => t.beatType)?.beatType ?? beatType;

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

  // Compute total height dynamically based on number of parts and their staves
  const lastPartIndex = score.parts.length - 1;
  const lastPartAttrs = score.parts[lastPartIndex].measures[0]?.elements.find(
    (e) => e.attributes
  )?.attributes;
  const lastPartStaves = lastPartAttrs?.staves ?? 1;
  const svgHeight =
    getPartYOffset(lastPartIndex) + lastPartStaves * STAFF_SPACING + 60;

  return (
    <svg width={svgWidth} height={svgHeight}>
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
        const staffDetails = firstMeasureAttrs?.staffDetails ?? [];

        // Initialize active clefs with initial clefs
        const globalActiveClefs: Record<number, Clef> = {};
        initialClefs.forEach((clef) => {
          globalActiveClefs[clef.staffNumber || 1] = clef;
        });

        let totalWidth = 125; // Starting X position

        // Track tied notes for each pitch and staff
        const tiedNotes = new Map<
          string,
          { note: Note; x: number; y: number; duration: number }
        >();

        // Track slurs - using staff + slur number as key
        const activeSlurs = new Map<string, SlurInfo>();
        const completedSlurs: CompletedSlur[] = [];

        // Helper function to handle slur events
        const handleSlurs = (
          note: Note,
          currentX: number,
          noteY: number,
          staffNum: number
        ) => {
          if (note.notations) {
            note.notations.forEach((notation) => {
              if (notation.slur) {
                notation.slur.forEach((slur) => {
                  const slurNumber = slur.number || 1;
                  const slurKey = `${staffNum}-${slurNumber}`;
                  const activeClef = globalActiveClefs[staffNum];
                  const isTabStaff = activeClef?.sign === "TAB";

                  let slurY = noteY;
                  let yOffset = 6;

                  if (isTabStaff) {
                    // For tablature, use the fret position and adjust offset
                    slurY = getTablatureY(note, partYOffset);
                    yOffset = note.stem === "up" ? -8 : 8; // Adjust for tablature spacing
                  } else {
                    // For standard notation, use existing logic
                    yOffset = 6 * (note.stem === "up" ? 1 : -1);
                  }

                  if (slur.type === "start") {
                    // Start a new slur
                    activeSlurs.set(slurKey, {
                      startX: currentX + 6,
                      startY: slurY + yOffset * (note.stem === "up" ? 1 : -1),
                      placement: slur.placement,
                      staff: staffNum,
                    });
                  } else if (slur.type === "stop") {
                    // End an existing slur
                    const startSlur = activeSlurs.get(slurKey);
                    if (startSlur) {
                      completedSlurs.push({
                        startX: startSlur.startX,
                        startY: startSlur.startY,
                        endX: currentX - 6,
                        endY: slurY + yOffset * (note.stem === "up" ? 1 : -1),
                        placement:
                          startSlur.placement ||
                          (note.stem === "up" ? "below" : "above"),
                        staff: staffNum,
                      });
                      activeSlurs.delete(slurKey);
                    }
                  }
                });
              }
            });
          }
        };

        return (
          <g key={`part-${partIndex}`}>
            <StavesRenderer
              width={svgWidth}
              yOffset={partYOffset}
              staves={staves}
              staffDetails={staffDetails}
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

              const measureWidth =
                (4 * beats * DURATION_SPACING_UNIT * divisions) / beatType;
              const measureX = totalWidth;
              let currentX = measureX;
              let spacing = 0;

              const elements = [];

              // Group notes into chords
              const chordGroups = groupNotesIntoChords(measure.elements);
              let chordGroupIndex = 0;

              // Add initial measure line for first measure
              if (measureIndex === 0) {
                elements.push(
                  renderMeasureLine(
                    125 - DURATION_SPACING_UNIT / 2,
                    partYOffset,
                    staves,
                    staffDetails
                  )
                );
              }

              // Process elements in order
              measure.elements.forEach((element, elementIndex) => {
                if (element.attributes?.clefs) {
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
                          x={currentX - 30}
                          yOffset={staffYOffset - 80}
                        />
                      );
                    }
                  });
                }

                // Render harmony elements (chord symbols)
                if (element.harmony) {
                  const chordOffset = element.harmony.offset
                    ? (element.harmony.offset *
                        beats *
                        DURATION_SPACING_UNIT *
                        divisions) /
                      beatType
                    : 0;
                  elements.push(
                    <ChordSymbolRenderer
                      key={`harmony-${partIndex}-${measureIndex}-${elementIndex}`}
                      harmony={element.harmony}
                      x={currentX + spacing}
                      y={partYOffset - 20} // Position above the staff
                      xOffset={chordOffset}
                    />
                  );
                }

                if (element.note) {
                  // Check if this element is the start of a chord group
                  const currentChordGroup = chordGroups[chordGroupIndex];
                  const isFirstNoteInChord =
                    currentChordGroup &&
                    currentChordGroup.elementIndices[0] === elementIndex;

                  if (isFirstNoteInChord) {
                    // Render entire chord group
                    const chordGroup = currentChordGroup;

                    if (!element.note.chord) {
                      currentX += spacing;
                    }
                    spacing = chordGroup.duration * DURATION_SPACING_UNIT;

                    // Pre-calculate all note positions for chord stem calculation
                    const chordNotesWithPositions: ChordNoteWithPosition[] =
                      chordGroup.notes.map((note) => {
                        const staffNum = note.staff || 1;
                        const activeClef = globalActiveClefs[staffNum];

                        let noteY: number;
                        if (activeClef?.sign === "TAB") {
                          // Use tablature positioning
                          noteY = getTablatureY(note, partYOffset);
                        } else {
                          // Use standard notation positioning
                          noteY = note.rest
                            ? partYOffset + 20 + (staffNum - 1) * STAFF_SPACING
                            : pitchToY(
                                note.pitch,
                                staffNum,
                                activeClef,
                                partYOffset,
                                note.unpitched
                              );
                        }

                        return { note, y: noteY };
                      });

                    // Render all notes in the chord
                    chordGroup.notes.forEach((note, noteIndex) => {
                      const noteY = chordNotesWithPositions[noteIndex].y;
                      const staffNum = note.staff || 1;
                      const activeClef = globalActiveClefs[staffNum];

                      // Handle slurs
                      handleSlurs(note, currentX, noteY, staffNum);

                      // Handle ties
                      const hasTieStart = note.notations?.some((notation) =>
                        notation.tied?.some((t) => t.type === "start")
                      );
                      const hasTieStop = note.notations?.some((notation) =>
                        notation.tied?.some((t) => t.type === "stop")
                      );

                      // Create a unique key for this note's pitch and staff
                      const noteKey = `${note.pitch?.step}${note.pitch?.octave}-${staffNum}`;

                      // Get the tied note info if this note has a tie stop
                      const tieEnd = hasTieStop
                        ? tiedNotes.get(noteKey)
                        : undefined;

                      // Store this note's info if it has a tie start
                      if (hasTieStart) {
                        tiedNotes.set(noteKey, {
                          note,
                          x: currentX,
                          y: noteY,
                          duration: note.duration, // Store the duration of the starting note
                        });
                      } else {
                        // Clear the tied note info if this note doesn't continue the tie
                        tiedNotes.delete(noteKey);
                      }

                      const key = `${
                        note.rest ? "rest" : "note"
                      }-${partIndex}-${measureIndex}-${
                        chordGroup.elementIndices[noteIndex]
                      }`;

                      elements.push(
                        <NoteRenderer
                          key={key}
                          note={note}
                          x={currentX}
                          y={noteY}
                          elementKey={key}
                          partYOffset={partYOffset}
                          isChord={chordGroup.notes.length > 1}
                          isFirstInChord={noteIndex === 0}
                          chordNotes={chordNotesWithPositions}
                          activeClefSign={activeClef?.sign}
                          tieEnd={tieEnd}
                        />
                      );
                    });

                    chordGroupIndex++;
                  }
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
                  staves,
                  staffDetails
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
                      staves,
                      staffDetails
                    )}
                    {renderMeasureLine(
                      measureX +
                        (4 * beats * DURATION_SPACING_UNIT * divisions) /
                          beatType -
                        DURATION_SPACING_UNIT / 2 -
                        3,
                      partYOffset,
                      staves,
                      staffDetails
                    )}
                  </g>
                );
              }

              totalWidth += measureWidth;

              return (
                <g key={`measure-${partIndex}-${measureIndex}`}>{elements}</g>
              );
            })}

            {/* Render all completed slurs for this part */}
            {completedSlurs.map((slur, slurIndex) => (
              <SlurRenderer
                key={`slur-${partIndex}-${slurIndex}`}
                startX={slur.startX}
                startY={slur.startY}
                endX={slur.endX}
                endY={slur.endY}
                placement={slur.placement}
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
};
