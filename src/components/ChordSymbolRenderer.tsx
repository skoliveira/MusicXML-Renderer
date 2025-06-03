import React from "react";
import { Harmony } from "../type";
import { FretboardRenderer } from "./FretboardRenderer";

interface Props {
  harmony: Harmony;
  x: number;
  y: number;
  xOffset: number;
}

export const ChordSymbolRenderer: React.FC<Props> = ({
  harmony,
  x,
  y,
  xOffset,
}) => {
  const getChordText = (harmony: Harmony): string => {
    let text = "";

    // Add root if present
    if (harmony.root) {
      text += harmony.root.rootStep;
      if (harmony.root.rootAlter) {
        text += harmony.root.rootAlter > 0 ? "#" : "♭";
      }
    }

    // Add kind
    switch (harmony.kind) {
      case "none":
      case "major":
        // Major is typically not shown unless it's specifically needed
        break;
      case "minor":
        text += "m";
        break;
      case "augmented":
        text += "+";
        break;
      case "diminished":
        text += "°";
        break;
      case "dominant":
        text += "7";
        break;
      case "major-seventh":
        text += "maj7";
        break;
      case "minor-seventh":
        text += "m7";
        break;
      case "diminished-seventh":
        text += "°7";
        break;
      case "half-diminished":
        text += "ø7";
        break;
      case "major-minor":
        text += "m(maj7)";
        break;
      case "major-sixth":
        text += "6";
        break;
      case "minor-sixth":
        text += "m6";
        break;
      case "dominant-ninth":
        text += "9";
        break;
      case "major-ninth":
        text += "maj9";
        break;
      case "minor-ninth":
        text += "m9";
        break;
      case "suspended-fourth":
        text += "sus4";
        break;
      case "suspended-second":
        text += "sus2";
        break;
      default:
        text += harmony.kind;
    }

    // Add bass note if present
    if (harmony.bass) {
      text += "/";
      text += harmony.bass.bassStep;
      if (harmony.bass.bassAlter) {
        text += harmony.bass.bassAlter > 0 ? "#" : "♭";
      }
    }

    return text;
  };
  return (
    <g>
      <text
        x={x + xOffset}
        y={y - 30}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="16"
        fontFamily="serif"
      >
        {getChordText(harmony)}
      </text>
      {harmony.frame && (
        <FretboardRenderer
          frame={harmony.frame}
          x={x + xOffset - 15}
          y={y - 15}
        />
      )}
    </g>
  );
};
