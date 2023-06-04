//NEW HTTP WITH EXPRESS
// import { express } from 'express';
import express from 'express';
// const { express } = pkg;
const app = express();
import { Server } from 'http';
const http = Server(app);
import { Server as SocketIOServer } from 'socket.io';
const io = new SocketIOServer(http)

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
export function setHTMLControllerCallback(cb) { callback = cb }

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

export function showImage(gameImage, maxWidth) {   
  io.emit('showImage', gameImage, maxWidth); 
}

io.on("connection", (socket) => {
  // console.log("connected = " + guess)
})

// io.on("connection", socket => {
//   socket.on("register", cb => cb({ canvas }));
//   socket.on("player click", coordinates => {
//     entities.boxes.forEach(box => {
//       // servers://stackoverflow.com/a/50472656/6243352
//       const force = 0.01;
//       const deltaVector = Matter.Vector.sub(box.position, coordinates);
//       const normalizedDelta = Matter.Vector.normalise(deltaVector);
//       const forceVector = Matter.Vector.mult(normalizedDelta, force);
//       Matter.Body.applyForce(box, box.position, forceVector);
//     });
//   });
//   socket.on('guess', function (guess) {
//     // console.log("htmlController.js guess = " + guess)
//     callback.guess()
//   });
// });

app.use(express.static('public'));

http.listen(port, () => {
  console.log(`chatguess: listening on port ${port}`);
});