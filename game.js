const Player = require("./Player");
const { playerListUpdate, turnUpdate } = require("./server");
const players = [];
let currentPlayerIndex = 0;
const words = ["apples and oranges", "banana", "cat", "flash mcqueen"];
let wordToDraw = "";
const pointsPerGuess = 10;

/** Determines how close 2 strings need to be
 * to be considered very close for a human brain
 */
const stringSimilarityThreshold = 0.8;

const turnLength = 10000; // in ms
const timeBetweenTurns = 5000; // in ms

module.exports = { addPlayer, removePlayer, getPlayerName, checkWordGuessed };

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

  updateScores();
  playerListUpdate(players);

  wordToDraw = getRandomWord();

  turnUpdate(players[currentPlayerIndex].id, wordToDraw, turnLength);

  // sets next player
  if (++currentPlayerIndex > players.length - 1) currentPlayerIndex = 0;
}

function getRandomWord() {
  return words[Math.floor(Math.random() * words.length)];
}

function updateScores() {
  for (player of players) {
    if (player.hasFoundWord === true) {
      player.addScore(pointsPerGuess);
      player.hasFoundWord = false;
    }
  }
}

function checkWordGuessed(playerid, word) {
  const similarity = levenshteinDistance(
    word.toLowerCase(),
    wordToDraw.toLowerCase(),
  );

  if (similarity < stringSimilarityThreshold) {
    return -1;
  } else if (similarity >= stringSimilarityThreshold && similarity < 1) {
    return 0;
  } else {
    players[players.findIndex(player => player.id === playerid)].hasFoundWord = true;
    return 1;
  }
}

// auto plays turn
setInterval(function() {
  if(players.length > 0) {
    playTurn();
  }
}, turnLength + timeBetweenTurns);

/**
 * Returns the similarity between two word
 * with the Levenshtein distance
 * https://en.wikipedia.org/wiki/Levenshtein_distance
 *
 * Comes from https://stackoverflow.com/a/36566052
 * @param {string} s1
 * @param {string} s2
 *
 * @returns {number} % of similarity between 0 and 1
 */
function levenshteinDistance(s1, s2) {
  function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    var costs = new Array();
    for (var i = 0; i <= s1.length; i++) {
      var lastValue = i;
      for (var j = 0; j <= s2.length; j++) {
        if (i == 0) costs[j] = j;
        else {
          if (j > 0) {
            var newValue = costs[j - 1];
            if (s1.charAt(i - 1) != s2.charAt(j - 1))
              newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }

  var longer = s1;
  var shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  var longerLength = longer.length;
  if (longerLength == 0) {
    return 1.0;
  }
  return (
    (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength)
  );
}
