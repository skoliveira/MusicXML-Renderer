export interface NoteData {
  step?: string;
  octave?: number;
  duration: number;
  type: string;
  isRest: boolean;
}

export function parseMusicXML(xmlString: string): NoteData[][] {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlString, "application/xml");
  const measures = Array.from(xml.getElementsByTagName("measure"));

  return measures.map((measure) => {
    const notes = Array.from(measure.getElementsByTagName("note"));
    return notes.map((note) => {
      const isRest = note.getElementsByTagName("rest").length > 0;
      const step = isRest
        ? undefined
        : note.getElementsByTagName("step")[0]?.textContent || "";
      const octave = isRest
        ? undefined
        : parseInt(
            note.getElementsByTagName("octave")[0]?.textContent || "4",
            10
          );
      const duration = parseInt(
        note.getElementsByTagName("duration")[0]?.textContent || "1",
        10
      );
      const type =
        note.getElementsByTagName("type")[0]?.textContent || "quarter";

      return { step, octave, duration, type, isRest };
    });
  });
}
