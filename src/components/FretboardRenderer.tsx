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
  const nutOffset = nutHeight / 2;
  const dotRadius = 2;
  const barreHeight = 4;

  // Calculate dimensions
  const diagramWidth = (frameStrings - 1) * stringSpacing;

  // Fret LINE y — lineIndex 0 = top edge, lineIndex frameFrets = bottom edge.
  // Completely independent of firstFret; just indexes into the visible grid.
  const getFretLineY = (lineIndex: number) => {
    return y + lineIndex * fretSpacing;
  };

  // Fret DOT/barre y — places a mark in the centre of the slot for fretNum,
  // accounting for which fret is at the top of the diagram (firstFret).
  const getFretDotY = (fretNum: number) => {
    return y + (fretNum - firstFret + 0.5) * fretSpacing;
  };

  // Helper function to get string position (from right to left for guitar)
  const getStringX = (stringNum: number) => {
    return x + (frameStrings - stringNum) * stringSpacing;
  };

  // Create a complete note array with muted strings for unspecified strings
  const completeFrameNote = React.useMemo(() => {
    const specifiedStrings = new Set(frameNote.map((note) => note.string));
    const allNotes = [...frameNote];

    // Detect barre region (fret + start/stop)
    const barreStart = frameNote.find((note) => note.barre === "start");
    const barreStop = frameNote.find(
      (note) => note.barre === "stop" && note.fret === barreStart?.fret
    );

    const hasBarre = barreStart && barreStop;
    const barreFret = barreStart?.fret;
    const barreStartString = Math.min(
      barreStart?.string ?? Infinity,
      barreStop?.string ?? Infinity
    );
    const barreEndString = Math.max(
      barreStart?.string ?? -Infinity,
      barreStop?.string ?? -Infinity
    );

    for (let stringNum = 1; stringNum <= frameStrings; stringNum++) {
      if (!specifiedStrings.has(stringNum)) {
        // If there is a barre and the string is within the range of the barre
        if (
          hasBarre &&
          stringNum >= barreStartString &&
          stringNum <= barreEndString
        ) {
          allNotes.push({
            string: stringNum,
            fret: barreFret!,
            fingering: undefined,
            barre: undefined,
          });
        } else {
          // Otherwise, treat it as a muted string
          allNotes.push({
            string: stringNum,
            fret: -1,
            fingering: undefined,
            barre: undefined,
          });
        }
      }
    }

    return allNotes.sort((a, b) => a.string - b.string);
  }, [frameNote, frameStrings]);

  return (
    <g className="fretboard-diagram">
      {/* Nut (when firstFret is 0) */}
      {firstFret === 0 && (
        <line
          x1={x}
          y1={getFretLineY(0) - nutOffset}
          x2={x + diagramWidth}
          y2={getFretLineY(0) - nutOffset}
          stroke="black"
          strokeWidth={nutHeight}
          strokeLinecap="square"
        />
      )}

      {/* Fret lines — lineIndex 0..frameFrets, purely positional */}
      {Array.from({ length: frameFrets + 1 }, (_, i) => (
        <line
          key={`fret-${i}`}
          x1={x}
          y1={getFretLineY(i)}
          x2={x + diagramWidth}
          y2={getFretLineY(i)}
          stroke="black"
          strokeWidth={0.5}
        />
      ))}

      {/* String lines — span the full grid height */}
      {Array.from({ length: frameStrings }, (_, i) => (
        <line
          key={`string-${i + 1}`}
          x1={getStringX(i + 1)}
          y1={getFretLineY(0)}
          x2={getStringX(i + 1)}
          y2={getFretLineY(frameFrets)}
          stroke="black"
          strokeWidth={0.5}
        />
      ))}

      {/* First fret number (if not starting from 1st fret) */}
      {firstFret > 1 && (
        <text
          x={x - 4}
          y={getFretLineY(0) + fretSpacing / 2}
          fontSize="9"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="black"
        >
          {firstFret}
        </text>
      )}

      {/* Frame notes (finger positions) — using complete array */}
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

        // Handle fretted notes — dot sits in the centre of its fret slot
        const fretY = getFretDotY(note.fret);

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

          const fretY = getFretDotY(startNote.fret);
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