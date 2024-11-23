let boxes = document.querySelectorAll(".boxes");
let rstBtn = document.querySelector("#reset");
let newGameBtn = document.querySelector("#newgame");
let scoreCount = document.querySelectorAll(".scores");
let a = 0;
let b = 0;
scoreCount[0].innerText = a;
scoreCount[1].innerText = b;
let players = "player1";
let winPatterns = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

boxes.forEach((box) => {
    box.addEventListener("click", () => {
        if (players == "player1") {
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
    })
})
winCheck = () => {
    let hasWinner = false;
    for (const pattern of winPatterns) {
        let [a, b, c] = pattern;
        if (
            boxes[a].innerText &&
            boxes[a].innerText === boxes[b].innerText &&
            boxes[a].innerText === boxes[c].innerText
        ) {
            winner = boxes[a].innerText;
            setTimeout(() => {
                alert(`${winner == 'x' ? 'player 1' : 'player 2'} wins the match.`);
                playerScores();
                autoReset();
            }, 550);
            hasWinner = true;
        }
    }

    if (!hasWinner) {
        let allBoxesFilled = true;
        for (const box of boxes) {
            if (!box.innerText) {
                allBoxesFilled = false;
                break;
            }
        }

        if (allBoxesFilled) {
            setTimeout(() => {
                alert("No winner \nMatch draw");
                autoReset();
            }, 550);
        }
    }
};

playerScores = () => {
    if (winner === "x") {
        scoreCount[0].innerText = ++a;
    } else {
        if (winner === "o") {
            scoreCount[1].innerText = ++b;
        }
    }
}

function resetGame() {
    boxes.forEach((box) => {
        box.innerText = "";
        box.disabled = false;
        box.style.cssText = "background-color:white; transform: rotateY(0deg); transition:0.5s;";
        haswinner = false;
    })
}

autoReset = resetGame;
rstBtn.addEventListener("click", resetGame)

newGameBtn.addEventListener("click", () => {
    boxes.forEach((box) => {
        box.innerText = "";
        box.disabled = false;
        box.style.cssText = "background-color:white; transform: rotateY(0deg); transition:0.5s;";
        haswinner = false;
    })
    scoreCount.forEach((score) => {
        score.innerText = 0;
    })
    a = 0; b = 0;
})