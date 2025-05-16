import React from "react";
import { Note } from "../type";
import { NoteHead } from "./NoteHead";
import { StemRenderer } from "./StemRenderer";
import { RestRenderer } from "./RestRenderer";

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
      <RestRenderer measure={note.rest.measure} type={note.type} x={x} y={y} />
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
