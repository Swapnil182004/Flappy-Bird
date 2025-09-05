// Pick elements
const bird = document.querySelector('.bird img');
const gameContainer = document.body;
const movingGrass = document.querySelector(".grass");
const startMessage = document.querySelector(".start-message");
const gameOverBox = document.querySelector('.game-over');
const scoreNumber = document.querySelector('.scorenumber');
const scoreNumber2 = document.querySelector('.game-over .scorenumber');

movingGrass.style.animationPlayState = "paused";
gameOverBox.style.visibility = "hidden";
gameOverBox.style.opacity = "0";


//for sound
const backgroundMusic = new Audio('sounds/background_music.mp3');

//for dragon
const dragon = document.getElementById("dragon");
let dragonActive = false;
let dragonInterval = null;
let dragonTimeout = null;

// Game variables
let birdY = window.innerHeight * 0.4;
let gravity = 1;
let jump = -6;
let velocity = 0;
let isGameOver = false;
let score = 0;



let isSpacePressed = false;
let pipeInterval = null;
let wingInterval = null;

let isPaused = false;
let savedVelocity = 0;

// Create pipes
function createPipe() {
    if (isGameOver) return;

    let gap = 160;
    if(score >= 70) gap = 120; //hard level smaller gap
    if(score >= 100) gap = 100;
    
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

// Rectangle collision detection
function isColliding(bird, pipe) {
    const birdRect = bird.getBoundingClientRect();
    const pipeRect = pipe.getBoundingClientRect();

    // some mercy in the easy level
    let mercy = 18;
    if(score >= 60) mercy = 8; //hard level less mercy
    

    return !(
        birdRect.top + mercy > pipeRect.bottom ||
        birdRect.bottom - mercy < pipeRect.top ||
        birdRect.right - mercy < pipeRect.left ||
        birdRect.left + mercy > pipeRect.right
    );
}


// Move pipes
function movePipe(pipeDown, pipeUp) {

    if (dragonActive) {
        pipeDown.remove();
        pipeUp.remove();
        clearInterval(moveInterval);
        return;
    }

    let pipeX = window.innerWidth;
    let hasScored = false;

    const moveInterval = setInterval(() => {
        if (isGameOver) {
            clearInterval(moveInterval);
            pipeDown.remove();
            pipeUp.remove();
            return;
        }

        pipeX -= 3;
        if(score>=70)
            pipeX -= 2; //speed increase
        

        pipeDown.style.left = `${pipeX}px`;
        pipeUp.style.left = `${pipeX}px`;

        // Collision check
        if (isColliding(bird, pipeDown) || isColliding(bird, pipeUp)) {
            gameOver();
            return;
        }

        // Scoring: when pipe passes bird's X center
        const birdCenterX = bird.getBoundingClientRect().left + bird.width / 2;
        const pipeRight = pipeDown.getBoundingClientRect().right;

        if (!hasScored && pipeRight < birdCenterX) {
            hasScored = true;
            score++;
            scoreNumber.innerHTML = score;
            scoreNumber2.innerHTML = score;

            //level up
            if(score == 10 && !dragonActive){
                console.log("Score = 10")
                document.body.style.backgroundImage = "url('images/background_night.jpg')";

                
                dragonActive = true;

                // Pause pipes
                clearInterval(pipeInterval);
                pipeInterval = null;

                // Show dragon
                dragon.style.display = "block";
                dragon.style.visibility = "visible"; // Ensure dragon is visible
                let dragonX = bird.getBoundingClientRect().left + 200; // Start closer to bird
                let dragonY = bird.getBoundingClientRect().top;


                //wait the dragon for somtime to cross the bird the remaining pipes
                setTimeout(() => {

                    //sound
                    backgroundMusic.pause();
                    const dragonSound = new Audio('sounds/dragon_sound.mp3');
                    dragonSound.play();

                    dragonInterval = setInterval(() => {
                    //Follow bird
                    const birdRect = bird.getBoundingClientRect();
                    if (dragonY < birdRect.top) dragonY += 1;
                    if(dragonY > birdRect.top) dragonY -= 1;
                    dragon.style.top = `${dragonY}px`;
                    dragonX  -= 3;
                    dragon.style.left = `${dragonX}px`;

                    // Collision detection
                    const dragonRect = dragon.getBoundingClientRect();
                    if (
                        dragonRect.left < birdRect.right &&
                        dragonRect.right > birdRect.left &&
                        dragonRect.top < birdRect.bottom &&
                        dragonRect.bottom > birdRect.top
                    ) {
                        //sound
                        dragonSound.pause();
                        
                        //small delay to avoid sound overlap
                        setTimeout(() => {gameOver();}, 200);
                        
                        
                    }
                }, 16)

                // Remove dragon after 5 seconds
                setTimeout(() => {
                    clearInterval(dragonInterval);
                    dragon.style.display = "none";
                    dragon.style.visibility = "hidden"; // Hide dragon after
                    dragonActive = false;

                    //background music resume
                    backgroundMusic.play();

                    // Resume pipes
                    pipeInterval = setInterval(createPipe, 2000);
                }, 5000);
                }, 3000);

            }

            if(score == 20){
                console.log("Score = 20")
                document.body.style.backgroundImage = "url('images/background.jpg')";
            }

            //again night at 50
            if(score == 50){
                console.log("Score = 50")
                document.body.style.backgroundImage = "url('images/background_night.jpg')";
            }
            if(score == 60){
                console.log("Score = 80")
                document.body.style.backgroundImage = "url('images/background_day.jpg')";
            }
        }

        // Remove pipes when off screen
        if (pipeRight < -100) {
            pipeDown.remove();
            pipeUp.remove();
            clearInterval(moveInterval);
        }
    }, 16);
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

// Jump on space i comment out this because its handled in startGame function

// document.addEventListener('keydown', (event) => {
//     if (event.code === 'Space' && !isGameOver && isSpacePressed) {
//         velocity = jump;
//     }
// });

function swapBirdWing() {
    if (!isGameOver) {
        let currentImg = bird.src.split("/").pop();
        bird.src = currentImg === "bird1_down.png"
            ? "images/bird1_up.png"
            : "images/bird1_down.png";
    }
}

// Game Over
function gameOver() {
    isGameOver = true;

    //sound
    backgroundMusic.pause();
    const gameOverSound = new Audio('sounds/game_over.mp3');
    gameOverSound.play();

    //bird dies
    bird.src = "images/bird1_died.png";



    gameOverBox.style.visibility = "visible";
    gameOverBox.style.opacity = "1";
    gameOverBox.style.transform = 'translate(-50%, -50%) scale(1)';

    movingGrass.style.animationPlayState = "paused";
    clearInterval(pipeInterval);
    clearInterval(wingInterval);

    // Smooth fall
    let birdTop = bird.offsetTop;
    const bottom = window.innerHeight - bird.offsetHeight;
    const fallSpeed = 5;

    const fallInterval = setInterval(() => {
        if (birdTop < bottom) {
            birdTop += fallSpeed;
            if (birdTop > bottom) birdTop = bottom;
            bird.style.top = birdTop + "px";
        } else {
            clearInterval(fallInterval);
        }
    }, 10);
}


// Start Game
function startGame() {
    
        if (!isSpacePressed) {
            isSpacePressed = true;

            //sound
            
            backgroundMusic.loop = true;
            backgroundMusic.volume = 0.5;
            backgroundMusic.play();
            
            velocity = jump;
            startMessage.style.visibility = "hidden";
            movingGrass.style.animationPlayState = "running";

            createPipe(); // first pipe
            // spawn every 2 seconds → constant gap
            pipeInterval = setInterval(createPipe, 2000);
            updateBird();
            wingInterval = setInterval(swapBirdWing, 200);



    
        }
    
};

document.addEventListener("keydown", (event) => {
    if(event.code === "Space"){
        if(!isSpacePressed && !isGameOver)
            startGame();
        else if(!isGameOver && isSpacePressed)
            velocity = jump;

    }
});


document.addEventListener("touchstart", () => {
    if(!isSpacePressed && !isGameOver)
        startGame();
    else if(!isGameOver && isSpacePressed)
        velocity = jump;
});//for mobile



function togglePause() {
    const pauseBtn = document.getElementById("pauseBtn");
    const pauseIcon = pauseBtn.querySelector("pauseIcon");
    const pauseText = pauseBtn.querySelector("pauseText");

    if (!isPaused) {
        isPaused = true;
        savedVelocity = velocity;
        velocity = 0;

        //pause Intervals
        if (pipeInterval) clearInterval(pipeInterval);
        if (wingInterval) clearInterval(wingInterval);

        //stop moving grass
        movingGrass.style.animationPlayState = "paused";

        //change icon and text
        pauseIcon.className = 'bx bx-play-circle';
        pauseText.textContent = "Play";
    }
    else {
        isPaused = false;
        velocity = savedVelocity;

        //resume intervals
        if (!isGameOver) {
            pipeInterval = setInterval(createPipe, 2000);
            wingInterval = setInterval(swapBirdWing, 200);
            movingGrass.style.animationPlayState = "running";
            backgroundMusic.play();
        }
        //change icon and text
        pauseIcon.className = 'bx bx-pause-circle';
        pauseText.textContent = "Pause";
    }
}
    document.getElementById('pauseBtn').addEventListener('click', togglePause);
