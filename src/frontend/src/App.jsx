import { useState } from 'react';
import Fretboard from './components/Fretboard';
import ChordSelector from './components/ChordSelector';
import sendDataToBackend from './api/sendDataToBackend';
import sendProgressionRequest from './api/sendProgressionRequest';
import './App.css';

const defaultTuning = ['E', 'A', 'D', 'G', 'B', 'E'];

const ChordBox = ({ chord, size = 'h-full w-full', fontsize = 'text-3lg', color = 'bg-red-200', isSquare = true, onClick, isSelected = false }) => {
  // Map original colors to their 300-level variants
  const colorMap = {
    'bg-red-200': 'bg-red-300',
    'bg-green-200': 'bg-green-300',
    'bg-sky-200': 'bg-sky-300',
    'bg-fuchsia-200': 'bg-fuchsia-300',
  };

  const selectedColor = colorMap[color] || 'bg-sky-300'; // Fallback if color not mapped

  return (
    <div
      className={`mx-5 flex items-center justify-center rounded-lg shrink font-thin font-sans text-2xl ${fontsize} ${size} ${
        isSelected ? selectedColor : color
      } ${
        isSquare ? 'aspect-square' : ''
      } ${onClick ? 'cursor-pointer hover:opacity-80 transition' : ''}`}
      onClick={onClick}
    >
      {chord}
    </div>
  );
};

const ChordDisplay = ({ chords, onChordClick, selectedChordIndex }) => (
  <div className="ChordDisplay flex items-center justify-center font-light shrink text-xl sm:text-2xl md:text-3xl lg:text-4xl w-full h-full mx-2 mt-6 sm:mx-3 md:mx-4 md:w-5/6 lg:mx-5 lg:w-3/4">
    {chords.map((chord, index) => (
      <ChordBox 
        key={index} 
        chord={chord} 
        color={index === 0 ? 'bg-red-200' : ['bg-green-200', 'bg-sky-200', 'bg-fuchsia-200'][index - 1]}
        onClick={() => onChordClick(chord, index)}
        isSelected={index === selectedChordIndex}
      />
    ))}
  </div>
);

const App = () => {
  const [fingerPositions, setFingerPositions] = useState([]);
  const [tuning, setTuning] = useState([...defaultTuning]);
  const [chordState, setChordState] = useState({
    root: 'D',
    modifier: 'maj7',
    fret: 3
  });
  const [progression, setProgression] = useState(['Cmaj', 'F', 'G', 'Am']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedChord, setSelectedChord] = useState(null);
  const [selectedChordIndex, setSelectedChordIndex] = useState(null); // Track selected chord index

  const handleChordSelect = async ({ root, modifier, fret, tuning: newTuning }) => {
    try {
      const fing = await sendDataToBackend({ 
        root, 
        modifier, 
        fret, 
        tuning: newTuning || tuning 
      });
      if (fing) {
        setFingerPositions(fing);
        setChordState({ root, modifier, fret });
      }
    } catch (error) {
      console.error('Error sending chord data:', error);
    }
  };

  const handleGenerateProgression = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    try {
      const startingChord = `${chordState.root}${chordState.modifier}`;
      const result = await sendProgressionRequest({ starting_chord: startingChord });
      
      if (result?.full_sequence) {
        let newProgression = result.full_sequence;
        
        // Check if the selected chord exists in the progression
        if (selectedChord && !newProgression.includes(selectedChord)) {
          // If the selected chord is not in the progression, reset the progression state
          setProgression([]);
        } else {
          // If a chord was selected, we keep its position in the progression
          if (selectedChordIndex !== null && selectedChord) {
            const selectedChordInProgression = progression[selectedChordIndex];
            const selectedIndex = newProgression.indexOf(selectedChordInProgression);
            
            // Ensure the selected chord stays in its previous position
            if (selectedIndex !== selectedChordIndex) {
              const temp = newProgression[selectedChordIndex];
              newProgression[selectedChordIndex] = selectedChordInProgression;
              newProgression[selectedIndex] = temp;
            }
          }

          setProgression(newProgression);
        }
      }
    } catch (error) {
      console.error('Error generating progression:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTuningChange = (newTuning) => {
    setTuning(newTuning);
    handleChordSelect({ 
      root: chordState.root, 
      modifier: chordState.modifier, 
      fret: chordState.fret,
      tuning: newTuning 
    });
  };

  const handleChordClick = (chord, index) => {
    setSelectedChord(chord);
    setSelectedChordIndex(index); // Store the selected chord index

    // Parse the clicked chord and update the selector
    const rootMatch = chord.match(/^[A-G][#b]?/);
    const modifierMatch = chord.match(/[^A-G#b].*/);
    
    if (rootMatch && modifierMatch) {
      const newRoot = rootMatch[0];
      const newModifier = modifierMatch[0];
      
      setChordState(prev => ({
        ...prev,
        root: newRoot,
        modifier: newModifier
      }));
      
      // Trigger chord selection update
      handleChordSelect({ 
        root: newRoot, 
        modifier: newModifier, 
        fret: chordState.fret,
        tuning 
      });
    }
  };

  return (
    <div className="WholePageContainer w-dvw h-dvh items-center align-center shrink">
      <section className="MainPage flex flex-col m-auto xl:w-1/2 lg:w-3/4 m:w-3/2 sm:w-3/4 h-dvh">
        <header className="Title font-sans ml-4 mt-8 font-bold text-5xl relative">
          chord sleuth
          <svg 
            className="ransform translate-x-12 -translate-y-10" 
            width="40" 
            height="40"
            style={{
              left: 'calc(50% + 2.5rem)',
              top: '50%'
            }}
          >
            <circle
              cx="20"
              cy="20"
              r="15"
              fill="rgb(254, 202, 202)"
            />
          </svg>
        </header>
        <div className="MainBox h-full w-full shrink flex flex-col justify-evenly items-center mt-8">
          <div className="ChordSelect flex w-full h-auto justify-center mb-6">
            <ChordSelector 
              onSelect={handleChordSelect} 
              onTuningChange={handleTuningChange}
              currentTuning={tuning}
              initialChord={chordState}
              selectedChord={selectedChord}
            />
          </div>

          <div className="ContentContainer flex-1 min-h-0 w-full flex flex-col items-center">
            <div className="FretboardContainer flex-1 min-h-0 w-full flex justify-center items-center">
              <Fretboard
                width="100%"
                height="100%"
                maxWidth={420}
                maxHeight={250}
                numFrets={4}
                numStrings={6}
                tuning={tuning}
                fingerPositions={fingerPositions}
              />
            </div>
            
            <div className='Generation flex-none w-full flex flex-col justify-center items-center mt-4 mb-10'>
              <ChordBox
                chord={isGenerating ? "Generating..." : "Generate Progression"}
                isSquare={false}
                size="px-6 pt-2 pb-3"
                fontsize="text-xl"
                color="bg-red-200 hover:bg-red-300 transition"
                onClick={handleGenerateProgression}
              />
              <ChordDisplay 
                chords={progression} 
                onChordClick={handleChordClick}
                selectedChordIndex={selectedChordIndex} // Pass the selected index
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default App
