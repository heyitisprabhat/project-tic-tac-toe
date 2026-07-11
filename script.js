function Gameboard() {
  const cells = 9;
  const board = [];

  for (let i = 0; i < cells; i++) {
    board[i] = Cell(); // board[i].push(Cell()) wouldn't work because it doesn't exist yet.
  }

  const getBoard = () => board;

  const dropMarker = (cell, player) => {
    if (board[cell].getValue() !== "") {
      return false;
    }
    board[cell].addMarker(player);
    return true;
  }; // function to check, if the cell is vacant fill the cell and return true, otherwise false

  const getBoardValues = () => board.map((cell) => cell.getValue()); // Returns the array with only values to check for win condition

  const printBoard = () => {
    console.log(getBoardValues());
  };

  const resetBoard = () => board.forEach((cell) => cell.resetValue()); // Resetting the Cell value to empty string for new game, Every() is a checker only, so it would not work

  return { getBoard, dropMarker, getBoardValues, printBoard, resetBoard };
}

function Cell() {
  let value = "";

  const addMarker = (player) => {
    value = player;
  };

  const getValue = () => value;

  const resetValue = () => {
    value = "";
  };

  return {
    addMarker,
    getValue,
    resetValue,
  };
}

const winningCombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8], // Rows
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8], // Columns
  [0, 4, 8],
  [2, 4, 6], // Diagonals
];

function checkWinner(board) {
  for (let combo of winningCombos) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return combo;
    }
  }

  return null;
}

function GameController(playerOne = "Player One", playerTwo = "Player Two") {
  const board = Gameboard();
  let round = 1;
  const getRound = () => round;

  let freezeBoard = false; // freezing the board when a round is over
  const isBoardFrozen = () => freezeBoard;

  const players = [
    { name: playerOne, marker: "X", score: 0 },
    { name: playerTwo, marker: "O", score: 0 },
  ];

  const getPlayers = (index) => players[index]; // target player one or player two, for rendering

  const getBoardValues = () => board.getBoardValues();

  const resetGameState = () => {
    round = 1;
    board.resetBoard();
    winningCells = null;
    freezeBoard = false;

    players[0].score = 0;
    players[0].name = "Player One";
    players[1].score = 0;
    players[1].name = "Player Two";

    activePlayer = players[0];
  };

  const resetRoundState = () => {
    // round++;
    board.resetBoard();
    winningCells = null;
    freezeBoard = false;
    activePlayer = players[0];
  };

  let activePlayer = players[0];

  const switchPlayerTurn = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };
  const getActivePlayer = () => activePlayer;

  const printNewRound = () => {
    // new board for next player's turn
    board.printBoard();
    console.log(`${getActivePlayer().name}'s turn.`);
  };

  let winningCells = null;
  const getWinningCells = () => winningCells;

  const playRound = (cell) => {
    const cellCheck = board.dropMarker(cell, getActivePlayer().marker);
    if (!cellCheck) {
      return {
        status: "invalid",
      };
    } // return and show alert if the cell is not vacant

    winningCells = checkWinner(getBoardValues());
    if (winningCells) {
      freezeBoard = true;
      getActivePlayer().score++;
      round++;

      return {
        status: "win",
        winner: getActivePlayer(),
      };
    } else if (getBoardValues().every((cell) => cell !== "")) {
      freezeBoard = true;
      round++;

      return {
        status: "draw",
      };
    }

    switchPlayerTurn();
    printNewRound();
    return {
      status: "continue", // function needs to return something, otherwise it will  return undefined, which will break the code if you are assigning the function to a variable.
    }; // new board after each player turn
  };

  printNewRound(); // board immediately as game starts

  return {
    playRound,
    getRound,
    isBoardFrozen,
    getPlayers,
    getActivePlayer,
    getBoardValues,
    getWinningCells,
    resetRoundState,
    resetGameState,
  };
}

let game = GameController();

const boardCell = document.querySelectorAll(".cells");
const roundDisplay = document.getElementById("rounds");

