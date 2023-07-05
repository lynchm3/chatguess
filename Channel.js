import fetch from 'node-fetch';
import { Game, GameImage } from './Game.js';
import { HintProvider } from './HintProvider.js';
import { GuessChecker } from './GuessChecker.js';
import { Chatbot } from './chatbot/chatbot.js'; import { CorrectAnswer, Scoreboard } from './db.js';
import { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET } from './secrets.js';
import { Redemption } from './Redemption.js';
import { showImage, showCoverImage, showTitle } from './htmlController.js';
import { igdbAccessToken } from './app.js'
import { Namespace } from 'socket.io';
// GOG Affiliate programme:
// https://support.gog.com/hc/en-us/articles/4405004689297-How-to-join-the-GOG-Affiliate-Program?product=gog

const HUMBLE_URL = "https://www.humblebundle.com/store/"
const HUMBLE_SUFFIX = "?partner=chatguess"

const BASE_IGDB_URL = "https://api.igdb.com/v4"

const ENDPOINT_GAMES = "/games"
const MIN_FOLLOWERS = 45
// const GAMES_WITH_50_RATING = 897
const RESULT_COUNT = 1
// & follows >= ${MIN_FOLLOWERS} 

const KEY_FIRST_RELEASE_DATE = "first_release_date"

//Category names
const CATEGORY_NAME_60s_NORMAL = "The 60s"
const CATEGORY_NAME_60s_HARDCORE = "The 60s, harcore mode"
const CATEGORY_NAME_70s_NORMAL = "The 70s"
const CATEGORY_NAME_70s_HARDCORE = "The 70s, harcore mode"
const CATEGORY_NAME_80s_NORMAL = "The 80s"
const CATEGORY_NAME_80s_HARDCORE = "The 80s, harcore mode"
const CATEGORY_NAME_90s_NORMAL = "The 90s"
const CATEGORY_NAME_90s_HARDCORE = "The 90s, harcore mode"
const CATEGORY_NAME_00s_NORMAL = "The 00s"
const CATEGORY_NAME_00s_HARDCORE = "The 00s, harcore mode"
const CATEGORY_NAME_10s_NORMAL = "The 10s"
const CATEGORY_NAME_10s_HARDCORE = "The 10s, harcore mode"
const CATEGORY_NAME_20s_NORMAL = "The 20s"
const CATEGORY_NAME_20s_HARDCORE = "The 20s, harcore mode"

const TIMESTAMP_1960 = -315619200
const TIMESTAMP_1970 = -3600
const TIMESTAMP_1980 = 315532800
const TIMESTAMP_1990 = 631152000
const TIMESTAMP_2000 = 946684800
const TIMESTAMP_2010 = 1262304000
const TIMESTAMP_2020 = 1577836800
const TIMESTAMP_2030 = 1893456000

const RANGE_60s = `${KEY_FIRST_RELEASE_DATE} >= ${TIMESTAMP_1960}
& ${KEY_FIRST_RELEASE_DATE} < ${TIMESTAMP_1970}`
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

