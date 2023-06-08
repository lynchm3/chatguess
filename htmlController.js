//NEW HTTP WITH EXPRESS
// import { express } from 'express';
import { clientId, clientSecret} from './TwurpleSecrets.js'
import { createHomeGame } from './app.js'
import express from 'express';
// const { express } = pkg;
const expressApp = express();
import { Server } from 'http';
const httpServer = Server(expressApp);
import { Server as SocketIOServer } from 'socket.io';
const io = new SocketIOServer(httpServer)

import path from 'path';
import { fileURLToPath } from 'url';

import fetch from 'node-fetch';

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
export function showText(text) { io.emit('showText', text); }

export function showVideo(video) { io.emit('showVideo', video); }

export function showTitle(broadcasterUsername) {
  var socketsForChannel = sockets[broadcasterUsername]
  for (let i in socketsForChannel) {
    socketsForChannel[i].emit('showTitle');
  }
}

export function showCoverImage(gameImage, username, broadcasterUsername) {
  var socketsForChannel = sockets[broadcasterUsername]
  for (let i in socketsForChannel) {
    socketsForChannel[i].emit('showCoverImage', gameImage, username);
  }
}

export function showImage(gameImage, maxWidth, broadcasterUsername) {
  var socketsForChannel = sockets[broadcasterUsername]
  for (let i in socketsForChannel) {
    socketsForChannel[i].emit('showImage', gameImage, maxWidth);
  }
}

export function showHomeImage(gameImage, maxWidth, socket) {
  socket.emit('showImage', gameImage, maxWidth);
}

//How do I detect and remove dead sockets?

// io.on("*",function(event,data) {
//   console.log("* EVENT")
//   console.log(event);
//   console.log(data);
// });

const sockets = {}
io.on("connection", (socket) => {
  console.log("connection EVENT")

  console.log("socket.handshake.headers.referer")
  console.log(socket.handshake.headers.referer)

  var broadcasterUsername = socket.handshake.headers.referer.split('/').pop();

  console.log("broadcasterUsername:")
  console.log(broadcasterUsername)

  if (broadcasterUsername == "") {
    createHomeGame(socket)
  } else {
    var socketsForChannel = sockets[broadcasterUsername]

    if (socketsForChannel == null) {
      sockets[broadcasterUsername] = [socket];
    } else {
      socketsForChannel.push(socket)
      sockets[broadcasterUsername] = socketsForChannel
    }
  }
})

//static access to public folder
// expressApp.use(express.static('public'));

expressApp.use((req, res, next) => {
  // console.log(`Req: ${req.originalUrl} Time: ${Date.now()}`)
  console.log("req.originalUrl")
  console.log(req.originalUrl)

  // console.log("__dirname")
  // console.log(__dirname)

  //https://id.twitch.tv/oauth2/authorize?client_id=4wsujxiz1khg6h9afkutmiyxhom8qv&response_type=code&redirect_uri=https://www.chatguess.com/twitchauthorizationredirect&scope=channel:read:redemptions+chat:edit+chat:read+channel:manage:redemptions

  if (
    req.originalUrl == "" ||
    req.originalUrl == "/" ||
    req.originalUrl.endsWith("index.html") ||
    req.originalUrl.endsWith(".png") ||
    req.originalUrl.endsWith(".mp3") ||
    req.originalUrl.endsWith(".jpg") ||
    req.originalUrl.endsWith(".jpeg") ||
    req.originalUrl.endsWith(".js") ||
    req.originalUrl.endsWith(".css") ||
    req.originalUrl.endsWith(".ico")) {
    next()
  } else if (req.originalUrl.startsWith("/twitchauthorizationredirect")) {
    auth2(req.query.code)
  } else {

    // console.log("req.query.x")
    // console.log(req.query.x)

    // console.log("req")
    // console.log(req)

    let channelName = req.originalUrl.substring(1)
    res.sendFile(__dirname + '/public/chatguessgames.html');

    //if we don't have auth for the user, send them to the home screen
    //do I do a redirect? Or just sendFile?
  }

  // console.log('req:', req)
  // console.log('res:', res)
})

expressApp.use(express.static('public'));

httpServer.listen(port, () => {
  console.log(`chatguess: listening on port ${port}`);
});

const auth2 = async (authorizationCode) => {

  console.log("auth2")
  console.log("clientId")
  console.log(clientId)
  
  var auth2URL = "https://id.twitch.tv/oauth2/token" +
  "?client_id=" + clientId +
    "&client_secret=" + clientSecret +
    "&code=" + authorizationCode +
    "&grant_type=authorization_code" +
    "&redirect_uri=https://www.chatguess.com"

  const auth2Response = await fetch(auth2URL, {
    method: 'POST',
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    }

  });

  const auth2ResponseJSON = await auth2Response.json();
  console.log("auth2ResponseJSON")
  console.log(auth2ResponseJSON)  

  var accessToken = auth2ResponseJSON.access_token
  var refreshToken = auth2ResponseJSON.refresh_token
  console.log("accessToken")
  console.log(accessToken)
  console.log("refreshToken")
  console.log(refreshToken)
}