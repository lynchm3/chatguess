import sqlite3 from 'sqlite3';
import { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET } from './secrets.js';
import fetch from 'node-fetch';
import { Sequelize } from 'sequelize';
import { createChannel } from './app.js';
import { chatGuessDBPassword } from './TwurpleSecrets.js'

const databaseName = "chatguess.db"
// var db = null
var sequelize = null

async function initMySql() {
    sequelize = new Sequelize('chatguessdb', 'root', chatGuessDBPassword, {
        host: '35.195.21.2', //ENVIRONMENTX
        dialect: 'mysql'
    });

    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }

    Auth.loadUsers()

    //Create tables
    // try {
    //     await sequelize.query(`
    //       create table correct_answer (
    //       timestamp text not null,
    //       userID text not null,
    //       channelID text not null,
    //       gameID text not null
    //   );`);
    // } catch (error) {
    //     console.error('Unable to create correct_answer table:', error);
    // }

    // try {
    //     await sequelize.query(`
    //     create table auth (
    //     broadcaster text not null,
    //     userID text not null,
    //     accessToken text not null,
    //     refreshToken text not null,
    //     rewardID text not null
    // );`);
    // } catch (error) {
    //     console.error('Unable to create auth table:', error);
    // }    

    //MySQL Select *
    // try {
    //     let result = await sequelize.query(`Select * from correct_answer;`);
    //     console.log("Select * from correct_answer;")
    //     console.log(result)
    // } catch (error) {
    //     console.error('Unable to create auth table:', error);
    // }

    // try {
    //     let result = await sequelize.query(`Select * from auth;`);
    //     console.log("Select * from auth;")
    //     console.log(result)
    // } catch (error) {
    //     console.error('Unable to create auth table:', error);
    // }

    // sqlite
    // Select * from correct_answer
    // Select * from auth
}

initMySql()

/////////////////////////////////////////////////////

export class CorrectAnswer {
    constructor(timestamp, userID, channelID, gameID) {
        this.timestamp = timestamp
        this.userID = userID
        this.channelID = channelID
        this.gameID = gameID
    }

    async insertCorrectAnswer() {
        try {
            await sequelize.query(`insert into correct_answer (timestamp, userID, channelID, gameID) 
            values ('${this.timestamp}', '${this.userID}', '${this.channelID}',  '${this.gameID}'); `);
        } catch (error) {
            console.error('error insertCorrectAnswer:', error);
        }
    }
}

class ScoreboardEntry {
    constructor(username, score) {
        this.username = username
        this.score = score
    }
}

export class Scoreboard {

    // Top 5 of the month
    async getScoreboard(accessToken, chatbot, channelId) {
        const startOfTheMonth = this.getTimestampForStartOfMonth()
        try {
            let result = await sequelize.query(`Select userID, COUNT(userId) as score from correct_answer 
            WHERE channelID = '${channelId}' 
            AND timestamp > ${startOfTheMonth} GROUP BY userID ORDER BY Score DESC LIMIT 5;`,
                { type: Sequelize.QueryTypes.SELECT })
            console.log("Scoreboard");
            console.log(result);
            this.getScoreboardUserNames(accessToken, result, chatbot)
        } catch (error) {
            console.error('error getScoreboard:', error);
        }
    }

    getScoreboardUserNames = async (accessToken, result, chatbot) => {

        console.log("getScoreboardUserNames")
        console.log("result")
        console.log(result)

        const twitchUserResponse = await fetch(`https://api.twitch.tv/helix/users?id=${result[0].userID}&id=${result[1].userID}&id=${result[2].userID}&id=${result[3].userID}&id=${result[4].userID}`, {
            method: 'GET',
            headers: {
                "Client-ID": `${TWITCH_CLIENT_ID}`,
                "Authorization": `Bearer ${accessToken}`,
                "Accept": "application/json"
            }
        });

        const users = await twitchUserResponse.json();
        console.log("users")
        console.log(users)

        const scoreboardWithNames =
            result.map(x => new ScoreboardEntry(users.data.find(y => y.id == x.userID).display_name, x.score))

        chatbot.chat("This Month's Scoreboard: " + scoreboardWithNames.map(x => x.username + ": " + x.score).join(", "))
    }

