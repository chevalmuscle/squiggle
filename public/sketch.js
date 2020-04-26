function setup() {
  var canvas = createCanvas(500, 400);
  background("#F2F2F2");
  frameRate(100);
  canvas.parent('sketch-holder');
}

function mouseDragged() {
  stroke(0);
  if (mouseIsPressed) {
    line(mouseX, mouseY, pmouseX, pmouseY);
  }
}

