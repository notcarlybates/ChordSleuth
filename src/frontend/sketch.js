let numStrings = 6;
let numFrets = 12;
let stringSpacing = 50;
let fretSpacing = 60;
let startX = 100;
let startY = 100;
let selectedNotes = [];

function setup() {
  createCanvas(900, 400);
  for (let i = 0; i < numStrings; i++) {
    selectedNotes[i] = Array(numFrets).fill(false);
  }
}

function draw() {
  background(30);
  drawFretboard();
  drawNotes();
}

function drawFretboard() {
  stroke(100);
  strokeWeight(3);
  for (let i = 0; i < numStrings; i++) {
    let y = startY + i * stringSpacing;
    line(startX, y, startX + (numFrets * fretSpacing), y);
  }
  
  for (let i = 0; i <= numFrets; i++) {
    let x = startX + i * fretSpacing;
    line(x, startY, x, startY + (numStrings - 1) * stringSpacing);
  }
}

function drawNotes() {
  for (let i = 0; i < numStrings; i++) {
    for (let j = 0; j < numFrets; j++) {
      let x = startX + (j + 0.5) * fretSpacing;
      let y = startY + i * stringSpacing;
      if (selectedNotes[i][j]) {
        fill(255, 100, 100);
      } else {
        fill(255);
      }
      ellipse(x, y, 20);
    }
  }
}

function mousePressed() {
  for (let i = 0; i < numStrings; i++) {
    for (let j = 0; j < numFrets; j++) {
      let x = startX + (j + 0.5) * fretSpacing;
      let y = startY + i * stringSpacing;
      if (dist(mouseX, mouseY, x, y) < 10) {
        selectedNotes[i][j] = !selectedNotes[i][j];
      }
    }
  }
}
