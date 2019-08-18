const canvas = document.querySelector('#tetris');
const ctx = canvas.getContext('2d');
const scoreElement = document.querySelector('#score');

const ROW = 20;
const COL = COLUMN = 10;
const SQ = squareSize = 20;
const VACANT = "WHITE"; // color of an empty square

function drawSquare(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * SQ, y * SQ, SQ, SQ);

  ctx.strokeStyle = 'BLACK';
  ctx.strokeRect(x * SQ, y * SQ, SQ, SQ);
}

let board = [];
for (row = 0; row < ROW; row++) {
  board[row] = [];
  for (col = 0; col < COL; col++) {
    board[row][col] = VACANT;
  }
}

function drawBoard() {
  for (row = 0; row < ROW; row++) {
    for (col = 0; col < COL; col++) {
      drawSquare(col, row, board[row][col]);
    }
  }
}

drawBoard();

const PIECES = [
  [Z, "red"],
  [S, "green"],
  [T, "yellow"],
  [O, "blue"],
  [L, "purple"],
  [I, "cyan"],
  [J, "orange"]
];

function randomPiece() {
  let r = randomNum = Math.floor(Math.random() * PIECES.length);
  return new Piece(PIECES[r][0], PIECES[r][1]);
}

let p = randomPiece();

function Piece(tetromino, color) {
  this.tetromino = tetromino;
  this.color = color;

  this.tetrominoN = 0;
  this.activeTetromino = this.tetromino[this.tetrominoN];

  this.x = 3;
  this.y = -2;
}

Piece.prototype.fill = function (color) {
  for (row = 0; row < this.activeTetromino.length; row++) {
    for (col = 0; col < this.activeTetromino.length; col++) {
      if (this.activeTetromino[row][col]) {
        drawSquare(this.x + col, this.y + row, color);
      }
    }
  }
}

// undraw a piece
Piece.prototype.unDraw = function () {
  this.fill(VACANT);
}
// draw a piece to the board

Piece.prototype.draw = function () {
  this.fill(this.color);
}


//move piece down
Piece.prototype.moveDown = function () {
  if (!this.collision(0, 1, this.activeTetromino)) {
    this.unDraw();
    this.y++;
    this.draw();
  } else {
    //lock piece and generate new orange
    this.lock();
    p = randomPiece();
  }
}

Piece.prototype.moveRight = function () {
  if (!this.collision(1, 0, this.activeTetromino)) {
    this.unDraw();
    this.x++;
    this.draw();
  }
}

Piece.prototype.moveLeft = function () {
  if (!this.collision(-1, 0, this.activeTetromino)) {
    this.unDraw();
    this.x--;
    this.draw();
  }
}

Piece.prototype.rotate = function () {
  let nextPattern = this.tetromino[(this.tetrominoN + 1) % this.tetromino.length];
  let kick = 0;

  if (this.collision(0, 0, nextPattern)) {
    if (this.x > COL / 2) {
      // it's the right wall
      kick = -1; // we need to move the piece to the left
    } else {
      // it's the left wall
      kick = 1; // we need to move the piece to the right
    }
  }

  if (!this.collision(kick, 0, nextPattern)) {
    this.unDraw();
    this.x += kick;
    this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length; // (0+1)%4 => 1
    this.activeTetromino = this.tetromino[this.tetrominoN];
    this.draw();
  }
}

let score = 0;

Piece.prototype.lock = function () {
  for (r = 0; r < this.activeTetromino.length; r++) {
    for (c = 0; c < this.activeTetromino.length; c++) {
      // we skip the vacant squares
      if (!this.activeTetromino[r][c]) {
        continue;
      }
      // pieces to lock on top = game over
      if (this.y + r < 0) {
        alert("Game Over");
        // stop request animation frame
        gameOver = true;
        break;
      }
      // we lock the piece
      board[this.y + r][this.x + c] = this.color;
    }
  }
  // remove full rows
  for (r = 0; r < ROW; r++) {
    let isRowFull = true;
    for (c = 0; c < COL; c++) {
      isRowFull = isRowFull && (board[r][c] != VACANT);
    }
    if (isRowFull) {
      // if the row is full
      // we move down all the rows above it
      for (y = r; y > 1; y--) {
        for (c = 0; c < COL; c++) {
          board[y][c] = board[y - 1][c];
        }
      }
      // the top row board[0][..] has no row above it
      for (c = 0; c < COL; c++) {
        board[0][c] = VACANT;
      }
      // increment the score
      score += 10;
    }
  }
  // update the board
  drawBoard();

  // update the score
  scoreElement.innerHTML = score;
}

//Collision detection

Piece.prototype.collision = function (x, y, piece) {
  for (row = 0; row < piece.length; row++) {
    for (col = 0; col < piece.length; col++) {
      if (!piece[row][col]) {
        continue;
      }
      let newX = this.x + col + x;
      let newY = this.y + row + y;

      if (newX < 0 || newX >= COL || newY >= ROW) {
        return true;
      }
      if (newY < 0) {
        continue;
      }
      if (board[newY][newX] != VACANT) {
        return true;
      }
    }
  }
  return false;
}


//Event Listeners

document.addEventListener("keydown", CONTROL);

function CONTROL(event) {
  if (event.keyCode == 37) {
    p.moveLeft();
    dropStart = Date.now();
  } else if (event.keyCode == 38) {
    p.rotate();
    dropStart = Date.now();
  } else if (event.keyCode == 39) {
    p.moveRight();
    dropStart = Date.now();
  } else if (event.keyCode == 40) {
    p.moveDown();
  }
}

// drop the piece every 1sec

let dropStart = Date.now();
let gameOver = false;
function drop() {
  let now = Date.now();
  let delta = now - dropStart;
  if (delta > 1000) {
    p.moveDown();
    dropStart = Date.now();
  }
  if (!gameOver) {
    requestAnimationFrame(drop);
  }
}

drop();
