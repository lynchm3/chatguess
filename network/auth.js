import { createHomeGame, createOrUpdateChannel } from '../app.js?'
import { clientId, clientSecret, userId } from '../secrets.js'
import fetch from 'node-fetch';
import { Auth } from '../db.js';

export async function refreshToken(channel) {

    // console.log("refreshToken")

    var auth2URL = "https://id.twitch.tv/oauth2/token" +
        "?client_id=" + clientId +
        "&client_secret=" + clientSecret +
        "&refresh_token=" + channel.refreshToken +
        "&grant_type=refresh_token"

    const auth2Response = await fetch(auth2URL, {
        method: 'POST',
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    });

    if (auth2Response.status != 200)
        return

    const auth2ResponseJSON = await auth2Response.json();
    // console.log("auth2ResponseJSON")
    // console.log(auth2ResponseJSON)

    var accessToken = auth2ResponseJSON.access_token
    var refreshToken = auth2ResponseJSON.refresh_token
    // console.log("accessToken")
    // console.log(accessToken)
    // console.log("refreshToken")
    // console.log(refreshToken)

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

    // console.log("usersResponseJSON")
    // console.log(usersResponseJSON)
    // console.log("userId")
    // console.log(userId)
    // console.log("login")
    // console.log(login)

    new Auth(login, userId, accessToken, refreshToken).insertOrUpdateAuth()
    createOrUpdateChannel(login, userId, accessToken, refreshToken)

    // let channelName = login
    // res.sendFile(__dirname + '/public/chatguessgames.html');
    // res.redirect("/" + channelName)
    // req.redi.red
}