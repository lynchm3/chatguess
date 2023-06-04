const WebsiteCategories = {
    official: 1,
    wikia: 2,
    wikipedia: 3,
    facebook: 4,
    twitter: 5,
    twitch: 6,
    instagram: 8,
    youtube: 9,
    iphone: 10,
    ipad: 11,
    android: 12,
    steam: 13,
    reddit: 14,
    itch: 15,
    epicgames: 16,
    gog: 17,
    discord: 18
}

export class Game {
    constructor(
        id,
        name,
        follows,
        hypes,
        aggregatedRating,
        alternativeNames,
        artworks,
        collection,
        coverArt,
        originalReleaseDate,
        franchise,
        franchises,
        genres,
        involvedCompanies,
        platforms,
        screenshots,
        similarGames,
        storyline,
        summary,
        themes,
        videos,
        websites) {

        this.id = id;
        this.name = name;
        this.follows = follows;
        this.hypes = hypes;
        this.aggregatedRating = aggregatedRating;
        this.alternativeNames = alternativeNames;
        this.artworks = artworks;
        this.collection = collection;
        this.coverArt = coverArt;
        this.originalReleaseDate = originalReleaseDate;
        this.franchise = franchise;
        this.franchises = franchises;
        this.genres = genres;
        this.involvedCompanies = involvedCompanies;
        this.platforms = platforms;
        this.screenshots = screenshots;
        this.similarGames = similarGames;
        this.storyline = storyline;
        this.summary = summary;
        this.themes = themes;
        this.videos = videos;
        this.websites = websites;

        //get the steam url docs - https://api-docs.igdb.com/#website
        this.steamURL = null
        for (let i in websites) {
            if (websites[i].category == WebsiteCategories.steam) {
                this.steamURL = websites[i].url
            }
        }
    }
}

export class GameImage {
    constructor(url, width, height) {
        this.url = url
        this.width = width
        this.height = height
    }
}
