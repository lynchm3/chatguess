import fetch from 'node-fetch';
import { Game, GameImage } from './Game.js';
import { HintProvider } from './HintProvider.js';
import { GuessChecker } from './GuessChecker.js';
import { Chatbot } from './chatbot/chatbot.js'; import { CorrectAnswer, Scoreboard } from './scoreboard.js';
import { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET } from './secrets.js';
import { setRedemptionCallback } from './Twurple.js';
import { showImage, showCoverImage, showTitle, setHTMLControllerCallback } from './htmlController.js';

const BASE_IGDB_URL = "https://api.igdb.com/v4"
let igdbAccessToken = null

const ENDPOINT_GAMES = "/games"
const MIN_FOLLOWERS = 45
const GAMES_WITH_50_RATING = 897
const MAX_OFFSET = GAMES_WITH_50_RATING
const RESULT_COUNT = 1
const FIELDS = `name, follows, hypes, aggregated_rating, alternative_names.name, artworks.*, cover.*,
  first_release_date, franchise.name, franchises.name, genres.name, platforms.name, screenshots.*, similar_games.name,
  storyline, summary, themes.name, videos.*, websites.*,
  collection.name, 
  involved_companies.company.name`
const IMAGE_BIG_COVER_URL = `https://images.igdb.com/igdb/image/upload/t_cover_big/`
const IMAGE_1080_URL = `https://images.igdb.com/igdb/image/upload/t_1080p/`
const IMAGE_720_URL = `https://images.igdb.com/igdb/image/upload/t_720p/`
const THUMB_URL = `//images.igdb.com/igdb/image/upload/t_thumb/`
const SEARCH_TERM = ""

export class ChannelStatus {
    constructor(channel) {
        this.channel = channel
        this.game = null
        this.queue = 0
        this.hintProvider = null
        this.guessChecker = null
        this.autoplay = false
        this.chatbot = new Chatbot(this)
    }

    getGame = async (igdbAccessToken) => {

        this.chatbot.chat(`lynchm1Youwhat Starting a new round of WHAT'S THE GAME! lynchm1Youwhat`)

        var search = ""
        if (SEARCH_TERM.length > 0)
            search = `search "${SEARCH_TERM}";`

        const response = await fetch(`${BASE_IGDB_URL}${ENDPOINT_GAMES}`, {
            method: 'POST',
            body: `fields ${FIELDS}; 
          limit ${RESULT_COUNT};
          offset ${getRandomInt(MAX_OFFSET)};
          where version_parent = null & parent_game = null & follows >= ${MIN_FOLLOWERS} & themes != (42);   
          ${search}`,
            headers: {
                "Client-ID": `${TWITCH_CLIENT_ID}`,
                "Authorization": `Bearer ${igdbAccessToken}`,
                "Accept": "application/json"
            }
        });

        const responseJson = await response.json();

        this.game = new Game(
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
          /* websites = */ responseJson[0].websites
        )

        this.hintProvider = new HintProvider(this.game, this)
        this.guessChecker = new GuessChecker(this.game)
    }

    checkGuess(message, username, userId, channelId) {
        if (this.guessChecker?.checkGuess(message)) {
            const correctAnswer = new CorrectAnswer(
                Date.now(),
                userId,
                channelId,
                game.id)
            correctAnswer.insertCorrectAnswer()

            this.chatbot.chat(`lynchm1Youwhat ${username} guessed correctly! The game was ${this.game.name}! lynchm1Youwhat`)
            // if (game.steamURL != null) {
            //   chatbot.chat(`lynchm1Youwhat Here's the steam URL: ${game.steamURL} lynchm1Youwhat`)
            // }

            new Scoreboard().getUserScoreAndRival(this.chatbot, userId, channelId, username, igdbAccessToken)

            if (userId != null)
                getProfileImage(userId, igdbAccessToken)
            showCoverImage(this.game.coverArt, username)
            this.guessChecker = null
            this.hintProvider.stop()
            this.hintProvider = null
            var that = this
            setTimeout(function () {
                that.roundEnded();
            }, 11_000);
        }
    }

    giveUp() {
        this.chatbot.chat(`lynchm1Youwhat No one guessed correctly! The game was ${this.game.name}! lynchm1Youwhat`)
        // if (game.steamURL != null) {
        //   chatbot.chat(`lynchm1Youwhat Here's the steam URL: ${game.steamURL} lynchm1Youwhat`)
        // }
        showCoverImage(this.game.coverArt, "No one")
        this.guessChecker = null
        this.hintProvider.stop()
        this.hintProvider = null
        var that = this
        setTimeout(function () {
            that.roundEnded();
        }, 11_000);
    }

    addGamesToQueue(gc, username) {
        console.log("addGamesToQueue gc")
        console.log(gc)
        console.log("this.queue")
        console.log(this.queue)
        // console.log("this.game")
        // console.log(this.game)
        this.queue += gc
        if (this.queue > 0 && this.game == null) {
            this.queue--
            console.log("calling get game")
            this.getGame(igdbAccessToken)
            showTitle()
        } else {
            this.chatbot.chat(`There's a game running right now, but yours has been queued up ${username}!`)
        }
    }

    guess(message) {
        checkGuess(message, "You", null, null)
    }

    giveTextHint(hint) {
        this.chatbot.chat(hint.hint())
    }

    giveImageHint(hint, hintCount) {
        showImage(hint.gameImage, 100 + 25 * hintCount)
    }

    setAutoPlay(a) {
        this.autoplay = a
        if (this.game == null) {
            this.getGame(igdbAccessToken)
            showTitle()
        }
    }

    messageCallback(message, tags, username, userId, channelId) {
        this.checkGuess(message, username, userId, channelId)
    }

    points(userId, channel, displayName) {
        new Scoreboard().getUserScore(this.chatbot, userId, channel, displayName)
    }

    scoreboard(channelId) {
        new Scoreboard().getScoreboard(igdbAccessToken, this.chatbot, channelId)
    }

    roundEnded() {
        console.log("roundEnded()")
        console.log("this.autoplay")
        console.log(this.autoplay)
        if (this.autoplay) {
            this.getGame(igdbAccessToken)
            showTitle()
        } else if (this.queue > 0) {
            this.getGame(igdbAccessToken)
            showTitle()
            this.queue--
        } else {
            this.game = null
        }
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

export const getIgdbAccessToken = async () => {
    const response = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials&scope=channel%3Amanage%3Aredemptions`, {
        method: 'POST'
    });
    const responseJson = await response.json();
    igdbAccessToken = responseJson.access_token
}