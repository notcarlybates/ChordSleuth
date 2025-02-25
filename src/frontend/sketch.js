function setup() {
  createCanvas(400, 600);
}

function draw() {
  background("aqua");
  if (mouseIsPressed === true) {
    fill(0);
  } else {
    fill(125);
  }

  circle(mouseX, mouseY, 100);
}
