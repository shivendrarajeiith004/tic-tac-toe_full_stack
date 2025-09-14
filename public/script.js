document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('board');
    const statusElement = document.getElementById('status');
    const resetButton = document.getElementById('reset');
    
    // Initialize the board
    function initBoard() {
        boardElement.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.index = i;
            cell.addEventListener('click', handleCellClick);
            boardElement.appendChild(cell);
        }
    }

    // Update UI based on game state
    async function updateGameState() {
        const response = await fetch('/api/game/state');
        const gameState = await response.json();
        
        // Update cells
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            cell.textContent = gameState.board[index] || '';
            cell.classList.remove('x', 'o');
            if (gameState.board[index]) {
                cell.classList.add(gameState.board[index].toLowerCase());
            }
        });

        // Update status
        if (gameState.winner) {
            statusElement.textContent = gameState.winner === 'draw' 
                ? 'Game ended in a draw!' 
                : `Player ${gameState.winner} wins!`;
        } else {
            statusElement.textContent = `Player ${gameState.currentPlayer}'s turn`;
        }

        // Highlight winning cells
        if (gameState.winningLine) {
            gameState.winningLine.forEach(index => {
                cells[index].classList.add('winning-cell');
            });
        }
    }

    // Handle cell click
    async function handleCellClick(e) {
        const index = parseInt(e.target.dataset.index);
        
        try {
            const response = await fetch('/api/game/move', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ index })
            });
            
            if (!response.ok) {
                throw new Error('Invalid move');
            }
            
            await updateGameState();
        } catch (error) {
            console.error('Move error:', error);
        }
    }

    // Handle reset
    resetButton.addEventListener('click', async () => {
        await fetch('/api/game/reset', { method: 'POST' });
        await updateGameState();
    });

    // Initialize game
    initBoard();
    updateGameState();
});