//DECADES CATEGORIES
const HARDCORE_SIXTIES_WHERE_CLAUSE = `${BASE_WHERE_CLAUSE} & ${RANGE_60s};`
const NORMAL_SIXTIES_WHERE_CLAUSE = `${BASE_WHERE_CLAUSE} & ${RANGE_60s};`
const HARDCORE_SEVENTIES_WHERE_CLAUSE = `${BASE_WHERE_CLAUSE} & ${RANGE_70s};`
const NORMAL_SEVENTIES_WHERE_CLAUSE = `${BASE_WHERE_CLAUSE} & ${RANGE_70s} 
& (aggregated_rating_count >= 1);`
const HARDCORE_EIGHTIES_WHERE_CLAUSE = `${BASE_WHERE_CLAUSE} & ${RANGE_80s};`
const NORMAL_EIGHTIES_WHERE_CLAUSE = `${BASE_WHERE_CLAUSE} & ${RANGE_80s} 
& (aggregated_rating_count >= 1);`
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
& (aggregated_rating_count >= 6 | follows >= ${MIN_FOLLOWERS});`

// PUBLISHER CATEGORIES
const WHERE_CLAUSE_PUBLISHER_NINTENDO = `${BASE_WHERE_CLAUSE} & involved_companies.company = (70);`
const WHERE_CLAUSE_PUBLISHER_UBISOFT = `${BASE_WHERE_CLAUSE} & involved_companies.company = (104);`
// const WHERE_CLAUSE_PUBLISHER_NINTENDO = `${BASE_WHERE_CLAUSE} & platforms = (48);`

// THEME CATEGORIES
const WHERE_CLAUSE_THEME_HORROR = `${BASE_WHERE_CLAUSE} & themes = 19 
& (aggregated_rating_count > 1 | follows >= 1);`

// RATING CATEGORIES
const WHERE_CLAUSE_RATING_90_PLUS = `${BASE_WHERE_CLAUSE} & aggregated_rating > 90;`
//WHERE_CLAUSE_RATING_UNDER_20

// SPECIAL CATEGORY - UNRELEASED GAMES
// SPECIAL CATEGORY - FUTURE GAMES
// SPECIAL CATEGORY - ANNOUNCED GAMES
// SPECIAL CATEGORY - INDIE GAMES (Maybe can match on theme or genres)
// SPECIAL CATEGORY - MARIO GAME SERIES
// THERES TAGS ON GAME OBJECTS?

const DEFAULT_WHERE_CLAUSE = `${BASE_WHERE_CLAUSE} 
& (aggregated_rating_count > 9 | follows >= ${MIN_FOLLOWERS}); `

const mapWhereClauseToCategoryName = new Map([
    [HARDCORE_SIXTIES_WHERE_CLAUSE, CATEGORY_NAME_60s_HARDCORE],
    [NORMAL_SIXTIES_WHERE_CLAUSE, CATEGORY_NAME_60s_NORMAL],
    [HARDCORE_SEVENTIES_WHERE_CLAUSE, CATEGORY_NAME_70s_HARDCORE],
    [NORMAL_SEVENTIES_WHERE_CLAUSE, CATEGORY_NAME_70s_NORMAL],
    [HARDCORE_EIGHTIES_WHERE_CLAUSE, CATEGORY_NAME_80s_HARDCORE],
    [NORMAL_EIGHTIES_WHERE_CLAUSE, CATEGORY_NAME_80s_NORMAL],
    [HARDCORE_NINTIES_WHERE_CLAUSE, CATEGORY_NAME_90s_HARDCORE],
    [NORMAL_NINTIES_WHERE_CLAUSE, CATEGORY_NAME_90s_NORMAL],
    [HARDCORE_AUGHTIES_WHERE_CLAUSE, CATEGORY_NAME_00s_HARDCORE],
    [NORMAL_AUGHTIES_WHERE_CLAUSE, CATEGORY_NAME_00s_NORMAL],
    [HARDCORE_TENS_WHERE_CLAUSE, CATEGORY_NAME_10s_HARDCORE],
    [NORMAL_TENS_WHERE_CLAUSE, CATEGORY_NAME_10s_NORMAL],
    [HARDCORE_TWENTIES_WHERE_CLAUSE, CATEGORY_NAME_20s_HARDCORE],
    [NORMAL_TWENTIES_WHERE_CLAUSE, CATEGORY_NAME_20s_NORMAL]
]);

const SEARCH_TERM_MARIO = "Mario"
const WHERE_CLAUSE_BAD_MARIO = "${BASE_WHERE_CLAUSE} & aggregated_rating < 70;"

const WHERE_CLAUSE = DEFAULT_WHERE_CLAUSE
const CATEGORY = "Popular Games"
const SEARCH_TERM = ""

const FIELDS = `name, follows, hypes, aggregated_rating, aggregated_rating_count, alternative_names.name, artworks.*, cover.*,
  first_release_date, franchise.name, franchises.name, genres.name, platforms.name, screenshots.*, similar_games.name,
  storyline, summary, themes.name, videos.*, websites.*,
  collection.name, 
  involved_companies.company.name`
const IMAGE_BIG_COVER_URL = `https://images.igdb.com/igdb/image/upload/t_cover_big/`
const IMAGE_1080_URL = `https://images.igdb.com/igdb/image/upload/t_1080p/`
const IMAGE_720_URL = `https://images.igdb.com/igdb/image/upload/t_720p/`
const THUMB_URL = `//images.igdb.com/igdb/image/upload/t_thumb/`

