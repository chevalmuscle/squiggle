# Squiggle

Goal: A game where you and your friends submit words and then have to guess them by drawing them one by one.

Built with the help of p5.js, socket.io, nodejs.

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

## Requirements

- node 20 or [nix](https://nixos.org) to load dependencies from `shell.nix`

## Installation

0. Install node & npm
1. Clone the repo
2. `npm ci`

## Run

`npm start` and open the localhost url printed in the console

## Tools used

- p5.js
- socket.io
- bootstrap
