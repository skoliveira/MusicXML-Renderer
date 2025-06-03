// components/NoteRenderer.tsx
import React from "react";
import { Note } from "../type";
import { NoteHead } from "./NoteHead";
import { StemRenderer } from "./StemRenderer";
import { RestRenderer } from "./RestRenderer";
import { DotsRenderer } from "./DotsRenderer";
import { Flag } from "./Flag";
import { AccidentalRenderer } from "./AccidentalRenderer";
import { LedgerLines } from "./LedgerLines";

interface NoteRendererProps {
  note: Note;
  x: number;
  y: number;
  elementKey: string;
  partYOffset?: number;
  isChord?: boolean;
  isFirstInChord?: boolean;
  chordNotes?: Array<{ note: Note; y: number }>; // All notes in the chord with their Y positions
}

export const NoteRenderer: React.FC<NoteRendererProps> = ({
  note,
  x,
  y,
  elementKey,
  partYOffset = 0,
  isChord = false,
  isFirstInChord = false,
  chordNotes = [],
}) => {
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
  const isUpwardStem = note.stem === "up";

  if (note.rest) {
    return (
      <>
        <RestRenderer
          type={note.type}
          measure={note.rest.measure}
          x={x}
          y={y}
        />
        {note.dots && <DotsRenderer x={x} y={y} dots={note.dots} />}
      </>
    );
  }

  // Calculate chord stem positions if this is a chord
  let stemStartY = y;
  let stemEndY = y;

  if (isChord && chordNotes.length > 1 && isFirstInChord) {
    // Find the highest and lowest notes in the chord
    const yPositions = chordNotes.map((cn) => cn.y);
    const highestY = Math.min(...yPositions); // Lowest Y value (highest on staff)
    const lowestY = Math.max(...yPositions); // Highest Y value (lowest on staff)

    if (isUpwardStem) {
      // Stem starts at the lowest note and extends upward from the highest note
      stemStartY = lowestY;
      stemEndY = highestY - 35; // Standard stem length above the notehead
    } else {
      // Stem starts at the highest note and extends downward from the lowest note
      stemStartY = highestY;
      stemEndY = lowestY + 35; // Standard stem length below the notehead
    }
  }

  return (
    <>
      <LedgerLines
        x={x}
        y={y}
        staff={note.staff || 1}
        staffYOffset={partYOffset}
      />
      {note.accidental && (
        <AccidentalRenderer type={note.accidental} x={x} y={y} />
      )}
      <NoteHead
        type={note.type}
        notehead={note.notehead}
        x={x}
        y={y}
        elementKey={elementKey}
      />
      {/* Only render stem and flag for single notes or first note in chord */}
      {(!isChord || isFirstInChord) && (
        <>
          {isChord && chordNotes.length > 1 ? (
            // Custom stem for chords
            <line
              x1={x + (isUpwardStem ? 5 : -5)}
              y1={stemStartY}
              x2={x + (isUpwardStem ? 5 : -5)}
              y2={stemEndY}
              stroke="black"
              strokeWidth="1"
            />
          ) : (
            // Standard stem for single notes
            <StemRenderer
              notehead={note.notehead}
              stem={note.stem}
              x={x}
              y={y}
              elementKey={elementKey}
            />
          )}
          {needsFlag && note.type && note.stem && (
            <g
              transform={
                !isUpwardStem
                  ? `scale(1,-1) translate(0,${-2 * (isChord ? stemEndY : y)})`
                  : undefined
              }
            >
              <Flag
                type={note.type}
                x={x + (isUpwardStem ? 5 : -5)}
                y={isChord ? stemEndY : y - 35}
              />
            </g>
          )}
        </>
      )}
      {note.dots && <DotsRenderer x={x} y={y} dots={note.dots} />}
    </>
  );
};
