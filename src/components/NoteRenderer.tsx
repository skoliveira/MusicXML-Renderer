// components/NoteRenderer.tsx
import React from "react";
import { Note, ClefSign } from "../type";
import { NoteHead } from "./NoteHead";
import { StemRenderer } from "./StemRenderer";
import { RestRenderer } from "./RestRenderer";
import { DotsRenderer } from "./DotsRenderer";
import { Flag } from "./Flag";
import { AccidentalRenderer } from "./AccidentalRenderer";
import { LedgerLines } from "./LedgerLines";
import { TablatureRenderer } from "./TablatureRenderer";
import { TieRenderer } from "./TieRenderer";

interface NoteRendererProps {
  note: Note;
  x: number;
  y: number;
  elementKey: string;
  partYOffset?: number;
  isChord?: boolean;
  isFirstInChord?: boolean;
  chordNotes?: Array<{ note: Note; y: number }>; // All notes in the chord with their Y positions
  activeClefSign?: ClefSign;
  tieEnd?: { x: number; y: number; duration: number }; // Add duration for tie start note
  tieToNext?: { x: number; y: number; duration: number }; // Add duration for tie start note
  onSlurEvent?: (
    type: "start" | "stop",
    x: number,
    y: number,
    slurNumber?: number,
    placement?: "above" | "below"
  ) => void;
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
  activeClefSign,
  tieEnd,
  tieToNext,
  onSlurEvent,
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
  const isUpwardStem = note.stem === "up";

  // Add this effect to handle slur events
  React.useEffect(() => {
    if (note.notations && onSlurEvent) {
      note.notations.forEach((notation) => {
        if (notation.slur) {
          notation.slur.forEach((slur) => {
            if (slur.type === "start" || slur.type === "stop") {
              onSlurEvent(slur.type, x, y, slur.number, slur.placement);
            }
          });
        }
      });
    }
  }, [note.notations, onSlurEvent, x, y]);

  // Handle tablature notation
  if (activeClefSign === "TAB") {
    return (
      <TablatureRenderer
        note={note}
        x={x}
        partYOffset={partYOffset}
        staff={note.staff || 1}
        activeClefSign={activeClefSign}
      />
    );
  }

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
  let stemLength = y;

  if (needsStem && isChord && chordNotes.length > 1 && isFirstInChord) {
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
    stemLength = lowestY - highestY + 35;
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
          {needsStem && isChord && chordNotes.length > 1 ? (
            // Custom stem for chords
            <StemRenderer
              notehead={note.notehead}
              stem={note.stem}
              x={x}
              y={stemStartY}
              elementKey={elementKey}
              stemLength={stemLength}
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

      {/* Render ties - now using the initial note's duration for curve height */}
      {tieEnd && (
        <TieRenderer
          startX={tieEnd.x + 6}
          startY={tieEnd.y + 6 * (isUpwardStem ? 1 : -1)}
          endX={x - 6}
          endY={y + 6 * (isUpwardStem ? 1 : -1)}
          curveHeight={6 * tieEnd.duration * (isUpwardStem ? 1 : -1)}
          thickness={6}
        />
      )}
      {tieToNext && (
        <TieRenderer
          startX={x + 6}
          startY={y + 6 * (isUpwardStem ? 1 : -1)}
          endX={tieToNext.x - 6}
          endY={tieToNext.y + 6 * (isUpwardStem ? 1 : -1)}
          curveHeight={6 * note.duration * (isUpwardStem ? 1 : -1)}
          thickness={6}
        />
      )}
    </>
  );
};
