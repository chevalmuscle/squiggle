const Player = require("./Player");
const playerListUpdate = require("./server");
const players = [new Player("Justin Sider"), new Player("Captain Daddy")];

module.exports = { addPlayer };

function addPlayer(name) {
  players.push(new Player(name));
  playerListUpdate(players);
}

setInterval(function() {
  players[players.length - 1].addScore(20);
  playerListUpdate(players);
}, 2000);
