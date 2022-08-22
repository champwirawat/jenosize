const express = require("express");

const router = express.Router();

const user = "X";
const bot = "O";
const winList = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];
const sessions = {};

const winGame = (board, player) => {
  return (
    winList.filter(
      (val) =>
        board[val[0]] == player &&
        board[val[1]] == player &&
        board[val[2]] == player
    ).length > 0
  );
};
const getAvailableOnBoard = (board) => {
  return board.filter((val) => val != user && val != bot);
};
const botProcess = (board) => {
  const availableOnBoard = getAvailableOnBoard(board);

  // # 1 : check lose game
  let idxLost = null;
  for (const index of availableOnBoard) {
    const currentBoard = [...board];
    currentBoard[index] = user;
    if (winGame(currentBoard, user)) {
      idxLost = index;
    }
  }

  // # 2 : check win game
  const chanceWinList = winList.filter(
    (val) =>
      board[val[0]] != user && board[val[1]] != user && board[val[2]] != user
  );
  if (chanceWinList.length == 0) {
    return idxLost != null ? idxLost : availableOnBoard[0];
  }
  const winUse = { max: 0, pattern: [] };
  for (const data of chanceWinList) {
    let sum = 1;
    if (board[data[0]] == bot) {
      sum += 10;
    }
    if (board[data[1]] == bot) {
      sum += 10;
    }
    if (board[data[2]] == bot) {
      sum += 10;
    }
    if (winUse.max < sum) {
      winUse.max = sum;
      winUse.pattern = data;
    }
  }
  for (const index of winUse.pattern) {
    if (board[index] != bot) {
      return idxLost != null && winUse.max < 20 ? idxLost : index;
    }
  }
  return idxLost != null ? idxLost : availableOnBoard[0];
};

router.get("/", async (req, res) => {
  const token = req.cookies.__session;
  const index = req.query.index;

  let currentBoard;
  try {
    // # 1 : get current board
    if (!sessions[token]) {
      currentBoard = [0, 1, 2, 3, 4, 5, 6, 7, 8];
      sessions[token] = { board: currentBoard };
    } else {
      currentBoard = sessions[token].board;
    }

    // # 2 : validation input
    if (getAvailableOnBoard(currentBoard).length == 0) {
      throw "Game Over";
    } else if (winGame(currentBoard, bot)) {
      throw "Bot Win";
    } else if (winGame(currentBoard, user)) {
      throw "User Win";
    } else if (
      index < 0 ||
      index > 8 ||
      currentBoard[index] == user ||
      currentBoard[index] == bot
    ) {
      throw "Can't place";
    }

    // # 3 : input user
    currentBoard[index] = user;

    // # 4 : bot process
    const idxBot = botProcess(currentBoard);
    currentBoard[idxBot] = bot;

    // # 5 : set new board
    sessions[token] = { board: currentBoard };
    res.json({ status: "success", board: currentBoard });
  } catch (err) {
    console.error(err);
    res.json({ status: "error", error: err.message || err });
  }
});

router.get("/clear", async (req, res) => {
  const token = req.cookies.__session;
  if (sessions[token]) {
    sessions[token] = null;
  }
  res.json({ status: "success" });
});

module.exports = router;
