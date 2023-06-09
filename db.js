import sqlite3 from 'sqlite3';
import { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET } from './secrets.js';
import fetch from 'node-fetch';

const databaseName = "chatguess.db"
var db = null

function init() {
    db = new sqlite3.Database(`./${databaseName}`, sqlite3.OPEN_READWRITE, (err) => {
        if (err && err.code == "SQLITE_CANTOPEN") {
            createDatabase();
        } else if (err) {
            console.log("Getting error " + err);
        }
    });
}

function createDatabase() {
    db = new sqlite3.Database(databaseName, (err) => {
        if (err) {
            console.log("Getting error " + err);
        }
        createTables();
    });
}

function createTables() {
    createCorrectAnswerTable()
    createAuthTable()
}

function createCorrectAnswerTable() {
    db.exec(`
    create table correct_answer (
        timestamp text not null,
        userID text not null,
        channelID text not null,
        gameID text not null
    );`, (err) => {
        if (err) {
            console.log("create table correct_answer err ");
            console.log(err);
        }
    });
}

function createAuthTable() {
    db.exec(`
    create table auth (
        broadcaster text not null,
        accessToken text not null,
        refreshToken text not null
    );`, (err) => {
        if (err) {
            console.log("create table auth err ");
            console.log(err);
        }
    });
}

init()

/////////////////////////////////////////////////////

export class CorrectAnswer {
    constructor(timestamp, userID, channelID, gameID) {
        this.timestamp = timestamp
        this.userID = userID
        this.channelID = channelID
        this.gameID = gameID
    }

