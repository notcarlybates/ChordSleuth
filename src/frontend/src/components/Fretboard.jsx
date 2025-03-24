export default function Fretboard({
  width = 420,
  height = 250,
  numFrets,
  numStrings,
  tuning = [],
}) {
  const spacingX = width / numFrets;
  const spacingY = height / (numStrings - 1);
  const labelMargin = 30; // space to the left for labels

  const lines = [
    // String (horizontal) lines
    ...Array.from({ length: numStrings }).map((_, i) => (
      <line
        key={`string-${i}`}
        x1={0}
        y1={i * spacingY}
        x2={width}
        y2={i * spacingY}
        stroke="black"
        strokeWidth={1}
        strokeLinecap="round"
        shapeRendering="crispEdges"
      />
    )),
    // Fret (vertical) lines
    ...Array.from({ length: numFrets + 1 }).map((_, i) => (
      <line
        key={`fret-${i}`}
        x1={i * spacingX}
        y1={0}
        x2={i * spacingX}
        y2={height}
        stroke="black"
        strokeWidth={1.}
        strokeLinecap="round"
        shapeRendering="crispEdges"
      />
    )),
  ];

  return (
    <div className="Fretboard w-full max-w-2xl aspect-[1.6] max-h-[320px] flex justify-center items-center">
      {/* SVG wrapper for positioning */}
      <div
        className="relative"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        {/* HTML tuning labels absolutely locked to SVG */}
        <div className="absolute left-0 top-0 z-10 h-full w-[30px]">
          {tuning.map((label, i) => (
            <div
              key={`label-${i}`}
              className="text-black text-lg font-sans font-extralight text-right pr-6"
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

        {/* Actual SVG */}
        <svg
          className="absolute top-0 left-[30px]"
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
          overflow= 'visible'
          preserveAspectRatio="xMidYMid meet"
        >
          {lines}
        </svg>
      </div>
    </div>
  );
}
