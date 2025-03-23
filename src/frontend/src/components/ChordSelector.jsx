import { useState, useRef, useEffect } from 'react';

const roots = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const modifiers = ['maj', 'min', '7', 'maj7', 'sus4', 'dim', 'aug'];
const frets = Array.from({ length: 24 }, (_, i) => i + 1);

const ChordSelector = ({ onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [root, setRoot] = useState("D");
  const [modifier, setModifier] = useState("maj7");
  const [fret, setFret] = useState(3);
  const [activeTab, setActiveTab] = useState("root");
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        if (onSelect) onSelect({ chord: `${root}${modifier}`, fret });
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [root, modifier, fret, onSelect]);

  const getActiveOptions = () => {
    if (activeTab === "root") return roots;
    if (activeTab === "modifier") return modifiers;
    return frets;
  };

  const getValue = () => {
    if (activeTab === "root") return root;
    if (activeTab === "modifier") return modifier;
    return fret;
  };

  const setValue = (val) => {
    if (activeTab === "root") setRoot(val);
    else if (activeTab === "modifier") setModifier(val);
    else setFret(val);
  };

  return (
    <div
      ref={containerRef}
      className={`transition-all duration-300 w-full max-w-md border rounded-lg p-4 ${
        isOpen ? 'bg-white shadow-lg' : 'bg-red-200 hover:bg-red-300 cursor-pointer'
      }`}
      onClick={() => setIsOpen(true)}
    >
      {isOpen ? (
        <div className="flex justify-between gap-4">
          {/* Preview Section */}
          <div className="flex flex-col items-center justify-between w-1/2">
            <div className="text-xl font-semibold">{`${root}${modifier}`}</div>
            <div className="text-sm text-gray-600">Fret {fret}</div>

            {/* Tabs */}
            <div className="flex gap-2 mt-4">
              {["root", "modifier", "fret"].map((tab) => (
                <button
                  key={tab}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTab(tab);
                  }}
                  className={`px-2 py-1 text-sm rounded ${
                    tab === activeTab ? 'bg-gray-300 font-light' : 'hover:bg-gray-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Scroll-Wheel Section */}
          <div className="w-1/2 max-h-40 overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 rounded border px-2 py-1">
            {getActiveOptions().map((opt) => (
              <div
                key={opt}
                onClick={(e) => {
                  e.stopPropagation();
                  setValue(opt);
                }}
                className={`cursor-pointer px-2 py-1 rounded text-sm text-center ${
                  getValue() === opt ? 'bg-gray-200 font-semibold' : 'hover:bg-gray-100'
                }`}
              >
                {opt}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center text-xl">{`${root}${modifier} (Fret ${fret})`}</div>
      )}
    </div>
  );
};

export default ChordSelector;
