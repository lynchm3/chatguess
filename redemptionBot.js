import { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET } from './secrets.js';
import fetch from 'node-fetch';

const BROADCASTER_ID = "57016188"
const REWARD_ID = "123456"

export class RedemptionBot {

    constructor(accessToken) {
        this.accessToken = accessToken
    }

    // returns an object containing the custom rewards, or if an error, null
    getRedemptions = async () => {

        // console.log("this.accessToken")
        // console.log(this.accessToken)

        const redemptionsResponse = await fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${BROADCASTER_ID}`, {
            method: 'GET',
            headers: {
                "Client-ID": `${TWITCH_CLIENT_ID}`,
                "Authorization": `Bearer ${this.accessToken}`,
                "Accept": "application/json"
            }
        });

        const redemptionsResponseJson = await redemptionsResponse.json();

        // console.log("redemptionsResponseJson")
        // console.log(redemptionsResponseJson)
    }

    // function for polling every 15 seconds to check for user redemptions 
    pollForRedemptions = async () => {

        // console.log("this.accessToken")
        // console.log(this.accessToken)

        const redemptionResponse = await fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?broadcaster_id=${BROADCASTER_ID}&reward_id=${REWARD_ID}&status=UNFULFILLED`, {
            method: 'GET',
            headers: {
                "Client-ID": `${TWITCH_CLIENT_ID}`,
                "Authorization": `Bearer ${this.accessToken}`,
                "Accept": "application/json"
            }
        });

        const redemptionResponseJson = await redemptionResponse.json();

        // console.log("redemptionResponseJson")
        // console.log(redemptionResponseJson)


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

}