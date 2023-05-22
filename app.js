// Chapter on getting oauth token https://www.youtube.com/watch?v=7uSjKbAUHXg

import fetch from 'node-fetch';
import { Game, GameImage } from './Game.js';
import { HintProvider } from './HintProvider.js';
import { GuessChecker } from './GuessChecker.js';
import { Chatbot } from './chatbot/chatbot.js';
import { showImage, showCoverImage, showTitle, setCallback } from './htmlController.js';
import { CorrectAnswer, Scoreboard } from './scoreboard.js';
import { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET } from './secrets.js';

// console.log(`app.js - Starting Guess The Game`)

const BASE_IGDB_URL = "https://api.igdb.com/v4"

let accessToken = null
var autoplay = false

let game = null
let hintProvider = null
let guessChecker = null

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

var queue = 0

//New - 
//collection, Reference ID for Collection,	The series the game belongs to
//involved_companies,	Array of Involved Company IDs,	Companies who developed this game
//parent_game, Reference ID for Game,	If a DLC, expansion or part of a bundle, this is the main game or bundle
//status,	Status Enum,	The status of the games release
//version_parent,	Reference ID for Game	If a version, this is the main game (Not gold or collectors edition)

const ENDPOINT_GAMES = "/games"
const MIN_FOLLOWERS = 45
const GAMES_WITH_50_RATING = 897
const MAX_OFFSET = GAMES_WITH_50_RATING
const RESULT_COUNT = 1
const FIELDS = `name, follows, hypes, aggregated_rating, alternative_names.name, artworks.*, cover.*,
  first_release_date, franchise.name, franchises.name, genres.name, platforms.name, screenshots.*, similar_games.name,
  storyline, summary, themes.name, videos.*, websites.url,
  collection.name, 
  involved_companies.company.name`
const IMAGE_BIG_COVER_URL = `https://images.igdb.com/igdb/image/upload/t_cover_big/`
const IMAGE_1080_URL = `https://images.igdb.com/igdb/image/upload/t_1080p/`
const IMAGE_720_URL = `https://images.igdb.com/igdb/image/upload/t_720p/`
const THUMB_URL = `//images.igdb.com/igdb/image/upload/t_thumb/`

let i = 0;

const SEARCH_TERM = ""

const getGame = async (accessToken) => {

  chatbot.chat(`lynchm1Youwhat Starting a new round of WHAT'S THE GAME! lynchm1Youwhat`)

  var search = ""
  if (SEARCH_TERM.length > 0)
    search = `search "${SEARCH_TERM}";`

  const response = await fetch(`${BASE_IGDB_URL}${ENDPOINT_GAMES}`, {
    method: 'POST',
    body: `fields ${FIELDS}; 
        limit ${RESULT_COUNT};
        offset ${getRandomInt(MAX_OFFSET)};
        where version_parent = null & parent_game = null & follows >= ${MIN_FOLLOWERS} & themes != (42);   
        ${search}
      `,
    headers: {
      "Client-ID": `${TWITCH_CLIENT_ID}`,
      "Authorization": `Bearer ${accessToken}`,
      "Accept": "application/json"
    }
  });
  const responseJson = await response.json();

  // console.log("responseJson")
  // console.log(responseJson)

  game = new Game(
    /* id = */ responseJson[0].id,
        /* name = */ responseJson[0].name,
        /* follows = */ responseJson[0].follows,
        /* hypes = */ responseJson[0].hypes,
        /* aggregatedRating = */ Math.round(responseJson[0].aggregated_rating),
        /* alternativeNames = */ responseJson[0].alternative_names?.map(x => x.name),
        /* artworks = */ responseJson[0].artworks?.map(x => new GameImage(`${IMAGE_720_URL}${x.image_id}.jpg`, x.width, x.height)),
        /* collection = */ responseJson[0].collection?.name,
        /* coverArt = */ new GameImage(`${IMAGE_720_URL}${responseJson[0].cover.image_id}.jpg`, responseJson[0].cover.width, responseJson[0].cover.height),
        /* originalReleaseDate = */ new Date(responseJson[0].first_release_date * 1000).getFullYear(),
        /* franchise = */ responseJson[0].franchise?.name,
        /* franchises = */ responseJson[0].franchises?.map(x => x.name),
        /* genres = */ responseJson[0].genres?.map(x => x.name),
        /* involvedCompanies = */ responseJson[0].involved_companies?.map(x => `${x.company.name}`),
        /* platforms = */ responseJson[0].platforms?.map(x => x.name),
        /* screenshots = */ responseJson[0].screenshots?.map(x => new GameImage(`${IMAGE_720_URL}${x.image_id}.jpg`, x.width, x.height)),
        /* similarGames = */ responseJson[0].similar_games?.map(x => x.name),
        /* storyline = */ responseJson[0].storyline,
        /* summary = */ responseJson[0].summary,
        /* themes = */ responseJson[0].themes?.map(x => x.name),
        /* videos = */ responseJson[0].videos?.map(x => x.video_id),
        /* websites = */ responseJson[0].websites?.map(x => x.url)

  )

  // console.log(JSON.stringify(game))

  hintProvider = new HintProvider(game, new HintProviderCallback())
  guessChecker = new GuessChecker(game)
}



