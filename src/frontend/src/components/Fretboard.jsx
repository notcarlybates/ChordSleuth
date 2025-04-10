import { motion } from 'framer-motion';
import { calc_frets, display_fret } from "../utils/FretCalc";
import { useState, useEffect } from "react";

export default function Fretboard({
  width = "100%",
  height = "100%",
  maxWidth = 420,
  maxHeight = 250,
  numFrets = 24,
  numStrings = 6,
  tuning = [],
  fingerPositions = [],
}) {
  // Animation constants
  const ANIMATION_DURATION = 1; // seconds
  const ANIMATION_EASING = { ease: [0.25, 0.1, 0.25, 1], duration: ANIMATION_DURATION };
  
  // Reverse the tuning and finger positions
  const reversedTuning = [...tuning].reverse();
  const reversedFingerPositions = [...fingerPositions].reverse();

  const [prevPositions, setPrevPositions] = useState([]);
  useEffect(() => {
    setPrevPositions(reversedFingerPositions);
  }, [reversedFingerPositions]);

  const pixelWidth = typeof width === 'number' ? width : maxWidth;
  const pixelHeight = typeof height === 'number' ? height : maxHeight;
  
  const spacingX = pixelWidth / numFrets;
  const spacingY = pixelHeight / (numStrings - 1);
  
  const lines = [
    ...Array.from({ length: numStrings }).map((_, i) => (
      <line
        key={`string-${i}`}
        x1={0}
        y1={i * spacingY}
        x2={width}
        y2={i * spacingY}
        stroke="black"
        strokeWidth={1}
      />
    )),
    ...Array.from({ length: numFrets + 1 }).map((_, i) => (
      <line
        key={`fret-${i}`}
        x1={i * spacingX}
        y1={0}
        x2={i * spacingX}
        y2={height}
        stroke="black"
        strokeWidth={1}
      />
    )),
  ];

  const getShapePosition = (pos, stringIndex) => {
    const currentY = stringIndex * spacingY;
    
    if (pos === 'x') {
      return {
        x: 0,
        y: currentY,
        size: 30,
        type: 'square'
      };
    } else if (typeof pos === 'number' && pos > 0) {
      return {
        x: pos * spacingX - spacingX / 2,
        y: currentY,
        size: 30,
        type: 'circle'
      };
    } else {
      return {
        x: spacingX / 2,
        y: currentY,
        size: 30,
        type: 'open'
      };
    }
  };

  const renderMarker = (stringIndex) => {
    const currentPos = calc_frets(reversedFingerPositions)[stringIndex];
    const prevPos = calc_frets(prevPositions)[stringIndex];
    
    const current = getShapePosition(currentPos, stringIndex);
    const previous = prevPos ? getShapePosition(prevPos, stringIndex) : null;
  
    // Determine animation properties based on transitions
    let initialX, initialY, initialOpacity;
    let animateX, animateY, animateOpacity;
  
    if (previous) {
      // Transition FROM OPEN
      if (previous.type === 'open') {
        // Start from current position (appearing)
        initialX = current.x;
        initialY = current.y;
        initialOpacity = 0;
      } 
      // Transition TO OPEN
      else if (current.type === 'open') {
        // Start from previous position (disappearing)
        initialX = previous.x;
        initialY = previous.y;
        initialOpacity = 1;
      }
      // Normal transition (between circle/square)
      else {
        initialX = previous.x;
        initialY = previous.y;
        initialOpacity = 1;
      }
    } else {
      // Initial render
      initialX = current.x;
      initialY = current.y;
      initialOpacity = 0;
    }
  
    // Determine animate properties
    if (current.type === 'open') {
      // Disappearing - stay in same position
      animateX = initialX;
      animateY = initialY;
      animateOpacity = 0;
    } else {
      // Appearing or moving - go to current position
      animateX = current.x;
      animateY = current.y;
      animateOpacity = 1;
    }
  
    const commonProps = {
      fill: "rgb(254, 202, 202)",
      initial: { 
        x: initialX,
        y: initialY,
        opacity: initialOpacity
      },
      animate: { 
        x: animateX,
        y: animateY,
        opacity: animateOpacity
      },
      transition: ANIMATION_EASING
    };
  
    if (current.type === 'square') {
      return (
        <motion.rect
          key={`square-${stringIndex}`}
          x={-current.size/2}
          y={-current.size/2}
          width={current.size}
          height={current.size}
          rx="4"
          {...commonProps}
          initial={{
            ...commonProps.initial,
            rx: previous?.type === 'circle' ? 15 : 4
          }}
          animate={{
            ...commonProps.animate,
            rx: 4
          }}
        />
      );
    } else if (current.type === 'circle') {
      return (
        <motion.rect
          key={`circle-${stringIndex}`}
          x={-current.size/2}
          y={-current.size/2}
          width={current.size}
          rx="15"
          height={current.size}
          {...commonProps}
          initial={{
            ...commonProps.initial,
            rx: previous?.type === 'square' ? 4 : 15
          }}
          animate={{
            ...commonProps.animate,
            rx: 15
          }}
        />
      );
    } else {
      // Open string - invisible marker
      return (
        <motion.rect
          key={`open-${stringIndex}`}
          x={-current.size/2}
          y={-current.size/2}
          width={current.size}
          height={current.size}
          {...commonProps}
        />
      );
    }
  };

  const markers = Array.from({ length: numStrings }).map((_, stringIndex) => (
    <g key={`marker-group-${stringIndex}`}>
      {renderMarker(stringIndex)}
    </g>
  ));

  return (
    <div className="Fretboard w-full h-full flex justify-center items-center"
      style={{
        maxWidth: `${maxWidth}px`,
        maxHeight: `${maxHeight}px`,
        aspectRatio: `${maxWidth / maxHeight}`
      }}>
      <div className="relative w-full h-full">
        <div className="TuningDisplay absolute left-0 top-0 z-10 h-full w-[30px]">
          {reversedTuning.map((label, i) => (
            <div key={`label-${i}`}
              className="text-black text-2xl font-sans font-extralight text-right -translate-x-14"
              style={{
                position: 'absolute',
                top: `${(i * spacingY / pixelHeight) * 100}%`,
                transform: 'translateY(-50%)',
                width: '100%',
              }}>
              {label}
            </div>
          ))}
          <div className="FretDisplay text-black text-2xl font-sans font-extralight text-center -translate-y-14"
            style={{
              position: 'absolute',
              left: `${(spacingX / 2 / pixelWidth) * 1400}%`,
              transform: 'translateX(-50%)',
            }}>
            {display_fret(reversedFingerPositions)}
          </div>
        </div>

        <svg className="absolute top-0 w-full h-full"
          viewBox={`0 0 ${pixelWidth} ${pixelHeight}`}
          preserveAspectRatio="xMidYMid meet"
          overflow="visible">
          {lines}
          {markers}
        </svg>
      </div>
    </div>
  );
}