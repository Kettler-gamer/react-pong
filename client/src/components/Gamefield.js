import { useEffect, useRef, useState } from "react";
import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";

export default function Gamefield() {
  const ref = useRef(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [dc, setDc] = useState(false);
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

  function checkPlayerYAxis() {
    if (player1.y < 0) {
      player1.y = 0;
    } else if (player1.y > mapSize.height - 50) {
      player1.y = mapSize.height - 50;
    }
    if (player2.y < 0) {
      player2.y = 0;
    } else if (player2.y > mapSize.height - 50) {
      player2.y = mapSize.height - 50;
    }
  }

  function applyMotion() {
    player1.y += player1.yMove * playerSpeed;
    player2.y += player2.yMove * playerSpeed;
    checkPlayerYAxis();
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
      setShowGameOver(true);
    }
  }

  function onPlayerHitBall(playerY) {
    ball.xMove = -ball.xMove;

    ball.yMove = -(playerY + 30 - ball.y) * 0.01;

    ballSpeed = Math.min(ballSpeed + 1, maxBallSpeed);
  }

  function renderGamefield() {
    if (gameOver.current) return;
    applyMotion();
    ctx.current.clearRect(0, 0, mapSize.width, mapSize.height);

    ctx.current.fillStyle = "white";
    ctx.current.fillRect(player1.x, player1.y, player1.width, player1.height);
    ctx.current.fillRect(player2.x, player2.y, player2.width, player2.height);
    ctx.current.fillRect(ball.x, ball.y, ball.width, ball.height);
    setTimeout(renderGamefield, 25);
  }

  const keyPressed = {};
  let player = "player1";

  function keyHandler(key) {
    switch (key) {
      case "ArrowUp":
      case "ArrowDown":
        const value =
          keyPressed["ArrowUp"] && keyPressed["ArrowDown"]
            ? 0
            : keyPressed["ArrowUp"]
            ? -1
            : keyPressed["ArrowDown"]
            ? 1
            : 0;
        let moverToSend;
        if (player === "player1") {
          player1.yMove = value;
          moverToSend = player1;
        } else {
          player2.yMove = value;
          moverToSend = player2;
        }
        socket.current.emit("move", { move: moverToSend, ball });
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

  function onStartGame(playerName) {
    player = playerName;
    renderGamefield();
  }

  function opponentMove(value) {
    const opponent = player === "player1" ? player2 : player1;

    for (let index in value.move) {
      opponent[index] = value.move[index];
    }

    for (let index in value.ball) {
      ball[index] = value.ball[index];
    }
  }

  function onDisconnected() {
    socket.current.close();
    gameOver.current = true;
    setDc(true);
  }

  useEffect(() => {
    if (!ref.current) {
      ref.current = true;
      window.addEventListener("keyup", onKeyUp);
      window.addEventListener("keydown", keyDown);
      ctx.current = document.querySelector("canvas").getContext("2d");
      const sock = io("http://localhost:3001/");
      sock.on("connect", () => {
        console.log("Connected!");
      });
      sock.on("disconnect", onDisconnected);
      sock.on("start", onStartGame);
      sock.on("opponentMove", opponentMove);
      socket.current = sock;
    }
  });

  return (
    <>
      <canvas width={mapSize.width} height={mapSize.height}></canvas>
      {showGameOver && <h2>Game Over!</h2>}
      {dc && <p>Disconnected. Refresh to try again!</p>}
    </>
  );
}