    //All time
    async getUserScore(chatbot, userId, channel, userDisplayName) {

        try {
            let result = await sequelize.query(`Select userID, COUNT(userId) as score from correct_answer 
            WHERE channelID = '${channel}' GROUP BY userID ORDER BY Score DESC;`,
                { type: Sequelize.QueryTypes.SELECT })
            console.log("getUserScore alltime");
            console.log(result);
            const allTimeRow = result.find(x => x.userID == userId)
            var allTimeScore = 0
            var allTimePosition = "last"
            if (allTimeRow != undefined) {
                allTimeScore = allTimeRow.score
                allTimePosition = result.findIndex(x => x.userID == userId) + 1
            }

            //Month
            const startOfTheMonth = this.getTimestampForStartOfMonth()
            try {
                let result2 = await sequelize.query(`Select userID, COUNT(userId) as score from correct_answer 
            WHERE channelID = '${channel}' 
            AND timestamp > ${startOfTheMonth} GROUP BY userID ORDER BY Score DESC;`,
                    { type: Sequelize.QueryTypes.SELECT })
                console.log("getUserScore month");
                console.log(result2);
                const monthRow = result2.find(x => x.userID == userId)
                var monthScore = 0
                var monthPosition = "last"
                if (monthRow != undefined) {
                    monthScore = monthRow.score
                    monthPosition = result2.findIndex(x => x.userID == userId) + 1
                }
                chatbot.chat(`This month ${userDisplayName} is ${this.numberToOrdinal(monthPosition)} with ${monthScore} ${monthScore != 1 ? "points" : "point"}.
                        All-time ${this.numberToOrdinal(allTimePosition)} with ${allTimeScore} ${allTimeScore != 1 ? "points" : "point"}.`)
            } catch (error) {
                console.error('Error getUserScore 2:', error);
            }
        } catch (error) {
            console.error('Error getUserScore 1:', error);
        }
    }

    getTimestampForStartOfMonth() {
        var now = new Date();
        var year = now.getFullYear();
        var month = now.getMonth();

        var firstDayOfMonth = new Date(year, month, 1);
        firstDayOfMonth.setHours(0, 0, 0, 0);

        return Math.floor(firstDayOfMonth.getTime()) // / 1000);
    }

    getTimestampForStartOfWeek() {
        var now = new Date(); // Get current date and time
        var currentDay = now.getDay(); // Get the current day of the week (0-6, where 0 is Sunday)

        // Calculate the number of milliseconds to subtract to get to the first day of the week
        var millisecondsInDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day
        var millisecondsToSubtract = currentDay * millisecondsInDay; // Number of milliseconds to subtract

        // Calculate the Unix timestamp for midnight on the first day of the week
        var firstDayOfWeek = new Date(now.getTime() - millisecondsToSubtract);
        firstDayOfWeek.setHours(0, 0, 0, 0);

        // Return the Unix timestamp for the first day of the week
        return Math.floor(firstDayOfWeek.getTime() / 1000);
    }

    numberToOrdinal(number) {
        if (typeof number !== 'number') {
            return number; // Return the input as is if it's not a number
        }

        if (number % 100 >= 11 && number % 100 <= 13) {
            return number + 'th'; // Special case for 11th, 12th, and 13th
        }

        switch (number % 10) {
            case 1:
                return number + 'st';
            case 2:
                return number + 'nd';
            case 3:
                return number + 'rd';
            default:
                return number + 'th';
        }
    }

    async getUserScoreAndRival(chatbot, userId, channel, userDisplayName, accessToken, prefix) {

        //Month
        const startOfTheMonth = this.getTimestampForStartOfMonth()
        try {
            let result2 = await sequelize.query(`Select userID, COUNT(userId) as score from correct_answer 
                WHERE channelID = '${channel}' AND timestamp > ${startOfTheMonth} GROUP BY userID ORDER BY Score DESC;`,
                { type: Sequelize.QueryTypes.SELECT })

            console.log("getUserScore month");
            console.log(result2);
            const monthRow = result2.find(x => x.userID == userId)
            var monthScore = 0
            var monthPosition = "last"
            if (monthRow != undefined) {
                monthScore = monthRow.score
                const index = result2.findIndex(x => x.userID == userId)
                monthPosition = index + 1
                var rivalIndex = index - 1
                var rivalRow = null
                while (rivalIndex > -1 && rivalRow == null) {
                    var potentialRivalRow = result2[rivalIndex]
                    if (potentialRivalRow.score > monthScore) {
                        rivalRow = potentialRivalRow
                    } else {
                        rivalIndex--
                    }
                }

                if (rivalRow != null) {
                    const rivalScore = rivalRow.score
                    const pointsBehind = rivalScore - monthScore
                    const rivalUserID = rivalRow.userID
                    this.getRivalName(userDisplayName, monthPosition, monthScore, accessToken, pointsBehind, rivalUserID, chatbot, prefix)
                } else {
                    chatbot.chat(`${prefix} They're in ${this.numberToOrdinal(monthPosition)} 
                        with ${monthScore} ${monthScore != 1 ? "points" : "point"}.`)
                }
            } else {
                chatbot.chat(`${prefix} ${userDisplayName} has not scored this month.`)
            }

        } catch (error) {
            console.error('error getUserScoreAndRival 2:', error);
        }
    }

    getRivalName = async (userDisplayName, monthPosition, monthScore, accessToken, pointsBehind, rivalUserID, chatbot, prefix) => {

        const twitchUserResponse = await fetch(`https://api.twitch.tv/helix/users?id=${rivalUserID}`, {
            method: 'GET',
            headers: {
                "Client-ID": `${TWITCH_CLIENT_ID}`,
                "Authorization": `Bearer ${accessToken}`,
                "Accept": "application/json"
            }
        });

        const users = await twitchUserResponse.json();
        const rivalDisplayName = users.data[0].display_name

        chatbot.chat(`${prefix} They're in ${this.numberToOrdinal(monthPosition)} with ${monthScore} ${monthScore != 1 ? "points" : "point"},
            ${pointsBehind} ${pointsBehind != 1 ? "points" : "point"} behind ${rivalDisplayName}.`)

    }
}

export class Auth {

    constructor(broadcaster, userID, accessToken, refreshToken, rewardID) {
        this.broadcaster = broadcaster
        this.userID = userID
        this.accessToken = accessToken
        this.refreshToken = refreshToken
        this.rewardID = rewardID
    }

    async insertOrUpdateAuth() {
        try {
            let result = await sequelize.query(`SELECT * FROM auth WHERE userID = '${this.userID}';`,
                { type: Sequelize.QueryTypes.SELECT })
            console.log("insertOrUpdateAuth success");
            console.log(result);
            if (result.length == 0) {
                this.insertAuth()
            } else {
                this.updateAuth()
            }
        } catch (error) {
            console.error('error insertOrUpdateAuth:', error);
        }
    }

    async insertAuth() {
        try {
            await sequelize.query(`INSERT INTO auth (broadcaster, userID, accessToken, refreshToken, rewardID) 
            values ('${this.broadcaster}', ${this.userID}, '${this.accessToken}', '${this.refreshToken}', 'null'); `);
        } catch (error) {
            console.error('auth insertAuth err:', error);
        }
    }

    async updateAuth() {
        try {
            await sequelize.query(`UPDATE auth 
            SET broadcaster = '${this.broadcaster}',  accessToken = '${this.accessToken}', refreshToken = '${this.refreshToken}'
            WHERE userID = '${this.userID}'`);
        } catch (error) {
            console.error('auth updateAuth err:', error);
        }
    }

    async selectAuthByBroadcasterName() {
        var auth = this
        try {
            let result = await sequelize.query(`SELECT * FROM auth WHERE broadcaster = '${auth.broadcaster}';`,
                { type: Sequelize.QueryTypes.SELECT })
            console.log("selectAuthByBroadcasterName success");
            console.log(result);
            if (result.length == 0) {
            } else {
                console.log("result[0]");
                console.log(result[0]);
                console.log("result[0].userID");
                console.log(result[0].userID);
                auth.userID = result[0].userID
                auth.accessToken = result[0].accessToken
                auth.refreshToken = result[0].refreshToken
                auth.rewardID = result[0].rewardID
            }
        } catch (error) {
            console.error('auth selectAuthByBroadcasterName err:', error);
        }
    }

    async saveRewardId() {
        try {
            await sequelize.query(`UPDATE auth 
            SET rewardID = '${this.rewardID}'
            WHERE broadcaster = '${this.broadcaster}'`);
        } catch (error) {
            console.error('auth saveRewardId err:', error);
        }
    }

    static async loadUsers() {
        console.error(`loadUsers`);
        try {

            // await sequelize.query(`DELETE FROM correct_answer;`,
            // // {plain:true}
            // )

            // await sequelize.query(`DELETE FROM auth;`,
            // // {plain:true}
            // )

            // let resultz = await sequelize.query(`SELECT * FROM correct_answer;`,
            // {plain:true}
            // )

            // {raw:true}
            // {plain:true}

            // console.error(`SELECT * FROM correct_answer;`);
            // console.error(resultz);


            let result = await sequelize.query(`SELECT * FROM auth;`,
                { type: Sequelize.QueryTypes.SELECT }
            )
            // {raw:true}
            // {plain:true}

            console.error(`SELECT * FROM auth;`);
            console.error(result);
            for (let r of result) {
                console.error("r");
                console.error(r);
                createChannel(
                    r.broadcaster,
                    r.userID,
                    r.accessToken,
                    r.refreshToken,
                    r.rewardID)
            }
        } catch (error) {
            console.error('auth loadUsers err:', error);
        }
    }
}