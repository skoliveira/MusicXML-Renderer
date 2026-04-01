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
import { LyricsRenderer } from "./LyricsRenderer";

interface NoteRendererProps {
  note: Note;
  x: number;
  y: number;
  elementKey: string;
  partYOffset?: number;
  isChord?: boolean;
  isFirstInChord?: boolean;
  chordNotes?: Array<{ note: Note; y: number }>;
  activeClefSign?: ClefSign;
  tieEnd?: { x: number; y: number; duration: number };
  tieToNext?: { x: number; y: number; duration: number };
  staffBottomY?: number;
  /** Distance (px) from this note's x to the next note that carries a lyric
   *  syllable. Used to center hyphens correctly across silent/empty notes. */
  lyricsHyphenSpan?: number;
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
  staffBottomY,
  lyricsHyphenSpan,
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

  if (activeClefSign === "TAB") {
    return (
      <TablatureRenderer
        note={note}
        x={x}
        partYOffset={partYOffset}
        staff={note.staff || 1}
        activeClefSign={activeClefSign}
        tieEnd={tieEnd}
        tieToNext={tieToNext}
        lyrics={note.lyrics}
        lyricsHyphenSpan={lyricsHyphenSpan}
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

  let stemStartY = y;
  let stemEndY = y;
  let stemLength = y;

  if (needsStem && isChord && chordNotes.length > 1 && isFirstInChord) {
    const yPositions = chordNotes.map((cn) => cn.y);
    const highestY = Math.min(...yPositions);
    const lowestY = Math.max(...yPositions);

    if (isUpwardStem) {
      stemStartY = lowestY;
      stemEndY = highestY - 35;
    } else {
      stemStartY = highestY;
      stemEndY = lowestY + 35;
    }
    stemLength = lowestY - highestY + 35;
  }

  // Lyrics are pinned to a fixed distance below the bottom staff line,
  // regardless of the note's pitch. Falls back to y only if staffBottomY
  // was not provided (should not happen in normal usage).
  const lyricsY = (staffBottomY ?? y) + 22;

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
      {(!isChord || isFirstInChord) && (
        <>
          {needsStem && isChord && chordNotes.length > 1 ? (
            <StemRenderer
              notehead={note.notehead}
              stem={note.stem}
              x={x}
              y={stemStartY}
              elementKey={elementKey}
              stemLength={stemLength}
            />
          ) : (
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

      {(!isChord || isFirstInChord) &&
        note.lyrics &&
        note.lyrics.length > 0 && (
          <LyricsRenderer
            lyrics={note.lyrics}
            x={x}
            y={lyricsY}
            hyphenSpan={lyricsHyphenSpan}
          />
        )}
    </>
  );
};
