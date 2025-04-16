import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Fretboard from './components/Fretboard';
import ChordSelector from './components/ChordSelector';
import React from 'react';
import './index.css';
import sendDataToBackend from './api/sendDataToBackend';
import sendProgressionRequest from './api/sendProgressionRequest';
import chordColors from './utils/chordColors';
import animationConfig from './utils/animateConfig';
import './App.css';

const defaultTuning = ['E', 'A', 'D', 'G', 'B', 'E'];

const ChordBox = ({
  chord,
  size = 'h-full w-4/5',
  fontsize = 'text-xl font-light',
  isSquare = true,
  onClick,
  isSelected = false
}) => {
  const colors = chordColors[chord] || chordColors['Cmaj'];
  const bg100 = colors?.[100]?.hex || '#fecaca';
  const bg200 = colors?.[200]?.hex || '#fca5a5';
  const bg300 = colors?.[300]?.hex || '#f87171';

  return (
    <motion.div
    className={`relative mx-2 sm:mx-3 md:mx-4 lg:mx-5 flex items-center font-sans justify-center rounded-lg max-w-25 shrink font-sans ${fontsize} ${size} ${
    isSquare ? 'aspect-square' : ''
      } ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        backgroundColor: bg200
      }}
      whileHover={{
        scale: 1.05,
        transition: { 
          type: 'spring',
          stiffness: 400,
          damping: 10
        }
      }}
      whileTap={{
        scale: 0.95,
        transition: { duration: 0.1 }
      }}
      transition={{
        duration: animationConfig.COLOR_TRANSITION,
        ease: 'easeOut'
      }}
    >
      {/* Background layer */}
      <motion.div
        className="absolute w-full h-full rounded-lg z-0"
        initial={{ backgroundColor: bg200 }}
        animate={{ backgroundColor: bg200 }}
        transition={{ duration: animationConfig.COLOR_TRANSITION }}
      />
      
      {/* Decorative back boxes with enhanced animations */}
      <AnimatePresence>
      {isSelected && (
        <>
          <motion.div
            className="absolute w-4/5 h-4/5 z-0 rounded-lg"
            style={{ backgroundColor: bg300 }}
            initial={{ 
              top: 0, 
              left: 0,
              opacity: 0
            }}
            animate={{ 
              top: '-0.5rem', 
              left: '-0.5rem',
              opacity: 1
            }}
            exit={{
              top: 0,
              left: 0,
              opacity: 0
            }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 15,
              delay: 0.1
            }}
          />
          <motion.div
            className="absolute w-4/5 h-4/5 z-0 rounded-lg"
            style={{ backgroundColor: bg100 }}
            initial={{ 
              bottom: 0, 
              right: 0,
              opacity: 0
            }}
            animate={{ 
              bottom: '-0.5rem', 
              right: '-0.5rem',
              opacity: 1
            }}
            exit={{
              bottom: 0,
              right: 0,
              opacity: 0
            }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 15,
              delay: 0.15
            }}
          />
        </>
      )}
      </AnimatePresence>
      
      {/* Chord text */}
      <motion.div 
  className="absolute w-full h-full z-0 rounded-lg flex items-center justify-center"

        style={{ backgroundColor: bg200 }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          delay: 0.2,
          type: 'spring',
          stiffness: 500
        }}
      >
        <div className="z-20">{chord}</div>
        </motion.div>
      </motion.div>
  );
};

const ChordDisplay = ({ chords, onChordClick, selectedChordIndex }) => {
  // Ensure we always have 4 items, filling with empty strings if needed
  const displayChords = Array(4).fill('').map((_, i) => chords[i] || '');

  return (
    <motion.div
      className="ChordDisplay flex items-center justify-center font-thin shrink text-xl sm:text-xl md:text-3xl lg:text-4xl w-full h-full mx-2 mt-6 sm:mx-3 md:mx-3 sm:md:w-5/6 lg:mx-5 lg:w-3/4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: animationConfig.COLOR_TRANSITION }}
    >
      {displayChords.map((chord, index) => (
        <ChordBox
          key={index}
          chord={chord || ' '}
          onClick={() => chord && onChordClick(chord, index)}
          isSelected={index === selectedChordIndex && !!chord}
        />
      ))}
    </motion.div>
  );
};



const App = () => {
  const [fingerPositions, setFingerPositions] = useState([]);
  const [tuning, setTuning] = useState([...defaultTuning]);
  const [chordState, setChordState] = useState({
    root: 'C',
    modifier: 'maj7',
    fret: 1
  });
  const [progression, setProgression] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedChord, setSelectedChord] = useState(null);
  const [selectedChordIndex, setSelectedChordIndex] = useState(0);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [progressionData, setProgressionData] = useState(null);
  const [currentChord, setCurrentChord] = useState('');

  const currentColors = chordColors[`${chordState.root}${chordState.modifier}`] || chordColors['Cmaj'];
  const bg200 = currentColors[200].hex;
  const bg300 = currentColors[300].hex;

  const normalizeChordName = (chord) => {
    if (!chord) return '';
    return chord.replace(/\s+/g, '').toUpperCase();
  };

  const rotateArray = (arr, n) => {
    const len = arr.length;
    n = n % len;
    return arr.slice(n).concat(arr.slice(0, n));
  };

  useEffect(() => {
    if (hasGenerated && currentChord && progressionData) {
      const normalizedCurrent = normalizeChordName(currentChord);
      const normalizedStarting = normalizeChordName(progressionData.starting_chord);
      const inSequence = progressionData.full_sequence.some(
        chord => normalizeChordName(chord) === normalizedCurrent
      );

      if (normalizedCurrent !== normalizedStarting && !inSequence) {
        setProgression([]);
        setHasGenerated(false);
        setProgressionData(null);
        setSelectedChordIndex(0);
      }
    }
  }, [currentChord]);

  const handleChordSelect = async ({ root, modifier, fret, tuning: newTuning }) => {
    const chord = `${root}${modifier}`;
    setCurrentChord(chord);
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
        let newProgression = [...result.full_sequence];
        const normalizedCurrent = normalizeChordName(selectedChord || currentChord);
  
        // Find the index of our current chord in the new progression
        const currentChordIndex = newProgression.findIndex(
          chord => normalizeChordName(chord) === normalizedCurrent
        );
  
        if (currentChordIndex !== -1 && selectedChordIndex !== null) {
          // Instead of rotating, create a new array with the chord in the desired position
          const rotatedProgression = [];
          const progressionLength = newProgression.length;
          
          // Fill the progression ensuring our selected chord is at selectedChordIndex
          for (let i = 0; i < 4; i++) {
            const offset = i - selectedChordIndex;
            const sourceIndex = (currentChordIndex + offset + progressionLength) % progressionLength;
            rotatedProgression[i] = newProgression[sourceIndex] || '';
          }
  
          newProgression = rotatedProgression;
        }
  
        setProgression(newProgression);
        setProgressionData({ ...result, full_sequence: newProgression });
        setHasGenerated(true);
        setCurrentChord(startingChord);
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
    const normalizedChord = normalizeChordName(chord);
    setSelectedChord(normalizedChord);
    setSelectedChordIndex(index);

    const rootMatch = chord.match(/^[A-G][#b]?/);
    const modifierMatch = chord.match(/[^A-G#b].*/);

    if (rootMatch && modifierMatch) {
      const newRoot = rootMatch[0];
      const newModifier = modifierMatch[0];

      setChordState((prev) => ({
        ...prev,
        root: newRoot,
        modifier: newModifier
      }));

      handleChordSelect({
        root: newRoot,
        modifier: newModifier,
        fret: chordState.fret,
        tuning
      });
    }
  };

  return (
    <div className="WholePageContainer w-screen h-screen flex items-center justify-center overflow-hidden">
      <section className="MainPage flex flex-col m-auto xl:w-1/2 lg:w-3/4 m:w-3/2 sm:w-full h-full">
      <header className="Title font-sans ml-4 mt-8 font-bold text-5xl pb-6 relative" style={{ fontSize: '2.5rem'}}>
      <div className="flex items-center gap-0">
  <span>ch</span>
  <svg 
    width="40" 
    height="40"
    viewBox="0 0 40 40"
    className="block -mx-1"
    style={{ width: '40px', height: '40px' }}
  >
    <circle
      cx="20"
      cy="25"
      r="15"
      fill={bg200}
      animate={{ fill: bg200 }}
      transition={{ duration: animationConfig.COLOR_TRANSITION }}
    />
  </svg>
  <span>rd sleuth</span>
</div>
</header>
        
        <div className="MainBox flex-grow dvh-screen w-full shrink flex flex-col justify-evenly items-center mt-8 px-4">
          <div className="ChordSelect font-sans flex w-full h-auto justify-center pb-6">
            <ChordSelector 
              onSelect={handleChordSelect} 
              onTuningChange={handleTuningChange}
              currentTuning={tuning}
              initialChord={chordState}
              selectedChord={selectedChord}
            />
          </div>

          <div className="ContentContainer flex-1 min-h-0 h-1/5 w-full flex flex-col items-center mx-4">
          <div className="
              FretboardContainer w-full flex justify-center items-center
              h-[270px]  // Default for all screens
              xs:h-[200px] // 400px+
              sm:h-[320px] // 640px+
              md:h-[380px] // 768px+
              lg:h-[400px]       // Large screens
              xl:h-[500px]       // Extra large
            ">
              <Fretboard
                width="100%"
                height="100%"
                maxWidth = '420'
                maxHeight = '350'
                numFrets={4}
                numStrings={6}
                tuning={tuning}
                currentChord={currentChord}
                fingerPositions={fingerPositions}
              />
            </div>
                      
            <div className='Generation w-full max-w-[800px] flex flex-col font-thin justify-center items-center mt-8'>
              <motion.button
                onClick={handleGenerateProgression}
                disabled={isGenerating}
                className="rounded-lg font-sans text-base sm:text-lg md:text-xl font-extralight px-4 py-3 sm:px-6"
                style={{
                  backgroundColor: bg200,
                  padding: '0.8rem 1.0rem'
                }}
                whileHover={{
                  scale: 1.03,
                  transition: { duration: 0.15, ease: 'easeOut' }
                }}
                whileTap={{
                  scale: 0.98,
                  transition: { duration: 0.1 }
                }}
              >
                {isGenerating 
                  ? 'generating...'
                  : hasGenerated && progression.length > 0
                    ? 'regenerate'
                    : 'generate progression'}
              </motion.button>
              
              {hasGenerated && progression.length > 0 && (
                <ChordDisplay 
                  chords={progression} 
                  onChordClick={handleChordClick}
                  selectedChordIndex={selectedChordIndex}
                  
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default App;