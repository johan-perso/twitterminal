// Dépendances
const term = require('terminal-kit').terminal; // https://www.npmjs.com/package/terminal-kit
var Twit = require('twit'); // https://www.npmjs.com/package/twit
const config = require('./tweetConfig.json'); // Fichier local


var T = new Twit({
// Les 4 premiers champs peuvent être trouvés dans son profil développeur Twitter
    consumer_key:         config.consumer_key,
    consumer_secret:      config.consumer_secret,
    access_token:         config.access_token,
    access_token_secret:  config.access_token_secret,
    timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
    strictSSL:            true,     // optional - requires SSL certificates to be valid.
});


term("Veuillez entrer le contenu du tweet : "); // Message de demande de texte
term.inputField(function(error, input){ // Demande de texte

		term("\nEnvoie du tweet : "); // Message pour dire que le tweet s'envoie
		term.cyan(input + "\n"); // Suite du message pour dire que le tweet s'envoie
		T.post('statuses/update', { status: input }, function(err, data, response) { // Tweeter le tweet
		    process.exit(); // Arrêter le processus
});
	}
);
