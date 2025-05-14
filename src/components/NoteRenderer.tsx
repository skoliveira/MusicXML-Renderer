import React from "react";
import { Note } from "../type";
import { NoteHead } from "./NoteHead";

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

  return <NoteHead type={note.type} x={x} y={y} elementKey={elementKey} />;
};
