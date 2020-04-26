var socket;
socket = io.connect();

socket.on("player-list", newPlayerList);

function newPlayerList(playerList) {
  const playerListElement = document.getElementById("player-list");
  playerListElement.innerHTML = "";
  playerListElement.append(
    ...playerList
      .sort((playerA, playerB) => playerB.score - playerA.score)
      .map(playerData =>
        generatePlayerElement(playerData.name, playerData.score),
      ),
  );
}

function generatePlayerElement(playerName, playerScore) {
  const playerElement = document.createElement("li");
  playerElement.className = "player";

  const playerNameElement = document.createElement("span");
  playerNameElement.className = "player-name";
  playerNameElement.textContent = playerName;

  const playerScoreElement = document.createElement("span");
  playerScoreElement.className = "player-score";
  playerScoreElement.textContent = playerScore;

  playerElement.append(playerNameElement, playerScoreElement);
  return playerElement;
}
