// THE BIG ONES
// https
// Google cloud DB, firestore mentioned here? https://cloud.google.com/nodejs/getting-started
// database layer (class)
// auth table
// network layer that re-auths on 401
// delete dead sockets

// Google Cloud Launch
// Open Google CLoud SDK Shell
// cd C:\Users\lynch\Documents\GitHub\chatguess\
// gcloud run deploy

// The cloud run dahsboard for managing the server
// https://console.cloud.google.com/run?project=chatguess

// Logs
// https://console.cloud.google.com/logs/query?project=chatguess

import {ChannelStatus} from './ChannelStatus.js'
import {Home} from './Home.js'
import { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET } from './secrets.js';
import fetch from 'node-fetch';

//Not sure whether to do map or array here
var ChannelStatusMap = {}
var ChannelStatuses = []

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



var igdbAccessToken = null
export const getIgdbAccessToken = async () => {
    const response = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials&scope=channel%3Amanage%3Aredemptions`, {
        method: 'POST'
    });
    const responseJson = await response.json();
    igdbAccessToken = responseJson.access_token
    new ChannelStatus("lynchml", "57016188", igdbAccessToken)
    // new Home("lynchml", igdbAccessToken)
}
getIgdbAccessToken()

export function createHomeGame(socket) {
    let home = new Home(socket, igdbAccessToken)
    home.getGame()
}