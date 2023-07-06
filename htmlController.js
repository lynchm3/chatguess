//NEW HTTP WITH EXPRESS
// import { express } from 'express';
import { clientId, clientSecret } from './secrets.js'
import { createHomeGame, createOrUpdateChannel } from './app.js'
import express from 'express';
// const { express } = pkg;
const expressApp = express();
import { Server } from 'http';
const httpServer = Server(expressApp);
import { Server as SocketIOServer } from 'socket.io';
const io = new SocketIOServer(httpServer)

import path from 'path';
import { fileURLToPath } from 'url';
import { Auth } from './db.js';

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

var callback = null
export function setCallback(c) {
  callback = c
}

//Socket emits
export function showText(text) { io.emit('showText', text); }

export function showVideo(video) { io.emit('showVideo', video); }

export function showTitle(broadcasterUsername, endTimestamp) {
  var socketsForChannel = sockets[broadcasterUsername]  
  // var endTimestamp = new Date("June 17, 2023 17:00:00").getTime()
  for (let i in socketsForChannel) {
    socketsForChannel[i].emit('showTitle', endTimestamp);
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
  // console.log("connection EVENT")

  // console.log("socket.handshake.headers.referer")
  // console.log(socket.handshake.headers.referer)

  var broadcasterUsername = socket.handshake.headers.referer.split('/').pop();

  // console.log("broadcasterUsername:")
  // console.log(broadcasterUsername)

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
    req.originalUrl.endsWith(".ico") ||
    req.originalUrl.endsWith(".ttf") ||
    req.originalUrl.endsWith(".woff") ||
    req.originalUrl.endsWith(".otf")) {
    next()
  } else if (req.originalUrl.startsWith("/twitchauthorizationredirect")) {
    auth2(req.query.code, res)
  // } else if (req.originalUrl.startsWith("/twitchchannelnotregistered")) {
  //   console.log("Looking for twitchchannelnotregistered")  
  //   res.set('Content-Type', 'text/html');    
  //   res.send("The channel " + req.query.channelName + " is not registered, go to chatguess.com in your browser to register yoour channel!");
  //   // next()
  } else {

    // console.log("req.query.x")
    // console.log(req.query.x)

    // console.log("req")
    // console.log(req)

    let channelName = req.originalUrl.substring(1)
    userRegisteredCheck(channelName, res)

    //if we don't have auth for the user, send them to the home screen
    //do I do a redirect? Or just sendFile?
  }

  // console.log('req:', req)
  // console.log('res:', res)
})

expressApp.use(express.static('public'));

httpServer.listen(port, () => {
  // console.log(`chatguess: listening on port ${port}`);
});


async function userRegisteredCheck(channelName, res) {

  var auth = new Auth(channelName, null, null, null)
  await auth.selectAuthByBroadcasterName(res)

  // console.log("auth")
  // console.log(auth)

  if (!auth.accessToken) { 
    res.set('Content-Type', 'text/html');    
    res.send("The channel " + channelName + ' is not registered, go to <a href="http://chatguess.com">chatguess.com</a> to enable ChatGuess for your channel!');
    // res.redirect("/twitchchannelnotregistered?"+channelName)
    // res.redirect("/twitchchannelnotregistered.html?channelName="+channelName)
    // res.sendFile(__dirname + '/public/notregistered.html');
  } else {
    res.sendFile(__dirname + '/public/chatguessgames.html');
  }
}

const auth2 = async (authorizationCode, res) => {

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

  console.log("auth2Response")
  console.log(auth2Response.status)
  const auth2ResponseJSON = await auth2Response.json();
  console.log(auth2ResponseJSON)

  if (auth2Response.status != 200)
    res.redirect("/error")

  console.log("auth2ResponseJSON")
  console.log(auth2ResponseJSON)

  var accessToken = auth2ResponseJSON.access_token
  var refreshToken = auth2ResponseJSON.refresh_token
  console.log("accessToken")
  console.log(accessToken)
  console.log("refreshToken")
  console.log(refreshToken)

  // userId
  const usersResponse = await fetch("https://api.twitch.tv/helix/users", {
    method: 'GET',
    headers: {
      "Client-ID": `${clientId}`,
      "Authorization": `Bearer ${accessToken}`,
      "Accept": "application/json",
      "Content-Type": "application/json"
    }
  });

  if (usersResponse.status != 200)
    return

  const usersResponseJSON = await usersResponse.json();

  var userId = usersResponseJSON.data[0].id
  var login = usersResponseJSON.data[0].login

  console.log("usersResponseJSON")
  console.log(usersResponseJSON)
  console.log("userId")
  console.log(userId)
  console.log("login")
  console.log(login)

  new Auth(login, userId, accessToken, refreshToken).insertOrUpdateAuth()
  createOrUpdateChannel(login, userId, accessToken, refreshToken)

  let channelName = login
  // res.sendFile(__dirname + '/public/chatguessgames.html');
  res.redirect("/" + channelName)
  // req.redi.red
}

