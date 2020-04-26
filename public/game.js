var id;
var canDraw = false;
var socket;
socket = io.connect();

socket.on("connect", () => (id = socket.id));

socket.on("player-list", newPlayerList);
socket.on("new-turn", newTurn);
socket.on("counter", updateCountDown);

/**
 *
 * @param {Array} playerList List of the players playing the game. See Player.js for the object
 */
function newPlayerList(playerList) {
  const playerListElement = document.getElementById("player-list");
  playerListElement.innerHTML = "";
  playerListElement.append(
    ...playerList
      .sort((playerA, playerB) => playerB.score - playerA.score)
      .map(playerData =>
        generatePlayerElement(playerData.id, playerData.name, playerData.score),
      ),
  );
}

/**
 * Fired when a new turn is starting
 * @param {object} { drawerid: id of the player that is drawing, word: word that is being drawn }
 */
function newTurn({ drawerid, word }) {
  if (drawerid === id) {
    canDraw = true;
    const wordToGuessElement = document.getElementById("word-to-guess");
    wordToGuessElement.textContent = word;
    wordToGuessElement.classList.remove("guess-word");
    wordToGuessElement.classList.add("draw-word");
  } else {
    canDraw = false;
    const wordToGuessElement = document.getElementById("word-to-guess");

    let wordSections = word.split(" ");
    wordSections = wordSections.map(word =>
      word
        .split("")
        .map(() => `<span style="margin-left:5px">_</span>`)
        .join(""),
    );
    wordSections = wordSections.join(`<span style="margin-left:10px"> </span>`);
    wordToGuessElement.innerHTML = wordSections;
    wordToGuessElement.classList.remove("draw-word");
    wordToGuessElement.classList.add("guess-word");
  }
}

/**
 * Fired when an update to the countdown is sent
 * Also resets the canDraw variable to true at the end of the countdown
 * @param {object} { timeLeft: time remaining to the countdown, totalTime: initial time of the countdown } 
 */
function updateCountDown({ timeLeft, totalTime }) {
  if (timeLeft <= 0) {
    canDraw = true;
  }
  $(".progress-bar").css("width", (timeLeft / totalTime) * 100 + "%");
}

/**
 * Generate a document element for a player. Contains the name of the player and its score.
 * @param {string} playerid id of the player
 * @param {string} playerName name of the player
 * @param {number} playerScore player's score
 */
function generatePlayerElement(playerid, playerName, playerScore) {
  const playerElement = document.createElement("li");
  playerElement.className = "player";

  if (playerid === id) {
    playerElement.classList.add("is-current-user");
  }

  const playerNameElement = document.createElement("span");
  playerNameElement.className = "player-name";
  playerNameElement.textContent = playerName;

  const playerScoreElement = document.createElement("span");
  playerScoreElement.className = "player-score";
  playerScoreElement.textContent = playerScore;

  playerElement.append(playerNameElement, playerScoreElement);
  return playerElement;
}
