var id;
var isTheDrawingPlayer = false;
var guessedTheWord = false;
var canDraw = false;
var wordToGuess = "";
var roomid = window.location.search.split("room=")[1].split("&")[0];
var socket = io.connect();

socket.on("connect", () => (id = socket.id));

socket.on("player-list", newPlayerList);
socket.on("new-turn", newTurn);
socket.on("invalid-room-id", invalidRoomid);
socket.on("counter", updateCountDown);

// chatting
socket.on("chat-message", receiveMessage);
socket.on("server-message", receiveServerMessage);
socket.on("close-guess", receivedCloseGuess);
socket.on("guessed-right", receivedAnswer);

window.onload = function() {
    let playerName = localStorage.getItem("playerName");
    if (playerName === null) {
        // the user has not set its username
        playerName = prompt("What's your name?", "");
        if (playerName === null || playerName === "") {
            playerName = "Not the NSA !";
        }
        localStorage.setItem("playerName", playerName);
    }

    socket.emit("join-room", { roomid: roomid, playerName: playerName });

    $("#room-id").text(roomid);

    $("#chat-input-form").submit(function(e) {
        e.preventDefault();
        const chatMessage = $("#chat-input").val();
        if (chatMessage !== "") {
            sendMessageToServer(chatMessage);
            $("#chat-input").val("");
        }
        return false;
    });

    $("#word-proposition-form").submit(function(e) {
        e.preventDefault();
        const proposedWord = $("#proposition-input").val();
        if (proposedWord !== "") {
            proposeWord(proposedWord);
            $("#proposition-input").val("");
        }
        return false;
    });
};

/**
 * Receives the message from the server and displays it in the chatbox
 * @param {object} {
 *                   playerid: player's id who sent the message,
 *                   playerName: player's name who sent the message,
 *                   message: message received
 *                 }
 */
function receiveMessage({ playerid, playerName, message }) {
    if (playerid === id) {
        insertMessageInChat("You", message, "");
    } else {
        insertMessageInChat(playerName, message, "");
    }
}

function receiveServerMessage({ message }) {
    insertMessageInChat("server", message, "");
    document.getElementById("server-message").textContent = message;

    setTimeout(() => {
        document.getElementById("server-message").textContent = "";
    }, 3000);
}

/**
 * Receives an almost correct answer from the server and
 * displays it in the chatbox for the user who almost guessed right
 * @param {object} {
 *                   playerid: player's id who sent the message,
 *                   message: message received
 *                 }
 */
function receivedCloseGuess({ playerid, message }) {
    $(`#${playerid}`).addClass("almost-guessed-word");

    if (playerid === id) {
        insertMessageInChat("You", message, "almost-guessed-word");
    }
}

/**
 * Receives a correct answer from the server and
 * displays it in the chatbox for the user who guessed right
 * @param {object} {
 *                   playerid: player's id who sent the message,
 *                   playerName: player's name who sent the message,
 *                   message: message received
 *                 }
 */
function receivedAnswer({ playerid, playerName, message }) {
    $(`#${playerid}`).addClass("has-guessed-word");

    if (playerid === id) {
        // lets the player draw and add words when
        // he guessed right
        guessedTheWord = true;
        $("#word-proposition-container").css("visibility", "visible");
        insertMessageInChat("You", message, "has-guessed-word");
    } else {
        insertMessageInChat("Info", `${playerName} has guessed the word !`, "");
    }
}

/**
 * Writes a message in the chatbox.
 * Format: `chatterName: message`
 * @param {string} chatterName Chatter's name of the message
 * @param {string} message Message sent to the chatbox
 * @param {string} customClasses Custom css classes added to the li. Must be separated by a space if many
 */
function insertMessageInChat(chatterName, message, customClasses) {
    const messageElement = document.createElement("li");
    messageElement.className = `message-in-chat ${customClasses}`;
    messageElement.innerHTML = `<span class="chatter-name">${chatterName}: </span><span>${message}</span>`;
    $("#chat-messages").prepend(messageElement);
}

/**
 * Sends a message to the server and
 * empties the chat input
 * @param {string} message message sent by the user
 */
function sendMessageToServer(message) {
    socket.emit("chat-message", message);
}

/**
 * Sends a word to the server to be added into the game's word bank
 * @param {string} word word to add into the games bank
 */
function proposeWord(word) {
    socket.emit("propose-new-word", word);
}

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
    // hides the possibility to propose new words
    $("#word-proposition-container").css("visibility", "hidden");

    this.wordToGuess = word;
    guessedTheWord = false;

    for (let drawingIndicator of document.getElementsByName("player-drawing-indicator")) {
        drawingIndicator.style.visibility = "hidden";
    }
    document.getElementById(`${drawerid}-drawing-indicator`).style.visibility = "visible";

    if (drawerid === id) {
        isTheDrawingPlayer = true;
        const wordToGuessElement = document.getElementById("word-to-guess");
        wordToGuessElement.textContent = word;
        wordToGuessElement.classList.remove("guess-word");
        wordToGuessElement.classList.add("draw-word");
    } else {
        isTheDrawingPlayer = false;

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

    $("#chat-input-form :input").prop("disabled", isTheDrawingPlayer);
}

/**
 * Fired when an update to the countdown is sent
 * When the countdown is over:
 *     - resets the canDraw variable to true so that all users can draw
 *     - shows the word that needed to be guessed
 * @param {object} { timeLeft: time remaining to the countdown, totalTime: initial time of the countdown }
 */
function updateCountDown({ timeLeft, totalTime }) {
    if (timeLeft <= 0) {
        guessedTheWord = true;
        document.getElementById("word-to-guess").textContent = this.wordToGuess;
    }
    $(".progress-bar").css("width", (timeLeft / totalTime) * 100 + "%");
}

/**
 * Fired when the user is going to an invalid room's id.
 * Sends the user a message to inform him and redirects to the home page
 */
function invalidRoomid() {
    alert("This room doesn't exist. You need to create one before.");
    window.location.href = "/";
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

    playerElement.id = playerid;

    if (playerid === id) {
        playerElement.classList.add("is-current-user");
    }

    const playerNameElement = document.createElement("span");
    playerNameElement.className = "player-name";
    playerNameElement.textContent = playerName;

    const playerScoreElement = document.createElement("span");
    playerScoreElement.className = "player-score";
    playerScoreElement.textContent = playerScore;

    const playerIsDrawingElement = document.createElement("span");
    playerIsDrawingElement.className = "player-drawing-indicator";
    playerIsDrawingElement.textContent = "🎨";
    playerIsDrawingElement.id = `${playerid}-drawing-indicator`

    playerElement.append(playerNameElement, playerScoreElement, playerIsDrawingElement);
    return playerElement;
}
