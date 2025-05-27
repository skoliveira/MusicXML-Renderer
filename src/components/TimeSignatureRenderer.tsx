import React from "react";

interface Props {
  beats: number;
  beatType: number;
  x: number;
  yOffset: number;
}

const smuflTimeSigDigits: Record<string, string> = {
  "0": "\uE080",
  "1": "\uE081",
  "2": "\uE082",
  "3": "\uE083",
  "4": "\uE084",
  "5": "\uE085",
  "6": "\uE086",
  "7": "\uE087",
  "8": "\uE088",
  "9": "\uE089",
};

function toSmuflDigits(num: number): string {
  return num
    .toString()
    .split("")
    .map((digit) => smuflTimeSigDigits[digit] || digit)
    .join("");
}

export const TimeSignatureRenderer: React.FC<Props> = ({
  beats,
  beatType,
  x,
  yOffset,
}) => {
  const beatsGlyphs = toSmuflDigits(beats);
  const beatTypeGlyphs = toSmuflDigits(beatType);

  return (
    <g>
      {/* Numerator */}
      <text
        x={x}
        y={yOffset - 10}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="36"
        fontFamily="Bravura"
      >
        {beatsGlyphs}
      </text>
      {/* Denominator */}
      <text
        x={x}
        y={yOffset + 10}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="36"
        fontFamily="Bravura"
      >
        {beatTypeGlyphs}
      </text>
    </g>
  );
};
