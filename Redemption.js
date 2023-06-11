import { copyFileSync, promises as fs } from 'fs';
import { clientId, clientSecret, userId } from './TwurpleSecrets.js'
import fetch from 'node-fetch';
import { Auth } from './db.js';

//Twitch docs - https://dev.twitch.tv/docs/api/reference/#create-custom-rewards

// Switch to eventsub

export class Redemption {

	constructor(callback, channelName, broadcasterId, authToken, refreshToken, rewardId) {
		this.callback = callback
		this.channelName = channelName
		this.rewardId = rewardId
		this.broadcasterId = broadcasterId
		this.authToken = authToken
		this.refreshToken = refreshToken
		// this.CHAT_GUESS_GAMES_REWARD_ID = "ab562539-eea4-4a49-b570-cb9c4a57b704"

		this.checkRewardID()
		// this.startPolling()
	}

	async startPolling() {
		setTimeout(this.pollForRedemptions, 5 * 1000)
	}

	async checkRewardID() {
		var auth = new Auth(this.channelName, null, null, null, null)
		await auth.selectAuthByBroadcasterName()
		console.log("auth.rewardID")
		console.log(auth.rewardID)
		if (auth.rewardID != 'null' 
		&& auth.rewardID != 'undefined' 
		&& auth.rewardID != null 
		&& this.rewardId != undefined) {
			this.rewardId = auth.rewardID
			this.startPolling()
		} else {
			await this.createReward()
			this.startPolling()
		}
	}

	// getRewards = async () => {

	// 	console.log("getRewards")

	// 	const redemptionsResponse = await fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${userId}`, {
	// 		method: 'GET',
	// 		headers: {
	// 			"Client-ID": `${clientId}`,
	// 			"Authorization": `Bearer ${this.authToken}`,
	// 			"Accept": "application/json"
	// 		}
	// 	});

	// 	const getRewardsResponseJson = await redemptionsResponse.json();
	// 	console.log("getRewardsResponseJson")
	// 	console.log(getRewardsResponseJson)
	// 	return getRewardsResponseJson
	// }

	createReward = async () => {

		const createRedemptionResponse = await fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${this.broadcasterId}`, {
			method: 'POST',
			headers: {
				"Client-ID": `${clientId}`,
				"Authorization": `Bearer ${this.authToken}`,
				"Accept": "application/json",
				"Content-Type": "application/json"
			},
			body: `{
			"title": "Chat Guess Games abc 123 xyz",
			"cost": 300
		}`
		});

		const createRewardJson = await createRedemptionResponse.json();
		console.log("createRewardJson")
		console.log(createRewardJson)
		let rewardId = createRewardJson.data[0].id
		let auth = new Auth(this.channelName, null, null, null, rewardId)
		auth.saveRewardId()
		this.rewardId = rewardId
	}

	// createRedemption()

	// getRewards()
	pollForRedemptions = async () => {
		// console.log("pollForRedemptions")

		const redemptionResponse = await fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?broadcaster_id=${userId}&reward_id=${this.rewardId}&status=UNFULFILLED`, {
			method: 'GET',
			headers: {
				"Client-ID": `${clientId}`,
				"Authorization": `Bearer ${this.authToken}`,
				"Accept": "application/json"
			}
		});

		// console.log("redemptionResponse.status")
		// console.log(redemptionResponse.status)

		if (redemptionResponse.status == 200) {
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
		} else if (redemptionResponse.status == 404) {
			this.createReward()
		}

		setTimeout(this.pollForRedemptions, 5 * 1000)
	}

	fulfillRedemption = async (redemptionId) => {

		const fulfillRedemptionResponse = await fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?broadcaster_id=${userId}&reward_id=${this.rewardId}&id=${redemptionId}`, {
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