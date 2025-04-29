import React from "react";
import { NoteData } from "../utils/parseMusicXML";

interface Props {
  music: NoteData[][];
}

const pitchToY = (step: string, octave: number): number => {
  const scale = ["C", "D", "E", "F", "G", "A", "B"];
  const index = scale.indexOf(step);
  return 110 - ((octave - 4) * 7 + index) * 5;
};

const DURATION_SPACING_UNIT = 40; // Base unit: 1 duration = 20px spacing

export const MusicRenderer: React.FC<Props> = ({ music }) => {
  return (
    <svg width={1000} height={200}>
      {/* Staff lines */}
      {[0, 10, 20, 30, 40].map((y, i) => (
        <line key={i} x1={0} y1={y + 60} x2={1000} y2={y + 60} stroke="black" />
      ))}

      {/* Notes */}
      {music.map((measure, mIdx) => {
        let x = mIdx * 220 + 50; // Initial measure offset

        return measure.map((note, nIdx) => {
          const y = note.isRest ? 80 : pitchToY(note.step!, note.octave!);
          const spacing = note.duration * DURATION_SPACING_UNIT;

          const element = note.isRest ? (
            <text key={`${mIdx}-${nIdx}`} x={x} y={y} fontSize="14px">
              𝄽
            </text>
          ) : (
            <circle key={`${mIdx}-${nIdx}`} cx={x} cy={y} r={5} fill="black" />
          );

          x += spacing;
          return element;
        });
      })}
    </svg>
  );
};
