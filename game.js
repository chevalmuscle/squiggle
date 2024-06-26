const Player = require("./Player");
const { playerListUpdate, turnUpdate } = require("./server");

module.exports = class Game {

    /**
        * @param {string} roomid
        * @param {number} turnLength Time per turn in ms
        * @param {Array<string>} words List of initial words
    */
    constructor(roomid, turnLength, words) {
        this.roomid = roomid;

        /**
         * List of the players in the game
         */
        this.players = [];

        /**
         * Index of the current player that is drawing
         * in the players array
         */
        this.currentPlayerIndex = 0;

        /**
            * Words that can be used during the game
            * @type {Array<string>}
        */
        this.words = words;

        /**
            * Words that have already been drawned
            * @type {Array<string>}
        */
        this.drawnWords = [];

        /**
         * Word that is being drawn in the current turn
         */
        this.wordToDraw = "";

        this.POINTS_PER_GUESS = 10;

        /**
         * Determines how close 2 strings need to be
         * to be considered very close for a human brain
         */
        this.STRING_SIMILARITY_THRESHOLD = 0.8;

        /**
         * Time per turn in ms
         */
        this.TURN_LENGTH = turnLength;

        /**
         * Pause between turns in ms
         */
        this.TIME_BETWEEN_TURNS = 5000;

        this.turnInterval = undefined;

        // auto plays turn
        this.startNewTurn();
    }

    /**
     * Returns true if the game has no player
     */
    isEmpty() {
        return this.players.length === 0;
    }

    cleanResources() {
        if (this.turnInterval) {
            clearInterval(this.turnInterval);
        }
    }

    /**
     * Return player's name by id
     * @param {string} id id of the player
     */
    getPlayerName(id) {
        const playerIndex = this.players.findIndex(player => player.id === id);
        return this.players.slice(playerIndex, playerIndex + 1)[0].name;
    }

    /**
     * Adds a player to the game
     * @param {string} id player's id
     * @param {string} name player's name
     */
    addPlayer(id, name) {
        this.players.push(new Player(id, name));
        playerListUpdate(this.roomid, this.players);
    }

    /**
     * Removes player from the game by id
     * @param {string} id  id of the player
     */
    removePlayer(id) {
        this.players.splice(
            this.players.findIndex(player => player.id === id),
            1,
        );
        playerListUpdate(this.roomid, this.players);
    }

    /**
     * Adds a word in the words bank if not already present
     * @param {string} word word to be added in the bank
     */
    addWord(word) {
        word = word.toLowerCase()
        if (this.words.indexOf(word) !== -1) {
            // the word is already in the bank
            // so its not added
            return false;
        } else {
            this.words.push(word);
            return true;
        }
    }

    startNewTurn() {
        if (this.turnInterval) {
            clearInterval(this.turnInterval);
        }

        setTimeout(() => {
            this.playNextTurn();

            this.turnInterval = setInterval(() => {
                this.startNewTurn();
            }, this.TURN_LENGTH);
        }, this.TIME_BETWEEN_TURNS);

    }
    /**
     * Plays the next turn
     *
     * Updates the score, send an update on the players list,
     * generates a new word and sends the turn's informations to the server.
     *
     * Sets the next player to play after the information is sent.
     */
    playNextTurn() {
        if (this.players.length == 0) {
            return;
        }
        this.updateScores();
        playerListUpdate(this.roomid, this.players);

        this.wordToDraw = this.getAndRemoveNextWord();

        // sets next player
        if (++this.currentPlayerIndex > this.players.length - 1)
            this.currentPlayerIndex = 0;

        turnUpdate(
            this.roomid,
            this.players[this.currentPlayerIndex].id,
            this.wordToDraw,
            this.TURN_LENGTH,
        );
    }

    /**
     * Returns a random words from the list of words in the game
     */
    getAndRemoveNextWord() {
        if (this.words.length == 0) {
            // in case there is not enough words in the bank
            return this.drawnWords[Math.floor(Math.random() * this.drawnWords.length)];
        }

        const index = Math.floor(Math.random() * this.words.length);
        const word = this.words[index];
        this.words.splice(index, 1);

        this.drawnWords.push(word);
        return word;
    }

    /**
     * Updates the players's scores based on if they guessed the word
     */
    updateScores() {
        for (let player of this.players) {
            if (player.hasFoundWord === true) {
                player.addScore(this.POINTS_PER_GUESS);
                player.hasFoundWord = false;
            }
        }
    }

    /**
     * Checks if the player has guessed the right word
     * @param {string} playerid player's id that's guessing
     * @param {string} word word guessed by the player
     */
    checkWordGuessed(playerid, word) {
        const similarity = this.levenshteinDistance(
            word.toLowerCase(),
            this.wordToDraw.toLowerCase(),
        );

        if (similarity < this.STRING_SIMILARITY_THRESHOLD) {
            return -1;
        } else if (similarity >= this.STRING_SIMILARITY_THRESHOLD && similarity < 1) {
            return 0;
        } else {
            this.players[
                this.players.findIndex(player => player.id === playerid)
            ].hasFoundWord = true;
            return 1;
        }
    }

    hasEveryPlayerFoundTheWord() {
        return this.players.every((player, index) => player.hasFoundWord || this.currentPlayerIndex === index);
    }

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
    levenshteinDistance(s1, s2) {
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
                                newValue =
                                    Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
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
};

// module.exports = { addPlayer, removePlayer, getPlayerName, checkWordGuessed };
