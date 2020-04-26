module.exports = class Player {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.score = 0;
  }

  addScore(scoreToAdd) {
    this.score += scoreToAdd;
  }

  resetScore() {
    this.score = 0;
  }
};
