import React from "react";
import { motion, AnimatePresence } from 'framer-motion';
import animationConfig from '../utils/animateConfig';
import chordColors from "../utils/chordColors";

export const ChordBox = ({
    chord,
    size = 'h-full w-4/5',
    fontsize = 'text-xl font-thin',
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
      className={`relative mx-2 sm:mx-3 md:mx-4 lg:mx-5 flex items-center font-sans justify-center rounded-lg max-w-25 shrink font-thin ${fontsize} ${size} ${
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
          backgroundColor: bg300,
          transition: { 
            type: 'spring',
            stiffness: 400,
            damping: 10
          }
        }}
        whileTap={{
          scale: 0.95,
          backgroundColor: bg100,
          transition: { duration: 0.1 }
        }}
        transition={{
          duration: animationConfig.COLOR_TRANSITION,
          ease: 'easeOut',
          backgroundColor: { duration: animationConfig.PROG_COLOR_TRANSITION }
        }}
      >
        {/* Background layer */}
        <motion.div
          className="absolute w-full h-full rounded-lg z-0"
          initial={{ backgroundColor: bg200 }}
          animate={{ backgroundColor: bg200 }}
          whileHover={{ backgroundColor: bg300 }}
          whileTap={{ backgroundColor: bg100 }}
          transition={{ 
            duration: animationConfig.COLOR_TRANSITION,
            backgroundColor: { duration: animationConfig.COLOR_TRANSITION }
          }}
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
                opacity: 1,
                backgroundColor: bg300
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
                delay: 0.1,
                backgroundColor: { duration: animationConfig.COLOR_TRANSITION }
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
                opacity: 1,
                backgroundColor: bg100
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
                delay: 0.15,
                backgroundColor: { duration: animationConfig.COLOR_TRANSITION }
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
          animate={{ 
            scale: 1, 
            opacity: 1,
            backgroundColor: bg200 
          }}
          whileTap={{ backgroundColor: bg100 }}
          transition={{
            delay: 0.2,
            type: 'spring',
            stiffness: 500,
            backgroundColor: { duration: animationConfig.PROG_COLOR_TRANSITION }
          }}
        >
          <div className="z-20">{chord}</div>
        </motion.div>
      </motion.div>
    );
  };