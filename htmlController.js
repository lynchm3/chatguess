//NEW HTTP WITH EXPRESS
// import { express } from 'express';
import express from 'express';
// const { express } = pkg;
const app = express();
import { Server } from 'http';
const http = Server(app);
import { Server as SocketIOServer } from 'socket.io';
const io = new SocketIOServer(http)
import Matter from 'matter-js'

const port = 8080;
// app.listen(port, () => {
//   console.log(`chatguess: listening on port ${port}`);
// });


// app.get('/', (req, res) => {
//   const name = process.env.NAME || 'World';
//   res.send(`ChatGuess.com`);
// });

//////// use 8080 ///////////////
// app.get('/', (req, res) => {
//   const name = process.env.NAME || 'World';
//   res.send(`Hello ${name}!`);
// });

// const port = 8080;
// app.listen(port, () => {
//   console.log(`helloworld: listening on port ${port}`);
// });

// http.listen(port, () => {
//   // console.log('listening on *:3000');
// });
//////// use 8080 ///////////////

//Socket emits
var callback = null
export function setCallback(cb) { callback = cb }

export function showText(text) { io.emit('showText', text); }

export function showVideo(video) { io.emit('showVideo', video); }

export function showGif(src, number) {
  // console.log('html.js showGif src = ' + src);
  io.emit('showGif', src, number);
}

export function playVideo(src) {
  // console.log('html.js function playVideo src = ' + src);
  io.emit('playVideo', src);
}

export function playAudio(src) {
  //  console.log('html.js playAudio src = ' + src);
  io.emit('playAudio', src);
}

export function clearImages() {
  io.emit('clearImages');
}

export function showTitle() {
  io.emit('showTitle');
}

export function showCoverImage(gameImage, username) {
  io.emit('showCoverImage', gameImage, username);
}

//PHYSICS
// const express = require("express");
// const Matter = require("matter-js");

// const app = express();
// const server = require("http").createServer(app);
// const io = require("socket.io")(server);

// app.use(express.static("public"));

const frameRate = 1000 / 30;
const canvas = { width: 1280, height: 720 };
// const boxes = 20;
const boxSize = 20;
const wallThickness = 20;

const gameImage = []

const entities = {
  boxes: [],
  walls: [
    Matter.Bodies.rectangle(
      canvas.width / 2, 0,
      canvas.width,
      wallThickness,
      { isStatic: true }
    ),
    Matter.Bodies.rectangle(
      0, canvas.height / 2,
      wallThickness,
      canvas.height,
      { isStatic: true }
    ),
    Matter.Bodies.rectangle(
      canvas.width,
      canvas.width / 2,
      wallThickness,
      canvas.width,
      { isStatic: true }
    ),
    Matter.Bodies.rectangle(
      canvas.width / 2,
      canvas.height,
      canvas.width,
      wallThickness,
      { isStatic: true }
    ),
  ]
};

export function showImage(gameImage, maxWidth) { 

  var box = Matter.Bodies.rectangle(
    Math.random() * canvas.width,
    maxWidth,
    maxWidth,
    maxWidth,
  )

  entities.boxes.push(box)
  // gameImages.push(gameImage)
  Matter.Composite.add(engine.world, box);
  
  io.emit('showImage', gameImage, maxWidth); 
}

const engine = Matter.Engine.create();
Matter.Composite.add(engine.world, Object.values(entities).flat());
const toVertices = e => e.vertices.map(({ x, y }) => ({ x, y }));

setInterval(() => {
  Matter.Engine.update(engine, frameRate);
  io.emit("update state", {
    boxes: entities.boxes.map(toVertices),
    walls: entities.walls.map(toVertices)
  });
}, frameRate);



io.on("connection", (socket) => {
  // console.log("connected = " + guess)
})

io.on("connection", socket => {
  socket.on("register", cb => cb({ canvas }));
  socket.on("player click", coordinates => {
    entities.boxes.forEach(box => {
      // servers://stackoverflow.com/a/50472656/6243352
      const force = 0.01;
      const deltaVector = Matter.Vector.sub(box.position, coordinates);
      const normalizedDelta = Matter.Vector.normalise(deltaVector);
      const forceVector = Matter.Vector.mult(normalizedDelta, force);
      Matter.Body.applyForce(box, box.position, forceVector);
    });
  });
  socket.on('guess', function (guess) {
    // console.log("htmlController.js guess = " + guess)
    callback.guess()
  });
});


app.use(express.static('public'));

http.listen(port, () => {
  console.log(`chatguess: listening on port ${port}`);
});

// server.listen(process.env.PORT, () =>
//   console.log("server listening on " + process.env.PORT)
// );