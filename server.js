const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Game state
let gameState = {
    board: Array(9).fill(null),
    currentPlayer: 'X',
    winner: null,
    winningLine: null
};

// Check for winner
function checkWinner(board) {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    for (const line of lines) {
        const [a, b, c] = line;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return {
                winner: board[a],
                winningLine: line
            };
        }
    }

    return {
        winner: board.includes(null) ? null : 'draw',
        winningLine: null
    };
}

// API Endpoints
app.get('/api/game/state', (req, res) => {
    res.json(gameState);
});

app.post('/api/game/move', (req, res) => {
    const { index } = req.body;
    
    if (gameState.winner || gameState.board[index] !== null) {
        return res.status(400).json({ error: 'Invalid move' });
    }

    gameState.board[index] = gameState.currentPlayer;
    
    const { winner, winningLine } = checkWinner(gameState.board);
    gameState.winner = winner;
    gameState.winningLine = winningLine;
    
    if (!gameState.winner) {
        gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
    }

    res.json(gameState);
});

app.post('/api/game/reset', (req, res) => {
    gameState = {
        board: Array(9).fill(null),
        currentPlayer: 'X',
        winner: null,
        winningLine: null
    };
    res.json(gameState);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
