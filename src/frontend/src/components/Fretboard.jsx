import { calc_frets, display_fret } from "../utils/FretCalc";
import { noteColor, getColorForChord } from '../utils/ColorSelect';

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
  // Use pixel values for calculations
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

  const markers = calc_frets(fingerPositions).map((pos, stringIndex) => {
    if (pos === 'x') {
      const fretNum = 0;
      return (
        <rect
          key={`marker-${stringIndex}`}
          x={fretNum * spacingX - 15}
          y={stringIndex * spacingY - 15}
          width={30}
          height={30}
          fill="rgb(254, 202, 202)"
          rx="4" 
        />)
    } else if (pos === 0) {
      return '';
    } else {
      const fretNum = parseInt(pos, 10);
      if (isNaN(fretNum)) return null;
      return (
        <circle
          key={`marker-${stringIndex}`}
          cx={fretNum * spacingX - spacingX / 2}
          cy={stringIndex * spacingY}
          r={15}
          fill="rgb(254, 202, 202)"
        />
      );
    }
  });

  return (
    <div 
      className="Fretboard w-full h-full flex justify-center items-center"
      style={{
        maxWidth: `${maxWidth}px`,
        maxHeight: `${maxHeight}px`,
        aspectRatio: `${maxWidth / maxHeight}`
      }}
    >
      <div className="relative w-full h-full">
        <div className="TuningDisplay absolute left-0 top-0 z-10 h-full w-[30px]">
          {tuning.map((label, i) => (
            <div
              key={`label-${i}`}
              className="text-black text-2xl font-sans font-extralight text-right -translate-x-14"
              style={{
                position: 'absolute',
                top: `${(i * spacingY / pixelHeight) * 100}%`,
                transform: 'translateY(-50%)',
                width: '100%',
              }}
            >
              {label}
            </div>
          ))}
          <div
            className="FretDisplay text-black text-2xl font-sans font-extralight text-center -translate-y-14"
            style={{
              position: 'absolute',
              left: `${(spacingX / 2 / pixelWidth) * 100}%`,
              transform: 'translateX(-50%)',
            }}
          >
            {display_fret(fingerPositions)}
          </div>
        </div>

        <svg
          className="absolute top-0 w-full h-full"
          viewBox={`0 0 ${pixelWidth} ${pixelHeight}`}
          preserveAspectRatio="xMidYMid meet"
          overflow="visible"
        >
          {lines}
          {markers}
        </svg>
      </div>
    </div>
  );
}