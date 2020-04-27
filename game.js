const Player = require("./Player");
const { playerListUpdate, turnUpdate } = require("./server");
const players = [];
let currentPlayerIndex = 0;
const words = ["apples and oranges", "banana", "cat", "flash mcqueen"];
const turnLength = 10000; // in ms
const timeBetweenTurns = 5000; // in ms

module.exports = { addPlayer, removePlayer, getPlayerName };

function addPlayer(id, name) {
  players.push(new Player(id, name));
  playerListUpdate(players);
}

function getPlayerName(id) {
  const playerIndex = players.findIndex(player => player.id === id)
  return players.slice(playerIndex, playerIndex+1)[0].name
}

function removePlayer(id) {
  players.splice(players.findIndex(player => player.id === id), 1)
  playerListUpdate(players);
}

function playTurn() {
  console.log("new turn");
  const wordToDraw = getRandomWord();

  turnUpdate(players[currentPlayerIndex].id, wordToDraw, turnLength);

  // sets next player
  if (++currentPlayerIndex > players.length - 1) currentPlayerIndex = 0;
}

function getRandomWord() {
  return words[Math.floor(Math.random() * words.length)];
}

// auto plays turn 
setInterval(function() {
  if(players.length > 0) {
    playTurn();
  }
}, turnLength + timeBetweenTurns);
