// parse.ts
import {
  AccidentalValue,
  NoteType,
  NoteheadValue,
  FermataShape,
  Dynamics,
  BeamValue,
  BeamLevel,
  GroupSymbolValue,
  GroupBarlineValue,
  BarStyle,
  KindValue,
  Step,
  NumeralRoot,
  Octave,
  ClefSign,
  NumeralMode,
  Mode,
  Articulation,
  Notation,
  Note,
  Lyric,
  Harmony,
  Backup,
  Attributes,
  Measure,
  PartList,
  Part,
  Work,
  Identification,
  ScorePartwise,
  PartGroup,
  Beams,
  Pitch,
  Unpitched,
  Rest,
  ScorePart,
  Stem,
} from "./type";

export function parsePitch(elem: Element): Pitch {
  const step = elem.querySelector("step")?.textContent as Step;
  const octave = parseInt(
    elem.querySelector("octave")?.textContent || "0"
  ) as Octave;
  const alterElem = elem.querySelector("alter");
  const alter = alterElem
    ? parseFloat(alterElem.textContent || "0")
    : undefined;

  return { step, octave, alter };
}

export function parseUnpitched(elem: Element): Unpitched {
  const displayStep = elem.querySelector("display-step")?.textContent as Step;
  const displayOctave = parseInt(
    elem.querySelector("display-octave")?.textContent || "0"
  ) as Octave;

  return { displayStep, displayOctave };
}

export function parseRest(elem: Element): Rest {
  const measure = elem.getAttribute("measure") as "yes" | "no" | undefined;
  const displayStep = elem.querySelector("display-step")?.textContent as Step;
  const displayOctave = parseInt(
    elem.querySelector("display-octave")?.textContent || "0"
  ) as Octave;

  return { measure, displayStep, displayOctave };
}

export function parseBeams(elem: Element): Beams[] {
  return Array.from(elem.querySelectorAll("beam")).map((beam) => ({
    content: beam.textContent as BeamValue,
    number: parseInt(beam.getAttribute("number") || "1") as BeamLevel,
  }));
}

export function parseLyric(elem: Element): Lyric {
  const syllabic = elem.querySelector("syllabic")?.textContent as
    | "begin"
    | "end"
    | "middle"
    | "single";
  const text = elem.querySelector("text")?.textContent || "";

  return { syllabic, text };
}

export function parseArticulation(elem: Element): Articulation {
  const result: Articulation = {};
  const placement = elem.getAttribute("placement") as
    | "above"
    | "below"
    | undefined;

  if (elem.querySelector("accent")) result.accent = { placement };
  if (elem.querySelector("strong-accent")) {
    result.strongAccent = {
      placement,
      pe: elem.querySelector("strong-accent")?.getAttribute("type") as
        | "up"
        | "down",
    };
  }
  if (elem.querySelector("staccato")) result.staccato = { placement };
  if (elem.querySelector("tenuto")) result.tenuto = { placement };
  if (elem.querySelector("detached-legato"))
    result.detachedLegato = { placement };
  if (elem.querySelector("staccatissimo")) result.staccatissimo = { placement };
  if (elem.querySelector("spiccato")) result.spiccato = { placement };
  if (elem.querySelector("scoop")) result.scoop = { placement };
  if (elem.querySelector("plop")) result.plop = { placement };
  if (elem.querySelector("doit")) result.doit = { placement };
  if (elem.querySelector("falloff")) result.falloff = { placement };

  const breathMark = elem.querySelector("breath-mark");
  if (breathMark) {
    result.breathMark = {
      type: breathMark.getAttribute("type") as
        | "comma"
        | "tick"
        | "upbow"
        | "salzedo"
        | "",
      placement,
    };
  }

  const caesura = elem.querySelector("caesura");
  if (caesura) {
    result.caesura = {
      type: caesura.getAttribute("type") as
        | "normal"
        | "thick"
        | "short"
        | "curved"
        | "single"
        | "",
      placement,
    };
  }

  if (elem.querySelector("stress")) result.stress = { placement };
  if (elem.querySelector("unstress")) result.unstress = { placement };
  if (elem.querySelector("soft-accent")) result.softAccent = { placement };

  return result;
}

