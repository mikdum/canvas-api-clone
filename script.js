let lastMouseX;
let lastMouseY;
let duckWidth = 155;
let duckHeight = 140;
let scoreCount = 0;
let diagonal = false;
let horizontal = false;
let mirrored;

let canvas = document.getElementById("gameCanvas");
let context = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

let sheetWidth = 644;
let sheetHeight = 294;

let ducks = [];
let deadDucks = [];

let dog;

const Score = document.getElementById("Score");

const background2 = new Image();
background2.src = "./CANVASAPI_UI/background-new-3.png";

const background = new Image();
background.src = "./CANVASAPI_UI/background-new-2-6.png";

const spriteSheet = new Image();
spriteSheet.src = "./CANVASAPI_UI/sprites-remake.png";
const spriteSheetMirrored = new Image();
spriteSheetMirrored.src = "./CANVASAPI_UI/sprites-remake-mirror.png";

canvas.style.backgroundColor = "rgb(51, 117, 192)";

const bulletAudio = new Audio("./CANVASAPI_UI/laukaus.mp3");
bulletAudio.volume = 0.05;

let gameStarted = false;

window.onload = () => {
  let duckX = 750;
  let duckY = 300;

  let duckClick = false;

  // Start Game -nappulan klikkaus
  document.getElementById("startGameButton").addEventListener("click", () => {
    gameStarted = true;
    document.getElementById("startGameDiv").style.display = "none";
  });

  // Restart -nappulan klikkaus
  document.getElementById("restartButton").addEventListener("click", () => {
    gameStarted = true;
    document.getElementById("gameOverDiv").style.display = "none";
  });

  canvas.addEventListener("click", (event) => {
    if (!gameStarted) return;

    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;

    console.log("Shot at: ", x, y);

    if (
      !duckClick &&
      isDuckClicked(x, y, duckX, duckY, duckWidth, duckHeight)
    ) {
      scoreCount += 100;
      Score.textContent = scoreCount;
      context.clearRect(duckX, duckY, duckWidth, duckHeight);
      duckClick = true;
      bulletAudio.currentTime = 0;
      bulletAudio.play();
    }
  });
  let color = 0;

  for (let i = 0; i < 16; i++) {
    let x = Math.round(Math.random() * (canvas.width - duckWidth));
    let y = Math.round(Math.random() * (canvas.height - duckHeight));
    let duck = new Duck(x, y, color, 2);
    color += 1;
    if (i % 3 == 0) {
      color = 0;
    }
    ducks.push(duck);
  }

  dog = new Dog(100, canvas.height * 0.71, 2, spriteSheet);

  animateFrame();
};

function isDuckClicked(x, y, duck) {
  bulletAudio.play();
  return (
    x >= duck.x &&
    x <= duck.x + duckWidth &&
    y >= duck.y &&
    y <= duck.y + duckHeight
  );
}

class Duck {
  constructor(x, y, count, speed) {
    this.spriteSheet = spriteSheet;
    this.spriteSheetMirrored = spriteSheetMirrored;
    this.spriteWidth = 40;
    this.spriteHeight = 40;
    this.spriteSheetY = 146 + count * this.spriteHeight;
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.dx = Math.random() < 0.5 ? 1 : -1;
    this.dy = (Math.random() - 0.5) * 0.2;
    this.dy = 1;
    this.frameIndex = 0;
    this.frameCount = 3;
    this.frameInterval = 40;
    this.frameCounter = 0;
    this.directionChangeCounter = 0;
    this.directionChangeInterval = 700;
    this.deadDelayCounter = 0;

    this.draw();
  }

  draw() {
    let spriteSheetX = this.frameIndex * this.spriteWidth;
    let spriteSheetY = this.spriteSheetY;

    if (this.dx !== 0 && Math.abs(this.dy) > 0.1) {
      diagonal = true;
    } else {
      diagonal = false;
    }

    if (this.dx < 0) {
      if (diagonal === false) {
        context.translate(this.x + duckWidth, this.y);
        context.scale(-1, 1);
        context.drawImage(
          this.spriteSheet,
          spriteSheetX,
          spriteSheetY,
          this.spriteWidth,
          this.spriteHeight,
          0,
          0,
          duckWidth,
          duckHeight
        );
      } else {
        context.drawImage(
          this.spriteSheet,
          this.spriteWidth * 3 + spriteSheetX,
          spriteSheetY,
          this.spriteWidth,
          this.spriteHeight,
          this.x,
          this.y,
          duckWidth,
          duckHeight
        );
      }
      context.setTransform(1, 0, 0, 1, 0, 0);
    } else {
      if (diagonal === false) {
        context.drawImage(
          this.spriteSheet,
          spriteSheetX,
          spriteSheetY,
          this.spriteWidth,
          this.spriteHeight,
          this.x,
          this.y,
          duckWidth,
          duckHeight
        );
      } else {
        context.drawImage(
          this.spriteSheet,
          this.spriteWidth * 3 + spriteSheetX,
          spriteSheetY,
          this.spriteWidth,
          this.spriteHeight,
          this.x,
          this.y,
          duckWidth,
          duckHeight
        );
      }
    }
  }

