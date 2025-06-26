# MusicXML Renderer

A modern React-based renderer for MusicXML files, built with TypeScript and Vite. This application allows you to visualize and render musical scores from MusicXML files directly in the browser.

## Features

- Renders MusicXML files with high fidelity
- Support for various musical notation elements:
  - Notes and rests
  - Clefs and key signatures
  - Time signatures
  - Accidentals
  - Chord symbols
  - Slurs and ties
  - Tablature notation
  - Fretboard diagrams
- Uses custom font (Bravura) for musical symbols
- Built with modern web technologies (React, TypeScript, Vite)

## Installation

```bash
# Clone the repository
git clone [your-repo-url]
cd MusicXML-Renderer

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Usage

1. Place your MusicXML files in the `src/assets` directory
2. Import and use the `MusicRenderer` component in your React application:

```tsx
import { MusicRenderer } from "./components/MusicRenderer";

function App() {
  return <MusicRenderer musicXmlFile="path/to/your/file.musicxml" />;
}
```

## Project Structure

- `src/components/` - React components for rendering different musical elements
- `src/assets/` - MusicXML files and fonts
- `src/parse.ts` - MusicXML parsing logic
- `src/type.ts` - TypeScript type definitions

## Development

```bash
# Run in development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
