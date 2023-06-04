import {ChannelStatus, getIgdbAccessToken} from './ChannelStatus.js'
import { showImage, showCoverImage, showTitle, setHTMLControllerCallback } from './htmlController.js';
import { setRedemptionCallback } from './Twurple.js';

//Not sure whether to do map or array here
var ChannelStatusMap = {}
var ChannelStatuses = []

// To be replaced by ChannelStatus class
let queue = 0
let game = null
let hintProvider = null
let guessChecker = null

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

getIgdbAccessToken()
const channelStatus = new ChannelStatus("LynchML")
setHTMLControllerCallback(channelStatus)
setRedemptionCallback(channelStatus)