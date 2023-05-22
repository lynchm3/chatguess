import { levenshteinDistance } from './Levenshtein.js';

const WORDS_TO_REMOVE = ['the', 'a', 'and', 'i', 'ii', 'iii', 'iv', 'v',
    'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii', 'xiii', 'xiv', 'xv', 'xv']

const WORD_REMOVAL_REGEX = new RegExp(`\\b(${WORDS_TO_REMOVE.join('|')})\\b`, "g")

export class GuessChecker {

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
        
        //to lower case
        this.allNames = this.allNames.map(x => x.toLowerCase())
        
        //remove short words
        this.allNames = this.allNames.map(x => x.replace(WORD_REMOVAL_REGEX, ''))
        
        //removes all non-alphabetic characters
        this.allNames = this.allNames.map(x => x.replace(/[^a-z]/gm, "")).filter(item => item)
    }

    checkGuess(guess) {

        // make lowercase        
        let cleanedUpGuess = guess.toLowerCase()

        // remove unwanted short words
        cleanedUpGuess = cleanedUpGuess.replace(WORD_REMOVAL_REGEX, '')

        // remove non-alphabetic
        cleanedUpGuess = cleanedUpGuess.replace(/[^a-z]/gm, "") 

        var allowedDistance = 2
        if(guess.length <= 5) {
            allowedDistance = 0
        } else if (guess.length <= 10) {
            allowedDistance = 1
        }

        for (let i = 0; i < this.allNames?.length; i++) {
            if (levenshteinDistance(cleanedUpGuess, this.allNames[i]) <= allowedDistance) {
                return true;
            }
        }

        return false;
    }
}