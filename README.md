# Squiggle

Goal: A game where you and your friends submit words and then have to guess them by drawing them one by one.

Built with the help of p5.js, socket.io and nodejs.

## Definition of Squiggle

> squiggle *noun*
>
> /ˈskwɪɡl/
>
> a line, for example in somebody’s handwriting, that is drawn or written in a careless way with curves and waves in it
>
> https://www.oxfordlearnersdictionaries.com/definition/english/squiggle

## Features

- Create a game room to play
- Ability to select base words when creating the game room
- One color (black) and no erasing
- Once you guessed the word that someone else was drawing, you
  - can add new words to the bank
  - draw on top of the current drawing
- Chaos
- Unexpected and unplanned new "features"

## Install & Run

### With docker

Requirement: [docker](https://www.docker.com)

1. `docker compose up` or `make run:docker`
2. Open the url on the port printed in the console

### Using node directly

Requirement: [node 20](https://nodejs.org/fr/blog/release/v20.9.0)

1. `npm ci` or `make install`
2. `npm start` or `make run`
3. Open the url on the port printed in the console

## Tools used

- p5.js
- socket.io
- bootstrap
