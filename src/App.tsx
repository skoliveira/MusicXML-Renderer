import React, { useState } from "react";
import { parseMusicXML, NoteData } from "./utils/parseMusicXML";
import { MusicRenderer } from "./components/MusicRenderer";

const App: React.FC = () => {
  const [musicData, setMusicData] = useState<NoteData[][]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      file.text().then((text) => {
        const parsed = parseMusicXML(text);
        setMusicData(parsed);
      });
    }
  };

  return (
    <div>
      <h1>MusicXML Renderer</h1>
      <input type="file" accept=".xml,.musicxml" onChange={handleFileChange} />
      {musicData.length > 0 && <MusicRenderer music={musicData} />}
    </div>
  );
};

export default App;
