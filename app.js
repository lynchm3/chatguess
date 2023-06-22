// THE BIG ONES
// https
// Google cloud DB, firestore mentioned here? https://cloud.google.com/nodejs/getting-started
// database layer (class)
// auth table
// network layer that re-auths on 401
// delete dead sockets



import { Channel } from './Channel.js'
import { Home } from './Home.js'
import { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET } from './secrets.js';
import fetch from 'node-fetch';
import { PRODUCTION_ENVIRONMENT, DEVELOPMENT_ENVIRONMENT } from './environments.js';

export var ENVIRONMENT = PRODUCTION_ENVIRONMENT
process.argv.forEach(function (val, index, array) {
    if (val == "dev_env") {
        console.log("Environment is DEV")
        ENVIRONMENT = DEVELOPMENT_ENVIRONMENT
    }
});

//Not sure whether to do map or array here
var channelMap = new Map();

// const getProfileImage = async (userID, accessToken) => {

//   const twitchUserResponse = await fetch(`https://api.twitch.tv/helix/users?id=${userID}`, {
//     method: 'GET',
//     headers: {
//       "Client-ID": `${TWITCH_CLIENT_ID}`,
//       "Authorization": `Bearer ${accessToken}`,
//       "Accept": "application/json"
//     }
//   });
//   const twitchUserResponseJson = await twitchUserResponse.json();
// }

export var igdbAccessToken = null
export const getIgdbAccessToken = async () => {
    const response = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials&scope=channel%3Amanage%3Aredemptions`, {
        method: 'POST'
    });

    if (response.status != 200) {
        console.log("error getting getIgdbAccessToken")
        return
    }

    const responseJson = await response.json();
    igdbAccessToken = responseJson.access_token
    // new Channel("lynchml", "57016188", igdbAccessToken)
    // new Home("lynchml", igdbAccessToken)
}
getIgdbAccessToken()

export function createChannel(channelName, channelId, authToken, refreshToken, rewardID) {
    const oldChannel = channelMap.get(channelName)
    if (oldChannel == undefined) {
        let channel = new Channel(channelName, channelId, authToken, refreshToken, rewardID)
        channelMap.set(channelName, channel)
    } else {
        oldChannel.authToken = authToken
        oldChannel.refreshToken = refreshToken
    }
}

export function createHomeGame(socket) {
    let home = new Home(socket, igdbAccessToken)
    home.getGame()
}