import React from 'react';
import { motion } from 'framer-motion';
import animationConfig from '../utils/animateConfig';
import { ChordBox } from './ChordBox';

export const ChordDisplay = ({ chords, onChordClick, selectedChordIndex }) => {
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