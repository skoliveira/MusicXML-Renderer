// type.ts
export type AccidentalValue =
  | "sharp"
  | "natural"
  | "flat"
  | "double-sharp"
  | "sharp-sharp"
  | "flat-flat"
  | "natural-sharp"
  | "natural-flat"
  | "quarter-flat"
  | "quarter-sharp"
  | "three-quarters-flat"
  | "three-quarters-sharp"
  | "sharp-down"
  | "sharp-up"
  | "natural-down"
  | "natural-up"
  | "flat-down"
  | "flat-up"
  | "doublesharp--sharp-down"
  | "double-sharp-up"
  | "flat-flat-down"
  | "flat-flat-up"
  | "arrow-down"
  | "arrow-up"
  | "triple-sharp"
  | "triple-flat"
  | "slash-quarter-sharp"
  | "slash-sharp"
  | "slash-flat"
  | "double-slash-flat"
  | "sharp-1"
  | "sharp-2"
  | "sharp-3"
  | "sharp-5"
  | "flat-1"
  | "flat-2"
  | "flat-3"
  | "flat-4"
  | "sori"
  | "koron";

export type NoteType =
  | "maxima"
  | "long"
  | "breve"
  | "whole"
  | "half"
  | "quarter"
  | "eighth"
  | "16th"
  | "32nd"
  | "64th"
  | "128th"
  | "256th"
  | "512th"
  | "1024th";

export type NoteheadValue =
  | "arrow down"
  | "arrow up"
  | "back slashed"
  | "circle dot"
  | "circle-x"
  | "circled"
  | "cluster"
  | "cross"
  | "diamond"
  | "do"
  | "fa"
  | "fa up"
  | "inverted triangle"
  | "la"
  | "left triangle"
  | "mi"
  | "none"
  | "normal"
  | "re"
  | "rectangle"
  | "slash"
  | "slashed"
  | "so"
  | "square"
  | "ti"
  | "triangle"
  | "x";

export type FermataShape =
  | "normal"
  | "angled"
  | "square"
  | "double-angled"
  | "double-square"
  | "double-dot"
  | "half-curve"
  | "curlew"
  | "";

export type Dynamics =
  | "p"
  | "pp"
  | "ppp"
  | "pppp"
  | "ppppp"
  | "pppppp"
  | "f"
  | "ff"
  | "fff"
  | "ffff"
  | "fffff"
  | "ffffff"
  | "mp"
  | "mf"
  | "sf"
  | "sfp"
  | "sfpp"
  | "fp"
  | "rf"
  | "rfz"
  | "sfz"
  | "sffz"
  | "fz"
  | "n"
  | "pf"
  | "sfzp";

export type BeamValue =
  | "backward hook"
  | "begin"
  | "continue"
  | "end"
  | "forward hook";

export type BeamLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type GroupSymbolValue = "brace" | "bracket" | "line" | "none" | "square";

export type GroupBarlineValue = "yes" | "no" | "Mensurstrich";

export type BarStyle =
  | "dashed"
  | "dotted"
  | "heavy"
  | "heavy-heavy"
  | "heavy-light"
  | "light-heavy"
  | "light-light"
  | "none"
  | "regular"
  | "short"
  | "tick";

export type KindValue =
  | "augmented"
  | "augmented-seventh"
  | "diminished"
  | "diminished-seventh"
  | "dominant"
  | "dominant-11th"
  | "dominant-13th"
  | "dominant-ninth"
  | "French"
  | "German"
  | "half-diminished"
  | "Italian"
  | "major"
  | "major-11th"
  | "major-13th"
  | "major-minor"
  | "major-ninth"
  | "major-seventh"
  | "major-sixth"
  | "minor"
  | "minor-11th"
  | "minor-13th"
  | "minor-ninth"
  | "minor-seventh"
  | "minor-sixth"
  | "Neapolitan"
  | "none"
  | "other"
  | "pedal"
  | "power"
  | "suspended-fourth"
  | "suspended-second"
  | "Tristan";

export type Step = "A" | "B" | "C" | "D" | "E" | "F" | "G";

export type NumeralRoot = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type Octave = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type Stem = "down" | "up" | "double" | "none";

export type ClefSign =
  | "G"
  | "F"
  | "C"
  | "percussion"
  | "TAB"
  | "jianpu"
  | "none";

export type NumeralMode =
  | "harmonic minor"
  | "major"
  | "melodic minor"
  | "minor"
  | "natural minor";

export type Mode =
  | "major"
  | "minor"
  | "dorian"
  | "phrygian"
  | "lydian"
  | "mixolydian"
  | "aeolian"
  | "ionian"
  | "locrian"
  | "none";

export interface Pitch {
  step: Step;
  octave: Octave;
  alter?: number;
}

export interface Unpitched {
  displayStep: Step;
  displayOctave: Octave;
}

export interface Rest {
  measure?: "yes" | "no";
  displayStep?: Step;
  displayOctave?: Octave;
}

export interface Beams {
  content: BeamValue;
  number: BeamLevel;
}

export interface Tied {
  type: "start" | "stop" | "continue" | "let-ring";
}

export interface Slur {
  type: "start" | "stop" | "continue";
}

export interface Tuplet {
  type: "start" | "stop";
  placement?: "above" | "below";
}

export interface Accent {
  placement?: "above" | "below";
}

export interface StrongAccent {
  placement?: "above" | "below";
  pe?: "up" | "down";
}

export interface Staccato {
  placement?: "above" | "below";
}

export interface Tenuto {
  placement?: "above" | "below";
}

export interface DetachedLegato {
  placement?: "above" | "below";
}

export interface Staccatissimo {
  placement?: "above" | "below";
}

export interface Spiccato {
  placement?: "above" | "below";
}

