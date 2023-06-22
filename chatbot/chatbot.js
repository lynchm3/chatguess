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

			const displayName = tags['display-name']
			const username = tags.username
			const userId = tags['user-id']
			const roomId = tags['room-id']
			const userTextColor = tags.color
			const channelId = channel
			const isBroadcaster = userId == roomId

			if (message == "!brb" && isBroadcaster) {
				callback.setAutoPlay(true, displayName)
			} else if (message == "!unbrb" && isBroadcaster)
				callback.setAutoPlay(false, displayName)
			else if (message == "!cgg" && isBroadcaster)
				callback.addGameToQueue(displayName)
			else if (message == "!giveup" && isBroadcaster)
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

	//Example message tags
	// {
	// 	'badge-info': { subscriber: '28' },
	// 	badges: { broadcaster: '1', subscriber: '0', 'superultracombo-2023': '1' },
	// 	'client-nonce': '66febddceaf7d786eed08a7f4a8f92e7',
	// 	color: '#B22222',
	// 	'display-name': 'LynchML',
	// 	emotes: null,
	// 	'first-msg': false,
	// 	flags: null,
	// 	id: '24ebf3ab-5e9a-4508-b555-77a7eacc4726',
	// 	mod: false,
	// 	'returning-chatter': false,
	// 	'room-id': '57016188',
	// 	subscriber: true,
	// 	'tmi-sent-ts': '1687441516880',
	// 	turbo: false,
	// 	'user-id': '57016188',
	// 	'user-type': null,
	// 	'emotes-raw': null,
	// 	'badge-info-raw': 'subscriber/28',
	// 	'badges-raw': 'broadcaster/1,subscriber/0,superultracombo-2023/1',
	// 	username: 'lynchml',
	// 	'message-type': 'chat'
	//   }
}