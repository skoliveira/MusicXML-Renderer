import React from "react";
import { Note } from "../type";
import { NoteHead } from "./NoteHead";
import { StemRenderer } from "./StemRenderer";
import { RestRenderer } from "./RestRenderer";
import { DotsRenderer } from "./DotsRenderer";

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
      {note.dots && <DotsRenderer x={x} y={y} dots={note.dots} />}
    </>
  );
};
