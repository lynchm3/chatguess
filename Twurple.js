import { RefreshingAuthProvider } from '@twurple/auth';
import { Bot, createBotCommand } from '@twurple/easy-bot';
import { promises as fs } from 'fs';
import { clientId, clientSecret, userId } from './TwurpleSecrets.js'
import fetch from 'node-fetch';

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

const createRedemption = async () => {

	console.log("createRedemption")

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

	const createRedemptionJson = await createRedemptionResponse.json();

	console.log("createRedemptionJson")
	console.log(createRedemptionJson)
}

createRedemption()


const getRedemptions = async () => {

	console.log("getRedemptions")

	const redemptionsResponse = await fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${userId}`, {
		method: 'GET',
		headers: {
			"Client-ID": `${clientId}`,
			"Authorization": `Bearer ${tokenData.accessToken}`,
			"Accept": "application/json"
		}
	});

	const redemptionsResponseJson = await redemptionsResponse.json();

	console.log("redemptionsResponseJson")
	console.log(redemptionsResponseJson)
}

// getRedemptions()



// function for polling every 15 seconds to check for user redemptions 
const CHAT_GUESS_GAMES_REWARD_ID = "57b3482c-f832-4c64-b0e5-30ddb2936a58"
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

	// let redemptions = body.data
	// let successfulRedemptions = []
	// let failedRedemptions = []

	// for (let redemption of redemptions) {
	//     // can't follow yourself :) 
	//     if (redemption.broadcaster_id == redemption.user_id) {
	//         failedRedemptions.push(redemption.id)
	//         continue
	//     }
	//     // if failed, add to the failed redemptions
	//     if (await followUser(redemption.broadcaster_id, redemption.user_id) == false) {
	//         failedRedemptions.push(redemption.id)
	//         continue
	//     }
	//     // otherwise, add to the successful redemption list
	//     successfulRedemptions.push(redemption.id)
	// }

	// // do this in parallel
	// await Promise.all([
	//     fulfillRewards(successfulRedemptions, "FULFILLED"),
	//     fulfillRewards(failedRedemptions, "CANCELED")
	// ])

	// console.log(`Processed ${successfulRedemptions.length + failedRedemptions.length} redemptions.`)

	// // instead of an interval, we wait 15 seconds between completion and the next call
	// pollingInterval = setTimeout(pollForRedemptions, 15 * 1000)
}

// pollForRedemptions()
















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