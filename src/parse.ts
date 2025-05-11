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
  GroupSymbolValue,
} from "./type";

export function parse(xmlContent: string): ScorePartwise {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlContent, "application/xml");

  const score: ScorePartwise = {
    partList: { scorePart: [] },
    parts: [],
  };

  const getText = (el: Element | null): string | undefined =>
    el?.textContent || undefined;

  // Parse <work>
  const workElement = xml.querySelector("work");
  if (workElement) {
    score.work = {
      workNumber: getText(workElement.querySelector("work-number")),
      workTitle: getText(workElement.querySelector("work-title")),
    };
  }

  // Parse <identification>
  const identificationElement = xml.querySelector("identification");
  if (identificationElement) {
    score.identification = {
      creator: Array.from(
        identificationElement.querySelectorAll("creator")
      ).map((el) => ({
        type: el.getAttribute("type") || undefined,
        value: el.textContent || "",
      })),
    };
  }

  // Parse <score-part>
  xml.querySelectorAll("score-part").forEach((partEl) => {
    score.partList.scorePart.push({
      id: partEl.getAttribute("id") || "",
      partName: getText(partEl.querySelector("part-name")) || "",
    });
  });

  // Parse <part>
  xml.querySelectorAll("part").forEach((partEl) => {
    const part: Part = {
      id: partEl.getAttribute("id") || "",
      measures: [],
    };

    partEl.querySelectorAll("measure").forEach((measureEl) => {
      const measure: Measure = {
        number: measureEl.getAttribute("number") || "",
        elements: [],
        attributes: undefined,
      };

      // Parse <attributes>
      const attrEl = measureEl.querySelector("attributes");
      if (attrEl) {
        const attr: Attributes = {};

        const divisionsEl = attrEl.querySelector("divisions");
        if (divisionsEl)
          attr.divisions = parseInt(divisionsEl.textContent || "0");

        const keyEl = attrEl.querySelector("key");
        if (keyEl) {
          attr.key = [
            {
              fifths: parseInt(
                keyEl.querySelector("fifths")?.textContent || "0"
              ),
            },
          ];
        }

        const timeEl = attrEl.querySelector("time");
        if (timeEl) {
          attr.time = [
            {
              beats: parseInt(
                timeEl.querySelector("beats")?.textContent || "0"
              ),
              beatType: parseInt(
                timeEl.querySelector("beat-type")?.textContent || "0"
              ),
            },
          ];
        }

        const stavesEl = attrEl.querySelector("staves");
        if (stavesEl)
          attr.staves = parseInt(stavesEl.textContent || "1") as number;

        const partSymbolEl = attrEl.querySelector("part-symbol");
        if (partSymbolEl) {
          attr.partSymbol = partSymbolEl.textContent as GroupSymbolValue;
        }

        const instrumentsEl = attrEl.querySelector("instruments");
        if (instrumentsEl) {
          attr.instruments = parseInt(instrumentsEl.textContent || "0");
        }

        const clefEl = attrEl.querySelector("clef");
        if (clefEl) {
          attr.clefs = [
            {
              sign: getText(clefEl.querySelector("sign")) as ClefSign,
              line: parseInt(clefEl.querySelector("line")?.textContent || "0"),
            },
          ];
        }

        measure.attributes = attr;
      }

      // Parse elements in <measure> (notes, backups)
      measureEl.childNodes.forEach((child) => {
        if (!(child instanceof Element)) return;

        if (child.tagName === "note") {
          const note: Note = {
            chord: !!child.querySelector("chord"),
            duration: parseInt(
              child.querySelector("duration")?.textContent || "0"
            ),
            dots: child.querySelectorAll("dot").length,
            staff: child.querySelector("staff")
              ? parseInt(child.querySelector("staff")?.textContent || "0")
              : undefined,
          };

          const pitchEl = child.querySelector("pitch");
          if (pitchEl) {
            note.pitch = {
              step: getText(pitchEl.querySelector("step")) as Step,
              octave: parseInt(
                getText(pitchEl.querySelector("octave")) || "0"
              ) as Octave,
              alter: pitchEl.querySelector("alter")
                ? parseInt(getText(pitchEl.querySelector("alter")) || "0")
                : undefined,
            };
          }

          const restEl = child.querySelector("rest");
          if (restEl) {
            note.rest = {
              measure: restEl.getAttribute("measure") as Rest["measure"],
              displayStep: getText(
                restEl.querySelector("display-step")
              ) as Step,
              displayOctave: parseInt(
                getText(restEl.querySelector("display-octave")) || "0"
              ) as Octave,
            };
          }

          const type = getText(child.querySelector("type"));
          if (type) note.type = type as NoteType;

          const accidental = getText(child.querySelector("accidental"));
          if (accidental) note.accidental = accidental as AccidentalValue;

          const lyrics = child.querySelectorAll("lyric");
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

        if (child.tagName === "backup") {
          const duration = child.querySelector("duration");
          if (duration) {
            measure.elements.push({
              backup: {
                duration: parseInt(duration.textContent || "0"),
              },
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
