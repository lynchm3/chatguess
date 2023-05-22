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

    }
}

export class GameImage {
    constructor(url, width, height) {
        this.url = url
        this.width = width
        this.height = height
    }
}
