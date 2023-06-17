const HINT_NAME_ARTWORK = "Artwork"
const HINT_NAME_COVER_ART = "Cover Art"
const HINT_NAME_CRITICS_RATING = "Critics Rating"
const HINT_NAME_GENRES_AND_THEMES = "Genres & Themes"
const HINT_NAME_INVOLVED_COMPANIES = "Involved Companies"
const HINT_NAME_PLATFORMS = "Platforms"
const HINT_NAME_ORIGINAL_RELEASE_DATE = "Original Release"
const HINT_NAME_SCREENSHOT = "Screenshot"
const HINT_NAME_SIMILAR_GAMES = "Similar Games"
const HINT_NAME_STORYLINE = "Storyline"
const HINT_NAME_SUMMARY = "Summary"

const HINT_TYPE_TEXT = "HINT_TYPE_TEXT"
const HINT_TYPE_IMAGE = "HINT_TYPE_IMAGE"

const MAX_HINT_LENGTH = 400

const TEXT_HINT_INTERVAL_MS = 15_000

const lynchm1Redacted2 = " lynchm1Redacted2 "

const TIME_LIMIT_MS = 2 * 60 * 1_000
// const TIME_LIMIT_MS = 5 * 1_000

export class HintProvider {

    constructor(game, callback, imageHintIntervalMS) {

        this.stopped = false
        this.imageHintIntervalMS = imageHintIntervalMS

        // Compile and randomise image hints
        this.imageHints = []

        if (game.artworks != undefined) {
            this.artworkHints = game.artworks?.map(x => new ImageHint(HINT_NAME_ARTWORK, x))
            this.imageHints = this.imageHints.concat(this.artworkHints)
        }

        if (game.screenshots != undefined) {
            this.screenshotHints = game.screenshots?.map(x => new ImageHint(HINT_NAME_SCREENSHOT, x))
            this.imageHints = this.imageHints.concat(this.screenshotHints)
        }

        for (let i = this.imageHints.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = this.imageHints[i];
            this.imageHints[i] = this.imageHints[j];
            this.imageHints[j] = temp;
        }

        //Compile text hints
        this.textHints = []

        if (game.aggregatedRating != undefined) {
            this.criticsRatingHint = new TextHint(HINT_NAME_CRITICS_RATING, isNaN(game.aggregatedRating) ? 'Not scored' : game.aggregatedRating)
            this.textHints.push(this.criticsRatingHint)
        }

        if (game.originalReleaseDate != undefined) {
            this.originalReleaseDateHint = new TextHint(HINT_NAME_ORIGINAL_RELEASE_DATE, game.originalReleaseDate)
            this.textHints.push(this.originalReleaseDateHint)
        }

        if (game.platforms != undefined) {
            this.platformsHint = new TextHint(HINT_NAME_PLATFORMS, game.platforms?.join(", "))
            this.textHints.push(this.platformsHint)
        }

        if (game.genres != undefined && game.themes != undefined) {
            this.genresHint = new TextHint(HINT_NAME_GENRES_AND_THEMES, game.genres?.join(", ") + ", " + game.themes?.join(", "))
            this.textHints.push(this.genresHint)
        } else if (game.genres != undefined) {
            this.genresHint = new TextHint(HINT_NAME_GENRES_AND_THEMES, game.genres?.join(", "))
            this.textHints.push(this.genresHint)
        } else if (game.themes != undefined) {
            this.themesHint = new TextHint(HINT_NAME_GENRES_AND_THEMES, game.themes?.join(", "))
            this.textHints.push(this.themesHint)
        }

        if (game.involvedCompanies != undefined) {
            this.involvedCompaniesHint = new TextHint(HINT_NAME_INVOLVED_COMPANIES, game.involvedCompanies?.join(", "))
            this.textHints.push(this.involvedCompaniesHint)
        }

        if (game.summary != undefined) {
            let cleanedSummary = replaceAll(game.summary, game.name, lynchm1Redacted2)
            for (let i = 0; i < game.alternativeNames?.length; i++) {
                cleanedSummary = replaceAll(cleanedSummary, game.alternativeNames[i], lynchm1Redacted2)
            }
            // console.log("game.collection")
            // console.log(game.collection)
            if (game.collection != undefined)
                cleanedSummary = replaceAll(cleanedSummary, game.collection, lynchm1Redacted2)
            for (let i = 0; i < game.similarGames?.length; i++) {
                cleanedSummary = replaceAll(cleanedSummary, game.similarGames[i], lynchm1Redacted2)
            }
            this.summaryHint = new CrawlingTextHint(HINT_NAME_SUMMARY, cleanedSummary)
            this.textHints.push(this.summaryHint)
        }

        if (game.storyline != undefined) {
            let cleanedStoryline = replaceAll(game.storyline, game.name, lynchm1Redacted2)
            for (let i = 0; i < game.alternativeNames?.length; i++) {
                cleanedStoryline = replaceAll(cleanedStoryline, game.alternativeNames[i], lynchm1Redacted2)
            }
            if (game.collection != undefined)
                cleanedStoryline = replaceAll(cleanedStoryline, game.collection, lynchm1Redacted2)
            for (let i = 0; i < game.similarGames?.length; i++) {
                cleanedStoryline = replaceAll(cleanedStoryline, game.similarGames[i], lynchm1Redacted2)
            }
            this.storylineHint = new CrawlingTextHint(HINT_NAME_STORYLINE, cleanedStoryline)
            this.textHints.push(this.storylineHint)
        }

        this.callback = callback

        this.imageHintIndex = 0
        this.imageHintsGiven = 0
        this.textHintIndex = 0
        this.giveImageHint()
        this.giveTextHint()

        let startTime = Date.now()
        this.endTimestamp = startTime + TIME_LIMIT_MS
        this.timeoutID = setTimeout(this.timeout, TIME_LIMIT_MS, callback);
        // this.cancelTimeout()
    }

