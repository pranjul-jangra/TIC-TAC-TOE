const boxes = document.querySelectorAll(".boxes");
const rstBtn = document.querySelector("#reset");
const newGameBtn = document.querySelector("#newgame");
const scoreCount = document.querySelectorAll(".scores");
const notify = document.querySelector('#notify');
const loadingIndicator = document.createElement('div');

loadingIndicator.style.cssText = 'width: 0; background-color: red; height: 7px; position: absolute; bottom: 0; left: 0; transition: all 3s;';

// Game variables
let a = 0;
let b = 0;
let players = "player1";
let haswinner = false;
let winner = null;

scoreCount[0].innerText = a;
scoreCount[1].innerText = b;

let winPatterns = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

boxes.forEach((box) => {
    box.addEventListener("click", () => {
        if (haswinner) return;

        if (players === "player1") {
            box.innerText = "x";
            box.style.cssText = "background-color:red; transform: rotateY(180deg); transition:0.5s;";
            players = "player2";
        } else {
            box.innerText = "o";
            box.style.cssText = "background-color:green; transform: rotateY(180deg); transition:0.5s;";
            players = "player1";
        }
        box.disabled = true;

        winCheck();
    });
});

function winCheck() {
    for (const pattern of winPatterns) {
        const [x, y, z] = pattern;
        if (
            boxes[x].innerText &&
            boxes[x].innerText === boxes[y].innerText &&
            boxes[x].innerText === boxes[z].innerText
        ) {
            haswinner = true;
            for (let box of boxes) {
                box.disabled = true;
            }
            winner = boxes[x].innerText;

            notify.innerHTML = `${winner === 'x' ? 'Player 1' : 'Player 2'} wins the match.`;
            notify.appendChild(loadingIndicator);

            setTimeout(() => {
                loadingIndicator.style.width = '100%';
            }, 0);

            notify.style.cssText = 'transform: translateX(0); opacity: 1;';
            updateScores();
            disableAllBoxes();
            resetNotifyAfterDelay();
            setTimeout(() => { resetGame() }, 3000)
            return;
        }
    }

    if (!haswinner && Array.from(boxes).every(box => box.innerText)) {
        setTimeout(() => {
            alert("No winner \nMatch draw");
            resetGame();
        }, 550);
    }
}

function disableAllBoxes() {
    boxes.forEach((box) => {
        box.disabled = true;
    });
}

function resetNotifyAfterDelay() {
    setTimeout(() => {
        notify.style.cssText = 'transform: translateX(-100%); opacity: 0;';
        loadingIndicator.style.width = '0';
    }, 3000);
}

function updateScores() {
    if (winner === "x") {
        scoreCount[0].innerText = ++a;
    } else if (winner === "o") {
        scoreCount[1].innerText = ++b;
    }
}

function resetGame() {
    boxes.forEach((box) => {
        box.innerText = "";
        box.disabled = false;
        box.style.cssText = "background-color:white; transform: rotateY(0deg); transition:0.5s;";
    });
    haswinner = false;
    winner = null;
}

rstBtn.addEventListener("click", resetGame);

newGameBtn.addEventListener("click", () => {
    resetGame();
    scoreCount.forEach(score => score.innerText = 0);
    a = 0, b = 0;
});