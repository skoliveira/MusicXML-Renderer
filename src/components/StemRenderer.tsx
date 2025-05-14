import React from "react";
import { NoteheadValue, Stem } from "../type";

interface StemRendererProps {
  notehead?: NoteheadValue;
  stem?: Stem;
  x: number;
  y: number;
  elementKey: string;
}

export const StemRenderer: React.FC<StemRendererProps> = ({
  notehead,
  stem,
  x,
  y,
  elementKey,
}) => {
  const renderDurationHead = () => {
    switch (stem) {
      case "up":
        return (
          <line
            key={`stem-up-${elementKey}`}
            x1={x + 5}
            y1={y}
            x2={x + 5}
            y2={y - 35}
            stroke="black"
          />
        );
      case "down":
        return (
          <line
            key={`stem-down-${elementKey}`}
            x1={x - 5}
            y1={y}
            x2={x - 5}
            y2={y + 35}
            stroke="black"
          />
        );
      case "double":
        return (
          <g>
            <line
              key={`stem-up-${elementKey}`}
              x1={x + 5}
              y1={y}
              x2={x + 5}
              y2={y - 35}
              stroke="black"
            />
            <line
              key={`stem-down-${elementKey}`}
              x1={x - 5}
              y1={y}
              x2={x - 5}
              y2={y + 35}
              stroke="black"
            />
          </g>
        );
      case "none":
        return <g />;
    }
  };

  const renderSpecialNotehead = () => {
    switch (notehead) {
      case "arrow down":
        return (
          <line
            key={`stem-up-${elementKey}`}
            x1={x}
            y1={y}
            x2={x}
            y2={y - 35}
            stroke="black"
          />
        );
      case "arrow up":
        return (
          <line
            key={`stem-down-${elementKey}`}
            x1={x}
            y1={y}
            x2={x}
            y2={y + 35}
            stroke="black"
          />
        );
      default:
        return (
          <line
            key={`stem-up-${elementKey}`}
            x1={x + 5}
            y1={y - 4}
            x2={x + 5}
            y2={y - 31}
            stroke="black"
          />
        );
    }
  };

  if (!notehead) {
    return renderDurationHead();
  }

  return renderSpecialNotehead();
};
