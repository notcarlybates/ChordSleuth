export default function Fretboard({
  width = 420,
  height = 250,
  numFrets,
  numStrings,
  tuning = [],
  fingerPositions = [],
}) {
  const spacingX = width / numFrets;
  const spacingY = height / (numStrings - 1);
  const labelMargin = 30;

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

  const markers = fingerPositions.map((pos, stringIndex) => {
    if (pos === 'x') {
      const fretNum = 0;
      return (
        <rect
          key={`marker-${stringIndex}`}
          x={fretNum * spacingX - 15}
          y={stringIndex * spacingY - 15}
          width={30}
          height={30}
          fill="red"
          rx = "4" 
        />
      );
    } else {
      const fretNum = parseInt(pos, 10);
      if (isNaN(fretNum)) return null;
      return (
        <circle
          key={`marker-${stringIndex}`}
          cx={fretNum * spacingX - spacingX / 2}
          cy={stringIndex * spacingY}
          r={15}
          fill="red"
        />
      );
    }
  });

  return (
    <div className="Fretboard w-full max-w-2xl aspect-[1.6] max-h-[320px] flex justify-center items-center">
      <div className="relative" style={{ width: `${width}px`, height: `${height}px` }}>
        <div className="absolute left-0 top-0 z-10 h-full w-[30px]">
          {tuning.map((label, i) => (
            <div
              key={`label-${i}`}
              className="text-black text-2xl font-sans font-extralight text-right -translate-x-14"
              style={{
                position: 'absolute',
                top: `${i * spacingY}px`,
                transform: 'translateY(-50%)',
                width: '100%',
              }}
            >
              {label}
            </div>
          ))}
        </div>

        <svg
          className="absolute top-0"
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
          overflow="visible"
        >
          {lines}
          {markers}
        </svg>
      </div>
    </div>
  );
}
