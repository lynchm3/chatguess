import { oAuthToken, botName, channelName } from './env.js';
import pkg from 'tmi.js';

export class Chatbot {

	constructor(callback) {
		this.callback = callback
		this.client = new pkg.Client({
			options: { debug: true, messagesLogLevel: "debug" },
			connection: {
				reconnect: true,
				secure: true
			},
			identity: {
				username: botName,
				password: oAuthToken
			},
			channels: [channelName]
		});

		this.client.connect().catch(console.error)
		this.client.on('message', (channel, tags, message, self) => {

			if (self) return

			const displayName = tags['display-name']
			const username = tags.username
			const userId = tags['user-id']
			const userTextColor = tags.color
			const channelId = channel

			// console.log(username)
			// console.log(userId)

			if (message == "!brb" && username == "lynchml") {
				callback.setAutoPlay(true)
			} else if (message == "!unbrb" && username == "lynchml")
				callback.setAutoPlay(false)
			else if (message == "!cgg" && username == "lynchml")
				callback.addGameToQueue(displayName)
			else if (message == "!giveup" && username == "lynchml")
				callback.giveUp(false)
			else if (message == "!points" || message == "!score")
				callback.points(userId, channelId, displayName)
			else if (message == "!scoreboard" || message == "!top")
				callback.scoreboard(channelId)
			else
				callback.messageCallback(message, tags, displayName, userId, channelId)
		});
	}

	chat(message) {
		this.client.say(channelName, message)
	}
}