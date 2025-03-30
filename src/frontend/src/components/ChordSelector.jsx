import { useState, useRef, useEffect } from 'react';
import sendDataToBackend from '../api/sendDataToBackend';

const roots = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const modifiers = ['maj', 'min', '7', 'maj7', 'sus4', 'dim', 'aug'];
const frets = Array.from({ length: 24 }, (_, i) => i + 1);
const stringNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const defaultTuning = ['E', 'A', 'D', 'G', 'B', 'E'];
// const defaultTuning = ['E', 'B', 'D', 'G', 'B', 'E'];



const ChordSelector = ({ onSelect, onTuningChange, currentTuning = defaultTuning, initialChord = { root: 'D', modifier: 'maj7', fret: 3 } }) => {
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

  // Sync local tuning with parent's currentTuning
  useEffect(() => {
    setTuning(currentTuning);
  }, [currentTuning]);

  // Fetch and send finger positions whenever chord changes
  useEffect(() => {
    const fetchAndSendPositions = async () => {
      const fing = await sendDataToBackend({ root, modifier, fret, tuning });
      if (fing && onSelect) {
        onSelect({ root, modifier, fret, fing, tuning });
      }
    };
    fetchAndSendPositions();
  }, [root, modifier, fret]);

  // Handle tuning changes
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
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setIsTuningMode(false);
    }, 0);
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
    } else if (activeTab === "root") setRoot(val);
    else if (activeTab === "modifier") setModifier(val);
    else setFret(val);
  };

  const resetTuning = () => {
    handleTuningChange([...defaultTuning]);
  };

  return (
    <div
      ref={containerRef}
      className={`relative transition-all duration-500 w-auto max-w-md rounded-lg p-7 ${
        isOpen ? 'bg-red-100' : 'bg-red-200 hover:bg-red-300 cursor-pointer'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Preview when closed */}
      <div className={`transition-opacity duration-400 ${isOpen ? 'opacity-0 h-0' : 'opacity-100 h-auto'}`}>
        <div className="text-center font-sans font-extralight text-2xl">{`${root}${modifier} (Fret ${fret})`}</div>
      </div>

      {/* Expanded content */}
      <div 
        className={`transition-all duration-300 overflow-hidden ${
          isOpen ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0'
        }`}
      >
        <div className="flex flex-col gap-4">
          {/* Preview Section */}
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <div className="text-xl font-sans font-extralight">{`${root}${modifier}`}</div>
              <div className="text-sm font-sans font-extralight text-gray-600">Fret {fret}</div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsTuningMode(!isTuningMode);
                if (!isTuningMode) setActiveTab(null);
              }}
              className={`inline-block relative px-3 py-2 min-w-[80px] text-sm rounded font-sans font-extralight ${
                isTuningMode ? 'bg-red-200 hover:bg-red-300' : 'bg-red-200 hover:bg-red-300'
              }`}
            >
              {isTuningMode ? 'chord' : 'tuning'}
            </button>
          </div>

          {isTuningMode ? (
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                {tuning.map((note, i) => (
                  <button
                    key={`string-select-${i}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedString(i);
                    }}
                    className={`px-2 py-1 text-sm font-sans font-extralight rounded ${
                      i === selectedString ? 'bg-red-300 font-extralight' : 'hover:bg-red-100'
                    }`}
                  >
                    {note}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              {["root", "modifier", "fret"].map((tab) => (
                <button
                  key={tab}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTab(tab);
                  }}
                  className={`px-2 py-1 text-sm font-sans font-extralight rounded ${
                    tab === activeTab ? 'bg-red-300 font-extralight' : 'hover:bg-red-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}

          {/* Scroll-Wheel Section */}
          <div className="max-h-40 overflow-y-scroll bg-red-200 scrollbar-thin scrollbar-thumb-red-300 scrollbar-track-red-400 rounded px-5 py-1">
            {getActiveOptions().map((opt) => (
              <div
                key={opt}
                onClick={(e) => {
                  e.stopPropagation();
                  setValue(opt);
                }}
                className={`cursor-pointer px-5 py-1 font-sans font-extralight rounded text-sm text-center ${
                  getValue() === opt ? 'bg-red-300 font-extralight' : 'hover:bg-red-100'
                }`}
              >
                {opt}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChordSelector;