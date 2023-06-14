import fetch from 'node-fetch';
import { Game, GameImage } from './Game.js';
import { HintProvider } from './HintProvider.js';
import { GuessChecker } from './GuessChecker.js';
import { Chatbot } from './chatbot/chatbot.js'; import { CorrectAnswer, Scoreboard } from './db.js';
import { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET } from './secrets.js';
import { Redemption } from './Redemption.js';
import { showImage, showCoverImage, showTitle } from './htmlController.js';
import { igdbAccessToken } from './app.js'

const BASE_IGDB_URL = "https://api.igdb.com/v4"

const ENDPOINT_GAMES = "/games"
const MIN_FOLLOWERS = 45
// const GAMES_WITH_50_RATING = 897
const RESULT_COUNT = 1
// & follows >= ${MIN_FOLLOWERS} 

const KEY_FIRST_RELEASE_DATE = "first_release_date"

const TIMESTAMP_1970 = -3600
const TIMESTAMP_1980 = 315532800
const TIMESTAMP_1990 = 631152000
const TIMESTAMP_2000 = 946684800
const TIMESTAMP_2010 = 1262304000
const TIMESTAMP_2020 = 1577836800
const TIMESTAMP_2030 = 1893456000

const RANGE_70s = `${KEY_FIRST_RELEASE_DATE} >= ${TIMESTAMP_1970}
& ${KEY_FIRST_RELEASE_DATE} < ${TIMESTAMP_1980}`
const RANGE_80s = `${KEY_FIRST_RELEASE_DATE} >= ${TIMESTAMP_1980}
& ${KEY_FIRST_RELEASE_DATE} < ${TIMESTAMP_1990}`
const RANGE_90s = `${KEY_FIRST_RELEASE_DATE} >= ${TIMESTAMP_1990}
& ${KEY_FIRST_RELEASE_DATE} < ${TIMESTAMP_2000}`
const RANGE_00s = `${KEY_FIRST_RELEASE_DATE} >= ${TIMESTAMP_2000}
& ${KEY_FIRST_RELEASE_DATE} < ${TIMESTAMP_2010}`
const RANGE_10s = `${KEY_FIRST_RELEASE_DATE} >= ${TIMESTAMP_2010}
& ${KEY_FIRST_RELEASE_DATE} < ${TIMESTAMP_2020}`
const RANGE_20s = `${KEY_FIRST_RELEASE_DATE} >= ${TIMESTAMP_2020}
& ${KEY_FIRST_RELEASE_DATE} < ${TIMESTAMP_2030}`

const BASE_WHERE_CLAUSE = `version_parent = null 
& parent_game = null 
& themes != (42)  
& cover != null
& (artworks != null | screenshots != null) `

const HARDCORE_SEVENTIES_WHERE_CLAUSE = `${BASE_WHERE_CLAUSE} & ${RANGE_70s};`
// const NORMAL_SEVENTIES_WHERE_CLAUSE = `${BASE_WHERE_CLAUSE} & ${RANGE_70s} 
// & (aggregated_rating_count >= 1);`
const HARDCORE_EIGHTIES_WHERE_CLAUSE = `${BASE_WHERE_CLAUSE} & ${RANGE_80s};`
// const NORMAL_EIGHTIES_WHERE_CLAUSE = `${BASE_WHERE_CLAUSE} & ${RANGE_80s} 
// & (aggregated_rating_count >= 1);`
const HARDCORE_NINTIES_WHERE_CLAUSE = `${BASE_WHERE_CLAUSE} & ${RANGE_90s};`
const NORMAL_NINTIES_WHERE_CLAUSE = `${BASE_WHERE_CLAUSE} & ${RANGE_90s} 
& (aggregated_rating_count >= 1);`
const HARDCORE_AUGHTIES_WHERE_CLAUSE = `${BASE_WHERE_CLAUSE} & ${RANGE_00s};`
const NORMAL_AUGHTIES_WHERE_CLAUSE = `${BASE_WHERE_CLAUSE} & ${RANGE_00s} 
& (aggregated_rating_count >= 4);`
const HARDCORE_TENS_WHERE_CLAUSE = `${BASE_WHERE_CLAUSE} & ${RANGE_10s};`
const NORMAL_TENS_WHERE_CLAUSE = `${BASE_WHERE_CLAUSE} & ${RANGE_10s} 
& (aggregated_rating_count >= 10);`
const HARDCORE_TWENTIES_WHERE_CLAUSE = `${BASE_WHERE_CLAUSE} & ${RANGE_20s};`
const NORMAL_TWENTIES_WHERE_CLAUSE = `${BASE_WHERE_CLAUSE} & ${RANGE_20s} 
& (aggregated_rating_count >= 3);`

// const RPG_WHERE_CLAUSE

const DEFAULT_WHERE_CLAUSE = `${BASE_WHERE_CLAUSE} 
& (aggregated_rating_count > 9 | follows >= ${MIN_FOLLOWERS}); `

