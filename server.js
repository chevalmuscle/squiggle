module.exports = { playerListUpdate, turnUpdate };

const express = require("express");
const socket = require("socket.io");
const Game = require("./game");

const app = express();
const games = {};
const ROOM_ID_LENGTH = 5;

const port = process.env.PORT || 3000;
const server = app.listen(port, function() {
  app.use(express.static("public"));
  app.use("/game", express.static("public/game"));
  console.log(`http://localhost:${port} 🐷`);
});

const io = socket(server);

io.sockets.on("connection", newConnection);

function newConnection(socket) {
  console.log(`New connection: ${socket.id}`);
  let room;

  socket.on("join-room", roomid => {
    room = roomid.toLowerCase();
    if (games[room] === undefined) {
      games[room] = new Game(room);
    }
    socket.join(room);
    games[room].addPlayer(socket.id, socket.id);
  });

  socket.on("mouse", mouseDrawingData => {
    socket.broadcast.to(room).emit("mouse", mouseDrawingData);
  });

  socket.on("chat-message", message => {
    const playerName = games[room].getPlayerName(socket.id);
    const result = games[room].checkWordGuessed(socket.id, message);

    if (result === -1) {
      // user did not guessed the word
      io.in(room).emit("chat-message", {
        playerid: socket.id,
        playerName,
        message,
      });
    } else if (result === 0) {
      // the word guessed is close
      io.in(room).emit("close-guess", {
        playerid: socket.id,
        playerName,
        message,
      });
    } else if (result == 1) {
      // the user guessed the word
      io.in(room).emit("guessed-right", {
        playerid: socket.id,
        playerName,
        message,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log(`${socket.id} disconnected`);
    if (room !== undefined) {
      games[room].removePlayer(socket.id);
      if (games[room].isEmpty()) {
        delete games[room];
      }
    }
  });

  socket.on("request-new-room", () => {
    const roomid = generateRoomid(ROOM_ID_LENGTH);
    io.to(socket.id).emit("new-room-id", roomid);
  });
}

/**
 * Generates a new room id
 * Comes from https://stackoverflow.com/a/1349426
 */
function generateRoomid(roomidLength) {
  let isUnique = true;
  let roomid;

  do {
    roomid = "";
    const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < roomidLength; i++) {
      roomid += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    isUnique = games[roomid] === undefined;
  } while (!isUnique);

  return roomid;
}

function playerListUpdate(roomid, playerList) {
  io.in(roomid).emit("player-list", playerList);
}

function turnUpdate(roomid, drawerid, word, turnLength) {
  console.log("Turn update in room " + roomid);
  io.in(roomid).emit("new-turn", { drawerid, word });

  let timeLeft = turnLength;
  var turnCountDown = setInterval(function() {
    io.in(roomid).emit("counter", {
      timeLeft: timeLeft,
      totalTime: turnLength,
    });
    timeLeft -= 1000;
    if (timeLeft < 0) {
      clearInterval(turnCountDown);
    }
  }, 1000);
}
