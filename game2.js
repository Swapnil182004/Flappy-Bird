// Pick elements
const bird = document.querySelector('.bird img');
const gameContainer = document.body;
const movingGrass = document.querySelector(".grass");
const startMessage = document.querySelector(".start-message");
const gameOverBox = document.querySelector('.game-over');
const scoreNumber = document.querySelector('.scorenumber')

movingGrass.style.animationPlayState = "paused";

gameOverBox.style.visibility = "hidden";
gameOverBox.style.opacity = "0";


// Game variables
let birdY = window.innerHeight * 0.4; // renamed for clarity
let gravity = 1;
let jump = -6;
let velocity = 0;
let isGameOver = false;
let score = 0;

let isSpacePressed = false;
let pipeInterval = null;

function createPipe() {
    if (isGameOver) return;

    const gap = 140;
    const minPipeHeight = 50;
    const maxPipeHeight = window.innerHeight - gap - minPipeHeight;

    // Random height for top pipe
    const pipeDownHeight = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight) + minPipeHeight);

    // Pipe Down (top)
    const pipeDown = document.createElement('div');
    pipeDown.classList.add('pipe', 'pipe-down');
    pipeDown.style.height = `${pipeDownHeight}px`;
    pipeDown.style.left = '100vw';
    pipeDown.innerHTML = `<img src="images/pipe down.png" width="80" height="${pipeDownHeight}">`;

    // Pipe Up (bottom)
    const pipeUpHeight = window.innerHeight - pipeDownHeight - gap;
    const pipeUp = document.createElement('div');
    pipeUp.classList.add('pipe', 'pipe-up');
    pipeUp.style.height = `${pipeUpHeight}px`;
    pipeUp.style.left = '100vw';
    pipeUp.style.bottom = '0px';
    pipeUp.innerHTML = `<img src="images/pipe up.png" width="80" height="${pipeUpHeight}">`;

    gameContainer.appendChild(pipeDown);
    gameContainer.appendChild(pipeUp);

    movePipe(pipeDown, pipeUp);
}


// Move pipes
function movePipe(pipeDown, pipeUp) {
    let pipeX = window.innerWidth;

    const moveInterval = setInterval(() => {
        if (isGameOver) {
            clearInterval(moveInterval);
            pipeDown.remove();
            pipeUp.remove();
            return;
        }

        pipeX -= 3;
        pipeDown.style.left = `${pipeX}px`;
        pipeUp.style.left = `${pipeX}px`;

        // Collision detection call
            if( isColliding(bird, pipeDown) || isColliding(bird, pipeUp)){
                
                gameOver();
            }

        // Score increase
        if (pipeX === 95) {
            score++;
            console.log("Score:", score);

        }
        scoreNumber.innerHTML = score;

        // Remove pipe when off screen
        if (pipeX < -100) {
            pipeDown.remove();
            pipeUp.remove();
            clearInterval(moveInterval);
        }
    }, 16);
}


//collision detection function:

function isColliding(bird, pipe) {
    const birdRect = bird.getBoundingClientRect();
    const pipeRect = pipe.getBoundingClientRect();

    return !(
        birdRect.top > pipeRect.bottom ||
        birdRect.bottom < pipeRect.top ||
        birdRect.right < pipeRect.left ||
        birdRect.left > pipeRect.right
    );
}


// Bird position update
function updateBird() {
    if (!isGameOver) {
        velocity += gravity * 0.3;
        birdY += velocity;

        if (birdY < 0) birdY = 0;

        // Ground collision
        if (birdY + bird.height > window.innerHeight - 5) {
            gameOver();
        }

        bird.style.position = 'fixed';
        bird.style.top = `${birdY}px`;

        requestAnimationFrame(updateBird);
    }
}


// Jump bird on space press
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && !isGameOver && isSpacePressed) {
        velocity = jump; // Jump
    }
});


function swapBirdWing() {
    if (!isGameOver) {
        let currentImg = bird.src.split("/").pop();
        bird.src = currentImg === "bird1_down.png"
            ? "images/bird1_up.png"
            : "images/bird1_down.png";
    }
}




function gameOver() {
    isGameOver = true;

    bird.src = "images/bird1_died.png"; // show dead bird

    gameOverBox.style.visibility = "visible";
    gameOverBox.style.opacity = "1";
    gameOverBox.style.transform = 'translate(-50%, -50%) scale(1)';

    movingGrass.style.animationPlayState = "paused";
    clearInterval(pipeInterval);

    // Smooth fall using JS
    let birdTop = bird.offsetTop; // current position
    const bottom = window.innerHeight - bird.offsetHeight;
    const fallSpeed = 5; // pixels per frame (adjust for speed)

    const fallInterval = setInterval(() => {
        if (birdTop < bottom) {
            birdTop += fallSpeed;
            if (birdTop > bottom) birdTop = bottom; // prevent overflow
            bird.style.top = birdTop + "px";
        } else {
            clearInterval(fallInterval); // stop when it hits the bottom
        }
    }, 10); // frame every 20ms (~50fps)
}


// Start game
function startGame() {
    document.addEventListener("keydown", (event) => {
        if (event.code === "Space" && !isSpacePressed) {
            isSpacePressed = true;
            velocity = jump; // Initial jump
            console.log("Space is pressed - Game Started");

            startMessage.style.visibility = "hidden";
            movingGrass.style.animationPlayState = "running";

            createPipe();

            pipeInterval = setInterval(createPipe, 2000);
            updateBird();

            setInterval(swapBirdWing, 200);
        }
    });
}

startGame();
