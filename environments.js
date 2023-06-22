class Environment {
    constructor(homeURL, databaseIPv4) {
        this.homeURL = homeURL
        this.databaseIPv4 = databaseIPv4
    }
}

const developmentEnvironment = new Environment("https://localhost:8080", "35.195.21.2")
const productionEnvironment = new Environment("https://chatguess.com", "10.6.144.3")
