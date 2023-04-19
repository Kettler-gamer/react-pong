import { useEffect, useRef, useState } from "react";
import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";

export default function Gamefield() {
  const ref = useRef(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const ctx = useRef(false);
  const gameOver = useRef(false);
  const socket = useRef();
  const mapSize = { width: 1024, height: 496 };

  const playerSpeed = 5;
  const player1 = {
    x: 40,
    y: mapSize.height / 2 - 25,
    width: 10,
    height: 80,
    yMove: 0,
  };
  const player2 = {
    x: mapSize.width - 50,
    y: mapSize.height / 2 - 25,
    width: 10,
    height: 80,
    yMove: 0,
  };

  let ballSpeed = 5;
  const maxBallSpeed = 10;
  const ball = {
    x: mapSize.width / 2,
    y: mapSize.height / 2,
    width: 10,
    height: 10,
    xMove: 1,
    yMove: 0,
  };

  function applyMotion() {
    player1.y += player1.yMove * playerSpeed;
    player2.y += player2.yMove * playerSpeed;
    ball.x += ball.xMove * ballSpeed;
    ball.y += ball.yMove * ballSpeed;

    if (
      ball.x >= player2.x - 10 &&
      ball.y >= player2.y - 9 &&
      ball.y <= player2.y + player2.height + 9
    ) {
      onPlayerHitBall(player2.y);
    } else if (
      ball.x <= player1.x + 10 &&
      ball.y >= player1.y - 9 &&
      ball.y <= player1.y + player1.height + 9
    ) {
      onPlayerHitBall(player1.y);
    } else if (ball.y < 0 || ball.y > mapSize.height) {
      ball.yMove = -ball.yMove;
    }

    if (ball.x < 10 || ball.x > mapSize.width - 10) {
      gameOver.current = true;
    }
  }

  function onPlayerHitBall(playerY) {
    ball.xMove = -ball.xMove;

    console.log(-(playerY + 30 - ball.y) * 0.01);
    ball.yMove = -(playerY + 30 - ball.y) * 0.01;

    ballSpeed = Math.min(ballSpeed + 1, maxBallSpeed);
  }

  function renderGamefield() {
    if (gameOver.current) return setShowGameOver(true);
    applyMotion();
    ctx.current.clearRect(0, 0, mapSize.width, mapSize.height);

    ctx.current.fillStyle = "white";
    ctx.current.fillRect(player1.x, player1.y, player1.width, player1.height);
    ctx.current.fillRect(player2.x, player2.y, player2.width, player2.height);
    ctx.current.fillRect(ball.x, ball.y, ball.width, ball.height);
    setTimeout(renderGamefield, 25);
  }

  const keyPressed = {};

  function keyHandler(key) {
    switch (key) {
      case "w":
      case "s":
        player1.yMove =
          keyPressed["w"] && keyPressed["s"]
            ? 0
            : keyPressed["w"]
            ? -1
            : keyPressed["s"]
            ? 1
            : 0;
        break;
      case "ArrowUp":
      case "ArrowDown":
        player2.yMove =
          keyPressed["ArrowUp"] && keyPressed["ArrowDown"]
            ? 0
            : keyPressed["ArrowUp"]
            ? -1
            : keyPressed["ArrowDown"]
            ? 1
            : 0;
        break;
      default:
    }
  }

  function onKeyUp(event) {
    keyPressed[event.key] = false;
    keyHandler(event.key);
  }

  function keyDown(event) {
    if (keyPressed[event.key]) return;
    keyPressed[event.key] = true;
    keyHandler(event.key);
  }

  useEffect(() => {
    if (!ref.current) {
      ref.current = true;
      window.addEventListener("keyup", onKeyUp);
      window.addEventListener("keydown", keyDown);
      ctx.current = document.querySelector("canvas").getContext("2d");
      // renderGamefield();
      const sock = io("http://localhost:3001/");
      sock.on("connection", () => {
        console.log("Connected!");
      });
      socket.current = sock;
    }
  });

  return (
    <>
      <canvas width={mapSize.width} height={mapSize.height}></canvas>
      {showGameOver && <h2>Game Over!</h2>}
    </>
  );
}
