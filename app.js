import {ChannelStatus, getIgdbAccessToken} from './ChannelStatus.js'

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

getIgdbAccessToken()
const channelStatus = new ChannelStatus("lynchml", "57016188")