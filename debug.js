// Dépendances et variables importantes
const term = require('terminal-kit').terminal; // https://www.npmjs.com/package/terminal-kit
const config = require('./tweetConfig.json'); // Fichier local

// Debug mode
if(config.consumer_key1 === ""){
    var key1 = "vide"
} else {
    var key1 = "non vide"
}
if(config.consumer_secret1 === ""){
    var key2 = "vide"
} else {
    var key2 = "non vide"
}
if(config.access_token1 === ""){
    var key3 = "vide"
} else {
    var key3 = "non vide"
}
if(config.access_token_secret1 === ""){
    var key4 = "vide"
} else {
    var key4 = "non vide"
}

term.cyan("\nconsumer_key : " + key1)
term.cyan("\nconsumer_secret : " + key2)
term.cyan("\naccess_token : " + key3)
term.cyan("\naccess_token_secret : " + key4)
term.cyan("\nChemin de Twitterminal : " + __dirname + "\n\n")