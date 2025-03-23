export default function Fretboard({ width = 420, height = 250, numFrets, numStrings }) {
  const spacingX = width / (numFrets);  
  const spacingY = height / (numStrings - 1);  

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
        strokeLinecap="round"
        shapeRendering="crispEdges"
      />
    )),
    ...Array.from({ length: (numFrets + 1) }).map((_, i) => (
      <line
        key={`fret-${i}`}
        x1={i * spacingX}
        y1={0}
        x2={i * spacingX}
        y2={height}
        stroke="black"
        strokeWidth={1}
        strokeLinecap="round"
        shapeRendering="crispEdges"
      />
    ))
  ];

  return (
    <div className="Fretboard w-full max-w-2xl aspect-[1.6] max-h-[320px] flex justify-center items-center border">
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        width="100%" 
        height="100%" 
        preserveAspectRatio="xMidYMid meet"
      >
        {lines}
      </svg>
    </div>
  );
}
