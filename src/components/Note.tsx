import React from "react";
import { Note as NoteType } from "../type";
import { NoteHead } from "./NoteHead";

interface NoteProps {
  note: NoteType;
  x: number;
  y: number;
  elementKey: string;
}

export const Note: React.FC<NoteProps> = ({ note, x, y, elementKey }) => {
  if (note.rest) {
    return (
      <text key={elementKey} x={x} y={y} fontSize="14px">
        𝄽
      </text>
    );
  }

  return <NoteHead type={note.type} x={x} y={y} elementKey={elementKey} />;
};