const WHERE_CLAUSE = NORMAL_TENS_WHERE_CLAUSE

const FIELDS = `name, follows, hypes, aggregated_rating, aggregated_rating_count, alternative_names.name, artworks.*, cover.*,
  first_release_date, franchise.name, franchises.name, genres.name, platforms.name, screenshots.*, similar_games.name,
  storyline, summary, themes.name, videos.*, websites.*,
  collection.name, 
  involved_companies.company.name`
const IMAGE_BIG_COVER_URL = `https://images.igdb.com/igdb/image/upload/t_cover_big/`
const IMAGE_1080_URL = `https://images.igdb.com/igdb/image/upload/t_1080p/`
const IMAGE_720_URL = `https://images.igdb.com/igdb/image/upload/t_720p/`
const THUMB_URL = `//images.igdb.com/igdb/image/upload/t_thumb/`
const SEARCH_TERM = ""

export class Channel {
    constructor(channel, broadcasterId, authToken, refreshToken, rewardID) {
        this.channel = channel
        this.broadcasterId = broadcasterId
        this.authToken = authToken
        this.refreshToken = refreshToken
        this.game = null
        this.queue = 0
        this.hintProvider = null
        this.guessChecker = null
        this.autoplay = false
        this.chatbot = new Chatbot(this)
        this.redemption = new Redemption(this, channel, broadcasterId, authToken, refreshToken, rewardID)
    }

    getGame = async (igdbAccessToken) => {

        //TODO
        //I think the offset might need to count form 1 not 0.
        //1. check if this is tru
        //2. alter randomiser results to never be 0 (I think there may be a small chance)

        const countResponse = await fetch(`${BASE_IGDB_URL}${ENDPOINT_GAMES}/count`, {
            method: 'POST',
            body: `where ${WHERE_CLAUSE}`,
            headers: {
                "Client-ID": `${TWITCH_CLIENT_ID}`,
                "Authorization": `Bearer ${igdbAccessToken}`,
                "Accept": "application/json"
            }
        });
        const countResponseJson = await countResponse.json();
        console.log("countResponseJson")
        console.log(countResponseJson)
        let count = countResponseJson.count
        console.log(`There are ${count} games in this filter`)

        this.chatbot.chat(`New round of Chat Guess Games!`)

        var search = ""
        if (SEARCH_TERM.length > 0)
            search = `search "${SEARCH_TERM}";`

        const MAX_OFFSET = count

        const response = await fetch(`${BASE_IGDB_URL}${ENDPOINT_GAMES}`, {
            method: 'POST',
            body: `fields ${FIELDS}; 
          limit ${RESULT_COUNT};
          offset ${getRandomInt(MAX_OFFSET)};
          where ${WHERE_CLAUSE} 
          ${search}`,
            headers: {
                "Client-ID": `${TWITCH_CLIENT_ID}`,
                "Authorization": `Bearer ${igdbAccessToken}`,
                "Accept": "application/json"
            }
        });

        const responseJson = await response.json();

        // console.log("responseJson")
        // console.log(responseJson)

        // console.log("responseJson")
        // console.log(responseJson[0])

        console.log("aggregated_rating_count")
        console.log(responseJson[0].aggregated_rating_count)

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

        this.hintProvider = new HintProvider(this.game, this, 7_000)
        this.guessChecker = new GuessChecker(this.game)
    }

    checkGuess(message, username, userId, channelId) {
        if (this.guessChecker?.checkGuess(message)) {
            const correctAnswer = new CorrectAnswer(
                Date.now(),
                userId,
                channelId,
                this.game.id)
            correctAnswer.insertCorrectAnswer()

            this.chatbot.chat(`lynchm1Youwhat ${username} guessed correctly! The game was ${this.game.name}! lynchm1Youwhat`)
            // if (game.steamURL != null) {
            //   chatbot.chat(`lynchm1Youwhat Here's the steam URL: ${game.steamURL} lynchm1Youwhat`)
            // }

            new Scoreboard().getUserScoreAndRival(this.chatbot, userId, channelId, username, igdbAccessToken)

            // if (userId != null)
            //     getProfileImage(userId, igdbAccessToken)
            showCoverImage(this.game.coverArt, username, this.channel)
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
        showCoverImage(this.game.coverArt, "No one", this.channel)
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
            showTitle(this.channel)
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
        showImage(hint.gameImage, 100 + 25 * hintCount, this.channel)
    }

    setAutoPlay(a) {
        this.autoplay = a
        if (this.game == null) {
            this.getGame(igdbAccessToken)
            showTitle(this.channel)
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
            showTitle(this.channel)
        } else if (this.queue > 0) {
            this.getGame(igdbAccessToken)
            showTitle(this.channel)
            this.queue--
        } else {
            this.game = null
        }
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}