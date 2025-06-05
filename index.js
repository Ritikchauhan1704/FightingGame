const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

// const aspectRatio = 56 / 9;
// const width = window.innerWidth;
// const height = width / aspectRatio;
// canvas.width = width;
// canvas.height = height;

// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;
canvas.width = 1280;
canvas.height = 720;

ctx.fillRect(0, 0, canvas.width, canvas.height);

const gravity = 0.7;

const background = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  imageSrc: "./img/background.png",
});
const shop = new Sprite({
  position: {
    x: 900,
    y: 248,
  },
  imageSrc: "./img/shop.png",
  scale: 2.75,
  frameMax: 6,
});

const player = new Fighter({
  position: {
    x: 400,
    y: 0,
  },
  velocity: {
    x: 0,
    y: 50,
  },
  color: "red",

  imageSrc: "./img/samuraiMack/Idle.png",
  frameMax: 8,
  scale: 2.5,
  offset: {
    x: 215,
    y: 155,
  },
  sprites: {
    idle: { imageSrc: "./img/samuraiMack/Idle.png", frameMax: 8 },
    run: { imageSrc: "./img/samuraiMack/Run.png", frameMax: 8 },
    jump: { imageSrc: "./img/samuraiMack/Jump.png", frameMax: 2 },
    fall: { imageSrc: "./img/samuraiMack/Fall.png", frameMax: 2 },
    attack1: { imageSrc: "./img/samuraiMack/Attack1.png", frameMax: 6 },
    takeHit: {
      imageSrc: "./img/samuraiMack/Take Hit - white silhouette.png",
      frameMax: 4,
    },
    death: { imageSrc: "./img/samuraiMack/Death.png", frameMax: 6 },
  },
  attackBox: {
    offset: {
      x: 90,
      y: 50,
    },
    width: 160,
    height: 50,
  },
});
player.draw();

const enemy = new Fighter({
  position: {
    x: 800,
    y: 0,
  },
  velocity: {
    x: 0,
    y: 50,
  },
  color: "blue",
  imageSrc: "./img/kenji/Idle.png",
  frameMax: 4,
  scale: 2.5,
  offset: {
    x: 215,
    y: 170,
  },

  sprites: {
    idle: { imageSrc: "./img/kenji/Idle.png", frameMax: 4 },
    run: { imageSrc: "./img/kenji/Run.png", frameMax: 8 },
    jump: { imageSrc: "./img/kenji/Jump.png", frameMax: 2 },
    fall: { imageSrc: "./img/kenji/Fall.png", frameMax: 2 },
    attack1: { imageSrc: "./img/kenji/Attack1.png", frameMax: 4 },
    takeHit: { imageSrc: "./img/kenji/Take hit.png", frameMax: 3 },
    death: { imageSrc: "./img/kenji/Death.png", frameMax: 7 },
  },
  attackBox: {
    offset: {
      x: -170,
      y: 50,
    },
    width: 160,
    height: 50,
  },
});

enemy.draw();

const keys = {
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  w: {
    pressed: false,
  },
  ArrowRight: {
    pressed: false,
  },
  ArrowLeft: {
    pressed: false,
  },
  ArrowUp: {
    pressed: false,
  },
};

decreaseTimer();

function animate() {
  window.requestAnimationFrame(animate);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  background.update();
  shop.update();
  ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  player.update();
  enemy.update();

  // player movement
  player.velocity.x = 0;

  if (keys.a.pressed && player.lastKey === "a") {
    player.velocity.x = -5;
    player.switchSprite("run");
  } else if (keys.d.pressed && player.lastKey === "d") {
    player.switchSprite("run");
    player.velocity.x = 5;
  } else {
    player.switchSprite("idle");
  }

  if (player.velocity.y < 0) {
    player.switchSprite("jump");
  } else if (player.velocity.y > 0) {
    player.switchSprite("fall");
  }
  // enemy movement
  enemy.velocity.x = 0;
  if (keys.ArrowLeft.pressed && enemy.lastKey === "ArrowLeft") {
    enemy.velocity.x = -5;
    enemy.switchSprite("run");
  } else if (keys.ArrowRight.pressed && enemy.lastKey === "ArrowRight") {
    enemy.velocity.x = 5;
    enemy.switchSprite("run");
  } else {
    enemy.switchSprite("idle");
  }
  if (enemy.velocity.y < 0) {
    enemy.switchSprite("jump");
  } else if (enemy.velocity.y > 0) {
    enemy.switchSprite("fall");
  }
  //   detect collison
  if (
    rectangularCollision({ rectangle1: player, rectangle2: enemy }) &&
    player.isAttacking &&
    player.frameCurrent === 4
  ) {
    enemy.takeHit();
    player.isAttacking = false;
    document.querySelector("#enemyHealth").style.width = enemy.health + "%";
    gsap.to("#enemyHealth", {
      width: enemy.health + "%",
    });
  }
  if (player.isAttacking && player.frameCurrent === 4) {
    player.isAttacking = false;
  }

  if (
    rectangularCollision({ rectangle1: enemy, rectangle2: player }) &&
    enemy.isAttacking &&
    enemy.frameCurrent === 2
  ) {
    enemy.isAttacking = false;
    player.takeHit();
    document.querySelector("#playerHealth").style.width = player.health + "%";
    gsap.to("#playerHealth", {
      width: player.health + "%",
    });
  }
  if (enemy.isAttacking && enemy.frameCurrent === 2) {
    enemy.isAttacking = false;
  }

  // end game based on health
  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner({ player, enemy, timerId });
  }
}
animate();

window.addEventListener("keydown", (event) => {
  if (!player.dead) {
    switch (event.key) {
      case "d":
        keys.d.pressed = true;
        player.lastKey = "d";
        break;
      case "a":
        keys.a.pressed = true;
        player.lastKey = "a";
        break;
      case "w":
        player.velocity.y = -20;
        break;
      case " ":
        player.attack();
        break;
    }
  }
  if (!enemy.dead) {
    switch (event.key) {
      case "ArrowRight":
        keys.ArrowRight.pressed = true;
        enemy.lastKey = "ArrowRight";
        break;
      case "ArrowLeft":
        keys.ArrowLeft.pressed = true;
        enemy.lastKey = "ArrowLeft";
        break;
      case "ArrowUp":
        enemy.velocity.y = -20;
        break;
      case "ArrowDown":
        enemy.attack();
        break;
    }
  }
});
window.addEventListener("keyup", (event) => {
  console.log(event.key);
  switch (event.key) {
    case "d":
      keys.d.pressed = false;
      break;
    case "a":
      keys.a.pressed = false;
      break;
    case "ArrowRight":
      keys.ArrowRight.pressed = false;
      break;
    case "ArrowLeft":
      keys.ArrowLeft.pressed = false;
      break;
  }
});
