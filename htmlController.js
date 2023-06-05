//NEW HTTP WITH EXPRESS
// import { express } from 'express';
import express from 'express';
// const { express } = pkg;
const expressApp = express();
import { Server } from 'http';
const httpServer = Server(expressApp);
import { Server as SocketIOServer } from 'socket.io';
const io = new SocketIOServer(httpServer)

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = 8080;
// expressApp.listen(port, () => {
//   console.log(`chatguess: listening on port ${port}`);
// });


// expressApp.get('/', (req, res) => {
//   const name = process.env.NAME || 'World';
//   res.send(`ChatGuess.com`);
// });

//////// use 8080 ///////////////
// expressApp.get('/', (req, res) => {
//   const name = process.env.NAME || 'World';
//   res.send(`Hello ${name}!`);
// });

// const port = 8080;
// expressApp.listen(port, () => {
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
  io.emit('showGif', src, number);
}

export function playVideo(src) {
  io.emit('playVideo', src);
}

export function playAudio(src) {
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

//sockets = {"lynchml":[socket1,socket2]}
//How do I detect and remove dead sockets?

// io.on("*",function(event,data) {
//   console.log("* EVENT")
//   console.log(event);
//   console.log(data);
// });

io.on("connection", (socket) => {
  console.log("connection EVENT")
  // console.log(socket)
})

//static access to public folder
// expressApp.use(express.static('public'));

expressApp.use((req, res, next) => {
  console.log(`Req: ${req.originalUrl} Time: ${Date.now()}`)
  console.log("req.originalUrl")
  console.log(req.originalUrl)
  
  console.log("__dirname")
  console.log(__dirname)

  if (    
    req.originalUrl.endsWith("index.html") ||
    req.originalUrl.endsWith(".png") ||
    req.originalUrl.endsWith(".mp3") ||
    req.originalUrl.endsWith(".jpg") ||
    req.originalUrl.endsWith(".jpeg") ||
    req.originalUrl.endsWith(".js") ||
    req.originalUrl.endsWith(".css")) {
    next()
  } else {
    let channelName = req.originalUrl.substring(1)
    console.log("channelName")
    console.log(channelName)   
    
    // Attempts at routing to index file
    res.sendFile(__dirname + '/public/index.html');
    // res.render('public/index.html');
    // res.send("Hello world!");

    // Redirect
    // res.redirect('./index.html');
    // next()
  }

  // console.log('req:', req)
  // console.log('res:', res)
})

expressApp.use(express.static('public'));

// expressApp.use(express.)

httpServer.listen(port, () => {
  console.log(`chatguess: listening on port ${port}`);
});