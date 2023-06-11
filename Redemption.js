import { promises as fs } from 'fs';
import { clientId, clientSecret, userId } from './TwurpleSecrets.js'
import fetch from 'node-fetch';

//Twitch docs - https://dev.twitch.tv/docs/api/reference/#create-custom-rewards

export class Redemption {

	constructor(callback, broadcasterId, authToken, refreshToken) {
		this.callback = callback
		this.CHAT_GUESS_GAMES_REWARD_ID = "ab562539-eea4-4a49-b570-cb9c4a57b704"
		this.broadcasterId = broadcasterId
		this.authToken = authToken
		this.refreshToken = refreshToken

		setTimeout(this.pollForRedemptions, 5 * 1000)
	}

	// async auth(){
	// 	this.tokenData = JSON.parse(await fs.readFile(`./tokens.${this.broadcasterId}.json`, 'UTF-8'));
	// 	this.authProvider = new RefreshingAuthProvider(
	// 		{
	// 			clientId,
	// 			clientSecret,
	// 			onRefresh: async (userId, newTokenData) => await fs.writeFile(`./tokens.${userId}.json`, JSON.stringify(newTokenData, null, 4), 'UTF-8')
	// 		}
	// 	);
	// 	await this.authProvider.addUserForToken(this.tokenData, ['chat', 'redemptions']);
	// }

	createReward = async () => {

		const createRedemptionResponse = await fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${userId}`, {
			method: 'POST',
			headers: {
				"Client-ID": `${clientId}`,
				"Authorization": `Bearer ${this.authToken}`,
				"Accept": "application/json",
				"Content-Type": "application/json"
			},
			body: `{
			"title": "Chat Guess Games",
			"cost": 300
		}`
		});

		const createRewardJson = await createRedemptionResponse.json();
	}

	// createRedemption()

	getRewards = async () => {

		console.log("getRewards")

		const redemptionsResponse = await fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${userId}`, {
			method: 'GET',
			headers: {
				"Client-ID": `${clientId}`,
				"Authorization": `Bearer ${this.authToken}`,
				"Accept": "application/json"
			}
		});

		const getRewardsResponseJson = await redemptionsResponse.json();
	}

	// getRewards()
	pollForRedemptions = async () => {
		// console.log("pollForRedemptions")

		const redemptionResponse = await fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?broadcaster_id=${userId}&reward_id=${this.CHAT_GUESS_GAMES_REWARD_ID}&status=UNFULFILLED`, {
			method: 'GET',
			headers: {
				"Client-ID": `${clientId}`,
				"Authorization": `Bearer ${this.authToken}`,
				"Accept": "application/json"
			}
		});

		// console.log("redemptionResponse.status")
		// console.log(redemptionResponse.status)

		if(redemptionResponse.status == 200) {		
			const redemptionResponseJson = await redemptionResponse.json();
			console.log("redemptionResponseJson")
			console.log(redemptionResponseJson)
	
			let redemptions = redemptionResponseJson.data
	
			if (this.callback != null) {
				for (let redemption of redemptions) {
					this.callback.addGamesToQueue(1, redemption.user_name)
					this.fulfillRedemption(redemption.id)
				}
			} else {
				tokenRefresh()
			}		
		} else {
			console.log("poll redemption error")
			console.log(redemptionResponse)			
		}

		setTimeout(this.pollForRedemptions, 5 * 1000)
	}

	fulfillRedemption = async (redemptionId) => {

		const fulfillRedemptionResponse = await fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?broadcaster_id=${userId}&reward_id=${this.CHAT_GUESS_GAMES_REWARD_ID}&id=${redemptionId}`, {
			method: 'PATCH',
			headers: {
				"Client-ID": `${clientId}`,
				"Authorization": `Bearer ${this.authToken}`,
				"Accept": "application/json",
				"Content-Type": "application/json"
			},
			body: `{"status": "FULFILLED"}`
		});

		const fulfillRedemptionResponseJson = await fulfillRedemptionResponse.json();
		
		console.log("fulfillRedemptionResponse")
		console.log(fulfillRedemptionResponse)	
	}
}