const cells = document.querySelectorAll('[data-cell]');
const board = document.querySelector('.game');
const winningMessage = document.getElementById('winning-message');
const messageText = document.getElementById('message-text');
const restartBtn = document.getElementById('restart');
const modeSelect = document.getElementById("mode");

let gameMode = "pvp"; // default
modeSelect.addEventListener("change", () => {
  gameMode = modeSelect.value;
  startGame(); // restart when mode changes
});

let playerMark = "X";
let botMark = "O";
let currentTurn = "X";


let oTurn;
const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

startGame();

restartBtn.addEventListener('click', startGame);

function startGame() {
    currentTurn = "X";
  cells.forEach(cell => {
    cell.classList.remove("X", "O");
    cell.textContent = "";
    cell.removeEventListener("click", handleClick);
    cell.addEventListener("click", handleClick, { once: true });
  });

  winningMessage.classList.add("hidden");
  restartBtn.classList.remove("restart-glow");

  // If bot is playing and should go first
  if (gameMode !== "pvp" && firstTurn === "bot") {
    setTimeout(botMove, 300);
  }
}


function handleClick(e) {
  const cell = e.target;

  if (cell.textContent !== "") return;

  if (gameMode === "pvp") {
    // 👥 PvP Mode
    placeMark(cell, currentTurn);

    if (checkWin(currentTurn)) {
      endGame(false, currentTurn);
    } else if (isDraw()) {
      endGame(true);
    } else {
      currentTurn = currentTurn === "X" ? "O" : "X"; // 🔁 Toggle turn
    }

  } else {
    // 🤖 Bot Mode
    placeMark(cell, playerMark);

    if (checkWin(playerMark)) {
      endGame(false, playerMark);
    } else if (isDraw()) {
      endGame(true);
    } else {
      setTimeout(botMove, 300);
    }
  }
}

function botMove() {
  let bestMove;
  switch (gameMode) {
    case "easy":
      bestMove = getRandomMove();
      break;
    case "medium":
      bestMove = getMediumMove();
      break;
    case "hard":
      bestMove = getBestMove(botMark); // botMark = O
      break;
  }

  if (bestMove !== undefined) {
    placeMark(cells[bestMove], botMark);

    if (checkWin(botMark)) {
        endGame(false, botMark); // pass the actual winner
    } else if (isDraw()) {
        endGame(true);
    }

  }
}

function getBestMove(botMark) {
  const humanMark = botMark === "X" ? "O" : "X";
  let bestScore = -Infinity;
  let move;

  getAvailableCells().forEach(index => {
    cells[index].textContent = botMark;
    const score = minimax(cells, 0, false, botMark, humanMark);
    cells[index].textContent = "";
    if (score > bestScore) {
      bestScore = score;
      move = index;
    }
  });

  return move;
}

function minimax(boardCells, depth, isMaximizing, botMark, humanMark) {
  if (checkWinState(botMark)) return 10 - depth;
  if (checkWinState(humanMark)) return depth - 10;
  if (getAvailableCells().length === 0) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    getAvailableCells().forEach(index => {
      boardCells[index].textContent = botMark;
      const score = minimax(boardCells, depth + 1, false, botMark, humanMark);
      boardCells[index].textContent = "";
      bestScore = Math.max(score, bestScore);
    });
    return bestScore;
  } else {
    let bestScore = Infinity;
    getAvailableCells().forEach(index => {
      boardCells[index].textContent = humanMark;
      const score = minimax(boardCells, depth + 1, true, botMark, humanMark);
      boardCells[index].textContent = "";
      bestScore = Math.min(score, bestScore);
    });
    return bestScore;
  }
}

function checkWinState(mark) {
  return WINNING_COMBINATIONS.some(combination =>
    combination.every(index => cells[index].textContent === mark)
  );
}

function getAvailableCells() {
  return [...cells].map((cell, i) => cell.textContent === "" ? i : null).filter(i => i !== null);
}

function getRandomMove() {
  const available = getAvailableCells();
  return available[Math.floor(Math.random() * available.length)];
}

function getMediumMove() {
  const available = getAvailableCells();

  // 1. Win if possible
  for (let i of available) {
    cells[i].textContent = "O";
    if (checkWin("O")) {
      cells[i].textContent = "";
      return i;
    }
    cells[i].textContent = "";
  }

  // 2. Block X if they're about to win
  for (let i of available) {
    cells[i].textContent = "X";
    if (checkWin("X")) {
      cells[i].textContent = "";
      return i;
    }
    cells[i].textContent = "";
  }

  // 3. Else random
  return getRandomMove();
}

function placeMark(cell, currentMark) {
  cell.classList.add(currentMark);
  cell.textContent = currentMark;
}

const firstTurnSelect = document.getElementById("firstTurn");
let firstTurn = "player"; // default

firstTurnSelect.addEventListener("change", () => {
  firstTurn = firstTurnSelect.value;
  startGame(); // restart game if turn changes
});

function checkWin(currentClass) {
  return WINNING_COMBINATIONS.some(combination =>
    combination.every(index => cells[index].classList.contains(currentClass))
  );
}

function isDraw() {
  return [...cells].every(cell => cell.classList.contains('X') || cell.classList.contains('O'));
}

function endGame(draw, winner = null) {
  if (draw) {
    messageText.textContent = "It's a Draw!";
  } else {
    messageText.textContent = `${winner} Wins!`;  // show actual winner mark
  }

  winningMessage.classList.remove("hidden");

  // Disable further moves
  cells.forEach(cell => {
    cell.removeEventListener("click", handleClick);
  });

  // Highlight restart
  restartBtn.classList.add("restart-glow");
}


