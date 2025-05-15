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
      case "cross":
        return (
          <line
            key={`stem-up-${elementKey}`}
            x1={x + 6}
            y1={y - 1}
            x2={x + 6}
            y2={y - 35}
            stroke="black"
          />
        );
      case "diamond":
      case "mi":
      case "re":
      case "rectangle":
        return (
          <line
            key={`stem-up-${elementKey}`}
            x1={x + 4.4}
            y1={y}
            x2={x + 4.4}
            y2={y - 35}
            stroke="black"
          />
        );
      case "do":
      case "triangle":
        return (
          <line
            key={`stem-up-${elementKey}`}
            x1={x + 3.5}
            y1={y + 3}
            x2={x + 3.5}
            y2={y - 35}
            stroke="black"
          />
        );
      case "fa":
        return (
          <line
            key={`stem-down-${elementKey}`}
            x1={x - 5}
            y1={y - 5}
            x2={x - 5}
            y2={y + 35}
            stroke="black"
          />
        );
      case "fa up":
      case "left triangle":
        return (
          <line
            key={`stem-down-${elementKey}`}
            x1={x + 5}
            y1={y + 5}
            x2={x + 5}
            y2={y - 35}
            stroke="black"
          />
        );
      case "inverted triangle":
      case "la":
        return (
          <line
            key={`stem-up-${elementKey}`}
            x1={x + 4}
            y1={y}
            x2={x + 4}
            y2={y - 35}
            stroke="black"
          />
        );
      case "left triangle":
        return (
          <line
            key={`stem-up-${elementKey}`}
            x1={x + 4}
            y1={y + 3.5}
            x2={x + 4}
            y2={y - 35}
            stroke="black"
          />
        );
      case "slash":
        return (
          <line
            key={`stem-up-${elementKey}`}
            x1={x + 4}
            y1={y - 3}
            x2={x + 4}
            y2={y - 35}
            stroke="black"
          />
        );
      case "square":
        return (
          <line
            key={`stem-up-${elementKey}`}
            x1={x + 3.5}
            y1={y}
            x2={x + 3.5}
            y2={y - 35}
            stroke="black"
          />
        );
      case "ti":
        return (
          <line
            key={`stem-up-${elementKey}`}
            x1={x + 4.5}
            y1={y - 1}
            x2={x + 4.5}
            y2={y - 35}
            stroke="black"
          />
        );
      case "x":
        return (
          <line
            key={`stem-up-${elementKey}`}
            x1={x + 4}
            y1={y - 3.5}
            x2={x + 4}
            y2={y - 35}
            stroke="black"
          />
        );
      default:
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
    }
  };

  if (!notehead) {
    return renderDurationHead();
  }

  return renderSpecialNotehead();
};
