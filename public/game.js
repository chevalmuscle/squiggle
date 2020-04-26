var id;
var socket;
socket = io.connect();

socket.on("connect", () => (id = socket.id));

socket.on("player-list", newPlayerList);
socket.on("guess-word", guessWord);

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

function guessWord({ drawerid, word, timeToGuess }) {
  if (drawerid === id) {
    const wordToGuessElement = document.getElementById("word-to-guess");
    wordToGuessElement.textContent = word;
    wordToGuessElement.classList.remove("guess-word");
    wordToGuessElement.classList.add("draw-word");
  } else {
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

  createProgressbar(timeToGuess);
}

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

/**
 *
 * @param {number} duration duration in ms of the countdown progressbar
 */
function createProgressbar(duration) {
  let i = 100;
  const counterBack = setInterval(function() {
    i--;
    if (i >= 0) {
      $(".progress-bar").css("width", i + "%");
    } else {
      clearInterval(counterBack);
    }
  }, duration / 100);
}
