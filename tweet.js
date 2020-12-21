// Dépendances
const term = require('terminal-kit').terminal; // https://www.npmjs.com/package/terminal-kit
var Twit = require('twit'); // https://www.npmjs.com/package/twit
const config = require('./tweetConfig.json'); // Fichier local
const markdownChalk = require('markdown-chalk'); // https://www.npmjs.com/package/markdown-chalk
const fetch = require('node-fetch'); // https://www.npmjs.com/package/node-fetch


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
term('Appuyer sur la touche "A" pour tweeter avec le compte principal, "B" pour tweeter avec le compte secondaire, "E" pour voir la liste des émojis\n\n');
var numberInput = 0;

// Liste des auto complétations
var autoComplete = [
	'%jump%' , ':joy:' , ':sob:' , ':clown:' ,
	':love:' , ':sleeping:' , ':dog:' , ':cat:' ,
	':panda:' , ':pig:' , ':wolf:' , ':chicken:' ,
	':mouse:' , ':lion:' , ':fire:' , ':tada:' ,
	':rainbow:' , ':santa:' , ':zero:' , ':one:' ,
  ':two:' , ':three:' , ':four:' , ':five:' , ':six:' ,
  ':seven:' , ':eight:' , ':nine:' , ':ten:' , 'heart:' ,
  ':orange_heart:' , ':yellow_heart:' , ':green_heart:' ,
  ':blue_heart:' , ':purple_heart:' , ':black_heart:' ,
  ':brown_heart:' , ':white_heart:', ':broken_heart:' ,
  ':heart_exclamation' , ':two_hearts:' , ':revolving_heart:' ,
  ':two_hearts:' , ':revolving_heart:' , ':heartbeat:' ,
  ':heartpulse:' , ':sparkling_heart:' , ':cupid:' , ':gift_heart:' ,
  ':heart_decoration:' , ':gift:' , ':smirk:' , ':hot:' , ':kiss:' ,
  ':skull:'
];

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
term.inputField({autoComplete: autoComplete, autoCompleteMenu: true, autoCompleteHint: true }, function( error , text ) { // Demande de texte et enregistrement sous la variable "text"

  // Définition de input (Remplacement de certains trucs de text)
  const input = text
  // Non émoji
  .replace(/%jump%/g, "\n") // Saut de ligne
  // Personnes
  .replace(/:joy:/g, "😂") // Emoji :joy:
  .replace(/:sob:/g, "😭") // Emoji :sob:
  .replace(/:clown:/g, "🤡") // Emoji :clown:
  .replace(/:love:/g, "🥰") // Emoji :love:
  .replace(/:sleeping:/g, "😴") // Emoji :sleeping:
  .replace(/:upside_down:/g, "🙃") // Emoji :upside_down:
  .replace(/:sunglasses:/g, "😎") // Emoji :sunglasses:
  .replace(/:thinking:/g, "🤔") // Emoji :thinking:
  .replace(/:scream:/g, "😱") // Emoji :scream:
  .replace(/:laughing:/g, "😆") // Emoji :laughing:
  .replace(/:smirk:/g, "😏") // Emoji :smirk:
  .replace(/:hot:/g, "🥵") // Emoji :hot:
  .replace(/:kiss:/g, "😘") // Emoji :kiss:
  // Animaux
  .replace(/:dog:/g, "🐶") // Emoji :dog:
  .replace(/:cat:/g, "🐱") // Emoji :cat:
  .replace(/:panda:/g, "🐼") // Emoji :panda:
  .replace(/:pig:/g, "🐷") // Emoji :pig:
  .replace(/:wolf:/g, "🐺") // Emoji :wolf:
  .replace(/:chicken:/g, "🐔") // Emoji :chicken:
  .replace(/:mouse:/g, "🐭") // Emoji :mouse:
  .replace(/:lion:/g, "🦁") // Emoji :lion:
  .replace(/:penguin:/g, "🐧") // Emoji :penguin:
  // Nombres
  .replace(/:zero:/g, "0️⃣") // Emoji :zero:
  .replace(/:one:/g, "1️⃣") // Emoji :one:
  .replace(/:two:/g, "2️⃣") // Emoji :two:
  .replace(/:three:/g, "3️⃣") // Emoji :three:
  .replace(/:four:/g, "4️⃣") // Emoji :four:
  .replace(/:five:/g, "5️⃣") // Emoji :five:
  .replace(/:six:/g, "6️⃣") // Emoji :six:
  .replace(/:seven:/g, "7️⃣") // Emoji :seven:
  .replace(/:eight:/g, "8️⃣") // Emoji :eight:
  .replace(/:nine:/g, "9️⃣") // Emoji :nine:
  .replace(/:ten:/g, "🔟") // Emoji :ten:
  // Coeur
  .replace(/:heart:/g, "❤️") // Emoji :heart:
  .replace(/:orange_heart:/g, "🧡") // Emoji :orange_heart:
  .replace(/:yellow_heart:/g, "💛") // Emoji :yellow_heart:
  .replace(/:green_heart:/g, "💚") // Emoji :green_heart:
  .replace(/:blue_heart:/g, "💙") // Emoji :blue_heart:
  .replace(/:purple_heart:/g, "💜") // Emoji :purple_heart:
  .replace(/:black_heart:/g, "🖤") // Emoji :black_heart:
  .replace(/:brown_heart:/g, "🤎") // Emoji :brown_heart:
  .replace(/:white_heart:/g, "🤍") // Emoji :white_heart:
  .replace(/:broken_heart:/g, "💔") // Emoji :broken_heart:
  .replace(/:heart_exclamation:/g, "❣️") // Emoji :heart_exclamation:
  .replace(/:two_hearts:/g, "💕") // Emoji :two_hearts:
  .replace(/:revolving_heart:/g, "💞") // Emoji :revolving_heart:
  .replace(/:heartbeat:/g, "💓") // Emoji :heartbeat:
  .replace(/:heartpulse:/g, "💗") // Emoji :heartpulse:
  .replace(/:sparkling_heart:/g, "💖") // Emoji :sparkling_heart:
  .replace(/:cupid:/g, "💘") // Emoji :cupid:
  .replace(/:gift_heart:/g, "💝") // Emoji :gift_heart:
  .replace(/:heart_decoration:/g, "💟") // Emoji :heart_decoration:
  // Autres
  .replace(/:fire:/g, "🔥") // Emoji :fire:
  .replace(/:tada:/g, "🎉") // Emoji :tadda:
  .replace(/:rainbow:/g, "🌈") // Emoji :rainbow:
  .replace(/:santa:/g, "🎅") // Emoji :santa:
  .replace(/:eyes:/g, "👀") // Emoji :eyes:
  .replace(/:middle_finger:/g, "🖕") // Emoji :middle_finger:
  .replace(/:100:/g, "💯") // Emoji :100:
  .replace(/:gift:/g, "🎁") // Emoji :gift:
  .replace(/:skull:/g, "💀"); // Emoji :skull:

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
          if(err.message === "Tweet needs to be a bit shorter."){
            var error = "Votre tweet est trop long. | Code erreur #11";
          } else {
		    	var error = "Une erreur inconnue s'est produite, Vérifier votre connexion internet et/ou les permissions de votre app Twitter. Pour plus d'aide, Veuillez me contacter sur Twitter (@Johan_Perso). | Code erreur #2";
		    }
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

// tweetSecond = Tweeter avec le compte secondaire
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
term.inputField({autoComplete: autoComplete, autoCompleteMenu: true, autoCompleteHint: true }, function( error , text ) { // Demande de texte et enregistrement sous la variable "text"

  // Définition de input (Remplacement de certains trucs de text)
  const input = text
  // Non émoji
  .replace(/%jump%/g, "\n") // Saut de ligne
  // Personnes
  .replace(/:joy:/g, "😂") // Emoji :joy:
  .replace(/:sob:/g, "😭") // Emoji :sob:
  .replace(/:clown:/g, "🤡") // Emoji :clown:
  .replace(/:love:/g, "🥰") // Emoji :love:
  .replace(/:sleeping:/g, "😴") // Emoji :sleeping:
  .replace(/:upside_down:/g, "🙃") // Emoji :upside_down:
  .replace(/:sunglasses:/g, "😎") // Emoji :sunglasses:
  .replace(/:thinking:/g, "🤔") // Emoji :thinking:
  .replace(/:scream:/g, "😱") // Emoji :scream:
  .replace(/:laughing:/g, "😆") // Emoji :laughing:
  .replace(/:smirk:/g, "😏") // Emoji :smirk:
  .replace(/:hot:/g, "🥵") // Emoji :hot:
  .replace(/:kiss:/g, "😘") // Emoji :kiss:
  // Animaux
  .replace(/:dog:/g, "🐶") // Emoji :dog:
  .replace(/:cat:/g, "🐱") // Emoji :cat:
  .replace(/:panda:/g, "🐼") // Emoji :panda:
  .replace(/:pig:/g, "🐷") // Emoji :pig:
  .replace(/:wolf:/g, "🐺") // Emoji :wolf:
  .replace(/:chicken:/g, "🐔") // Emoji :chicken:
  .replace(/:mouse:/g, "🐭") // Emoji :mouse:
  .replace(/:lion:/g, "🦁") // Emoji :lion:
  .replace(/:penguin:/g, "🐧") // Emoji :penguin:
  // Nombres
  .replace(/:zero:/g, "0️⃣") // Emoji :zero:
  .replace(/:one:/g, "1️⃣") // Emoji :one:
  .replace(/:two:/g, "2️⃣") // Emoji :two:
  .replace(/:three:/g, "3️⃣") // Emoji :three:
  .replace(/:four:/g, "4️⃣") // Emoji :four:
  .replace(/:five:/g, "5️⃣") // Emoji :five:
  .replace(/:six:/g, "6️⃣") // Emoji :six:
  .replace(/:seven:/g, "7️⃣") // Emoji :seven:
  .replace(/:eight:/g, "8️⃣") // Emoji :eight:
  .replace(/:nine:/g, "9️⃣") // Emoji :nine:
  .replace(/:ten:/g, "🔟") // Emoji :ten:
  // Coeur
  .replace(/:heart:/g, "❤️") // Emoji :heart:
  .replace(/:orange_heart:/g, "🧡") // Emoji :orange_heart:
  .replace(/:yellow_heart:/g, "💛") // Emoji :yellow_heart:
  .replace(/:green_heart:/g, "💚") // Emoji :green_heart:
  .replace(/:blue_heart:/g, "💙") // Emoji :blue_heart:
  .replace(/:purple_heart:/g, "💜") // Emoji :purple_heart:
  .replace(/:black_heart:/g, "🖤") // Emoji :black_heart:
  .replace(/:brown_heart:/g, "🤎") // Emoji :brown_heart:
  .replace(/:white_heart:/g, "🤍") // Emoji :white_heart:
  .replace(/:broken_heart:/g, "💔") // Emoji :broken_heart:
  .replace(/:heart_exclamation:/g, "❣️") // Emoji :heart_exclamation:
  .replace(/:two_hearts:/g, "💕") // Emoji :two_hearts:
  .replace(/:revolving_heart:/g, "💞") // Emoji :revolving_heart:
  .replace(/:heartbeat:/g, "💓") // Emoji :heartbeat:
  .replace(/:heartpulse:/g, "💗") // Emoji :heartpulse:
  .replace(/:sparkling_heart:/g, "💖") // Emoji :sparkling_heart:
  .replace(/:cupid:/g, "💘") // Emoji :cupid:
  .replace(/:gift_heart:/g, "💝") // Emoji :gift_heart:
  .replace(/:heart_decoration:/g, "💟") // Emoji :heart_decoration:
  // Autres
  .replace(/:fire:/g, "🔥") // Emoji :fire:
  .replace(/:tada:/g, "🎉") // Emoji :tadda:
  .replace(/:rainbow:/g, "🌈") // Emoji :rainbow:
  .replace(/:santa:/g, "🎅") // Emoji :santa:
  .replace(/:eyes:/g, "👀") // Emoji :eyes:
  .replace(/:middle_finger:/g, "🖕") // Emoji :middle_finger:
  .replace(/:100:/g, "💯") // Emoji :100:
  .replace(/:gift:/g, "🎁") // Emoji :gift:
  .replace(/:skull:/g, "💀"); // Emoji :skull:

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
         if(err.message === "Tweet needs to be a bit shorter."){
           var error = "Votre tweet est trop long. | Code erreur #11";
         } else {
         var error = "Une erreur inconnue s'est produite, Vérifier votre connexion internet et/ou les permissions de votre app Twitter. Pour plus d'aide, Veuillez me contacter sur Twitter (@Johan_Perso). | Code erreur #2";
       }
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

// emojiList = Liste des émojis
function emojiList(){
  fetch('https://raw.githubusercontent.com/anticoupable/twitterminal/main/replace-text.md')
    .then(res => res.text())
    .then(body => {
      console.log(markdownChalk(body) + "\nAccessible à cette adresse : https://github.com/anticoupable/twitterminal/blob/main/replace-text.md");
      process.exit();
    });
}

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

term.on('key', function(name, matches, data){
  // Si E : Afficher la liste des émojis
	if (name === 'e'){
		if(numberInput !== 0) return;
		numberInput++;
		emojiList();
	}
});


term.grabInput(true);
term.on('key', function(name, matches, data){
  // Si CTRL_Z : Arrêtez le processus
	if (name === 'CTRL_Z'){
		process.exit();
	}
  });
