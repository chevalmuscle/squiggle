const express = require("express");
const socket = require("socket.io");

const app = express();

const server = app.listen(3000, function() {
  app.use(express.static("public"));
  console.log("http://localhost:3000 🐷");
});

const io = socket(server);

io.sockets.on("connection", newConnection);

function newConnection(socket) {
  const room = 1
  socket.join(room);
  console.log(`new connection: ${socket.id}`)

  socket.on("mouse", mouseMsg);
  function mouseMsg(data) {
    socket.broadcast.to(room).emit("mouse", data)
  }
}
