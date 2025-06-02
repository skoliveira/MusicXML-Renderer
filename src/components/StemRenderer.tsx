import React from "react";
import { NoteheadValue, Stem } from "../type";

interface StemRendererProps {
  notehead?: NoteheadValue;
  stem?: Stem;
  x: number;
  y: number;
  elementKey: string;
  stemLength?: number; // optional prop
}

export const StemRenderer: React.FC<StemRendererProps> = ({
  notehead,
  stem,
  x,
  y,
  elementKey,
  stemLength = 35, // default to 35 if not provided
}) => {
  const renderLine = (
    offsetX: number,
    startY: number,
    direction: "up" | "down",
    keySuffix: string
  ) => {
    const x1 = x + offsetX;
    const y1 = startY;
    const y2 = direction === "up" ? startY - stemLength : startY + stemLength;

    return (
      <line
        key={`${keySuffix}-${elementKey}`}
        x1={x1}
        y1={y1}
        x2={x1}
        y2={y2}
        stroke="black"
      />
    );
  };

  const durationHead = () => {
    switch (stem) {
      case "up":
        return renderLine(+5, y, "up", "stem-up");
      case "down":
        return renderLine(-5, y, "down", "stem-down");
      case "double":
        return (
          <g>
            {renderLine(+5, y, "up", "stem-up")}
            {renderLine(-5, y, "down", "stem-down")}
          </g>
        );
      default:
        return <g />;
    }
  };

  const specialNotehead = () => {
    const upwardAt44 = new Set<NoteheadValue>([
      "diamond",
      "mi",
      "re",
      "rectangle",
    ]);
    if (notehead && upwardAt44.has(notehead)) {
      return renderLine(+4.4, y, "up", "stem-up");
    }

    const upFromYPlus3 = new Set<NoteheadValue>(["do", "triangle"]);
    if (notehead && upFromYPlus3.has(notehead)) {
      return renderLine(+3.5, y + 3, "up", "stem-up");
    }

    if (notehead === "cross") {
      return renderLine(+6, y - 1, "up", "stem-up");
    }

    if (notehead === "slash") {
      return renderLine(+4, y - 3, "up", "stem-up");
    }

    if (notehead === "square") {
      return renderLine(+3.5, y, "up", "stem-up");
    }

    if (notehead === "ti") {
      return renderLine(+4.5, y - 1, "up", "stem-up");
    }

    if (notehead === "x") {
      return renderLine(+4, y - 3.5, "up", "stem-up");
    }

    if (notehead === "arrow down") {
      return renderLine(0, y, "up", "stem-up");
    }

    if (notehead === "arrow up") {
      return renderLine(0, y, "down", "stem-down");
    }

    if (notehead === "fa") {
      return renderLine(-5, y - 5, "down", "stem-down");
    }

    if (notehead === "fa up" || notehead === "left triangle") {
      return renderLine(+5, y + 5, "up", "stem-down");
    }

    if (notehead === "inverted triangle" || notehead === "la") {
      return renderLine(+4, y, "up", "stem-up");
    }

    return renderLine(+5, y, "up", "stem-up");
  };

  return notehead ? specialNotehead() : durationHead();
};
