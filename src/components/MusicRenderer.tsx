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
  let offset = 0;
  switch (clefSign) {
    case "G":
      offset = (2 - line) * STAFF_LINE_SPACING;
      break;
    case "F":
      offset = (4 - line) * STAFF_LINE_SPACING - 60;
      break;
    case "C":
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

  if (octaveChange) {
    offset += octaveChange * 7 * (STAFF_LINE_SPACING / 2);
  }

  return offset;
};

const scale = ["C", "D", "E", "F", "G", "A", "B"];
const scaleIndexCache: Record<string, number> = {};

const getStepIndex = (step: string): number => {
  if (scaleIndexCache[step] !== undefined) {
    return scaleIndexCache[step];
  }
  const index = scale.indexOf(step);
  scaleIndexCache[step] = index;
  return index;
};

const getOffsetFromMiddleC = (step: string, octave: number): number => {
  return (octave - 4) * 7 + getStepIndex(step);
};

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

const getTablatureY = (note: Note, partYOffset: number): number => {
  const staffYOffset = partYOffset + ((note.staff || 1) - 1) * 120;

  const technical = note.notations?.find(
    (notation) => notation.technical && notation.technical.length > 0
  )?.technical?.[0];

  if (!technical) {
    return staffYOffset + 3 * STAFF_LINE_SPACING;
  }

  const { string: stringNum } = technical;
  const stringLineIndex = stringNum - 1;
  return staffYOffset + stringLineIndex * STAFF_LINE_SPACING;
};

interface MeasureElement {
  note?: Note;
}

const groupNotesIntoChords = (elements: MeasureElement[]): ChordGroup[] => {
  const chordGroups: ChordGroup[] = [];
  let currentChord: ChordGroup | null = null;

  elements.forEach((element, index) => {
    if (element.note) {
      const note = element.note;

      if (note.chord && currentChord) {
        currentChord.notes.push(note);
        currentChord.elementIndices.push(index);
      } else {
        if (currentChord) {
          chordGroups.push(currentChord);
        }

        currentChord = {
          notes: [note],
          x: 0,
          duration: note.duration,
          elementIndices: [index],
        };
      }
    }
  });

  if (currentChord) {
    chordGroups.push(currentChord);
  }

  return chordGroups;
};

// ---------------------------------------------------------------------------
// Lyric helpers
// ---------------------------------------------------------------------------

/** Returns true when a note carries at least one lyric with visible text. */
const noteHasLyric = (note: Note): boolean =>
  Array.isArray(note.lyrics) &&
  note.lyrics.some((l) => l.text && l.text.length > 0);

/**
 * Pre-compute, for every chord-group in a flattened list of measures, the
 * x-distance to the next chord-group whose first note carries a lyric.
 *
 * The returned Map keys are chord-group indices (within the flat list) and
 * the values are pixel distances.  Entries are only added for groups whose
 * syllabic value is "begin" or "middle" (i.e. groups that need a hyphen).
 *
 * @param chordGroupsWithX  Array of { chordGroup, x } objects in order.
 * @param divisions         MusicXML divisions value for this part.
 */
interface ChordGroupEntry {
  group: ChordGroup;
  x: number;
}

const computeHyphenSpans = (
  chordGroupsWithX: ChordGroupEntry[]
): Map<number, number> => {
  const spans = new Map<number, number>();

  for (let i = 0; i < chordGroupsWithX.length; i++) {
    const { group, x: currentX } = chordGroupsWithX[i];
    const firstNote = group.notes[0];

    // Only care about groups that need a hyphen
    const needsHyphen =
      firstNote.lyrics?.some(
        (l) => l.syllabic === "begin" || l.syllabic === "middle"
      ) ?? false;

    if (!needsHyphen) continue;

    // Scan forward for the next chord-group that carries a lyric
    for (let j = i + 1; j < chordGroupsWithX.length; j++) {
      const candidate = chordGroupsWithX[j];
      if (noteHasLyric(candidate.group.notes[0])) {
        spans.set(i, candidate.x - currentX);
        break;
      }
    }
    // If no next syllable is found (end of piece), the span stays unset and
    // LyricsRenderer will fall back to its default noteSpacing.
  }

  return spans;
};