    insertCorrectAnswer() {
        db.exec(`insert into correct_answer (timestamp, userID, channelID, gameID) 
        values ('${this.timestamp}', '${this.userID}', '${this.channelID}',  '${this.gameID}'); `,
            (err) => {
                if (err) {
                    console.log("insertCorrectAnswer err ");
                    console.log(err);
                }
            });
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
    getScoreboard(accessToken, chatbot, channelId) {

        const startOfTheMonth = this.getTimestampForStartOfMonth()
        db.all(`Select userID, COUNT(userId) as score from correct_answer WHERE channelID = '${channelId}' AND timestamp > ${startOfTheMonth} GROUP BY userID ORDER BY Score DESC LIMIT 5;`,
            (err, result) => {
                if (err) {
                    console.log("getScoreboard err ");
                    console.log(err);
                } else {
                    console.log("Scoreboard");
                    console.log(result);
                    this.getScoreboardUserNames(accessToken, result, chatbot)
                }
            });
    }

    getScoreboardUserNames = async (accessToken, result, chatbot) => {

        const twitchUserResponse = await fetch(`https://api.twitch.tv/helix/users?id=${result[0].userID}&id=${result[1].userID}&id=${result[2].userID}&id=${result[3].userID}&id=${result[4].userID}`, {
            method: 'GET',
            headers: {
                "Client-ID": `${TWITCH_CLIENT_ID}`,
                "Authorization": `Bearer ${accessToken}`,
                "Accept": "application/json"
            }
        });

        const users = await twitchUserResponse.json();

        const scoreboardWithNames =
            result.map(x => new ScoreboardEntry(users.data.find(y => y.id == x.userID).display_name, x.score))

        chatbot.chat("This Month's Scoreboard: " + scoreboardWithNames.map(x => x.username + ": " + x.score).join(", "))
    }

    //All time
    getUserScore(chatbot, userId, channel, userDisplayName) {
        db.all(`Select userID, COUNT(userId) as score from correct_answer WHERE channelID = '${channel}' GROUP BY userID ORDER BY Score DESC;`,
            (err, result) => {
                if (err) {
                    console.log("getUserScore alltime err ");
                    console.log(err);
                } else {
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
                    db.all(`Select userID, COUNT(userId) as score from correct_answer WHERE channelID = '${channel}' AND timestamp > ${startOfTheMonth} GROUP BY userID ORDER BY Score DESC;`,
                        (err, result) => {
                            if (err) {
                                console.log("getUserScore month err ");
                                console.log(err);
                            } else {
                                console.log("getUserScore month");
                                console.log(result);
                                const monthRow = result.find(x => x.userID == userId)
                                var monthScore = 0
                                var monthPosition = "last"
                                if (monthRow != undefined) {
                                    monthScore = monthRow.score
                                    monthPosition = result.findIndex(x => x.userID == userId) + 1
                                }
                                chatbot.chat(`This month ${userDisplayName} is ${this.numberToOrdinal(monthPosition)} with ${monthScore} ${monthScore != 1 ? "points" : "point"}.
                                All-time ${this.numberToOrdinal(allTimePosition)} with ${allTimeScore} ${allTimeScore != 1 ? "points" : "point"}.`)
                            }
                        });
                }
            });
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

    //All time
    getUserScoreAndRival(chatbot, userId, channel, userDisplayName, accessToken) {
        db.all(`Select userID, COUNT(userId) as score from correct_answer WHERE channelID = '${channel}' GROUP BY userID ORDER BY Score DESC;`,
            (err, result) => {
                if (err) {
                    console.log("getUserScore alltime err ");
                    console.log(err);
                } else {
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
                    db.all(`Select userID, COUNT(userId) as score from correct_answer WHERE channelID = '${channel}' AND timestamp > ${startOfTheMonth} GROUP BY userID ORDER BY Score DESC;`,
                        (err, result) => {
                            if (err) {
                                console.log("getUserScore month err ");
                                console.log(err);
                            } else {
                                console.log("getUserScore month");
                                console.log(result);
                                const monthRow = result.find(x => x.userID == userId)
                                var monthScore = 0
                                var monthPosition = "last"
                                if (monthRow != undefined) {
                                    monthScore = monthRow.score
                                    const index = result.findIndex(x => x.userID == userId)
                                    monthPosition = index + 1
                                    var rivalIndex = index - 1
                                    var rivalRow = null
                                    while (rivalIndex > -1 && rivalRow == null) {
                                        var potentialRivalRow = result[rivalIndex]
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
                                        this.getRivalName(userDisplayName, monthPosition, monthScore, accessToken, pointsBehind, rivalUserID, chatbot)
                                    } else {
                                        chatbot.chat(`${userDisplayName} is in ${this.numberToOrdinal(monthPosition)} 
                                        with ${monthScore} ${monthScore != 1 ? "points" : "point"}`)
                                    }
                                } else {
                                    chatbot.chat(`${userDisplayName} has not points this month.`)
                                }
                            }
                        });
                }
            });
    }

    getRivalName = async (userDisplayName, monthPosition, monthScore, accessToken, pointsBehind, rivalUserID, chatbot) => {

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

        chatbot.chat(`${userDisplayName} is in ${this.numberToOrdinal(monthPosition)} with ${monthScore} ${monthScore != 1 ? "points" : "point"},
            ${pointsBehind}  ${pointsBehind != 1 ? "points" : "point"} behind ${rivalDisplayName}`)

    }
}

export class Auth {

    constructor(broadcaster, accessToken, refreshToken) {
        this.broadcaster = broadcaster
        this.accessToken = accessToken
        this.refreshToken = refreshToken
    }

    insertOrUpdateAuth() {
        db.all(`SELECT * FROM auth WHERE broadcaster = '${this.broadcaster}';`,
            (err, result) => {
                if (err) {
                    console.log("auth select err ");
                    console.log(err);
                } else {
                    console.log("authselect success");
                    console.log(result);
                    if (result.length == 0) {
                        this.insertAuth()
                    } else {
                        this.updateAuth()
                    }
                }
            });
    }

    insertAuth() {
        db.exec(`INSERT INTO auth (broadcaster, accessToken, refreshToken) 
        values ('${this.broadcaster}', '${this.accessToken}', '${this.refreshToken}'); `,
            (err) => {
                if (err) {
                    console.log("auth insert err ");
                    console.log(err);
                } else {
                    console.log("auth insert success ");
                }
            });
    }

    updateAuth() {
        db.exec(`UPDATE auth 
        SET accessToken = '${this.accessToken}', refreshToken = '${this.refreshToken}'
        WHERE broadcaster = '${this.broadcaster}'`,
            (err) => {
                if (err) {
                    console.log("auth update err ");
                    console.log(err);
                } else {
                    console.log("auth update success ");
                }
            });
    }

    tokenRefresh(channel) {

    }

    async selectAuth() {
        var auth = this
        return new Promise(function (resolve, reject) {
            db.all(`SELECT * FROM auth WHERE broadcaster = '${auth.broadcaster}';`,
                (err, result) => {
                    if (err) {
                        console.log("auth select err ");
                        console.log(err);
                    } else {
                        console.log("auth select success");
                        console.log(result);
                        if (result.length == 0) {
                        } else {
                            auth.accessToken = result[0].accessToken
                            auth.refreshToken = result[0].refreshToken
                        }
                    }
                    resolve()
                });
        });
    }
}