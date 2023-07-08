class Environment {
    constructor(homeURL, databaseIPv4, databaseInstanceConnectionName) {
        this.homeURL = homeURL
        this.databaseIPv4 = databaseIPv4
        this.databaseInstanceConnectionName = databaseInstanceConnectionName        
    }
}

export const DEVELOPMENT_ENVIRONMENT = new Environment("http://localhost:8080", "35.195.21.2", "chatguess:europe-west1:chatguessdb")
export const PRODUCTION_ENVIRONMENT = new Environment("https://chatguess.com", "35.195.21.2", "chatguess:europe-west1:chatguessdb")
// PRIVATE DB IP export const PRODUCTION_ENVIRONMENT = new Environment("https://chatguess.com", "10.6.144.3")
// PRIVATE DB IP might need to run on port 3306
// https://cloud.google.com/sql/docs/mysql/connect-app-engine-standard#node.js_1