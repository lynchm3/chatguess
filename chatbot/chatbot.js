//relevant bit of documentation - https://github.com/tmijs/docs/blob/gh-pages/_posts/v1.4.2/2019-03-03-Events.md#chat

import { oAuthToken, botName, channelName } from './env.js';
import pkg from 'tmi.js';

// https://id.twitch.tv/oauth2/authorize
//     ?response_type=token
//     &client_id=4wsujxiz1khg6h9afkutmiyxhom8qv
//     &redirect_uri=https://www.chatguess.com
//     &scope=chat:edit+chat:read


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

			// console.log(tags)

			const displayName = tags['display-name']
			// console.log("displayName")
			// console.log(displayName)
			const username = tags.username
			// console.log("Message received")
			// console.log(message)
			// console.log(username)
			const userId = tags['user-id']
			// console.log("userId")
			// console.log(userId)
			const userTextColor = tags.color
			// console.log("userTextColor")
			// console.log(userTextColor)
			const channelId = channel
			// console.log("channel")
			// console.log(channel)

			if (message == "!brb" && username == "lynchml") {
				callback.setAutoPlay(true)
				callback.startWhatsTheGame()
			} else if (message == "!unbrb" && username == "lynchml")
				callback.setAutoPlay(false)
			else if (message == "!cgg" && username == "lynchml")
				callback.startWhatsTheGame()
			else if (message == "!giveup" && username == "lynchml")
				callback.giveUp()
			else if (message == "!points")
				callback.points(userId, channelId, displayName)
			else if (message == "!scoreboard")
				callback.scoreboard(channelId)
			else
				callback.messageCallback(message, tags, displayName, userId, channelId)
		});
	}

	chat(message) {
		// console.log("channelName")
		// console.log(channelName)
		// console.log("message")
		// console.log(message)
		this.client.say(channelName, message)
	}
}