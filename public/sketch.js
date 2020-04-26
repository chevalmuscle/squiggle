function setup() {
  var canvas = createCanvas(500, 400);
  background("#F2F2F2");
  frameRate(100);
  canvas.parent("sketch-holder");

  socket.on("mouse", newDrawing);
  socket.on("new-turn", newTurn);
}

function newTurn() {
  clear();
}

/**
 * Fired when the server sends backs a line to draw on the canvas
 * @param {*} data line to draw on the canvas
 */
function newDrawing(data) {
  stroke(0);
  line(data.x, data.y, data.px, data.py);
}

function mouseDragged() {
  if (canDraw === true) {
    const data = { px: pmouseX, py: pmouseY, x: mouseX, y: mouseY };
    socket.emit("mouse", data);

    stroke(0);
    if (mouseIsPressed) {
      line(mouseX, mouseY, pmouseX, pmouseY);
    }
  }
}
