import { useState, useEffect, useRef } from 'react';
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
import { ChordBox } from './components/ChordBox';
import { ChordDisplay } from './components/ChordDisplay';

const defaultTuning = ['E', 'A', 'D', 'G', 'B', 'E'];

const App = () => {
  const [fingerPositions, setFingerPositions] = useState([]);
  const [tuning, setTuning] = useState([...defaultTuning]);
  const [showInfo, setShowInfo] = useState(false);
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

  const popupRef = useRef(null);
  const infoButtonRef = useRef(null);

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
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        if (infoButtonRef.current && !infoButtonRef.current.contains(event.target)) {
          setShowInfo(false);
        }
      }
    };
  
    let timeoutId;
    
    if (showInfo) {
      document.addEventListener('mousedown', handleClickOutside);
      timeoutId = setTimeout(() => {
        setShowInfo(false);
      }, 4000);
    }
  
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [showInfo]);

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
    <div className="ipad-scale w-full h-full flex items-center align-center justify-center">
      <div className="WholePageContainer w-screen h-screen flex items-center justify-center overflow-x-hidden">
        <section className="MainPage flex flex-col m-auto xl:w-1/2 lg:w-3/4 m:w-3/2 sm:w-full h-full">
          <div className='title-scooch relative'>
            <header className="Title font-sans ml-4 mr-4 mt-4 font-bold text-5xl xl:pt-3 pb-6 xl:pb-2 relative" style={{ fontSize: '2.5rem'}}>
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
                
                {/* Info circle with popup */}
                <div className="absolute right-0 xl:right-1/10 font-normal ml-4">
                  <motion.div
                    ref={infoButtonRef}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowInfo(!showInfo);
                    }}
                  >
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
                      <text
                        x="20"
                        y="30"
                        textAnchor="middle"
                        fill="black"
                        fontSize="15"
                      >
                        i
                      </text>
                    </svg>
                  </motion.div>
                  
                  {/* Popup modal */}
                  <AnimatePresence>
                    {showInfo && (
                      <motion.div
                      ref={popupRef}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-50 bg-white rounded-lg shadow-lg p-4 z-50 border border-gray-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center mb-2">
                        <a 
                          href="https://github.com/notcarlybates" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center"
                        >
                          <svg
                            className="w-5 h-5 mr-2"
                            aria-hidden="true"
                            fill={"currentColor"}
                            viewBox="0 0 24 24"
                          >
                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-gray-800 hover:text-blue-600">Made by Carly Bates</span>
                          {/* <span className={`text-sm text-gray-800 hover:text-[${bg300}]`}>Made by Carly Bates */}

                        </a>
                      </div>
                      <p className="text-sm text-gray-600">User guide coming soon.</p>
                    </motion.div>
                      
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </header>
          </div>
          
          <div className="MainBox flex-grow dvh-screen w-full shrink flex flex-col justify-evenly align-center items-center mt-4 xl:mt-2 px-4">
            <div className="ChordSelect font-sans flex w-full h-auto justify-center pb-6 xl:pb-2">
              <ChordSelector 
                onSelect={handleChordSelect} 
                onTuningChange={handleTuningChange}
                currentTuning={tuning}
                initialChord={chordState}
                selectedChord={selectedChord}
              />
          </div>

            <div className="ContentContainer flex-1 min-h-0 h-1/5 w-full flex flex-col items-center pt-10 xl:pt-0 mx-4">
              <div className="
                  FretboardContainer w-full flex justify-center items-center
                  h-[230px]  // Default for all screens
                  xs:h-[200px] // 400px+
                  sm:h-[265px] // 640px+
                  md:h-[265px] // 768px+
                  lg:h-[270px] // Large screens
                  xl:h-[378px] // Extra large
                  ">

                  <Fretboard
                    width="100%"
                    height="100%"
                    maxWidth = '420'
                    maxHeight = '300'
                    numFrets={4}
                    numStrings={6}
                    tuning={tuning}
                    currentChord={currentChord}
                    fingerPositions={fingerPositions}
                  />
              </div>
                        
              <div className='Generation w-full max-w-[800px] flex flex-col font-extralight justify-center items-center mt-10 xl:mt-0'>
                <motion.button
                  onClick={handleGenerateProgression}
                  disabled={isGenerating}
                  className="rounded-lg font-sans text-base sm:text-lg md:text-xl px-4 py-3 sm:px-6"
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
      </div>
  );
};

export default App;