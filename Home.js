import fetch from 'node-fetch';
import { HomeGame, GameImage } from './HomeGame.js';
import { TWITCH_CLIENT_ID } from './secrets.js';
import { showHomeImage } from './htmlController.js';
import { HintProvider } from './HintProvider.js';

const GAME_IDS = [121, 26764, 119388, 1020, 1905, 472, 987, 1942, 1557, 123]
const BASE_IGDB_URL = "https://api.igdb.com/v4"

const ENDPOINT_GAMES = "/games"
const FIELDS = `id, artworks.*, screenshots.*`
const IMAGE_720_URL = `https://images.igdb.com/igdb/image/upload/t_720p/`

export class Home {

    constructor(socket, igdbAccessToken) {
        this.igdbAccessToken = igdbAccessToken
        this.socket = socket
        this.game = null
        this.hintProvider = null
    }

    getGame = async () => {

        let randomlySelectedId = GAME_IDS[getRandomInt(9)]

        const response = await fetch(`${BASE_IGDB_URL}${ENDPOINT_GAMES}`, {
            method: 'POST',
            body: `fields ${FIELDS}; where id = ${randomlySelectedId};`,
            headers: {
                "Client-ID": `${TWITCH_CLIENT_ID}`,
                "Authorization": `Bearer ${this.igdbAccessToken}`,
                "Accept": "application/json"
            }
        });

        const responseJson = await response.json();

        this.game = new HomeGame(
          /* id = */ responseJson[0].id,
          /* artworks = */ responseJson[0].artworks?.map(x => new GameImage(`${IMAGE_720_URL}${x.image_id}.jpg`, x.width, x.height)),
         /* screenshots = */ responseJson[0].screenshots?.map(x => new GameImage(`${IMAGE_720_URL}${x.image_id}.jpg`, x.width, x.height)),
        )

        this.hintProvider = new HintProvider(this.game, this, 4_000)
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
            this.getGame(this.igdbAccessToken)
        } else {
            this.chatbot.chat(`There's a game running right now, but yours has been queued up ${username}!`)
        }
    }

    giveImageHint(hint, hintCount) {
        showHomeImage(hint.gameImage, 300, this.socket)
    }

    giveTextHint(hint) {}
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}