  update() {
    let hitWall = false;

    if (this.x < 0 || this.x + duckWidth > canvas.width) {
      this.dx *= -1;
      hitWall = true;
    }
    if (this.y < 0 || this.y + duckHeight > canvas.height) {
      this.dy *= -1;
      hitWall = true;
    }
    // change direction randomly

    this.x += this.dx * this.speed;
    this.y += this.dy * this.speed;

    this.frameCounter++;
    if (this.frameCounter >= this.frameInterval) {
      if (Math.random() > 0.9) this.dx *= -1;
      if (Math.random() > 0.9) this.dy *= -1;
      this.frameCounter = 0;
      this.frameIndex = (this.frameIndex + 1) % this.frameCount;
    }

    this.directionChangeCounter++;
    if (
      this.directionChangeCounter >= this.directionChangeInterval ||
      hitWall
    ) {
      this.directionChangeCounter = 0;
      this.changeDirection();
    }
    this.draw();
  }

  changeDirection() {
    if (Math.random() < 0.67) {
      this.dx = Math.random() < 0.5 ? 1 : -1;
      this.dy = Math.random() < 0.5 ? 1 : -1;
    } else {
      this.dx = Math.random() < 0.5 ? 1 : -1;
      this.dy = (Math.random() - 0.5) * 0.2;
    }
  }

  updateDeads() {
    if (this.deadDelayCounter < 70) {
      this.deadDelayCounter++;
      this.drawDead(0);
    } else {
      this.drawDead(this.frameIndex);
      this.y += this.speed;
      this.frameCounter++;
      if (this.frameCounter >= 10) {
        this.frameCounter = 0;
        this.frameIndex = 1 + (this.frameIndex % 4);
      }
      if (this.y >= canvas.height) {
        deadDucks = deadDucks.filter((element) => element !== this);
      }
    }
  }
  drawDead(frameIndex) {
    let spriteSheetX = this.spriteWidth * 6 + frameIndex * this.spriteWidth;
    context.drawImage(
      this.spriteSheet,
      spriteSheetX + 2,
      this.spriteSheetY,
      this.spriteWidth - 6,
      this.spriteHeight,
      this.x,
      this.y,
      duckWidth,
      duckHeight
    );
  }
}

class Dog {
  // Kesken
  constructor(x, y, speed, spriteSheet) {
    this.spriteSheet = spriteSheet;
    this.spriteWidth = 69;
    this.spriteHeight = 69;

    this.x = x;
    this.y = y;
    this.dx = speed;

    this.frameIndex = 0;
    this.frameCount = 5;
    this.frameInterval = 10;
    this.frameCounter = 0;

    this.spriteSheetY = 0;

    this.draw();
  }

  draw() {
    let spriteSheetX = this.frameIndex * this.spriteWidth;

    if (this.dx < 0) {
      context.save();
      context.translate(this.x + this.spriteWidth * 3, this.y);
      context.scale(-1, 1);
      context.drawImage(
        this.spriteSheet,
        spriteSheetX,
        this.spriteSheetY,
        this.spriteWidth,
        this.spriteHeight,
        0,
        0,
        this.spriteWidth * 4,
        this.spriteHeight * 4
      );
      context.restore();
    } else {
      context.drawImage(
        this.spriteSheet,
        spriteSheetX,
        this.spriteSheetY,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        this.spriteWidth * 4,
        this.spriteHeight * 4
      );
    }
  }

  update() {
    if (this.x < 0 || this.x + this.spriteWidth * 3 > canvas.width) {
      this.dx *= -1;
    }

    this.x += this.dx;

    this.frameCounter++;
    if (this.frameCounter >= this.frameInterval) {
      this.frameCounter = 0;
      this.frameIndex = (this.frameIndex + 1) % this.frameCount;
    }

    this.draw();
  }
}

let animateFrame = function () {
  requestAnimationFrame(animateFrame);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(background2, 0, 0, window.innerWidth, window.innerHeight);
  ducks.forEach((element) => {
    element.update();
    context.imageSmoothingEnabled = false;
  });
  deadDucks.forEach((element) => {
    element.updateDeads();
    context.imageSmoothingEnabled = false;
  });

  context.drawImage(background, 0, 110, window.innerWidth, window.innerHeight);
  context.font = "38px Arial";
  context.fillStyle = "White";
  context.textAlign = "right";
  context.fillText(scoreCount, canvas.width - 20, 40);

  dog.update();
};

canvas.addEventListener("click", (event) => {
  if (!gameStarted) return;
  let rect = canvas.getBoundingClientRect();
  let x = event.clientX - rect.left;
  let y = event.clientY - rect.top;

  console.log("Shot at: ", x, y);

  for (let i = 0; i < ducks.length; i++) {
    if (isDuckClicked(x, y, ducks[i])) {
      ducks[i].frameCounter = 0;
      ducks[i].frameIndex = 0;
      console.log(ducks[i]);
      deadDucks.push(ducks[i]);
      ducks.splice(i, 1);
      scoreCount += 100;
      Score.textContent = scoreCount;
      bulletAudio.currentTime = 0;
      bulletAudio.play();

      break;
    }
  }
});
