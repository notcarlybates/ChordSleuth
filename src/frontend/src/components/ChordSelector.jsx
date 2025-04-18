import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import sendDataToBackend from '../api/sendDataToBackend';
import chordColors from '../utils/chordColors';

const roots = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const modifiers = [
  'maj', 'min', '7', 'maj7', 'min7', 'dim', 'sus4', 
  '6', '9', 'min9', 'maj9', '13'
];
const frets = Array.from({ length: 24 }, (_, i) => i + 1);
const stringNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const defaultTuning = ['E', 'A', 'D', 'G', 'B', 'E'];

const ChordSelector = ({ 
  onSelect, 
  onTuningChange, 
  currentTuning = defaultTuning, 
  initialChord = { root: 'C', modifier: 'maj7', fret: 3 },
  selectedChord 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [root, setRoot] = useState(initialChord.root);
  const [modifier, setModifier] = useState(initialChord.modifier);
  const [fret, setFret] = useState(initialChord.fret);
  const [tuning, setTuning] = useState(currentTuning);
  const [activeTab, setActiveTab] = useState("root");
  const [isTuningMode, setIsTuningMode] = useState(false);
  const [selectedString, setSelectedString] = useState(0);
  const containerRef = useRef(null);
  const timeoutRef = useRef(null);

  // Get colors for current chord
  const currentChord = `${root}${modifier}`;
  const colors = chordColors[currentChord] || chordColors['Cmaj'];
  const bg50 = colors[50].hex;
  const bg100 = colors[100].hex;
  const bg200 = colors[200].hex;
  const bg300 = colors[300].hex;

  useEffect(() => {
    if (selectedChord) {
      const fullMatch = selectedChord.match(/^([A-G][#b]?)(.*)/i);
      if (fullMatch) {
        const [, matchedRoot, matchedModifier] = fullMatch;
        const originalModifier = modifiers.find(m => 
          m.toLowerCase() === matchedModifier.trim().toLowerCase()
        ) || matchedModifier.trim() || 'maj';
        
        setRoot(matchedRoot);
        setModifier(originalModifier);
        
        sendDataToBackend({ 
          root: matchedRoot, 
          modifier: originalModifier, 
          fret, 
          tuning 
        }).then(fing => {
          if (fing && onSelect) {
            onSelect({ 
              root: matchedRoot, 
              modifier: originalModifier, 
              fret, 
              fing, 
              tuning,
              chord: `${root}${modifier}`
            });
          }
        });
      }
    }
  }, [selectedChord]);

  useEffect(() => {
    setTuning(currentTuning);
  }, [currentTuning]);

  useEffect(() => {
    const fetchAndSendPositions = async () => {
      const fing = await sendDataToBackend({ root, modifier, fret, tuning });
      if (fing && onSelect) {
        onSelect({ root, modifier, fret, fing, tuning });
      }
    };
    fetchAndSendPositions();
  }, [root, modifier, fret]);

  const handleTuningChange = (newTuning) => {
    setTuning(newTuning);
    if (onTuningChange) {
      onTuningChange(newTuning);
    }
  };

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };
  
  const handleMouseLeave = () => {
    if (isOpen) {
      timeoutRef.current = setTimeout(() => {
        setIsOpen(false);
        setIsTuningMode(false);
      }, 0);
    }
  };

  const getActiveOptions = () => {
    if (isTuningMode) return stringNotes;
    if (activeTab === "root") return roots;
    if (activeTab === "modifier") return modifiers;
    return frets;
  };

  const getValue = () => {
    if (isTuningMode) return tuning[selectedString];
    if (activeTab === "root") return root;
    if (activeTab === "modifier") return modifier;
    return fret;
  };

  const setValue = (val) => {
    if (isTuningMode) {
      const newTuning = [...tuning];
      newTuning[selectedString] = val;
      handleTuningChange(newTuning);
      
      sendDataToBackend({ 
        root, 
        modifier, 
        fret, 
        tuning: newTuning 
      }).then(fing => {
        if (onSelect) {
          onSelect({
            root,
            modifier,
            fret,
            fing,
            tuning: newTuning
          });
        }
      });
    } else {
      if (activeTab === "root") setRoot(val);
      else if (activeTab === "modifier") setModifier(val);
      else setFret(val);
      
      sendDataToBackend({ 
        root: activeTab === "root" ? val : root,
        modifier: activeTab === "modifier" ? val : modifier,
        fret,
        tuning 
      }).then(fing => {
        if (onSelect) {
          onSelect({
            root: activeTab === "root" ? val : root,
            modifier: activeTab === "modifier" ? val : modifier,
            fret,
            fing,
            tuning
          });
        }
      });
    }
  };

  const resetTuning = () => {
    handleTuningChange([...defaultTuning]);
  };

  return (
    <motion.div
      ref={containerRef}
      className="relative rounded-lg p-4 cursor-pointer"
      style={{ 
        minWidth: '200px',
        maxWidth: '100%',
        backgroundColor: bg200
      }}
      layout // This enables smooth layout animations including width
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.2
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={{
        backgroundColor: bg200,
        transition: { duration: 0.1 },
      }}
    >
      {/* Preview when closed */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            className="text-center font-sans font-extralight text-2xl"
            style={{ backgroundColor: bg200 }}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.1 }}
          >
            {`${root}${modifier} (Fret ${fret})`}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
            style={{ backgroundColor: bg200 }}
            layout // This ensures content changes animate smoothly
          >
            <div className="flex flex-col gap-4">
              {/* Preview Section */}
              <div className="flex justify-between items-center">
                <motion.div 
                  className="flex flex-col"
                  initial={{ y: -10 }}
                  animate={{ y: 0 }}
                >
                  <div className="text-xl font-sans font-extralight">{`${root}${modifier}`}</div>
                  <div className="text-sm font-sans font-extralight text-gray-600">Fret {fret}</div>
                </motion.div>

                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsTuningMode(!isTuningMode);
                    if (!isTuningMode) setActiveTab(null);
                  }}
                  className="inline-block relative px-3 py-2 min-w-[80px] text-sm rounded font-sans font-extralight"
                  style={{
                    backgroundColor: isTuningMode ? bg100 : bg100,
                    color: isTuningMode ? 'black' : 'inherit'
                  }}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ 
                    scale: 1.05,
                    backgroundColor: bg50
                  }}
                >
                  {isTuningMode ? 'chord' : 'tuning'}
                </motion.button>
              </div>

              {isTuningMode ? (
                <motion.div
                  className="flex gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {tuning.map((note, i) => (
                    <motion.button
                      key={`string-select-${i}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedString(i);
                      }}
                      className="px-2 py-1 text-sm font-sans font-extralight rounded"
                      style={{
                        backgroundColor: i === selectedString ? bg300 : bg100,
                        color: i === selectedString ? 'black' : 'inherit'
                      }}
                      whileHover={{ 
                        scale: 1.05,
                        backgroundColor: bg50
                      }}
                      layout
                    >
                      {note}
                    </motion.button>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  className="flex gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {["root", "modifier", "fret"].map((tab) => (
                    <motion.button
                      key={tab}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTab(tab);
                      }}
                      className="px-2 py-1 text-sm font-sans font-extralight rounded"
                      style={{
                        backgroundColor: tab === activeTab ? bg300 : bg100,
                        color: tab === activeTab ? 'black' : 'inherit'
                      }}
                      whileHover={{ 
                        scale: 1.05,
                        backgroundColor: bg50
                      }}
                    >
                      {tab}
                    </motion.button>
                  ))}
                </motion.div>
              )}

              {/* Scroll-Wheel Section */}
              <motion.div
                className="max-h-40 overflow-y-scroll rounded px-5 py-1 scrollbar-thin"
                style={{
                  backgroundColor: bg100,
                  scrollbarColor: `${bg300} ${bg100}`
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {getActiveOptions().map((opt, idx) => {
                  const isSelected = getValue() === opt;
                  return (
                    <motion.div
                      key={opt}
                      onClick={(e) => {
                        e.stopPropagation();
                        setValue(opt);
                      }}
                      className="cursor-pointer px-5 py-1 font-sans font-extralight rounded text-sm text-center"
                      style={{
                        backgroundColor: isSelected ? bg300 : bg100,
                        color: isSelected ? 'black' : 'inherit'
                      }}
                      whileHover={!isSelected ? { 
                        scale: 1.03,
                        backgroundColor: bg50
                      } : {}}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0}}
                    >
                      {opt}
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ChordSelector;