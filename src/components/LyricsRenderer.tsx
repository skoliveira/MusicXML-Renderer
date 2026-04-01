// components/LyricsRenderer.tsx
import React from "react";
import { Lyric } from "../type";

interface LyricsRendererProps {
  lyrics: Lyric[];
  x: number;
  y: number;
  noteSpacing?: number;   // spacing to the immediately next note (fallback)
  hyphenSpan?: number;    // total distance to the next non-empty syllable
}

export const LyricsRenderer: React.FC<LyricsRendererProps> = ({
  lyrics,
  x,
  y,
  noteSpacing = 40,
  hyphenSpan,
}) => {
  if (!lyrics || lyrics.length === 0) return null;

  // Use the full span to the next syllable-bearing note when available,
  // otherwise fall back to the single-note spacing so existing callers
  // keep working without changes.
  const spanForHyphen = hyphenSpan ?? noteSpacing;

  return (
    <>
      {lyrics.map((lyric, i) => {
        const needsHyphen =
          lyric.syllabic === "begin" || lyric.syllabic === "middle";

        return (
          <g key={i}>
            {/* Syllable text anchored to the note's x position */}
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="hanging"
              fontSize={16}
              fontFamily="serif"
              fill="currentColor"
              style={{ userSelect: "none" }}
            >
              {lyric.text}
            </text>

            {/*
              Hyphen centered between this note and the next note that
              actually carries a syllable. When intermediate notes are
              empty, spanForHyphen covers all of them, so the hyphen
              lands exactly in the middle of the whole gap.
            */}
            {needsHyphen && (
              <text
                x={x + spanForHyphen / 2}
                y={y}
                textAnchor="middle"
                dominantBaseline="hanging"
                fontSize={16}
                fontFamily="serif"
                fill="currentColor"
                style={{ userSelect: "none" }}
              >
                -
              </text>
            )}
          </g>
        );
      })}
    </>
  );
};
