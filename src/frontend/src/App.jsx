import { useState } from 'react';
import Fretboard from './components/Fretboard';
import ChordSelector from './components/ChordSelector';
import sendDataToBackend from './api/sendDataToBackend';
import './App.css';

const defaultTuning = ['E', 'A', 'D', 'G', 'B', 'E'];

const ChordBox = ({ chord, size = 'h-full w-full', fontsize = 'text-3lg', color = 'bg-red-200', isSquare = true }) => (
  <div
    className={`mx-5 flex items-center justify-center rounded-lg shrink font-thin font-sans text-2xl ${fontsize} ${size} ${color} ${
      isSquare ? 'aspect-square' : ''
    }`}
  >
    {chord}
  </div>
);

const ChordDisplay = () => (
  <div className="ChordDisplay flex items-center justify-center font-light shrink text-xl sm:text-2xl md:text-3xl lg:text-4xl w-full h-full mx-2 mt-6 sm:mx-3 md:mx-4 md:w-5/6 lg:mx-5 lg:w-3/4">
    <ChordBox chord='D#' />
    <ChordBox chord="Amaj7" color="bg-green-200" />
    <ChordBox chord="Em" color="bg-sky-200" />
    <ChordBox chord="Asus4" color="bg-fuchsia-200" />
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
        // Update chord state
        setChordState({ root, modifier, fret });
      }
    } catch (error) {
      console.error('Error sending chord data:', error);
    }
  };

  const handleTuningChange = (newTuning) => {
    setTuning(newTuning);
    // Re-trigger chord calculation with new tuning using current chord state
    handleChordSelect({ 
      root: chordState.root, 
      modifier: chordState.modifier, 
      fret: chordState.fret,
      tuning: newTuning 
    });
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
          left: 'calc(50% + 2.5rem)', // Adjust this value to position over the "O"
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
  {/* ChordSelect remains the same */}
  <div className="ChordSelect flex w-full h-auto justify-center mb-6">
    <ChordSelector 
      onSelect={handleChordSelect} 
      onTuningChange={handleTuningChange}
      currentTuning={tuning}
      initialChord={chordState}
    />
  </div>

  {/* New container for Fretboard and Generation */}
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
        chord="regenerate"
        isSquare={false}
        size="px-6 pt-2 pb-3"
        fontsize="text-xl"
        color="bg-red-200 hover:bg-red-300 transition cursor-pointer"
      />
      <ChordDisplay />
    </div>
  </div>
</div>
      </section>
    </div>
  );
};

export default App;