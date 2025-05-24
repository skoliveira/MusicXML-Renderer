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
}

export const NoteRenderer: React.FC<NoteRendererProps> = ({
  note,
  x,
  y,
  elementKey,
  partYOffset = 0,
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
      <StemRenderer
        notehead={note.notehead}
        stem={note.stem}
        x={x}
        y={y}
        elementKey={elementKey}
      />{" "}
      {needsFlag && note.type && note.stem && (
        <g
          transform={
            !isUpwardStem ? `scale(1,-1) translate(0,${-2 * y})` : undefined
          }
        >
          <Flag type={note.type} x={x + (isUpwardStem ? 5 : -5)} y={y - 35} />
        </g>
      )}
      {note.dots && <DotsRenderer x={x} y={y} dots={note.dots} />}
    </>
  );
};
