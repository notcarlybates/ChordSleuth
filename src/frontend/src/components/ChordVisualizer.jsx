import { useState } from 'react';
import ChordSelector from './ChordSelector';
import Fretboard from './Fretboard';

// Sample chord data (use actual dataset in production)
const chordData = [
  {
    CHORD_ROOT: 'C#',
    CHORD_TYPE: 'min',
    FINGER_POSITIONS: 'x,x,2,4,1,3',
    TUNING: ['E', 'A', 'D', 'G', 'B', 'E']
  },
  {
    CHORD_ROOT: 'C#',
    CHORD_TYPE: '9(#11)',
    FINGER_POSITIONS: 'x,2,1,3,4,1',
    TUNING: ['C#', 'G#', 'C#', 'F#', 'G#', 'C#']
  },
  // Add more chords as necessary
];

const ChordVisualizer = () => {
  const [selectedChord, setSelectedChord] = useState({ chord: 'Cmaj7', fret: 3 });

  const handleChordSelect = ({ chord, fret }) => {
    setSelectedChord({ chord, fret });
  };

  // Find the first chord that matches the selected root and type
  const selectedChordData = chordData.find(
    (chord) =>
      `${chord.CHORD_ROOT}${chord.CHORD_TYPE}` === selectedChord.chord
  );

  const fingerPositions = selectedChordData?.FINGER_POSITIONS
    ? selectedChordData.FINGER_POSITIONS.split(',')
    : [];

  return (
    <div className="ChordVisualizer">
      <ChordSelector onSelect={handleChordSelect} />
      {selectedChordData && (
        <Fretboard
          width={420}
          height={250}
          numFrets={24}
          numStrings={6}
          tuning={selectedChordData.TUNING}
          fingerPositions={fingerPositions}
        />
      )}
    </div>
  );
};

export default ChordVisualizer;