const getAccessToken = async () => {
  const response = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials&scope=channel%3Amanage%3Aredemptions`, {
    method: 'POST'
  });
  const responseJson = await response.json();
  accessToken = responseJson.access_token
  // console.log("accessToken")
  // console.log(accessToken)
}

const getProfileImage = async (userID, accessToken) => {

  const twitchUserResponse = await fetch(`https://api.twitch.tv/helix/users?id=${userID}`, {
    method: 'GET',
    headers: {
      "Client-ID": `${TWITCH_CLIENT_ID}`,
      "Authorization": `Bearer ${accessToken}`,
      "Accept": "application/json"
    }
  });

  const twitchUserResponseJson = await twitchUserResponse.json();

  // console.log("twitchUserResponseJson")
  // console.log(twitchUserResponseJson)
}

//troubleshoot for 401 - https://discuss.dev.twitch.tv/t/401-missing-user-oauth-token-get-custom-rewards/34902
//https://dev.twitch.tv/docs/api/reference/#get-custom-reward
//https://dev.twitch.tv/docs/authentication/scopes/

const getRedemptions = async (userID, accessToken) => {
  const redemptionsResponse = await fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${userID}`, {
    method: 'GET',
    headers: {
      "Client-ID": `${TWITCH_CLIENT_ID}`,
      "Authorization": `Bearer ${accessToken}`,
      "Accept": "application/json"
    }
  });

  const redemptionsResponseJson = await redemptionsResponse.json();

  console.log("redemptionsResponseJson")
  console.log(redemptionsResponseJson)
}

// function for polling every 15 seconds to check for user redemptions 
const pollForRedemptions = async (userID, accessToken) => {


  const redemptionResponse = await fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?broadcaster_id=${userID}&reward_id=${"123"}&status=UNFULFILLED`, {
    method: 'GET',
    headers: {
      "Client-ID": `${TWITCH_CLIENT_ID}`,
      "Authorization": `Bearer ${accessToken}`,
      "Accept": "application/json"
    }
  });

  const redemptionResponseJson = await redemptionResponse.json();

  console.log("redemptionResponseJson")
  console.log(redemptionResponseJson)


  // let redemptions = body.data
  // let successfulRedemptions = []
  // let failedRedemptions = []

  // for (let redemption of redemptions) {
  //     // can't follow yourself :) 
  //     if (redemption.broadcaster_id == redemption.user_id) {
  //         failedRedemptions.push(redemption.id)
  //         continue
  //     }
  //     // if failed, add to the failed redemptions
  //     if (await followUser(redemption.broadcaster_id, redemption.user_id) == false) {
  //         failedRedemptions.push(redemption.id)
  //         continue
  //     }
  //     // otherwise, add to the successful redemption list
  //     successfulRedemptions.push(redemption.id)
  // }

  // // do this in parallel
  // await Promise.all([
  //     fulfillRewards(successfulRedemptions, "FULFILLED"),
  //     fulfillRewards(failedRedemptions, "CANCELED")
  // ])

  // console.log(`Processed ${successfulRedemptions.length + failedRedemptions.length} redemptions.`)

  // // instead of an interval, we wait 15 seconds between completion and the next call
  // pollingInterval = setTimeout(pollForRedemptions, 15 * 1000)
}

class HintProviderCallback {
  giveTextHint(hint) {
    chatbot.chat(hint.hint())
  }

  giveImageHint(hint, hintCount) {
    showImage(hint.gameImage, 100 + 25 * hintCount)
  }
}

//Chat Bot
class ChatbotCallback {
  setAutoPlay(a) {
    autoplay = a
  }

  startWhatsTheGame() {
    if (game == null) {
      getGame(accessToken)
      showTitle()
    }
  }

  giveUp() {
    chatbot.chat(`lynchm1Youwhat No one guessed correctly! The game was ${game.name}! lynchm1Youwhat`)
    // console.log("game.coverArt")
    // console.log(game.coverArt)
    showCoverImage(game.coverArt, "No one")
    game = null
    guessChecker = null
    hintProvider.stop()
    hintProvider = null

    if (autoplay)
      setTimeout(function () {
        if (game == null) {
          getGame(accessToken)
          showTitle()
        }
      }, 11_000);
  }

  messageCallback(message, tags, username, userId, channelId) {
    // getProfileImage(userId, accessToken)
    // getRedemptions(userId, oAuthToken)
    // pollForRedemptions(userId, oAuthToken)
    checkGuess(message, username, userId, channelId)
  }

  points(userId, channel, displayName) {
    new Scoreboard().getUserScore(chatbot, userId, channel, displayName)
  }

  scoreboard(channelId) {
    new Scoreboard().getScoreboard(accessToken, chatbot, channelId)
  }
}

function checkGuess(message, username, userId, channelId) {
  if (guessChecker?.checkGuess(message)) {
    const correctAnswer = new CorrectAnswer(
      Date.now(),
      userId,
      channelId,
      game.id)
    correctAnswer.insertCorrectAnswer()
    chatbot.chat(`lynchm1Youwhat ${username} guessed correctly! The game was ${game.name}! lynchm1Youwhat`)
    
    // new Scoreboard().getScoreboard(accessToken, chatbot, channelId)

    new Scoreboard().getUserScoreAndRival(chatbot, userId, channelId, username, accessToken)

    if (userId != null)
      getProfileImage(userId, accessToken)
    showCoverImage(game.coverArt, username)
    game = null
    guessChecker = null
    hintProvider.stop()
    hintProvider = null

    if (autoplay)
      setTimeout(function () {
        if (game == null) {
          getGame(accessToken)
          showTitle()
        }
      }, 11_000);
  }
}

class HtmlControllerCallback {
  guess(message) {
    checkGuess(message, "You", null, null)
  }
}

setCallback(new HtmlControllerCallback())

// console.log("app.js - Starting Chat Bot")
let chatbot = new Chatbot(new ChatbotCallback())



getAccessToken()