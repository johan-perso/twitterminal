// Dépendances
const term = require('terminal-kit').terminal; // https://www.npmjs.com/package/terminal-kit
var Twit = require('twit'); // https://www.npmjs.com/package/twit
const config = require('./tweetConfig.json'); // Fichier local

// Vérification des champs 1 du fichier de config et si c'est vide : Afficher un message d'erreur et arrêter le processus
if(!config.consumer_key1 | !config.consumer_secret1 | !config.access_token1 | !config.access_token_secret1){
   term.red("Une erreur s'est produite, Les quatre premiers champs du fichier 'tweetConfig.json' sont incomplet, Veuillez les remplire. Si le problème continue, Veuillez me contacter sur Twitter (@Johan_Perso). | Code erreur #1\n");
   return process.exit();
}

// Vérification des champs 2 du fichier de config et si c'est vide : N'utiliser qu'un seul compte
if(!config.consumer_key2 | !config.consumer_secret2 | !config.access_token2 | !config.access_token_secret2){
  return tweetClassic();
}

// Indication des touches + Définition de numberInput
term('Appuyer sur la touche "A" pour tweeter avec le compte principal et "B" pour tweeter avec le compte secondaire\n\n');
var numberInput = 0;

// tweetClassic = Tweeter avec le compte principal
function tweetClassic(){

   var T = new Twit({
// Les 4 premiers champs peuvent être trouvés dans son profil développeur Twitter
    consumer_key:         config.consumer_key1,
    consumer_secret:      config.consumer_secret1,
    access_token:         config.access_token1,
    access_token_secret:  config.access_token_secret1,
    timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
    strictSSL:            true,     // optional - requires SSL certificates to be valid.
});

// Affichage d'un message de bienvenue
   T.get('account/verify_credentials', { skip_status: true })
  .then(function (result) {
    term("Bonjour " + result.data.name) + term(" !\n");
    term("(Connecté en tant que ") + term.cyan("@" + result.data.screen_name) + term(")\n");
    term.yellow("[-----------------------------------------------]\n");

term("Veuillez entrer le contenu du tweet : "); // Message de demande de texte
term.inputField(function(error, text){ // Demande de texte et enregistrement sous la variable "text"

// Définition de input (Remplacement de certains trucs de text)
const input = text
// Non émoji
.replace(/%jump%/g, "\n") // Saut de ligne
// Visages
.replace(/:joy:/g, "😂") // Emoji :joy:
.replace(/:sob:/g, "😭") // Emoji :sob:
.replace(/:clown:/g, "🤡") // Emoji :clown:
.replace(/:love:/g, "🥰") // Emoji :love:
.replace(/:sleeping:/g, "😴") // Emoji :sleeping:
// Animaux
.replace(/:dog:/g, "🐶") // Emoji :dog:
.replace(/:cat:/g, "🐱") // Emoji :cat:
.replace(/:panda:/g, "🐼") // Emoji :panda:
.replace(/:pig:/g, "🐷") // Emoji :pig:
.replace(/:wolf:/g, "🐺") // Emoji :wolf:
.replace(/:chicken:/g, "🐔") // Emoji :chicken:
.replace(/:mouse:/g, "🐭") // Emoji :mouse:
.replace(/:lion:/g, "🦁") // Emoji :lion:
// Autres
.replace(/:fire:/g, "🔥") // Emoji :fire:
.replace(/:tada:/g, "🎉") // Emoji :tadda:
.replace(/:rainbow:/g, "🌈") // Emoji :rainbow:
.replace(/:santa:/g, "🎅"); // Emoji :santa:

		term("\nEnvoie du tweet..."); // Message pour dire que le tweet s'envoie
		T.post('statuses/update', { status: input }, function(err, data, response){ // Tweeter le tweet
		// Si il n'y a pas d'erreur
		if(!err){
		    term("\nTweet envoyé..."); // Dire que le tweet est envoyé
		    term("\nLien du tweet : ") + term.cyan(`https://twitter.com/${ data.user.screen_name }/status/${ data.id_str }\n`); // Donner le lien du tweet
		    process.exit(); // Arrêter le processus
		} else {
		   // Si il y a une erreur

		    // Tentative de détection de l'erreur
		    if(err.message === "Status is a duplicate."){
		    	var error = "Un tweet contenant le même contenu est déjà existant. | Code erreur #9";
		    } else {
		    if(err.message === "Missing required parameter: status."){
		    	var error = "Votre tweet contient un caractère invalide ou est vide. | Code erreur #10";
		    } else {
		    	var error = "Une erreur inconnue s'est produite, Vérifier votre connexion internet et/ou les permissions de votre app Twitter. Pour plus d'aide, Veuillez me contacter sur Twitter (@Johan_Perso). | Code erreur #2";
		    }
		    }

        // Affichage de l'erreur
		    term.red("\nErreur de Twitter : " + err.message + "\n");
		    term.red("Erreur détecté par Twitterminal : " + error + "\n");
		    return process.exit(); // Arrêter le processus
		}

		});
});
}
)}

