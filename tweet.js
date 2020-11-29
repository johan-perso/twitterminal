// Dépendances
const term = require('terminal-kit').terminal; // https://www.npmjs.com/package/terminal-kit
var Twit = require('twit'); // https://www.npmjs.com/package/twit
const config = require('./tweetConfig.json'); // Fichier local

// Vérification des champs du fichier de config et si c'est vide : Afficher un message d'erreur et arrêter le processus
if(!config.consumer_key | !config.consumer_secret | !config.access_token | !config.access_token_secret){
   term.red("Une erreur s'est produite, Les champs du fichier 'tweetConfig.json' sont incomplet, Veuillez les remplire. Si le problème continue, Veuillez me contacter sur Twitter (@Johan_Perso). | Code erreur #1\n");
   return process.exit();
}

var T = new Twit({
// Les 4 premiers champs peuvent être trouvés dans son profil développeur Twitter
    consumer_key:         config.consumer_key,
    consumer_secret:      config.consumer_secret,
    access_token:         config.access_token,
    access_token_secret:  config.access_token_secret,
    timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
    strictSSL:            true,     // optional - requires SSL certificates to be valid.
});

// Vérifier le compte pour afficher le pseudo
T.get('account/verify_credentials', { skip_status: true })
  .then(function (result) {
    term("Bonjour " + result.data.name) + term(" !\n");
    term("(Connecté en tant que ") + term.cyan("@" + result.data.screen_name) + term(")\n");
    term.yellow("[-----------------------------------------------]\n");


term("Veuillez entrer le contenu du tweet : "); // Message de demande de texte
term.inputField(function(error, text){ // Demande de texte et enregistrement sous la variable "text"

// Définition de input (Remplacement de certains trucs de text)
const input = text
.replace(/%jump%/g, "\n") // Saut de ligne
.replace(/\%jump%/g, "%jump%") // Annuler le saut de ligne (Buggé)
.replace(/\:joy:/g, ":joy:") // Emoji :joy:
.replace(/:joy:/g, "😂") // Annuler l'émoji :joy: (Buggé)
.replace(/\:sob:/g, ":sob:") // Emoji :sob:
.replace(/:sob:/g, "😭"); // Annuler l'émoji :sob: (Buggé)

		term("\nEnvoie du tweet..."); // Message pour dire que le tweet s'envoie
		T.post('statuses/update', { status: input }, function(err, data, response){ // Tweeter le tweet
		// Si il n'y a pas d'erreur
		if(!err){
		    term("\nTweet envoyé..."); // Dire que le tweet est envoyé
		    term("\nLien du tweet : ") + term.cyan(`https://twitter.com/${ data.user.screen_name }/status/${ data.id_str }\n`); // Donner le lien du tweet
		    process.exit(); // Arrêter le processus
		} else {
		   // Si il y a une erreur
		    term.red("\nUne erreur inconnue s'est produite, Vérifier votre connexion internet et/ou le contenu du tweet. Si le problème continue, Veuillez me contacter sur Twitter (@Johan_Perso). | Code erreur #2\n"); // Afficher un message d'erreur
		    return process.exit(); // Arrêter le processus
		}
});
	}
);
  });
  
