import { copyFileSync, promises as fs } from 'fs';
import { clientId, clientSecret, userId } from './secrets.js'
import fetch from 'node-fetch';
import { Auth } from './db.js';
import { refreshToken } from './network/auth.js';

//Twitch docs - https://dev.twitch.tv/docs/api/reference/#create-custom-rewards

// Switch to eventsub

export class Redemption {

	constructor(channel) {
		console.log("Redemption constructor")
		this.channel = channel
		this.checkRewardID()
	}

	async startPolling() {
		console.log("Redemption startPolling")
		setTimeout(this.pollForRedemptions, 5 * 1000)
	}

	async checkRewardID() {
		console.log("Redemption checkRewardID")
		console.log("this.channel.channelName")
		console.log(this.channel.channelName)
		var auth = new Auth(this.channel.channelName, null, null, null, null)
		await auth.selectAuthByBroadcasterName()
		console.log("auth.rewardID")
		console.log(auth.rewardID)
		if (auth.rewardID != 'null'
			&& auth.rewardID != 'undefined'
			&& auth.rewardID != null
			&& auth.rewardID != undefined) {
			console.log("Redemption checkRewardID branch A")
			this.channel.rewardId = auth.rewardID
			this.startPolling()
		} else {
			console.log("Redemption checkRewardID branch B")
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
	// 			"Authorization": `Bearer ${this.channel.authToken}`,
	// 			"Accept": "application/json"
	// 		}
	// 	});

	// 	const getRewardsResponseJson = await redemptionsResponse.json();
	// 	console.log("getRewardsResponseJson")
	// 	console.log(getRewardsResponseJson)
	// 	return getRewardsResponseJson
	// }

	createReward = async () => {

		console.log("Redemption createReward")

		const createRedemptionResponse = await fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${this.channel.broadcasterId}`, {
			method: 'POST',
			headers: {
				"Client-ID": `${this.channel.clientId}`,
				"Authorization": `Bearer ${this.channel.authToken}`,
				"Accept": "application/json",
				"Content-Type": "application/json"
			},
			body: `{
			"title": "Chat Guess Games",
			"cost": 300,
			"prompt": "Play a round of Chat Guess Games on stream",
			"background_color": "#222222"	
		}`
		});

		if (createRedemptionResponse.status == 200) {
			const createRewardJson = await createRedemptionResponse.json();
			console.log("createRewardJson")
			console.log(createRewardJson)
			let rewardId = createRewardJson.data[0].id
			let auth = new Auth(this.channel.channelName, null, null, null, rewardId)
			auth.saveRewardId()
			this.channel.rewardId = rewardId
		} else {
			console.log("createRedemptionResponse error")
			console.log(createRedemptionResponse.status)
		}
	}

	// createRedemption()

	// getRewards()
	pollForRedemptions = async () => {

		// console.log("Redemption pollForRedemptions")

		const redemptionResponse = await fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?broadcaster_id=${userId}&reward_id=${this.channel.rewardId}&status=UNFULFILLED`, {
			method: 'GET',
			headers: {
				"Client-ID": `${clientId}`,
				"Authorization": `Bearer ${this.channel.authToken}`,
				"Accept": "application/json"
			}
		});

		// console.log("pollForRedemptions response")
		// console.log(redemptionResponse)

		if (redemptionResponse.status == 200) {
			const redemptionResponseJson = await redemptionResponse.json();
			// console.log("redemptionResponseJson")
			// console.log(redemptionResponseJson)

			let redemptions = redemptionResponseJson.data

			if (this.channel != null) {
				for (let redemption of redemptions) {
					this.channel.addGameToQueue(redemption.user_name)
					this.fulfillRedemption(redemption.id)
				}
			}
		} else if (redemptionResponse.status == 404) {
			this.createReward()
		} else if (redemptionResponse.status == 401) {
			console.log("redemptionResponse err")
			console.log(redemptionResponse)
			refreshToken(this.channel)
		}

		setTimeout(this.pollForRedemptions, 5 * 1000)
	}

	fulfillRedemption = async (redemptionId) => {

		const fulfillRedemptionResponse = await fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?broadcaster_id=${userId}&reward_id=${this.channel.rewardId}&id=${redemptionId}`, {
			method: 'PATCH',
			headers: {
				"Client-ID": `${clientId}`,
				"Authorization": `Bearer ${this.channel.authToken}`,
				"Accept": "application/json",
				"Content-Type": "application/json"
			},
			body: `{"status": "FULFILLED"}`
		});

		const fulfillRedemptionResponseJson = await fulfillRedemptionResponse.json();

		// console.log("fulfillRedemptionResponse")
		// console.log(fulfillRedemptionResponse)
	}
}