import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();

app.get("/test", (req, res) => res.send("Hello world!"));

const server = createServer(app, { cors: true });

const io = new Server(server, { cors: true });

io.on("connect", (ws) => {
  console.log("socket connection!");
});

server.listen(3001);
