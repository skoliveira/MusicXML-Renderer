import React, { useState } from "react";
import { parse } from "./parse";
import { ScorePartwise } from "./type";
import { MusicRenderer } from "./components/MusicRenderer";

const App: React.FC = () => {
  const [musicData, setMusicData] = useState<ScorePartwise>();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      file.text().then((text) => {
        const parsed = parse(text);
        setMusicData(parsed);
      });
    }
  };

  return (
    <div>
      <h1>MusicXML Renderer</h1>
      <input type="file" accept=".xml,.musicxml" onChange={handleFileChange} />
      {musicData && <MusicRenderer score={musicData} />}
    </div>
  );
};

export default App;