export class Channel {
    constructor(channelName, broadcasterId, authToken, refreshToken, rewardId) {
        this.channelName = channelName
        this.broadcasterId = broadcasterId
        this.authToken = authToken
        this.refreshToken = refreshToken
        this.rewardId = rewardId
        this.game = null
        this.gameInProgress = false
        this.queue = 0
        this.hintProvider = null
        this.guessChecker = null
        this.autoplay = false
        this.chatbot = new Chatbot(this)
        this.redemption = new Redemption(this)
    }

    getGame = async (igdbAccessToken) => {

        //GENRES
        // const genresResponse = await fetch(`${BASE_IGDB_URL}/genres`, {
        //     method: 'POST',
        //     body: `fields name;
        //     limit 500;`,
        //     headers: {
        //         "Client-ID": `${TWITCH_CLIENT_ID}`,
        //         "Authorization": `Bearer ${igdbAccessToken}`,
        //         "Accept": "application/json"
        //     }
        // });
        // const genresResponseJson = await genresResponse.json();
        // console.log("genresResponseJson")
        // console.log(genresResponseJson)

        //THEMES
        // const themesResponse = await fetch(`${BASE_IGDB_URL}/themes`, {
        //     method: 'POST',
        //     body: `fields name;
        //     limit 500;`,
        //     headers: {
        //         "Client-ID": `${TWITCH_CLIENT_ID}`,
        //         "Authorization": `Bearer ${igdbAccessToken}`,
        //         "Accept": "application/json"
        //     }
        // });
        // const themesResponseJson = await themesResponse.json();
        // console.log("themesResponseJson")
        // console.log(themesResponseJson)

        //COMPANY ID
        // const companiesResponse = await fetch(`${BASE_IGDB_URL}/games`, {
        //     method: 'POST',
        //     body: `fields name, involved_companies.company.id, involved_companies.company.name; 
        //     limit 500; 
        //     search "assassins creed";`,
        //     headers: {
        //         "Client-ID": `${TWITCH_CLIENT_ID}`,
        //         "Authorization": `Bearer ${igdbAccessToken}`,
        //         "Accept": "application/json"
        //     }
        // });
        // const companiesResponseJson = await companiesResponse.json();
        // console.log("companiesResponseJson")
        // console.log(JSON.stringify(companiesResponseJson))

        var search = ""
        if (SEARCH_TERM.length > 0)
            search = `search "${SEARCH_TERM}";`

        const countResponse = await fetch(`${BASE_IGDB_URL}${ENDPOINT_GAMES}/count`, {
            method: 'POST',
            body: `where ${WHERE_CLAUSE} 
            ${search}`,
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

        // this.chatbot.chat(`New round of Chat Guess Games! Category: ${mapWhereClauseToCategoryName.get(WHERE_CLAUSE)}.`)
        // this.chatbot.chat(`New round of Chat Guess Games! Category: 2010s`)
        this.chatbot.chat(`New round of Chat Guess Games! Category: ${CATEGORY}`)

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

        if (responseJson.length == 0)
            return

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
        showTitle(this.channelName, this.hintProvider.endTimestamp)
    }

    async checkGuess(message, username, userId, channelId) {
        if (this.guessChecker?.checkGuess(message)) {

            this.guessChecker = null
            this.hintProvider.stop()
            this.hintProvider = null

            const correctAnswer = new CorrectAnswer(
                Date.now(),
                userId,
                channelId,
                this.game.id)
            await correctAnswer.insertCorrectAnswer()

            // this.chatbot.chat()
            await new Scoreboard().getUserScoreAndRival(this.chatbot, userId, channelId, username, igdbAccessToken, `${username} got it! ${this.game.name}!`)
            this.generatHumbleURL()

            // if (game.steamURL != null) {
            //   chatbot.chat(`lynchm1Youwhat Here's the steam URL: ${game.steamURL} lynchm1Youwhat`)
            // }

            // if (userId != null)
            //     getProfileImage(userId, igdbAccessToken)
            showCoverImage(this.game.coverArt, username, this.channelName)
            var that = this
            setTimeout(function () {
                that.roundEnded();
            }, 11_000);
        }
    }

    getGiveupString() {
        // let index = getRandomInt(2)
        // if (index == 0) {
        //     return `Unfortunately, nobody got it right this time! The game in question was ${this.game.name}!`
        // } else if (index == 1) {
        //     return `We didn't have a winner this round! The game selected was ${this.game.name}!`
        // } else {
        //     return `No one got it! The game was ${this.game.name}!`
        // }
        return `No one got it! It was ${this.game.name}!`
    }

    async generatHumbleURL() {

        // There's an api
        // Works in browser
        // Gives bot and postman 403
        // const HUMBLE_SEARCH_URL = "https://www.humblebundle.com/store/api/search" +
        // "?sort=bestselling" +
        // "&filter=all" +
        // "&request=1" +
        // "&search=" + this.game.name.replace(/[^a-zA-Z0-9]/gm, "+").replace(/-{2,}/gm, "-")

        // const HUMBLE_SEARCH_URL = "https://www.humblebundle.com/store/api/lookup?products[]=rimworld&request=1&edit_mode=false"

        // HTML HEAD CALL
        let cleanedUpGameName = this.game.name.toLowerCase()
        // let cleanedUpGameName = "rimworld"        
        cleanedUpGameName = cleanedUpGameName.replace(/[^a-z0-9]/gm, "-")
        cleanedUpGameName = cleanedUpGameName.replace(/-{2,}/gm, "-")
        let url = HUMBLE_URL + cleanedUpGameName + HUMBLE_SUFFIX

        // <div class="js-discount-amount discount-amount">
        // -20%
        // <span class="off-text">

        const humbleResponse = await fetch(url);

        if (humbleResponse.status == 200) {

            // const humbleResponseText = await humbleResponse.json();

            // console.log("humbleResponseText")
            // console.log(humbleResponseText)            

            // var matches = humbleResponseText.match(/<div class="js-discount-amount discount-amount">([^<]*)</);

            // console.log("matches")
            // console.log(matches) 

            // var discount = null
            // if (matches) {
            //     console.log("matches[1]")
            //     console.log(matches[1]) 
            //     discount = matches[1];
            // }

            // if(discount != null)
            //     this.chatbot.chat(`${this.game.name} is on Humble (${discount} OFF)! ${url}`)        
            // else
            this.chatbot.chat(`${this.game.name} is on Humble! ${url}`)
        } else {
            console.log("humbleResponse.status")
            console.log(humbleResponse.status)
        }
    }

    giveUp(timedout) {
        if (this.game == null)
            return

        if (timedout) {
            this.chatbot.chat(`Time's up! It was ${this.game.name}!`)
            this.generatHumbleURL()
        } else {
            this.chatbot.chat(this.getGiveupString())
            this.generatHumbleURL()
        }
        // if (game.steamURL != null) {
        //   chatbot.chat(`lynchm1Youwhat Here's the steam URL: ${game.steamURL} lynchm1Youwhat`)
        // }
        showCoverImage(this.game.coverArt, "No one", this.channelName)
        this.guessChecker = null
        this.hintProvider.stop()
        this.hintProvider = null
        var that = this
        setTimeout(function () {
            that.roundEnded();
        }, 11_000);
    }

    addGameToQueue(username) {
        // console.log("this.queue")
        // console.log(this.queue)
        this.queue++
        if (this.queue > 0 && this.gameInProgress == false) {
            this.queue--
            console.log("calling get game")
            this.gameInProgress = true
            this.getGame(igdbAccessToken)
        } else {
            this.chatbot.chat(`There's a game running right now, but yours has been queued up ${username}!`)
        }
    }

    giveTextHint(hint) {
        this.chatbot.chat(hint.hint())
    }

    giveImageHint(hint, hintCount) {
        showImage(hint.gameImage, 100 + 25 * hintCount, this.channelName)
    }

    timeout() {
        this.giveUp(true)
    }

    setAutoPlay(autoplay, username) {
        this.autoplay = autoplay

        if (this.autoplay) {
            this.chatbot.chat("Autoplay mode enabled @" + username)
        } else {
            this.chatbot.chat("Autoplay mode disabled @" + username)
        }

        if (this.gameInProgress == false) {
            this.gameInProgress = true
            this.getGame(igdbAccessToken)
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
        this.game = null
        if (this.autoplay) {
            this.getGame(igdbAccessToken)
        } else if (this.queue > 0) {
            this.getGame(igdbAccessToken)
            this.queue--
        } else {
            this.gameInProgress = false
        }
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}