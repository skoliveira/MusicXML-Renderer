// components/LyricsRenderer.tsx
import React from "react";
import { Lyric } from "../type";

interface LyricsRendererProps {
  lyrics: Lyric[];
  x: number;
  y: number; // baseline Y, typically staffBottom + 20
}

export const LyricsRenderer: React.FC<LyricsRendererProps> = ({ lyrics, x, y }) => {
  if (!lyrics || lyrics.length === 0) return null;

  return (
    <>
      {lyrics.map((lyric, i) => {
        const needsHyphen =
          lyric.syllabic === "begin" || lyric.syllabic === "middle";
        const text = lyric.text + (needsHyphen ? " -" : "");

        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="hanging"
            fontSize={16}
            fontFamily="serif"
            fill="currentColor"
            style={{ userSelect: "none" }}
          >
            {text}
          </text>
        );
      })}
    </>
  );
};