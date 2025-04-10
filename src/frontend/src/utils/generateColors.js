import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const roots = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const modifiers = [
  'maj', 'min', '7', 'maj7', 'min7', 'dim', 'sus4', 
  '6', '9', 'min9', 'maj9', '13'
];

// Generate HSL color with consistent pastel tint
function generatePastelHue(index, total) {
  const hue = Math.round((index / total) * 360);
  return {
    h: hue,
    s: 70,
    l: 80  // Base lightness for 200 level
  };
}

// Convert HSL to RGB
function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  
  let r, g, b;
  if (h >= 0 && h < 60) {
    [r, g, b] = [c, x, 0];
  } else if (h >= 60 && h < 120) {
    [r, g, b] = [x, c, 0];
  } else if (h >= 120 && h < 180) {
    [r, g, b] = [0, c, x];
  } else if (h >= 180 && h < 240) {
    [r, g, b] = [0, x, c];
  } else if (h >= 240 && h < 300) {
    [r, g, b] = [x, 0, c];
  } else {
    [r, g, b] = [c, 0, x];
  }
  
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
}

// Convert RGB to hex
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

// Generate tints including a 50 level
function generateTints(baseHsl) {
  return {
    50: { ...baseHsl, l: baseHsl.l + 15 },  // Lightest variant
    100: { ...baseHsl, l: baseHsl.l + 5 },   // Lighter variant
    200: baseHsl,                            // Base color
    300: { ...baseHsl, l: baseHsl.l - 10 }   // Darker variant
  };
}

// Generate all color combinations
const colorMap = {};
let colorIndex = 0;
const totalCombinations = roots.length * modifiers.length;

roots.forEach(root => {
  modifiers.forEach(mod => {
    const chord = `${root}${mod}`;
    const baseHsl = generatePastelHue(colorIndex, totalCombinations);
    const tints = generateTints(baseHsl);
    
    colorMap[chord] = {
      50: {
        hex: rgbToHex(...hslToRgb(tints[50].h, tints[50].s, tints[50].l)),
        rgb: hslToRgb(tints[50].h, tints[50].s, tints[50].l)
      },
      100: {
        hex: rgbToHex(...hslToRgb(tints[100].h, tints[100].s, tints[100].l)),
        rgb: hslToRgb(tints[100].h, tints[100].s, tints[100].l)
      },
      200: {
        hex: rgbToHex(...hslToRgb(tints[200].h, tints[200].s, tints[200].l)),
        rgb: hslToRgb(tints[200].h, tints[200].s, tints[200].l)
      },
      300: {
        hex: rgbToHex(...hslToRgb(tints[300].h, tints[300].s, tints[300].l)),
        rgb: hslToRgb(tints[300].h, tints[300].s, tints[300].l)
      }
    };
    
    colorIndex++;
  });
});

// Create the file content
const fileContent = `// chordColors.js - Auto-generated pastel color palette
// Generated on ${new Date().toISOString()}

const chordColors = ${JSON.stringify(colorMap, null, 2)};

export default chordColors;
`;

// Write to file
const outputPath = path.join(__dirname, 'chordColors.js');
fs.writeFileSync(outputPath, fileContent);

console.log(`✅ Successfully generated chord colors file at:\n${outputPath}`);