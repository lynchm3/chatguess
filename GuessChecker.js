import { levenshteinDistance } from './Levenshtein.js';

// const ALLOWED_LEVENSHTEIN_DISTANCE = 2

const WORDS_TO_REMOVE = ['the', 'a', 'and', 'i', 'ii', 'iii', 'iv', 'v',
    'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii', 'xiii', 'xiv', 'xv', 'xv']

const WORD_REMOVAL_REGEX = new RegExp(`\\b(${WORDS_TO_REMOVE.join('|')})\\b`, "g")

export class GuessChecker {

    // game.name
    // game.alternativeNames

    constructor(game) {
        if (game.alternativeNames != undefined) {
            this.allNames = game.alternativeNames
            this.allNames.push(game.name)
        } else {
            this.allNames = [game.name]
        }

        if (game.franchise != undefined) {
            this.allNames.push(game.franchise)
        }

        if (game.franchises != undefined) {
            this.allNames.concat(game.franchises)
        }

        if (game.collection != undefined) {
            this.allNames.push(game.collection)
        }

        
        // console.log("All names 1:")
        // console.log(this.allNames)
        
        //to lower case
        this.allNames = this.allNames.map(x => x.toLowerCase())
        
        // console.log("All names 2:")
        // console.log(this.allNames)

        //remove short words
        this.allNames = this.allNames.map(x => x.replace(WORD_REMOVAL_REGEX, ''))
        
        // console.log("All names 3:")
        // console.log(this.allNames)

        //removes all non-alphabetic characters
        this.allNames = this.allNames.map(x => x.replace(/[^a-z]/gm, "")).filter(item => item)

        // console.log("All names 4:")
        // console.log(this.allNames)

        //here compile a list of names
        //remove non-alpha 
        //make lowercase
    }

    checkGuess(guess) {

        //remove non-alpha removed
        // make lowercase        
        let cleanedUpGuess = guess.toLowerCase()

        // remove unwanted words
        cleanedUpGuess = cleanedUpGuess.replace(WORD_REMOVAL_REGEX, '')

        // remove non-alphabetic
        cleanedUpGuess = cleanedUpGuess.replace(/[^a-z]/gm, "")        

        // console.log("Checking guess: " + cleanedUpGuess)

        var allowedDistance = 2
        if(guess.length <= 5) {
            allowedDistance = 0
        } else if (guess.length <= 10) {
            allowedDistance = 1
        }

        for (let i = 0; i < this.allNames?.length; i++) {
            // console.log("Checking against: " + this.allNames[i])
            // console.log("levenshteinDistance: " + levenshteinDistance(cleanedUpGuess, this.allNames[i]))
            if (levenshteinDistance(cleanedUpGuess, this.allNames[i]) <= allowedDistance) {
                // console.log("Match: " + this.allNames[i])
                return true;
            }
        }

        // console.log("No Match")
        return false;
    }
}