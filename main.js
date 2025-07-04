const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const COLORS = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'];

const TETROMINOES = [
    [[1, 1, 1, 1]],
    [[1, 1], [1, 1]],
    [[0, 1, 0], [1, 1, 1]],
    [[0, 1, 1], [1, 1, 0]],
    [[1, 1, 0], [0, 1, 1]],
    [[1, 0, 0], [1, 1, 1]],
    [[0, 0, 1], [1, 1, 1]]
];

let board = [];
let currentPiece = null;
let nextPiece = null;
let currentX = 0;
let currentY = 0;
let score = 0;
let gameRunning = false;
let gameSpeed = 500;
let gameInterval;

function initBoard() {
    board = [];
    for (let row = 0; row < BOARD_HEIGHT; row++) {
        board[row] = [];
        for (let col = 0; col < BOARD_WIDTH; col++) {
            board[row][col] = 0;
        }
    }
}

function createPiece() {
    const pieceIndex = Math.floor(Math.random() * TETROMINOES.length);
    const piece = TETROMINOES[pieceIndex];
    return {
        shape: piece,
        color: COLORS[pieceIndex]
    };
}

function isValidPosition(piece, x, y) {
    for (let row = 0; row < piece.shape.length; row++) {
        for (let col = 0; col < piece.shape[row].length; col++) {
            if (piece.shape[row][col]) {
                const newX = x + col;
                const newY = y + row;
                if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
                    return false;
                }
                if (newY >= 0 && board[newY][newX]) {
                    return false;
                }
            }
        }
    }
    return true;
}

function placePiece(piece, x, y) {
    for (let row = 0; row < piece.shape.length; row++) {
        for (let col = 0; col < piece.shape[row].length; col++) {
            if (piece.shape[row][col]) {
                const newX = x + col;
                const newY = y + row;
                if (newY >= 0) {
                    board[newY][newX] = piece.color;
                }
            }
        }
    }
}

function rotatePiece(piece) {
    const rows = piece.shape.length;
    const cols = piece.shape[0].length;
    const rotated = [];
    for (let i = 0; i < cols; i++) {
        rotated[i] = [];
        for (let j = 0; j < rows; j++) {
            rotated[i][j] = piece.shape[rows - 1 - j][i];
        }
    }
    return {
        shape: rotated,
        color: piece.color
    };
}

function checkLines() {
    let linesCleared = 0;
    for (let row = BOARD_HEIGHT - 1; row >= 0; row--) {
        let isComplete = true;
        for (let col = 0; col < BOARD_WIDTH; col++) {
            if (!board[row][col]) {
                isComplete = false;
                break;
            }
        }
        if (isComplete) {
            board.splice(row, 1);
            board.unshift(new Array(BOARD_WIDTH).fill(0));
            linesCleared++;
            row++;
        }
    }
    if (linesCleared > 0) {
        score += linesCleared * 100;
        document.getElementById('score').textContent = score;
        if (score % 1000 === 0) {
            gameSpeed = Math.max(100, gameSpeed - 50);
        }
    }
}

function renderNextPiece() {
    const nextGrid = document.getElementById('next-piece-grid');
    if (!nextGrid) return;
    nextGrid.innerHTML = '';
    if (nextPiece) {
        const maxSize = 4;
        for (let row = 0; row < maxSize; row++) {
            for (let col = 0; col < maxSize; col++) {
                const cell = document.createElement('div');
                cell.style.width = '15px';
                cell.style.height = '15px';
                cell.style.border = '1px solid #333';
                cell.style.boxSizing = 'border-box';
                if (row < nextPiece.shape.length && col < nextPiece.shape[row].length && nextPiece.shape[row][col]) {
                    cell.style.backgroundColor = nextPiece.color;
                    cell.classList.add('filled');
                }
                nextGrid.appendChild(cell);
            }
        }
    }
}

const grid = document.getElementById('tetris-grid');
grid.innerHTML = '';
const renderBoard = board.map(row => [...row]);

if (currentPiece) {
    for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
            if (currentPiece.shape[row][col]) {
                const x = currentX + col;
                const y = currentY + row;
                if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
                    renderBoard[y][x] = currentPiece.color;
                }
            }
        }
    }
}

function render() {
    const grid = document.getElementById('tetris-grid');
    grid.innerHTML = '';
    const renderBoard = board.map(row => [...row]);
    if (currentPiece) {
        for (let row = 0; row < currentPiece.shape.length; row++) {
            for (let col = 0; col < currentPiece.shape[row].length; col++) {
                if (currentPiece.shape[row][col]) {
                    const x = currentX + col;
                    const y = currentY + row;
                    if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
                        renderBoard[y][x] = currentPiece.color;
                    }
                }
            }
        }
    }
    for (let row = 0; row < BOARD_HEIGHT; row++) {
        for (let col = 0; col < BOARD_WIDTH; col++) {
            const cell = document.createElement('div');
            if (renderBoard[row][col]) {
                cell.style.backgroundColor = renderBoard[row][col];
                cell.classList.add('filled');
            }
            grid.appendChild(cell);
        }
    }
    renderNextPiece();
}

function moveDown() {
    if (currentPiece && isValidPosition(currentPiece, currentX, currentY + 1)) {
        currentY++;
    } else {
        if (currentPiece) {
            placePiece(currentPiece, currentX, currentY);
            checkLines();
        }
        currentPiece = nextPiece;
        nextPiece = createPiece();
        currentX = Math.floor(BOARD_WIDTH / 2) - Math.floor(currentPiece.shape[0].length / 2);
        currentY = 0;
        if (!isValidPosition(currentPiece, currentX, currentY)) {
            gameOver();
            return;
        }
    }
    render();
}

function moveHorizontal(direction) {
    if (currentPiece && isValidPosition(currentPiece, currentX + direction, currentY)) {
        currentX += direction;
        render();
    }
}

function rotate() {
    if (currentPiece) {
        const rotated = rotatePiece(currentPiece);
        if (isValidPosition(rotated, currentX, currentY)) {
            currentPiece = rotated;
            render();
        }
    }
}

function drop() {
    if (currentPiece) {
        while (isValidPosition(currentPiece, currentX, currentY + 1)) {
            currentY++;
        }
        render();
    }
}

function gameOver() {
    gameRunning = false;
    clearInterval(gameInterval);
    const audio = document.getElementById('tetris-soundtrack');
    audio.pause();
    alert('¡Juego terminado! Puntaje final: ' + score);
}

function startGame() {
    if (gameRunning) return;
    const audio = document.getElementById('tetris-soundtrack');
    audio.currentTime = 0;
    audio.play();
    gameRunning = true;
    score = 0;
    gameSpeed = 500;
    document.getElementById('score').textContent = score;
    initBoard();
    currentPiece = createPiece();
    nextPiece = createPiece();
    currentX = Math.floor(BOARD_WIDTH / 2) - Math.floor(currentPiece.shape[0].length / 2);
    currentY = 0;
    render();
    gameInterval = setInterval(moveDown, gameSpeed);
}

document.addEventListener('keydown', (event) => {
    if (!gameRunning) return;
    switch (event.key) {
        case 'ArrowLeft':
            moveHorizontal(-1);
            break;
        case 'ArrowRight':
            moveHorizontal(1);
            break;
        case 'ArrowDown':
            moveDown();
            break;
        case 'ArrowUp':
            rotate();
            break;
        case ' ':
            drop();
            break;
    }
});

function updateGameSpeed() {
    if (gameRunning) {
        clearInterval(gameInterval);
        gameInterval = setInterval(moveDown, gameSpeed);
    }
}
