import React from "react";
import { Note } from "../type";
import { NoteHead } from "./NoteHead";
import { StemRenderer } from "./StemRenderer";

interface NoteRendererProps {
  note: Note;
  x: number;
  y: number;
  elementKey: string;
}

export const NoteRenderer: React.FC<NoteRendererProps> = ({
  note,
  x,
  y,
  elementKey,
}) => {
  if (note.rest) {
    return (
      <text key={elementKey} x={x} y={y} fontSize="14px">
        𝄽
      </text>
    );
  }

  return (
    <>
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
      />
    </>
  );
};