export function parseNotation(elem: Element): Notation {
  const tied = Array.from(elem.querySelectorAll("tied")).map((tie) => ({
    type: tie.getAttribute("type") as
      | "start"
      | "stop"
      | "continue"
      | "let-ring",
  }));

  const slur = Array.from(elem.querySelectorAll("slur")).map((s) => ({
    type: s.getAttribute("type") as "start" | "stop" | "continue",
  }));

  const tuplet = Array.from(elem.querySelectorAll("tuplet")).map((t) => ({
    type: t.getAttribute("type") as "start" | "stop",
    placement: t.getAttribute("placement") as "above" | "below" | undefined,
  }));

  const articulations = Array.from(elem.querySelectorAll("articulations")).map(
    parseArticulation
  );
  const fermata = Array.from(elem.querySelectorAll("fermata")).map(
    (f) => f.textContent as FermataShape
  );
  const accidentalMark = Array.from(
    elem.querySelectorAll("accidental-mark")
  ).map((a) => a.textContent as AccidentalValue);
  const dynamics = Array.from(elem.querySelectorAll("dynamics")).map(
    (d) => Array.from(d.children)[0].tagName.toLowerCase() as Dynamics
  );

  return {
    tied,
    slur,
    tuplet,
    articulations,
    fermata,
    accidentalMark,
    dynamics,
  };
}

export function parseNote(elem: Element): Note {
  const chord = elem.querySelector("chord") !== null;
  const pitch = elem.querySelector("pitch")
    ? parsePitch(elem.querySelector("pitch")!)
    : undefined;
  const unpitched = elem.querySelector("unpitched")
    ? parseUnpitched(elem.querySelector("unpitched")!)
    : undefined;
  const rest = elem.querySelector("rest")
    ? parseRest(elem.querySelector("rest")!)
    : undefined;
  const duration = parseInt(elem.querySelector("duration")?.textContent || "0");
  const type = elem.querySelector("type")?.textContent as NoteType | undefined;
  const accidental = elem.querySelector("accidental")?.textContent as
    | AccidentalValue
    | undefined;
  const stem = elem.querySelector("stem")?.textContent as Stem | undefined;
  const notehead = elem.querySelector("notehead")?.textContent as
    | NoteheadValue
    | undefined;
  const staff = elem.querySelector("staff")
    ? parseInt(elem.querySelector("staff")!.textContent || "1")
    : undefined;
  const beams = elem.querySelector("beam") ? parseBeams(elem) : undefined;
  const notations = elem.querySelector("notations")
    ? [parseNotation(elem.querySelector("notations")!)]
    : undefined;
  const lyrics = Array.from(elem.querySelectorAll("lyric")).map(parseLyric);
  const dots = elem.querySelectorAll("dot")
    ? elem.querySelectorAll("dot").length
    : undefined;

  return {
    chord,
    pitch,
    unpitched,
    rest,
    duration,
    type,
    dots,
    accidental,
    stem,
    notehead,
    staff,
    beams,
    notations,
    lyrics,
  };
}

export function parseHarmony(elem: Element): Harmony {
  const root = elem.querySelector("root")
    ? {
        rootStep: elem.querySelector("root-step")?.textContent as Step,
        rootAlter: elem.querySelector("root-alter")
          ? parseFloat(elem.querySelector("root-alter")!.textContent || "0")
          : undefined,
      }
    : undefined;

  const numeral = elem.querySelector("numeral")
    ? {
        numeralRoot: parseInt(
          elem.querySelector("numeral-root")?.textContent || "1"
        ) as NumeralRoot,
        numeralAlter: elem.querySelector("numeral-alter")
          ? parseFloat(elem.querySelector("numeral-alter")!.textContent || "0")
          : undefined,
        numeralKey: elem.querySelector("numeral-key")
          ? {
              numeralFifths: parseInt(
                elem.querySelector("numeral-fifths")?.textContent || "0"
              ),
              numeralMode: elem.querySelector("numeral-mode")
                ?.textContent as NumeralMode,
            }
          : undefined,
      }
    : undefined;

  const kind = elem.querySelector("kind")?.textContent as KindValue;

  const inversion = elem.querySelector("inversion")
    ? parseInt(elem.querySelector("inversion")!.textContent || "0")
    : undefined;

  const bass = elem.querySelector("bass")
    ? {
        bassSeparator:
          elem.querySelector("bass-separator")?.textContent || undefined,
        bassStep: elem.querySelector("bass-step")?.textContent as Step,
        bassAlter: elem.querySelector("bass-alter")
          ? parseFloat(elem.querySelector("bass-alter")!.textContent || "0")
          : undefined,
      }
    : undefined;

  const degree = elem.querySelector("degree")
    ? {
        degreeValue: parseInt(
          elem.querySelector("degree-value")?.textContent || "0"
        ),
        degreeAlter: parseInt(
          elem.querySelector("degree-alter")?.textContent || "0"
        ),
        degreeType: elem.querySelector("degree-type")?.textContent as
          | "add"
          | "alter"
          | "subtract",
      }
    : undefined;

  return { root, numeral, kind, inversion, bass, degree };
}

