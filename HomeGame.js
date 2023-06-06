export class HomeGame {
    constructor(
        id,
        artworks,
        screenshots) {

        this.id = id;
        this.artworks = artworks;
        this.screenshots = screenshots;
    }
}

export class GameImage {
    constructor(url, width, height) {
        this.url = url
        this.width = width
        this.height = height
    }
}
