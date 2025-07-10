class TicTacToe {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameMode = 'pvp';
        this.difficulty = 'easy';
        this.gameOver = false;
        this.scores = { player1: 0, player2: 0, draws: 0 };
        this.totalGames = 0;
        this.soundEnabled = true;
        this.moveHistory = [];
        this.theme = 'classic';

        this.winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        this.init();
    }

    init() {
        this.bindEvents();
        this.updateDisplay();
        this.loadStats();
    }

    bindEvents() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.addEventListener('click', (e) => this.handleCellClick(e));
        });

        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('newGameBtn').addEventListener('click', () => this.newGame());
        document.getElementById('hintBtn').addEventListener('click', () => this.showHint());
        document.getElementById('undoBtn').addEventListener('click', () => this.undoMove());
        document.getElementById('soundToggle').addEventListener('click', () => this.toggleSound());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.playAgain());
        document.getElementById('closeModalBtn').addEventListener('click', () => this.closeModal());

        // Game mode selection
        document.querySelectorAll('.mode-option').forEach(option => {
            option.addEventListener('click', (e) => this.selectGameMode(e));
        });

        // Difficulty selection
        document.querySelectorAll('.difficulty-option').forEach(option => {
            option.addEventListener('click', (e) => this.selectDifficulty(e));
        });

        // Theme selection
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', (e) => this.selectTheme(e));
        });
    }

    handleCellClick(e) {
        const index = parseInt(e.target.dataset.index);

        if (this.board[index] || this.gameOver) return;

        this.makeMove(index, this.currentPlayer);
        this.playSound('move');

        if (this.checkWinner()) {
            this.handleGameEnd();
        } else if (this.board.every(cell => cell)) {
            this.handleDraw();
        } else {
            this.switchPlayer();
            if (this.gameMode === 'ai' && this.currentPlayer === 'O') {
                setTimeout(() => this.makeAIMove(), 500);
            }
        }
    }

    makeMove(index, player) {
        this.board[index] = player;
        this.moveHistory.push({ index, player });
        this.updateCell(index, player);
    }

    updateCell(index, player) {
        const cell = document.querySelector(`[data-index="${index}"]`);
        cell.textContent = player;
        cell.classList.add(player.toLowerCase());
        cell.classList.add('fade-in');
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateCurrentTurn();
    }

    makeAIMove() {
        if (this.gameOver) return;

        let move;
        switch (this.difficulty) {
            case 'easy':
                move = this.getRandomMove();
                break;
            case 'medium':
                move = this.getMediumMove();
                break;
            case 'hard':
                move = this.getBestMove();
                break;
        }

        if (move !== -1) {
            this.makeMove(move, 'O');
            this.playSound('move');

            if (this.checkWinner()) {
                this.handleGameEnd();
            } else if (this.board.every(cell => cell)) {
                this.handleDraw();
            } else {
                this.switchPlayer();
            }
        }
    }

    getRandomMove() {
        const availableMoves = this.board.map((cell, index) => cell === '' ? index : null)
            .filter(index => index !== null);
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    getMediumMove() {
        // 50% chance to make optimal move, 50% random move
        if (Math.random() < 0.5) {
            return this.getBestMove();
        }
        return this.getRandomMove();
    }

    getBestMove() {
        // Check for winning move
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'O';
                if (this.checkWinner()) {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }

        // Check for blocking move
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'X';
                if (this.checkWinner()) {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }

        // Take center if available
        if (this.board[4] === '') return 4;

        // Take corners
        const corners = [0, 2, 6, 8];
        for (let corner of corners) {
            if (this.board[corner] === '') return corner;
        }

        // Take any remaining move
        return this.getRandomMove();
    }

    checkWinner() {
        for (let pattern of this.winPatterns) {
            const [a, b, c] = pattern;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                this.highlightWinningCells(pattern);
                return this.board[a];
            }
        }
        return null;
    }

    highlightWinningCells(pattern) {
        pattern.forEach(index => {
            document.querySelector(`[data-index="${index}"]`).classList.add('winning');
        });
    }

    handleGameEnd() {
        this.gameOver = true;
        const winner = this.checkWinner();

        if (winner === 'X') {
            this.scores.player1++;
            this.showNotification('Player 1 Wins!', 'success');
        } else {
            this.scores.player2++;
            this.showNotification('Player 2 Wins!', 'success');
        }

        this.totalGames++;
        this.playSound('win');
        this.updateDisplay();
        this.saveStats();

        setTimeout(() => {
            this.showGameOverModal(winner);
        }, 1000);
    }

    handleDraw() {
        this.gameOver = true;
        this.scores.draws++;
        this.totalGames++;
        this.showNotification('It\'s a Draw!', 'info');
        this.playSound('draw');
        this.updateDisplay();
        this.saveStats();

        setTimeout(() => {
            this.showGameOverModal(null);
        }, 1000);
    }

    showGameOverModal(winner) {
        const modal = document.getElementById('gameOverModal');
        const title = document.getElementById('modalTitle');
        const message = document.getElementById('modalMessage');

        if (winner) {
            const playerName = winner === 'X' ? 'Player 1' : 'Player 2';
            title.textContent = `${playerName} Wins!`;
            message.textContent = `Congratulations! ${playerName} won this round.`;
        } else {
            title.textContent = 'It\'s a Draw!';
            message.textContent = 'Great game! No one won this round.';
        }

        modal.classList.add('show');
    }

    closeModal() {
        document.getElementById('gameOverModal').classList.remove('show');
    }

    playAgain() {
        this.closeModal();
        this.resetGame();
    }

    resetGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameOver = false;
        this.moveHistory = [];

        document.querySelectorAll('.cell').forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o', 'winning', 'fade-in');
        });

        this.updateCurrentTurn();
        this.showNotification('Game Reset!', 'info');
    }

    newGame() {
        this.resetGame();
        this.scores = { player1: 0, player2: 0, draws: 0 };
        this.totalGames = 0;
        this.updateDisplay();
        this.saveStats();
        this.showNotification('New Game Started!', 'success');
    }

    showHint() {
        if (this.gameOver || this.gameMode === 'pvp') {
            this.showNotification('Hints only available in AI mode!', 'warning');
            return;
        }

        const bestMove = this.getBestMove();
        if (bestMove !== -1) {
            const cell = document.querySelector(`[data-index="${bestMove}"]`);
            cell.classList.add('pulse');
            setTimeout(() => {
                cell.classList.remove('pulse');
            }, 2000);
            this.showNotification('Hint: Check the highlighted cell!', 'info');
        }
    }

    undoMove() {
        if (this.moveHistory.length < 1 || this.gameOver) {
            this.showNotification('No moves to undo!', 'warning');
            return;
        }

        const lastMove = this.moveHistory.pop();
        this.board[lastMove.index] = '';
        const cell = document.querySelector(`[data-index="${lastMove.index}"]`);
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'winning');

        // If in AI mode, undo AI move too
        if (this.gameMode === 'ai' && this.moveHistory.length > 0) {
            const aiMove = this.moveHistory.pop();
            this.board[aiMove.index] = '';
            const aiCell = document.querySelector(`[data-index="${aiMove.index}"]`);
            aiCell.textContent = '';
            aiCell.classList.remove('x', 'o', 'winning');
        }

        this.currentPlayer = 'X';
        this.updateCurrentTurn();
        this.showNotification('Move undone!', 'info');
    }

    selectGameMode(e) {
        document.querySelectorAll('.mode-option').forEach(option => {
            option.classList.remove('active');
        });
        e.target.classList.add('active');

        this.gameMode = e.target.dataset.mode;
        const difficultySelector = document.getElementById('difficultySelector');

        if (this.gameMode === 'ai') {
            difficultySelector.style.display = 'block';
            document.querySelector('.player-name:last-child').textContent = 'AI (O)';
        } else {
            difficultySelector.style.display = 'none';
            document.querySelector('.player-name:last-child').textContent = 'Player 2 (O)';
        }

        this.resetGame();
        this.showNotification(`Mode: ${this.gameMode === 'ai' ? 'Player vs AI' : 'Player vs Player'}`, 'info');
    }

    selectDifficulty(e) {
        document.querySelectorAll('.difficulty-option').forEach(option => {
            option.classList.remove('active');
        });
        e.target.classList.add('active');

        this.difficulty = e.target.dataset.difficulty;
        this.showNotification(`Difficulty: ${this.difficulty}`, 'info');
    }

    selectTheme(e) {
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
        });
        e.target.classList.add('active');

        this.theme = e.target.dataset.theme;
        this.applyTheme();
        this.showNotification(`Theme: ${this.theme}`, 'info');
    }

    applyTheme() {
        const root = document.documentElement;

        switch (this.theme) {
            case 'neon':
                root.style.setProperty('--primary-gradient', 'linear-gradient(135deg, #ff0099 0%, #493240 100%)');
                root.style.setProperty('--secondary-gradient', 'linear-gradient(135deg, #00ff88 0%, #0099ff 100%)');
                break;
            case 'ocean':
                root.style.setProperty('--primary-gradient', 'linear-gradient(135deg, #667eea 0%, #0b4e92 100%)');
                root.style.setProperty('--secondary-gradient', 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)');
                break;
            case 'sunset':
                root.style.setProperty('--primary-gradient', 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)');
                root.style.setProperty('--secondary-gradient', 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)');
                break;
            default:
                root.style.setProperty('--primary-gradient', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
                root.style.setProperty('--secondary-gradient', 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)');
        }
    }

    updateDisplay() {
        document.getElementById('player1Score').textContent = this.scores.player1;
        document.getElementById('player2Score').textContent = this.scores.player2;
        document.getElementById('totalGames').textContent = this.totalGames;
        document.getElementById('draws').textContent = this.scores.draws;

        const winRate = this.totalGames > 0 ?
            Math.round((this.scores.player1 / this.totalGames) * 100) : 0;
        document.getElementById('winRate').textContent = `${winRate}%`;

        const avgMoves = this.totalGames > 0 ?
            Math.round(this.moveHistory.length / this.totalGames) : 0;
        document.getElementById('avgMoves').textContent = avgMoves;
    }

    updateCurrentTurn() {
        const turnElement = document.getElementById('currentTurn');
        if (this.gameMode === 'ai') {
            turnElement.textContent = this.currentPlayer === 'X' ? 'Your Turn' : 'AI\'s Turn';
        } else {
            turnElement.textContent = this.currentPlayer === 'X' ? 'Player 1\'s Turn' : 'Player 2\'s Turn';
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const soundToggle = document.getElementById('soundToggle');
        soundToggle.textContent = this.soundEnabled ? '🔊' : '🔇';
        this.showNotification(`Sound ${this.soundEnabled ? 'On' : 'Off'}`, 'info');
    }

    playSound(type) {
        if (!this.soundEnabled) return;

        // Create audio context for sound effects
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        switch (type) {
            case 'move':
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                break;
            case 'win':
                oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
                oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                break;
            case 'draw':
                oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                break;
        }

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
    }

    // Persist stats using local storage 
    saveStats() {
        const stats = {
            scores: this.scores,
            totalGames: this.totalGames,
            theme: this.theme,
            soundEnabled: this.soundEnabled
        };
        localStorage.setItem('ticTacToeStats', JSON.stringify(stats));
    }

    loadStats() {
        const savedStats = localStorage.getItem('ticTacToeStats');
        if (savedStats) {
            const stats = JSON.parse(savedStats);
            this.scores = stats.scores || { player1: 0, player2: 0, draws: 0 };
            this.totalGames = stats.totalGames || 0;
            this.theme = stats.theme || 'classic';
            this.soundEnabled = stats.soundEnabled !== undefined ? stats.soundEnabled : true;
            this.applyTheme();
            this.updateDisplay();
        }
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
});