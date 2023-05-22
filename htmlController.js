//NEW HTTP WITH EXPRESS
// import { express } from 'express';
import express from 'express';
// const { express } = pkg;
const app = express();
import { Server } from 'http';
const http = Server(app);
import { Server as SocketIOServer } from 'socket.io';
const io = new SocketIOServer(http)

app.use(express.static('./'));

http.listen(3000, () => {
  // console.log('listening on *:3000');
});

io.on("connection", (socket) => {
  // console.log("connected = " + guess)

  socket.on('guess', function(guess) {
    // console.log("htmlController.js guess = " + guess)
    callback.guess()
  });
}) 

//Socket emits
var callback = null
export function setCallback (cb) { callback = cb }

export function showText (text) { io.emit('showText', text); }

export function showImage (gameImage, maxWidth) { io.emit('showImage', gameImage, maxWidth); }

export function showVideo (video) { io.emit('showVideo', video); }

export function showGif (src, number) { 
  // console.log('html.js showGif src = ' + src);
  io.emit('showGif', src, number); 
}

export function playVideo (src) { 
  // console.log('html.js function playVideo src = ' + src);
  io.emit('playVideo', src); 
}

export function playAudio (src) { 
  //  console.log('html.js playAudio src = ' + src);
   io.emit('playAudio', src); 
}

export function clearImages() {
  io.emit('clearImages'); 
}

export function showTitle() {
  io.emit('showTitle'); 
}

export function showCoverImage (gameImage, username) { 
  io.emit('showCoverImage', gameImage, username); 
}

