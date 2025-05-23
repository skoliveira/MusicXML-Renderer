import React from "react";
import { AccidentalValue } from "../type";

interface AccidentalRendererProps {
  type: AccidentalValue;
  x: number;
  y: number;
}

export const AccidentalRenderer: React.FC<AccidentalRendererProps> = ({
  type,
  x,
  y,
}) => {
  // Convert music symbols to Unicode characters
  const getAccidentalSymbol = (type: AccidentalValue): string => {
    switch (type) {
      case "sharp":
        return "♯";
      case "natural":
        return "♮";
      case "flat":
        return "♭";
      case "double-sharp":
        return "𝄪";
      case "sharp-sharp":
        return "♯♯";
      case "flat-flat":
        return "𝄫";
      case "natural-sharp":
        return "♮♯";
      case "natural-flat":
        return "♮♭";
      case "quarter-flat":
        return "♭̔";
      case "quarter-sharp":
        return "♯̔";
      case "three-quarters-flat":
        return "♭𝄃";
      case "three-quarters-sharp":
        return "♯𝄃";
      default:
        return "";
    }
  };

  return (
    <text
      x={x - 15} // Position accidental to the left of the note
      y={y + 5} // Align vertically with the note
      className="accidental"
      style={{
        fontSize: "24px",
        fontFamily: "Bravura, Musical Symbols",
      }}
    >
      {getAccidentalSymbol(type)}
    </text>
  );
};
