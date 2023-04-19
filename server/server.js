import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();

const server = createServer(app, { cors: true });

const io = new Server(server, { cors: true });

const players = { player1: undefined, player2: undefined };

io.on("connect", (ws) => {
  console.log("socket connection!");
  ws.on("move", (value) => {
    if (players.player1 == ws) {
      players.player2.emit("opponentMove", value);
    } else {
      players.player1.emit("opponentMove", value);
    }
  });

  if (players.player1) {
    players.player2 = ws;
    players.player1.emit("start", "player1");
    players.player2.emit("start", "player2");
  } else {
    players.player1 = ws;
  }

  ws.on("disconnect", () => {
    console.log("Disconnect!");
    if (players.player1) {
      players.player1.disconnect();
    }
    if (players.player2) {
      players.player2.disconnect();
    }
    players.player1 = undefined;
    players.player2 = undefined;
  });
});

server.listen(3001);
