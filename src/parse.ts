// parse.ts
import {
  AccidentalValue,
  ClefSign,
  ScorePartwise,
  Part,
  Measure,
  Note,
  Rest,
  Lyric,
  Step,
  Octave,
  Attributes,
  NoteType,
} from "./type";

export function parse(xmlContent: string): ScorePartwise {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlContent, "application/xml");

  const score: ScorePartwise = {
    partList: {
      scorePart: [],
    },
    parts: [],
  };

  const getText = (el: Element | null) => el?.textContent || undefined;

  // Work
  const workEl = xml.querySelector("work");
  if (workEl) {
    score.work = {
      workNumber: getText(workEl.querySelector("work-number")),
      workTitle: getText(workEl.querySelector("work-title")),
    };
  }

  // Identification
  const idEl = xml.querySelector("identification");
  if (idEl) {
    score.identification = {
      creator: Array.from(idEl.querySelectorAll("creator")).map((creator) => ({
        type: creator.getAttribute("type") || undefined,
        value: creator.textContent || "",
      })),
    };
  }

  // Part list
  xml.querySelectorAll("score-part").forEach((el) => {
    score.partList.scorePart.push({
      id: el.getAttribute("id") || "",
      partName: getText(el.querySelector("part-name")) || "",
    });
  });

  // Parts and measures
  xml.querySelectorAll("part").forEach((partEl) => {
    const part: Part = {
      id: partEl.getAttribute("id") || "",
      measures: [],
    };

    partEl.querySelectorAll("measure").forEach((measureEl) => {
      const measure: Measure = {
        number: measureEl.getAttribute("number") || "",
        elements: [],
        attributes: [],
      };

      const attrEl = measureEl.querySelector("attributes");
      if (attrEl) {
        const attr: Attributes = {};

        const divisions = attrEl.querySelector("divisions");
        if (divisions) attr.divisions = parseInt(divisions.textContent || "0");

        const key = attrEl.querySelector("key");
        if (key) {
          attr.key = [
            {
              fifths: parseInt(key.querySelector("fifths")?.textContent || "0"),
            },
          ];
        }

        const time = attrEl.querySelector("time");
        if (time) {
          attr.time = [
            {
              beats: parseInt(time.querySelector("beats")?.textContent || "0"),
              beatType: parseInt(
                time.querySelector("beat-type")?.textContent || "0"
              ),
            },
          ];
        }

        const clef = attrEl.querySelector("clef");
        if (clef) {
          attr.clefs = [
            {
              sign: getText(clef.querySelector("sign")) as ClefSign,
              line: parseInt(clef.querySelector("line")?.textContent || "0"),
            },
          ];
        }

        measure.attributes?.push(attr);
      }

      // Elements: notes & backups
      measureEl.childNodes.forEach((node) => {
        if (!(node instanceof Element)) return;

        if (node.tagName === "note") {
          const noteEl = node;
          const note: Note = {
            chord: !!noteEl.querySelector("chord"),
            duration: parseInt(
              noteEl.querySelector("duration")?.textContent || "0"
            ),
            dots: noteEl.querySelectorAll("dot").length,
            staff: noteEl.querySelector("staff")
              ? parseInt(noteEl.querySelector("staff")?.textContent || "0")
              : undefined,
          };

          const pitch = noteEl.querySelector("pitch");
          if (pitch) {
            note.pitch = {
              step: getText(pitch.querySelector("step")) as Step,
              octave: parseInt(
                getText(pitch.querySelector("octave")) || "0"
              ) as Octave,
              alter: pitch.querySelector("alter")
                ? parseInt(getText(pitch.querySelector("alter")) || "0")
                : undefined,
            };
          }

          const rest = noteEl.querySelector("rest");
          if (rest) {
            note.rest = {
              measure: rest.getAttribute("measure") as Rest["measure"],
              displayStep: getText(rest.querySelector("display-step")) as Step,
              displayOctave: parseInt(
                getText(rest.querySelector("display-octave")) || "0"
              ) as Octave,
            };
          }

          const type = getText(noteEl.querySelector("type"));
          if (type) note.type = type as NoteType;

          const accidental = getText(noteEl.querySelector("accidental"));
          if (accidental) note.accidental = accidental as AccidentalValue;

          const lyrics = noteEl.querySelectorAll("lyric");
          if (lyrics.length) {
            note.lyrics = Array.from(lyrics).map<Lyric>((lyricEl) => ({
              syllabic: getText(
                lyricEl.querySelector("syllabic")
              ) as Lyric["syllabic"],
              text: getText(lyricEl.querySelector("text")) || "",
            }));
          }

          measure.elements.push({ note });
        }

        if (node.tagName === "backup") {
          const durationEl = node.querySelector("duration");
          if (durationEl) {
            measure.elements.push({
              backup: { duration: parseInt(durationEl.textContent || "0") },
            });
          }
        }
      });

      part.measures.push(measure);
    });

    score.parts.push(part);
  });

  return score;
}