export function parseAttributes(elem: Element): Attributes {
  const divisions = elem.querySelector("divisions")
    ? parseInt(elem.querySelector("divisions")!.textContent || "0")
    : undefined;

  const keys = Array.from(elem.querySelectorAll("key")).map((keyElem) => ({
    cancel: keyElem.querySelector("cancel")
      ? parseInt(keyElem.querySelector("cancel")!.textContent || "0")
      : undefined,
    fifths: parseInt(keyElem.querySelector("fifths")?.textContent || "0"),
    mode: keyElem.querySelector("mode")?.textContent as Mode | undefined,
  }));

  const times = Array.from(elem.querySelectorAll("time")).map((timeElem) => ({
    beats: parseInt(timeElem.querySelector("beats")?.textContent || "0"),
    beatType: parseInt(timeElem.querySelector("beat-type")?.textContent || "0"),
  }));

  const staves = elem.querySelector("staves")
    ? parseInt(elem.querySelector("staves")!.textContent || "0")
    : undefined;

  const partSymbol = elem.querySelector("part-symbol")?.textContent as
    | GroupSymbolValue
    | undefined;

  const instruments = elem.querySelector("instruments")
    ? parseInt(elem.querySelector("instruments")!.textContent || "0")
    : undefined;

  const clefs = Array.from(elem.querySelectorAll("clef")).map((clefElem) => ({
    sign: clefElem.querySelector("sign")?.textContent as ClefSign,
    line: clefElem.querySelector("line")
      ? parseInt(clefElem.querySelector("line")!.textContent || "0")
      : undefined,
    staffNumber: clefElem.getAttribute("number")
      ? parseInt(clefElem.getAttribute("number") || "1")
      : undefined,
    clefOctaveChange: clefElem.querySelector("clef-octave-change")
      ? parseInt(
          clefElem.querySelector("clef-octave-change")!.textContent || "0"
        )
      : undefined,
  }));

  return {
    divisions,
    key: keys,
    time: times,
    staves,
    partSymbol,
    instruments,
    clefs,
  };
}

export function parseMeasure(elem: Element): Measure {
  const number = elem.getAttribute("number") || "1";
  const elements: {
    attributes?: Attributes;
    harmony?: Harmony;
    note?: Note;
    backup?: Backup;
    barline?: BarStyle;
  }[] = [];

  for (const child of Array.from(elem.children)) {
    switch (child.tagName) {
      case "attributes":
        elements.push({
          attributes: parseAttributes(child),
        });
        break;
      case "harmony":
        elements.push({ harmony: parseHarmony(child) });
        break;
      case "note":
        elements.push({ note: parseNote(child) });
        break;
      case "backup":
        elements.push({
          backup: {
            duration: parseInt(
              child.querySelector("duration")?.textContent || "0"
            ),
          },
        });
        break;
      case "barline":
        elements.push({
          barline: child.querySelector("barline")?.textContent as
            | BarStyle
            | undefined,
        });
    }
  }

  return { number, elements };
}

