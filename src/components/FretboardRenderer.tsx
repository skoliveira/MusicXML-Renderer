// components/FretboardRenderer.tsx
import React from "react";
import { Frame } from "../type";

interface Props {
  frame: Frame;
  x: number;
  y: number;
}

export const FretboardRenderer: React.FC<Props> = ({ frame, x, y }) => {
  const { frameStrings, frameFrets, firstFret = 1, frameNote } = frame;

  // Dimensions (scaled down by 50%)
  const stringSpacing = 6;
  const fretSpacing = 6;
  const nutHeight = 2;
  const dotRadius = 2;
  const barreHeight = 4;

  // Calculate dimensions
  const diagramWidth = (frameStrings - 1) * stringSpacing;
  const diagramHeight = frameFrets * fretSpacing;

  // Helper function to get string position (from right to left for guitar)
  const getStringX = (stringNum: number) => {
    return x + (frameStrings - stringNum) * stringSpacing;
  };

  // Helper function to get fret position
  const getFretY = (fretNum: number) => {
    return y + fretNum * fretSpacing;
  };

  // Create a complete note array with muted strings for unspecified strings
  const completeFrameNote = React.useMemo(() => {
    const specifiedStrings = new Set(frameNote.map((note) => note.string));
    const allNotes = [...frameNote];

    // Add muted entries for any unspecified strings
    for (let stringNum = 1; stringNum <= frameStrings; stringNum++) {
      if (!specifiedStrings.has(stringNum)) {
        allNotes.push({
          string: stringNum,
          fret: -1, // Negative fret indicates muted
          fingering: undefined,
          barre: undefined,
        });
      }
    }

    return allNotes.sort((a, b) => a.string - b.string);
  }, [frameNote, frameStrings]);

  return (
    <g className="fretboard-diagram">
      {/* Fret lines */}
      {Array.from({ length: frameFrets + 1 }, (_, i) => (
        <line
          key={`fret-${i}`}
          x1={x}
          y1={getFretY(i)}
          x2={x + diagramWidth}
          y2={getFretY(i)}
          stroke="black"
          strokeWidth={i === 0 && firstFret === 1 ? nutHeight : 0.5}
        />
      ))}

      {/* String lines */}
      {Array.from({ length: frameStrings }, (_, i) => (
        <line
          key={`string-${i + 1}`}
          x1={getStringX(i + 1)}
          y1={y}
          x2={getStringX(i + 1)}
          y2={y + diagramHeight}
          stroke="black"
          strokeWidth={0.5}
        />
      ))}

      {/* First fret number (if not starting from 1st fret) */}
      {firstFret > 1 && (
        <text
          x={x - 4}
          y={y + fretSpacing / 2}
          fontSize="5"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="black"
        >
          {firstFret}
        </text>
      )}

      {/* Frame notes (finger positions) - now using complete array */}
      {completeFrameNote.map((note, index) => {
        const stringX = getStringX(note.string);

        // Handle open strings (fret 0)
        if (note.fret === 0) {
          return (
            <g key={`note-${index}`}>
              <circle
                cx={stringX}
                cy={y - 6}
                r={dotRadius}
                fill="none"
                stroke="black"
                strokeWidth={0.75}
              />
            </g>
          );
        }

        // Handle muted strings (no fret specified or negative fret)
        if (note.fret < 0) {
          return (
            <g key={`note-${index}`}>
              <g stroke="black" strokeWidth={0.75}>
                <line x1={stringX - 2} y1={y - 8} x2={stringX + 2} y2={y - 4} />
                <line x1={stringX - 2} y1={y - 4} x2={stringX + 2} y2={y - 8} />
              </g>
            </g>
          );
        }

        // Handle fretted notes
        const fretY = getFretY(note.fret - 0.5); // Position dot between fret lines

        return (
          <g key={`note-${index}`}>
            {/* Finger dot */}
            <circle cx={stringX} cy={fretY} r={dotRadius} fill="black" />

            {/* Fingering number */}
            {note.fingering && note.fingering > 0 && (
              <text
                x={stringX}
                y={fretY}
                fontSize="4"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontWeight="bold"
              >
                {note.fingering}
              </text>
            )}
          </g>
        );
      })}

      {/* Barre lines */}
      {completeFrameNote
        .filter((note) => note.barre === "start")
        .map((startNote, index) => {
          const endNote = completeFrameNote.find(
            (note) => note.barre === "stop" && note.fret === startNote.fret
          );

          if (!endNote) return null;

          const fretY = getFretY(startNote.fret - 0.5);
          const startX = getStringX(Math.max(startNote.string, endNote.string));
          const endX = getStringX(Math.min(startNote.string, endNote.string));

          return (
            <line
              key={`barre-${index}`}
              x1={startX}
              y1={fretY}
              x2={endX}
              y2={fretY}
              stroke="black"
              strokeWidth={barreHeight}
              strokeLinecap="round"
            />
          );
        })}
    </g>
  );
};