const playerOneName = document.getElementById("player-one-name");
const playerTwoName = document.getElementById("player-two-name");
const playerOneScore = document.getElementById("player-one-score");
const playerTwoScore = document.getElementById("player-two-score");

const roundHeadline = document.getElementById("round-headline");
const gameHeadline = document.getElementById("game-headline");

const form = document.getElementById("player-form");

const resetRound = document.getElementById("reset-round");
const resetGame = document.getElementById("reset-game");
const SubmitBtn = document.getElementById("submit-btn");

function render() {
  const values = game.getBoardValues(); // an array with all the markers
  const winners = game.getWinningCells();

  boardCell.forEach((cell, i) => {
    cell.textContent = values[i]; // Gives each cell an appropriate marker comparing it with "values" array and this is an issue, because it will always fill the cell even after the match

    if (winners && winners.includes(i)) {
      cell.classList.add("winner");
    } else {
      cell.classList.remove("winner");
    }
  });
}

function screenRender() {
  roundDisplay.textContent = `Round ${game.getRound()}`;
  playerOneName.textContent = `${game.getPlayers(0).name} : `;
  playerOneScore.textContent = `${game.getPlayers(0).score}`;
  playerTwoName.textContent = `${game.getPlayers(1).name} : `;
  playerTwoScore.textContent = `${game.getPlayers(1).score}`;
  roundHeadline.textContent = "";
  gameHeadline.textContent = "";
}
// Need a way to find to attach the score name and round directly

boardCell.forEach((div) => {
  div.addEventListener("click", () => {
    if (game.isBoardFrozen()) {
      alert("The Game is Over, Play Next Round or Start New Game.");
      return;
    }

    if (roundDisplay.textContent === "Pick Players' Names") {
      roundDisplay.textContent = `Round ${game.getRound()}`;
    }

    const result = game.playRound(div.id);
    if (result.status === "invalid") {
      alert("Pick another cell.");
    }

    if (result.status === "win") {
      roundHeadline.textContent = `${result.winner.name} wins the round.`;
    }

    if (result.status === "draw") {
      roundHeadline.textContent = "This round is a draw!";
    }

    playerOneScore.textContent = `${game.getPlayers(0).score}`;
    playerTwoScore.textContent = `${game.getPlayers(1).score}`;

    if (
      game.getRound() > 3 &&
      game.getPlayers(0).score > game.getPlayers(1).score
    ) {
      gameHeadline.textContent = `${game.getPlayers(0).name} Wins the Game.`;
    } else if (
      game.getRound() > 3 &&
      game.getPlayers(0).score < game.getPlayers(1).score
    ) {
      gameHeadline.textContent = `${game.getPlayers(1).name} Wins the Game.`;
    } else if (
      game.getRound() > 3 &&
      game.getPlayers(0).score === game.getPlayers(1).score
    ) {
      gameHeadline.textContent = `The Game is a Tie.`;
    }

    render();
  });
});

SubmitBtn.addEventListener("click", (e) => {
  e.preventDefault();

  if (
    game.getRound() < 4 &&
    !game.getBoardValues().every((cell) => cell === "")
  ) {
    alert("Can not change names, mid Game.");
    return;
  }

  const playerOne = document.getElementById("input-player-one").value;
  const playerTwo = document.getElementById("input-player-two").value;

  if (playerOne === "" || playerTwo === "") {
    return alert("Oops! Missed Something.");
  }

  game = GameController(playerOne, playerTwo);
  render();
  screenRender();
  form.reset();
});

resetRound.addEventListener("click", () => {
  if (!game.isBoardFrozen()) {
    alert("Finish this Round, first.");
    return;
  }

  if (game.getRound() > 3) {
    alert("The Game is already Over, Reset Game to start New One.");
    return;
  }

  game.resetRoundState();
  render();
  screenRender();
});

resetGame.addEventListener("click", () => {
  game.resetGameState();
  render();
  screenRender();
});