function tweetSecond(){

   var T = new Twit({
     // Les 4 premiers champs peuvent être trouvés dans son profil développeur Twitter
    consumer_key:         config.consumer_key2,
    consumer_secret:      config.consumer_secret2,
    access_token:         config.access_token2,
    access_token_secret:  config.access_token_secret2,
    timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
    strictSSL:            true,     // optional - requires SSL certificates to be valid.
});

// Affichage d'un message de bienvenue
   T.get('account/verify_credentials', { skip_status: true })
  .then(function (result) {
    term("Bonjour " + result.data.name) + term(" !\n");
    term("(Connecté en tant que ") + term.cyan("@" + result.data.screen_name) + term(")\n");
    term.yellow("[-----------------------------------------------]\n");

term("Veuillez entrer le contenu du tweet : "); // Message de demande de texte
term.inputField(function(error, text){ // Demande de texte et enregistrement sous la variable "text"

  // Définition de input (Remplacement de certains trucs de text)
  const input = text
  // Non émoji
  .replace(/%jump%/g, "\n") // Saut de ligne
  // Visages
  .replace(/:joy:/g, "😂") // Emoji :joy:
  .replace(/:sob:/g, "😭") // Emoji :sob:
  .replace(/:clown:/g, "🤡") // Emoji :clown:
  .replace(/:love:/g, "🥰") // Emoji :love:
  .replace(/:sleeping:/g, "😴") // Emoji :sleeping:
  // Animaux
  .replace(/:dog:/g, "🐶") // Emoji :dog:
  .replace(/:cat:/g, "🐱") // Emoji :cat:
  .replace(/:panda:/g, "🐼") // Emoji :panda:
  .replace(/:pig:/g, "🐷") // Emoji :pig:
  .replace(/:wolf:/g, "🐺") // Emoji :wolf:
  .replace(/:chicken:/g, "🐔") // Emoji :chicken:
  .replace(/:mouse:/g, "🐭") // Emoji :mouse:
  .replace(/:lion:/g, "🦁") // Emoji :lion:
  // Autres
  .replace(/:fire:/g, "🔥") // Emoji :fire:
  .replace(/:tada:/g, "🎉") // Emoji :tada:
  .replace(/:rainbow:/g, "🌈") // Emoji :rainbow:
  .replace(/:santa:/g, "🎅"); // Emoji :santa:

		term("\nEnvoie du tweet..."); // Message pour dire que le tweet s'envoie
		T.post('statuses/update', { status: input }, function(err, data, response){ // Tweeter le tweet
		// Si il n'y a pas d'erreur
		if(!err){
		    term("\nTweet envoyé..."); // Dire que le tweet est envoyé
		    term("\nLien du tweet : ") + term.cyan(`https://twitter.com/${ data.user.screen_name }/status/${ data.id_str }\n`); // Donner le lien du tweet
		    process.exit(); // Arrêter le processus
		} else {
		   // Si il y a une erreur

		    // Tentative de détection de l'erreur
		    if(err.message === "Status is a duplicate."){
		    	var error = "Un tweet contenant le même contenu est déjà existant. | Code erreur #9";
		    } else {
		    if(err.message === "Missing required parameter: status."){
		    	var error = "Votre tweet contient un caractère invalide ou est vide. | Code erreur #10";
		    } else {
		    	var error = "Une erreur inconnue s'est produite, Vérifier votre connexion internet et/ou les permissions de votre app Twitter. Pour plus d'aide, Veuillez me contacter sur Twitter (@Johan_Perso). | Code erreur #2";
		    }
		    }

        // Affichage de l'erreur
		    term.red("\nErreur de Twitter : " + err.message + "\n");
		    term.red("Erreur détecté par Twitterminal : " + error + "\n");
		    return process.exit(); // Arrêter le processus
		}

		});
});
}
)}


term.grabInput(true);
term.on('key', function(name, matches, data){
  // Si A : Tweeter avec le compte principal
	if (name === 'a'){
		if(numberInput !== 0) return;
		numberInput++;
		tweetClassic();
	}
});

term.on('key', function(name, matches, data){
  // Si B : Tweeter avec le second compte
	if (name === 'b'){
		if(numberInput !== 0) return;
		numberInput++;
		tweetSecond();
	}
});

term.grabInput(true);
term.on('key', function(name, matches, data){
  // Si CTRL_Z : Arrêtez le processus
	if (name === 'CTRL_Z'){
		process.exit();
	}
  });