export interface Scoop {
  placement?: "above" | "below";
}

export interface Plop {
  placement?: "above" | "below";
}

export interface Doit {
  placement?: "above" | "below";
}

export interface Falloff {
  placement?: "above" | "below";
}

export interface BreathMark {
  type: "comma" | "tick" | "upbow" | "salzedo" | "";
  placement?: "above" | "below";
}

export interface Caesura {
  type: "normal" | "thick" | "short" | "curved" | "single" | "";
  placement?: "above" | "below";
}

export interface Stress {
  placement?: "above" | "below";
}

export interface Unstress {
  placement?: "above" | "below";
}

export interface SoftAccent {
  placement?: "above" | "below";
}

export interface Technical {
  string: number;
  fret: number;
}

export interface Articulation {
  accent?: Accent;
  strongAccent?: StrongAccent;
  staccato?: Staccato;
  tenuto?: Tenuto;
  detachedLegato?: DetachedLegato;
  staccatissimo?: Staccatissimo;
  spiccato?: Spiccato;
  scoop?: Scoop;
  plop?: Plop;
  doit?: Doit;
  falloff?: Falloff;
  breathMark?: BreathMark;
  caesura?: Caesura;
  stress?: Stress;
  unstress?: Unstress;
  softAccent?: SoftAccent;
}

export interface Notation {
  tied?: Tied[];
  slur?: Slur[];
  tuplet?: Tuplet[];
  technical?: Technical[];
  articulations?: Articulation[];
  fermata?: FermataShape[];
  accidentalMark?: AccidentalValue[];
  dynamics?: Dynamics[];
}

export interface Note {
  chord?: boolean;
  pitch?: Pitch;
  unpitched?: Unpitched;
  rest?: Rest;
  duration: number;
  type?: NoteType;
  dots?: number;
  accidental?: AccidentalValue;
  stem?: Stem;
  notehead?: NoteheadValue;
  staff?: number;
  beams?: Beams[];
  notations?: Notation[];
  lyrics?: Lyric[];
}

export interface Lyric {
  syllabic?: "begin" | "end" | "middle" | "single";
  text: string;
}

export interface Clef {
  sign: ClefSign;
  line?: number;
  staffNumber?: number;
  clefOctaveChange?: number;
}

export interface Root {
  rootStep: Step;
  rootAlter?: number;
}

export interface NumeralKey {
  numeralFifths: number;
  numeralMode: NumeralMode;
}

export interface Numeral {
  numeralRoot: NumeralRoot;
  numeralAlter?: number;
  numeralKey?: NumeralKey;
}

export interface Bass {
  bassSeparator?: string;
  bassStep: Step;
  bassAlter?: number;
}

export interface Degree {
  degreeValue: number;
  degreeAlter: number;
  degreeType: "add" | "alter" | "subtract";
}

export interface FrameNote {
  string: number;
  fret: number;
  fingering?: number;
  barre?: "start" | "stop";
}

export interface Frame {
  frameStrings: number;
  frameFrets: number;
  firstFret?: number;
  frameNote: FrameNote[];
}

export interface Harmony {
  root?: Root;
  numeral?: Numeral;
  kind: KindValue;
  inversion?: number;
  bass?: Bass;
  degree?: Degree;
  offset?: number;
  frame?: Frame;
}

export interface Backup {
  duration: number;
}

export interface Key {
  cancel?: number;
  fifths: number;
  mode?: Mode;
}

export interface Time {
  beats: number;
  beatType: number;
}

export interface StaffTuning {
  line: number;
  tuningStep: Step;
  tuningAlter?: number;
  tuningOctave: Octave;
}

export interface StaffDetails {
  staffNumber?: number;
  staffLines: number;
  staffTuning?: StaffTuning[];
}

export interface Attributes {
  divisions?: number;
  key?: Key[];
  time?: Time[];
  staves?: number;
  partSymbol?: GroupSymbolValue;
  instruments?: number;
  clefs?: Clef[];
  staffDetails?: StaffDetails[];
}

export interface Measure {
  number: string;
  elements: {
    attributes?: Attributes;
    harmony?: Harmony;
    note?: Note;
    backup?: Backup;
    barline?: BarStyle;
  }[];
}

export interface GroupNameDisplay {
  displayText?: string;
  accidentalText?: AccidentalValue;
}

export interface GroupAbbreviationDisplay {
  displayText?: string;
  accidentalText?: AccidentalValue;
}

export interface PartGroup {
  type: "start" | "stop";
  groupName?: string;
  groupNameDisplay?: GroupNameDisplay;
  groupAbbreviation?: string;
  groupAbbreviationDisplay?: GroupAbbreviationDisplay;
  groupSymbol?: GroupSymbolValue;
  groupBarline?: GroupBarlineValue;
  groupTime?: boolean;
}

export interface PartNameDisplay {
  displayText?: string;
  accidentalText?: AccidentalValue;
}

export interface PartAbbreviationDisplay {
  displayText?: string;
  accidentalText?: AccidentalValue;
}

export interface ScorePart {
  id: string;
  partName: string;
  partNameDisplay?: PartNameDisplay;
  partAbbreviation?: string;
  partAbbreviationDisplay?: PartAbbreviationDisplay;
}

export interface PartList {
  partGroup?: PartGroup[];
  scorePart: ScorePart[];
}

export interface Part {
  id: string;
  measures: Measure[];
}

export interface Work {
  workNumber?: string;
  workTitle?: string;
}

export interface Creator {
  type?: string;
  value: string;
}

export interface Identification {
  creator?: Creator[];
}

export interface ScorePartwise {
  work?: Work;
  identification?: Identification;
  partList: PartList;
  parts: Part[];
}
