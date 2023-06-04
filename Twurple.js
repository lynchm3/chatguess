import { RefreshingAuthProvider } from '@twurple/auth';
import { Bot, createBotCommand } from '@twurple/easy-bot';
import { promises as fs } from 'fs';
import { clientId, clientSecret, userId } from './TwurpleSecrets.js'
import fetch from 'node-fetch';

var callback = null
export function setRedemptionCallback(cb) { callback = cb }

const channel = 'lynchml'
const tokenData = JSON.parse(await fs.readFile(`./tokens.57016188.json`, 'UTF-8'));

// const authProvider = new StaticAuthProvider(clientId, accessToken)

const authProvider = new RefreshingAuthProvider(
	{
		clientId,
		clientSecret,
		onRefresh: async (userId, newTokenData) => await fs.writeFile(`./tokens.${userId}.json`, JSON.stringify(newTokenData, null, 4), 'UTF-8')
	}
);

await authProvider.addUserForToken(tokenData, ['chat', 'redemptions']);

const createReward = async () => {

	const createRedemptionResponse = await fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${userId}`, {
		method: 'POST',
		headers: {
			"Client-ID": `${clientId}`,
			"Authorization": `Bearer ${tokenData.accessToken}`,
			"Accept": "application/json",
			"Content-Type": "application/json"
		},
		body: `{
			"title": "CGG TEST",
			"cost": 999999
		}`
	});

	const createRewardJson = await createRedemptionResponse.json();
}

// createRedemption()


const getRewards = async () => {

	console.log("getRewards")

	const redemptionsResponse = await fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${userId}`, {
		method: 'GET',
		headers: {
			"Client-ID": `${clientId}`,
			"Authorization": `Bearer ${tokenData.accessToken}`,
			"Accept": "application/json"
		}
	});

	const getRewardsResponseJson = await redemptionsResponse.json();
}

// getRewards()
const CHAT_GUESS_GAMES_REWARD_ID = "ab562539-eea4-4a49-b570-cb9c4a57b704"
const pollForRedemptions = async () => {

	console.log("pollForRedemptions")

	const redemptionResponse = await fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?broadcaster_id=${userId}&reward_id=${CHAT_GUESS_GAMES_REWARD_ID}&status=UNFULFILLED`, {
		method: 'GET',
		headers: {
			"Client-ID": `${clientId}`,
			"Authorization": `Bearer ${tokenData.accessToken}`,
			"Accept": "application/json"
		}
	});

	const redemptionResponseJson = await redemptionResponse.json();
	console.log("redemptionResponseJson")
	console.log(redemptionResponseJson)

	let redemptions = redemptionResponseJson.data

	if (callback != null) {
		for (let redemption of redemptions) {
			callback.addGamesToQueue(1, redemption.user_name)
			fulfillRedemption(redemption.id)
		}
	}
	setTimeout(pollForRedemptions, 15 * 1000)

}

setTimeout(pollForRedemptions, 15 * 1000)

const fulfillRedemption = async (redemptionId) => {

	const fulfillRedemptionResponse = await fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?broadcaster_id=${userId}&reward_id=${CHAT_GUESS_GAMES_REWARD_ID}&id=${redemptionId}`, {
		method: 'PATCH',
		headers: {
			"Client-ID": `${clientId}`,
			"Authorization": `Bearer ${tokenData.accessToken}`,
			"Accept": "application/json",
			"Content-Type": "application/json"
		},
		body: `{"status": "FULFILLED"}`
	});

	const fulfillRedemptionResponseJson = await fulfillRedemptionResponse.json();
}
















//redempton API reference
// https://twurple.js.org/reference/api/classes/HelixChannelPointsApi.html

// "scope": [
// 	"channel:read:redemptions",
// 	"chat:edit",
// 	"chat:read"
// ],

// const bot = new Bot(null, {
// 	authProvider,
// 	channels: [channel],
// 	commands: [
// 		createBotCommand('dice', (params, { reply }) => {
// 			const diceRoll = Math.floor(Math.random() * 6) + 1;
// 			reply(`You rolled a ${diceRoll}`);
// 		}),
// 		createBotCommand('slap', (params, { userName, say }) => {
// 			say(`${userName} slaps ${params.join(' ')} around a bit with a large trout`);
// 		})
// 	]
// });

// bot.onSub(({ broadcasterName, userName }) => {
// 	bot.say(broadcasterName, `Thanks to @${userName} for subscribing to the channel!`);
// });
// bot.onResub(({ broadcasterName, userName, months }) => {
// 	bot.say(broadcasterName, `Thanks to @${userName} for subscribing to the channel for a total of ${months} months!`);
// });
// bot.onSubGift(({ broadcasterName, gifterName, userName }) => {
// 	bot.say(broadcasterName, `Thanks to @${gifterName} for gifting a subscription to @${userName}!`);
// });