export const MusicRenderer: React.FC<Props> = ({ score }) => {
  const maxWidth = Math.max(
    ...score.parts.map((part) => {
      const firstMeasureAttrs = part.measures[0]?.elements.find(
        (e) => e.attributes
      )?.attributes;

      const divisions = firstMeasureAttrs?.divisions ?? 1;
      let beats = firstMeasureAttrs?.time?.find((t) => t.beats)?.beats ?? 4;
      let beatType =
        firstMeasureAttrs?.time?.find((t) => t.beatType)?.beatType ?? 4;

      let totalWidth = 125; // começa igual ao rendering real

      part.measures.forEach((measure, measureIndex) => {
        const attrs = measure.elements.find((e) => e.attributes)?.attributes;

        beats = attrs?.time?.find((t) => t.beats)?.beats ?? beats;
        beatType =
          attrs?.time?.find((t) => t.beatType)?.beatType ?? beatType;

        const measureWidth =
          (4 * beats * DURATION_SPACING_UNIT * divisions) / beatType;

        const measureX = totalWidth;

        // Se for o último compasso, calcula posição da barra final
        if (measureIndex === part.measures.length - 1) {
          const finalBarlineX =
            measureX +
            measureWidth -
            DURATION_SPACING_UNIT / 2 +
            1; // mesma lógica do render (linha mais à direita)

          totalWidth = finalBarlineX;
        } else {
          totalWidth += measureWidth;
        }
      });

      return totalWidth;
    })
  );

  const svgWidth = maxWidth;

  const getPartYOffset = (partIndex: number): number => {
    if (partIndex === 0) return 60;

    const prevPartAttrs = score.parts[partIndex - 1].measures[0]?.elements.find(
      (e) => e.attributes
    )?.attributes;
    const prevPartStaves = prevPartAttrs?.staves ?? 1;
    const prevOffset: number = getPartYOffset(partIndex - 1);

    return prevOffset + prevPartStaves * STAFF_SPACING;
  };

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

        const globalActiveClefs: Record<number, Clef> = {};
        initialClefs.forEach((clef) => {
          globalActiveClefs[clef.staffNumber || 1] = clef;
        });

        // -------------------------------------------------------------------
        // First pass: collect all chord-group x-positions across every measure
        // so we can compute hyphen spans before rendering anything.
        // -------------------------------------------------------------------
        const allChordGroupEntries: ChordGroupEntry[] = [];
        {
          let scanX = 125;
          let scanBeats = beats;
          let scanBeatType = beatType;

          for (const measure of part.measures) {
            const attrs = measure.elements.find(
              (e) => e.attributes
            )?.attributes;
            scanBeats =
              attrs?.time?.find((t) => t.beats)?.beats ?? scanBeats;
            scanBeatType =
              attrs?.time?.find((t) => t.beatType)?.beatType ?? scanBeatType;

            const measureWidth =
              (4 * scanBeats * DURATION_SPACING_UNIT * divisions) /
              scanBeatType;

            let noteX = scanX;
            let noteSpacing = 0;
            const chordGroups = groupNotesIntoChords(measure.elements);
            let cgIdx = 0;

            measure.elements.forEach((element, elementIndex) => {
              if (element.note) {
                const cg = chordGroups[cgIdx];
                if (cg && cg.elementIndices[0] === elementIndex) {
                  if (!element.note.chord) {
                    noteX += noteSpacing;
                  }
                  noteSpacing = cg.duration * DURATION_SPACING_UNIT;
                  allChordGroupEntries.push({ group: cg, x: noteX });
                  cgIdx++;
                }
              }
              if (element.backup) {
                noteX -= element.backup.duration * DURATION_SPACING_UNIT;
              }
            });

            scanX += measureWidth;
          }
        }

        const hyphenSpanMap = computeHyphenSpans(allChordGroupEntries);

        // -------------------------------------------------------------------
        // Second pass: render
        // -------------------------------------------------------------------
        let totalWidth = 125;

        const tiedNotes = new Map<
          string,
          { note: Note; x: number; y: number; duration: number }
        >();

        const activeSlurs = new Map<string, SlurInfo>();
        const completedSlurs: CompletedSlur[] = [];

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
                    slurY = getTablatureY(note, partYOffset);
                    yOffset = note.stem === "up" ? -8 : 8;
                  } else {
                    yOffset = 6 * (note.stem === "up" ? 1 : -1);
                  }

                  if (slur.type === "start") {
                    activeSlurs.set(slurKey, {
                      startX: currentX + 6,
                      startY: slurY + yOffset * (note.stem === "up" ? 1 : -1),
                      placement: slur.placement,
                      staff: staffNum,
                    });
                  } else if (slur.type === "stop") {
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

        // Global chord-group index across all measures (matches allChordGroupEntries)
        let globalCgIdx = 0;

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

              const chordGroups = groupNotesIntoChords(measure.elements);
              let chordGroupIndex = 0;

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

              measure.elements.forEach((element, elementIndex) => {
                if (element.attributes?.clefs) {
                  element.attributes.clefs.forEach((clef) => {
                    const staffIndex = (clef.staffNumber || 1) - 1;
                    const staffYOffset =
                      partYOffset + staffIndex * STAFF_SPACING;
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

                    globalActiveClefs[clef.staffNumber || 1] = clef;
                  });
                }

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
                      y={partYOffset - 20}
                      xOffset={chordOffset}
                    />
                  );
                }

                if (element.note) {
                  const currentChordGroup = chordGroups[chordGroupIndex];
                  const isFirstNoteInChord =
                    currentChordGroup &&
                    currentChordGroup.elementIndices[0] === elementIndex;

                  if (isFirstNoteInChord) {
                    const chordGroup = currentChordGroup;

                    if (!element.note.chord) {
                      currentX += spacing;
                    }
                    spacing = chordGroup.duration * DURATION_SPACING_UNIT;

                    // Look up the pre-computed hyphen span for this chord group
                    const lyricsHyphenSpan = hyphenSpanMap.get(globalCgIdx);

                    const chordNotesWithPositions: ChordNoteWithPosition[] =
                      chordGroup.notes.map((note) => {
                        const staffNum = note.staff || 1;
                        const activeClef = globalActiveClefs[staffNum];

                        let noteY: number;
                        if (activeClef?.sign === "TAB") {
                          noteY = getTablatureY(note, partYOffset);
                        } else {
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

                    chordGroup.notes.forEach((note, noteIndex) => {
                      const noteY = chordNotesWithPositions[noteIndex].y;
                      const staffNum = note.staff || 1;
                      const activeClef = globalActiveClefs[staffNum];

                      handleSlurs(note, currentX, noteY, staffNum);

                      const hasTieStart = note.notations?.some((notation) =>
                        notation.tied?.some((t) => t.type === "start")
                      );
                      const hasTieStop = note.notations?.some((notation) =>
                        notation.tied?.some((t) => t.type === "stop")
                      );

                      const noteKey = `${note.pitch?.step}${note.pitch?.octave}-${staffNum}`;
                      const tieEnd = hasTieStop
                        ? tiedNotes.get(noteKey)
                        : undefined;

                      if (hasTieStart) {
                        tiedNotes.set(noteKey, {
                          note,
                          x: currentX,
                          y: noteY,
                          duration: note.duration,
                        });
                      } else {
                        tiedNotes.delete(noteKey);
                      }

                      const key = `${note.rest ? "rest" : "note"
                        }-${partIndex}-${measureIndex}-${chordGroup.elementIndices[noteIndex]
                        }`;

                      const staffBottomY =
                        partYOffset +
                        (staffNum - 1) * STAFF_SPACING +
                        4 * STAFF_LINE_SPACING;

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
                          staffBottomY={staffBottomY}
                          lyricsHyphenSpan={lyricsHyphenSpan}
                        />
                      );
                    });

                    chordGroupIndex++;
                    globalCgIdx++;
                  }
                }

                if (element.backup) {
                  currentX -= element.backup.duration * DURATION_SPACING_UNIT;
                }
              });

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

              if (measureIndex === part.measures.length - 1) {
                elements.push(
                  <g key={`final-barline-${partIndex}-${measureIndex}`}>
                    {renderMeasureLine(
                      measureX +
                      (4 * beats * DURATION_SPACING_UNIT * divisions) /
                      beatType -
                      DURATION_SPACING_UNIT / 2 +
                      0,
                      partYOffset,
                      staves,
                      staffDetails,
                      7
                    )}
                    {renderMeasureLine(
                      measureX +
                      (4 * beats * DURATION_SPACING_UNIT * divisions) /
                      beatType -
                      DURATION_SPACING_UNIT / 2 -
                      8,
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
