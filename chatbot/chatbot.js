import { botName } from '../secrets.js';
//oAuthToken, channelName, callback
import pkg from 'tmi.js';

export class Chatbot {

	constructor(channel) {
		this.channel = channel
		this.client = new pkg.Client({
			options: { debug: true, messagesLogLevel: "debug" },
			connection: {
				reconnect: true,
				secure: true
			},
			identity: {
				username: botName,
				password: channel.authToken
			},
			channels: [this.channel.channelName]
		});

		this.client.connect().catch(console.error)
		this.client.on('message', (channel, tags, message, self) => {

			const displayName = tags['display-name']
			const username = tags.username
			const userId = tags['user-id']
			const roomId = tags['room-id']
			const userTextColor = tags.color
			const channelId = roomId
			const isBroadcaster = userId == roomId

			if (message == "!brb" && isBroadcaster) {
				this.channel.setAutoPlay(true, displayName)
			} else if (message == "!unbrb" && isBroadcaster)
				this.channel.setAutoPlay(false, displayName)
			else if (message == "!cgg" && isBroadcaster)
				this.channel.addGameToQueue(displayName)
			else if (message == "!giveup" && isBroadcaster)
				this.channel.giveUp(false)
			else if (message == "!points" || message == "!score")
				this.channel.points(userId, channelId, displayName)
			else if (message == "!scoreboard" || message == "!top")
				this.channel.scoreboard(channelId)
			else
				this.channel.messageCallback(message, tags, displayName, userId, channelId)
		});
	}

	chat(message) {
		this.client.say(this.channel.channelName, message)
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