export function parsePartGroup(elem: Element): PartGroup {
  const type = elem.getAttribute("type") as "start" | "stop";
  const groupName = elem.querySelector("group-name")?.textContent || undefined;

  const groupNameDisplay = elem.querySelector("group-name-display")
    ? {
        displayText:
          elem
            .querySelector("group-name-display")
            ?.querySelector("display-text")?.textContent ?? undefined,
        accidentalText: elem
          .querySelector("group-name-display")
          ?.querySelector("accidental-text")?.textContent as AccidentalValue,
      }
    : undefined;

  const groupAbbreviation =
    elem.querySelector("group-abbreviation")?.textContent || undefined;

  const groupAbbreviationDisplay = elem.querySelector(
    "group-abbreviation-display"
  )
    ? {
        displayText:
          elem
            .querySelector("group-abbreviation-display")
            ?.querySelector("display-text")?.textContent || undefined,
        accidentalText: elem
          .querySelector("group-abbreviation-display")
          ?.querySelector("accidental-text")?.textContent as AccidentalValue,
      }
    : undefined;

  const groupSymbol = elem.querySelector("group-symbol")?.textContent as
    | GroupSymbolValue
    | undefined;
  const groupBarline = elem.querySelector("group-barline")?.textContent as
    | GroupBarlineValue
    | undefined;
  const groupTime = elem.querySelector("group-time")?.textContent === "yes";

  return {
    type,
    groupName,
    groupNameDisplay,
    groupAbbreviation,
    groupAbbreviationDisplay,
    groupSymbol,
    groupBarline,
    groupTime,
  };
}

export function parseScorePart(elem: Element): ScorePart {
  const id = elem.getAttribute("id") || "";
  const partName = elem.querySelector("part-name")?.textContent || "";

  const partNameDisplay = elem.querySelector("part-name-display")
    ? {
        displayText:
          elem.querySelector("part-name-display")?.querySelector("display-text")
            ?.textContent || undefined,
        accidentalText: elem
          .querySelector("part-name-display")
          ?.querySelector("accidental-text")?.textContent as AccidentalValue,
      }
    : undefined;

  const partAbbreviation =
    elem.querySelector("part-abbreviation")?.textContent || undefined;

  const partAbbreviationDisplay = elem.querySelector(
    "part-abbreviation-display"
  )
    ? {
        displayText:
          elem
            .querySelector("part-abbreviation-display")
            ?.querySelector("display-text")?.textContent || undefined,
        accidentalText: elem
          .querySelector("part-abbreviation-display")
          ?.querySelector("accidental-text")?.textContent as AccidentalValue,
      }
    : undefined;

  return {
    id,
    partName,
    partNameDisplay,
    partAbbreviation,
    partAbbreviationDisplay,
  };
}

export function parsePartList(elem: Element): PartList {
  const partGroups = Array.from(elem.querySelectorAll("part-group")).map(
    parsePartGroup
  );
  const scoreParts = Array.from(elem.querySelectorAll("score-part")).map(
    parseScorePart
  );
  return { partGroup: partGroups, scorePart: scoreParts };
}

export function parsePart(elem: Element): Part {
  const id = elem.getAttribute("id") || "";
  const measures = Array.from(elem.querySelectorAll("measure")).map(
    parseMeasure
  );
  return { id, measures };
}

export function parseWork(elem: Element): Work {
  return {
    workNumber: elem.querySelector("work-number")?.textContent || undefined,
    workTitle: elem.querySelector("work-title")?.textContent || undefined,
  };
}

export function parseIdentification(elem: Element): Identification {
  const creators = Array.from(elem.querySelectorAll("creator")).map(
    (creator) => ({
      type: creator.getAttribute("type") || undefined,
      value: creator.textContent || "",
    })
  );

  return { creator: creators.length > 0 ? creators : undefined };
}

export function parse(xmlString: string): ScorePartwise {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "text/xml");
  const root = doc.documentElement;

  const work = root.querySelector("work")
    ? parseWork(root.querySelector("work")!)
    : undefined;
  const identification = root.querySelector("identification")
    ? parseIdentification(root.querySelector("identification")!)
    : undefined;
  const partList = parsePartList(root.querySelector("part-list")!);
  const parts = Array.from(root.querySelectorAll("part")).map(parsePart);

  return { work, identification, partList, parts };
}