    cancelTimeout() {
        clearTimeout(this.timeoutID)
    }

    timeout(callback) {
        if (this.stopped) {
            //Do nothing
        } else {
            try {
                callback.timeout()
            } catch (error) {
                console.error(error);
            }
        }
    }

    giveImageHint() {
        let hint = this.imageHints[this.imageHintIndex]
        this.callback.giveImageHint(hint, this.imageHintsGiven)
        this.imageHintsGiven++
        this.imageHintIndex++;

        var intervalId = setInterval(() => {
            if (this.imageHintIndex >= this.imageHints.length)
                this.imageHintIndex = 0

            if (!this.stopped) {
                let hint = this.imageHints[this.imageHintIndex]
                this.callback.giveImageHint(hint, this.imageHintsGiven)
                this.imageHintsGiven++;
                this.imageHintIndex++;
            } else {
                clearInterval(intervalId);
            }
        }, this.imageHintIntervalMS);
    }

    giveTextHint() {
        let hint = this.textHints[this.textHintIndex]
        this.callback.giveTextHint(hint)
        this.textHintIndex++;
        var intervalId = setInterval(() => {
            if (this.textHintIndex < this.textHints.length && !this.stopped) {
                let hint = this.textHints[this.textHintIndex]
                this.callback.giveTextHint(hint)
                this.textHintIndex++;
            } else {
                clearInterval(intervalId);
            }
        }, TEXT_HINT_INTERVAL_MS);
    }

    stop() {
        clearTimeout(this.timeoutID)
        this.stopped = true
    }
}

class Hint {
    constructor(hintName) {
        this.hintName = hintName;
    }
}

class TextHint extends Hint {
    constructor(hintName, text) {
        super(hintName)
        this.text = text;
        this.hintType = HINT_TYPE_TEXT
    }

    hint() {
        return `${this.hintName}: ${this.text}`
    }
}

class CrawlingTextHint extends TextHint {
    constructor(hintName, text) {
        super(hintName, text)
        this.text = text;
        this.hintType = HINT_TYPE_TEXT
    }

    hint() {
        let hint = this.hintName + ": " + this.text
        if (hint.length > MAX_HINT_LENGTH) {
            hint = hint.substring(0, MAX_HINT_LENGTH - 1) + "…";
        }
        return hint
    }
}

class ImageHint extends Hint {
    constructor(hintName, gameImage) {
        super(hintName)
        this.gameImage = gameImage;
        this.hintType = HINT_TYPE_IMAGE
    }

    hint() {
        return this.hintName + ": " + this.gameImage.url
    }
}

function replaceAll(text, wordToReplace, replacement) {
    const regex = new RegExp(wordToReplace, 'gi');
    return text.replace(regex, replacement);
}