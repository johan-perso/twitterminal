#!/usr/bin/env node

// Dépendances et variables importantes
const term = require('terminal-kit').terminal; // https://www.npmjs.com/package/terminal-kit
var Twit = require('twit'); // https://www.npmjs.com/package/twit
const config = require('./tweetConfig.json'); // Fichier local
const fetch = require('node-fetch'); // https://www.npmjs.com/package/node-fetch
const clipboardy = require('clipboardy'); // https://www.npmjs.com/package/clipboardy
const fs = require('fs'); // https://www.npmjs.com/package/fs
var version = "2021.08.08-Outdated"

// Afficher une alerte comme quoi Twitterminal est outdated
term.bgRed.white("Cette version de Twitterminal n'est plus mis à jour.")
term.red("\nVeuillez effectuer la mise à jour dès que possible : https://twiterminal.carrd.co\n") 

// Système de mise à jour
fetch("https://raw.githubusercontent.com/johan-perso/twitterminal/old/version.json") // Envoyer une requête sur le Github de Twitterminal
    .then(res => res.json())
    .then(json => {
      if(json.version !== version){
        term.red("Dernière version de Twitterminal : ")
        term.cyan(json.version)
        term.red(". Vous n'êtes pas à jour. | Code erreur #16\n")
      }

// Vérification des champs 1 du fichier de config et si c'est vide : Afficher un message d'erreur et arrêter le processus
if(!config.consumer_key1 | !config.consumer_secret1 | !config.access_token1 | !config.access_token_secret1){
   term.red("Une erreur s'est produite, Les quatre premiers champs du fichier 'tweetConfig.json' sont incomplet, Veuillez les remplire. Si le problème continue, Veuillez me contacter sur Twitter (@Johan_Perso). | Code erreur #1\n");
   term.red("Chemin du fichier de config : ")
   term.cyan(__dirname + "\\tweetConfig.json\n")
   process.exit()
   }

// Vérification des champs 2 du fichier de config et si c'est vide : N'utiliser qu'un seul compte
if(!config.consumer_key2 | !config.consumer_secret2 | !config.access_token2 | !config.access_token_secret2){
  term('Appuyer sur la touche "A" pour tweeter, "C" pour tweeter une image (Bêta), "E" pour voir la liste des émojis, "G" pour chercher des gifs (Propulsé par Tenor).\n\n');
} else {
  // Indication des touches
  term('Appuyer sur la touche "A" pour tweeter avec le compte principal, "B" pour tweeter avec le compte secondaire, "C" pour tweeter une image avec le compte principal (Bêta), "E" pour voir la liste des émojis, "G" pour chercher des gifs (Propulsé par Tenor).\n\n');
}

// Définition de numberInput
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
  ':skull:' , ':frog:' , ':tiger:' , ':monkey:' , ':zebra:' , ':hamster:' ,
  ':cow:' , ':rabbit:' , ':bear:' , ':koala:' , ':elephant:' , ':dragon:' , ':racoon:' ,
  ':horse:' , ':unicorn:' , ':pizza:' , ':burger:' , ':french_fries:' , ':hot_dog:' ,
  ':pop_corn:' , ':salt:' , ':bacon:' , ':egg:' , ':waffle:' , ':pancake:' , ':butter:' ,
  ':down_finger:' , ':left_finger:' , ':right_finger:' , ':fingers_crossed:' , ':ok:' ,
  ':hand_shake:' , ':eyes:'
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
  .replace(/:frog:/g, "🐸") // Emoji :frog:
  .replace(/:tiger:/g, "🐯") // Emoji :tiger:
  .replace(/:monkey:/g, "🐵") // Emoji :monkey:
  .replace(/:zebra:/g, "🦓") // Emoji :zebra:
  .replace(/:hamster:/g, "🐹") // Emoji :hamster:
  .replace(/:cow:/g, "🐮") // Emoji :cow:
  .replace(/:rabbit:/g, "🐰") // Emoji :rabbit:
  .replace(/:bear:/g, "🐻") // Emoji :bear:
  .replace(/:koala:/g, "🐨") // Emoji :koala:
  .replace(/:elephant:/g, "🐘") // Emoji :elefant:
  .replace(/:dragon:/g, "🐲") // Emoji :dragon:
  .replace(/:racoon:/g, "🦝") // Emoji :racoon:
  .replace(/:horse:/g, "🐴") // Emoji :horse:
  .replace(/:unicorn:/g, "🦄") // Emoji :unicorn:
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
  // Nourriture
  .replace(/:pizza:/g, "🍕") // Emoji :pizza:
  .replace(/:burger:/g, "🍔") // Emoji :burger:
  .replace(/:french_fries:/g, "🍟") // Emoji :french_fries:
  .replace(/:hot_dog:/g, "🌭") // Emoji :hot_dog:
  .replace(/:pop_corn:/g, "🍿") // Emoji :pop_corn:
  .replace(/:salt:/g, "🧂") // Emoji :salt:
  .replace(/:bacon:/g, "🥓") // Emoji :bacon:
  .replace(/:egg:/g, "🥚") // Emoji :egg:
  .replace(/:waffle:/g, "🧇") // Emoji :waffle:
  .replace(/:pancake:/g, "🥞") // Emoji :pancake:
  .replace(/:butter:/g, "🧈") // Emoji :butter:
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
  .replace(/:100:/g, "💯") // Emoji :100:
  .replace(/:gift:/g, "🎁") // Emoji :gift:
  .replace(/:skull:/g, "💀") // Emoji :skull:
   // Gestes
  .replace(/:down_finger:/g, "👇") // Emoji :down_finger:
  .replace(/:left_finger:/g, "👈") // Emoji :left_finger:
  .replace(/:right_finger:/g, "👉") // Emoji :right_finger:
  .replace(/:fingers_crossed:/g, "🤞") // Emoji :fingers_crossed:
  .replace(/:middle_finger:/g, "🖕") // Emoji :middle_finger:
  .replace(/:hand_shake:/g, "👋") // Emoji :hand_shake:
  .replace(/:ok:/g, "👌"); // Emoji :ok:


		term("\nEnvoie du tweet..."); // Message pour dire que le tweet s'envoie
		T.post('statuses/update', { status: input }, function(err, data, response){ // Tweeter le tweet
		// Si il n'y a pas d'erreur
		if(!err){
		    term("\nTweet envoyé..."); // Dire que le tweet est envoyé
		    term("\nLien du tweet : ") + term.cyan(`https://twitter.com/${ data.user.screen_name }/status/${ data.id_str }\n`); // Donner le lien du tweet
        clipboardy.writeSync(`https://twitter.com/${ data.user.screen_name }/status/${ data.id_str }`); // Copier le lien du tweet dans le presse papier
		    process.exit(); // Arrêter le processus
		} else {
		   // Si il y a une erreur

		    // Détection de l'erreur
        if(err.message === "Status is a duplicate."){
          var error = "Un tweet contenant le même contenu est déjà existant. | Code erreur #9";
        } else {
        if(err.message === "Missing required parameter: status."){
          var error = "Votre tweet contient un caractère invalide ou est vide. | Code erreur #10";
        } else {
          if(err.message === "Tweet needs to be a bit shorter."){
            var error = "Votre tweet est trop long. | Code erreur #11";
          } else {
            if(err.message === "Read-only application cannot POST."){
              var error = "Votre application est en Read only, Pour utiliser Twitterminal vous avez besoin de la passer en \"Read and write\" via le Developer Portal de Twitter. | Code erreur #4"
            } else {
              var error = "Une erreur inconnue s'est produite, Vérifier votre connexion internet et/ou les permissions de votre app Twitter. Pour plus d'aide, Veuillez me contacter sur Twitter (@Johan_Perso). | Code erreur #2";
            }
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
  .replace(/:frog:/g, "🐸") // Emoji :frog:
  .replace(/:tiger:/g, "🐯") // Emoji :tiger:
  .replace(/:monkey:/g, "🐵") // Emoji :monkey:
  .replace(/:zebra:/g, "🦓") // Emoji :zebra:
  .replace(/:hamster:/g, "🐹") // Emoji :hamster:
  .replace(/:cow:/g, "🐮") // Emoji :cow:
  .replace(/:rabbit:/g, "🐰") // Emoji :rabbit:
  .replace(/:bear:/g, "🐻") // Emoji :bear:
  .replace(/:koala:/g, "🐨") // Emoji :koala:
  .replace(/:elephant:/g, "🐘") // Emoji :elefant:
  .replace(/:dragon:/g, "🐲") // Emoji :dragon:
  .replace(/:racoon:/g, "🦝") // Emoji :racoon:
  .replace(/:horse:/g, "🐴") // Emoji :horse:
  .replace(/:unicorn:/g, "🦄") // Emoji :unicorn:
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
  // Nourriture
  .replace(/:pizza:/g, "🍕") // Emoji :pizza:
  .replace(/:burger:/g, "🍔") // Emoji :burger:
  .replace(/:french_fries:/g, "🍟") // Emoji :french_fries:
  .replace(/:hot_dog:/g, "🌭") // Emoji :hot_dog:
  .replace(/:pop_corn:/g, "🍿") // Emoji :pop_corn:
  .replace(/:salt:/g, "🧂") // Emoji :salt:
  .replace(/:bacon:/g, "🥓") // Emoji :bacon:
  .replace(/:egg:/g, "🥚") // Emoji :egg:
  .replace(/:waffle:/g, "🧇") // Emoji :waffle:
  .replace(/:pancake:/g, "🥞") // Emoji :pancake:
  .replace(/:butter:/g, "🧈") // Emoji :butter:
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
  .replace(/:100:/g, "💯") // Emoji :100:
  .replace(/:gift:/g, "🎁") // Emoji :gift:
  .replace(/:skull:/g, "💀") // Emoji :skull:
   // Gestes
   .replace(/:down_finger:/g, "👇") // Emoji :down_finger:
   .replace(/:left_finger:/g, "👈") // Emoji :left_finger:
   .replace(/:right_finger:/g, "👉") // Emoji :right_finger:
   .replace(/:fingers_crossed:/g, "🤞") // Emoji :fingers_crossed:
   .replace(/:middle_finger:/g, "🖕") // Emoji :middle_finger:
   .replace(/:hand_shake:/g, "👋") // Emoji :hand_shake:
   .replace(/:ok:/g, "👌"); // Emoji :ok:

		term("\nEnvoie du tweet..."); // Message pour dire que le tweet s'envoie
		T.post('statuses/update', { status: input }, function(err, data, response){ // Tweeter le tweet
		// Si il n'y a pas d'erreur
		if(!err){
		    term("\nTweet envoyé..."); // Dire que le tweet est envoyé
		    term("\nLien du tweet : ") + term.cyan(`https://twitter.com/${ data.user.screen_name }/status/${ data.id_str }\n`); // Donner le lien du tweet
        clipboardy.writeSync(`https://twitter.com/${ data.user.screen_name }/status/${ data.id_str }`); // Copier le lien du tweet dans le presse papier
		    process.exit(); // Arrêter le processus
		} else {
		   // Si il y a une erreur

       // Détection de l'erreur
       if(err.message === "Status is a duplicate."){
        var error = "Un tweet contenant le même contenu est déjà existant. | Code erreur #9";
      } else {
      if(err.message === "Missing required parameter: status."){
        var error = "Votre tweet contient un caractère invalide ou est vide. | Code erreur #10";
      } else {
        if(err.message === "Tweet needs to be a bit shorter."){
          var error = "Votre tweet est trop long. | Code erreur #11";
        } else {
          if(err.message === "Read-only application cannot POST."){
            var error = "Votre application est en Read only, Pour utiliser Twitterminal vous avez besoin de la passer en \"Read and write\" via le Developer Portal de Twitter. | Code erreur #4"
          } else {
            var error = "Une erreur inconnue s'est produite, Vérifier votre connexion internet et/ou les permissions de votre app Twitter. Pour plus d'aide, Veuillez me contacter sur Twitter (@Johan_Perso). | Code erreur #2";
          }
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
  fetch('https://raw.githubusercontent.com/johan-perso/twitterminal/old/replace-text.md')
    .then(res => res.text())
    .then(body => {
      const markdownChalk = require('markdown-chalk'); // https://www.npmjs.com/package/markdown-chalk
      console.log(markdownChalk(body) + "\nAccessible à cette adresse : https://github.com/johan-perso/twitterminal/blob/old/replace-text.md");
      clipboardy.writeSync("https://github.com/johan-perso/twitterminal/blob/old/replace-text.md"); // Copier le lien dans le presse papier
      process.exit(); // Arrêter le processus
    });
}

// gif = Recherche de gif
function gif(){
  term("Entrer quelque chose à rechercher sur Tenor : "); // Demande de texte
  term.inputField(function(error, inputGif){
    // Remplacement des caractères invalides
    var gifSearch = inputGif
    .replace(/é/g, "e")
    .replace(/è/g, "e")
    .replace(/à/g, "a")
    .replace(/ê/g, "e")
    .replace(/ù/g, "u")
    .replace(/`/g, "")
    .replace(/\\/g, " ");

  // Fetch des gifs via l'API de Tenor
    fetch('https://api.tenor.com/v1/search?q=' + gifSearch + '&key=LIVDSRZULELA&limit=15')
        .then(res => res.json())
        .then(json => {
          console.log("\n\n" + json.results[0].url);
          console.log(json.results[1].url);
          console.log(json.results[2].url);
          console.log(json.results[3].url);
          console.log(json.results[4].url);
          console.log(json.results[5].url);
          console.log(json.results[6].url);
          console.log(json.results[7].url);
          console.log(json.results[8].url);
          console.log(json.results[9].url);
          console.log(json.results[10].url);
          console.log(json.results[11].url);
          console.log(json.results[12].url);
          console.log(json.results[13].url);
          console.log(json.results[14].url);
          clipboardy.writeSync(json.results[0].url); // Copier le lien du premier gif dans le presse papier
          process.exit(); // Arrêter le processus
  }).catch(err => {
    // En cas d'erreur, Arrêter le processus
    process.exit();
  });
  });

}

// tweetImageFirst = Tweeter une image avec le compte principal
function tweetImageFirst(){
var term = require('terminal-kit').terminal;
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

term('Choissisez une image (.png / .jpg / .jpeg / .gif) : '); // Demande de choix de fichier

term.fileInput({baseDir: ''},
	function(error, input){
		if (error)
		{
      // Si il y a une erreur, Le dire
			term.red("\nUne erreur inconnu s'est produite : " + error + "\n\nVeuillez contactez Johan#8021 / @Johan_Perso avec une capture d'écran de l'erreur complète. | Code erreur #12");
		}
		else
		{
      // Si il n'y a pas d'erreur, Dire le chemin du fichier
			term.white("\nVotre fichier : ");
      term.cyan(input + "\n")
    }

    // Regarddez l'état du fichier (Vérifiez si il existe)
    fs.readFile(input,  'utf8', function(err, data) {
      if(err){
        term.red("Une erreur inconnu s'est produite, Vérifiez que l'image au chemin " + input + " existe et que l'image est au format .png / .jpg / .jpeg / .gif (Les autres formats ne sont pas pris en charge par Twitter) | Code erreur #14")
        process.exit()
      }
    })

    // Vérifiez le nom du fichier (Pour n'avoir que les .png / .jpg / .jpeg / .gif)
    if(input.includes(".png")){

    } else {
      if(input.includes(".jpg")){

      } else {
        if(input.includes(".jpeg")){

        } else {
          if(input.includes(".gif")){

          } else {
            term.red("Votre fichier doit être une image au format .png / .jpg / .jpeg / .gif | Code erreur #13")
            process.exit()
          }
        }
      }
    }

    // Encoder le fichier en base64
    var b64content = fs.readFileSync(input, { encoding: 'base64' })

    // Envoyer le fichier à Twitter
T.post('media/upload', { media_data: b64content }, function (err, data, response) {
  var mediaIdStr = data.media_id_string
  var altText = "no altText."
  var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }

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
  .replace(/:frog:/g, "🐸") // Emoji :frog:
  .replace(/:tiger:/g, "🐯") // Emoji :tiger:
  .replace(/:monkey:/g, "🐵") // Emoji :monkey:
  .replace(/:zebra:/g, "🦓") // Emoji :zebra:
  .replace(/:hamster:/g, "🐹") // Emoji :hamster:
  .replace(/:cow:/g, "🐮") // Emoji :cow:
  .replace(/:rabbit:/g, "🐰") // Emoji :rabbit:
  .replace(/:bear:/g, "🐻") // Emoji :bear:
  .replace(/:koala:/g, "🐨") // Emoji :koala:
  .replace(/:elephant:/g, "🐘") // Emoji :elefant:
  .replace(/:dragon:/g, "🐲") // Emoji :dragon:
  .replace(/:racoon:/g, "🦝") // Emoji :racoon:
  .replace(/:horse:/g, "🐴") // Emoji :horse:
  .replace(/:unicorn:/g, "🦄") // Emoji :unicorn:
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
  // Nourriture
  .replace(/:pizza:/g, "🍕") // Emoji :pizza:
  .replace(/:burger:/g, "🍔") // Emoji :burger:
  .replace(/:french_fries:/g, "🍟") // Emoji :french_fries:
  .replace(/:hot_dog:/g, "🌭") // Emoji :hot_dog:
  .replace(/:pop_corn:/g, "🍿") // Emoji :pop_corn:
  .replace(/:salt:/g, "🧂") // Emoji :salt:
  .replace(/:bacon:/g, "🥓") // Emoji :bacon:
  .replace(/:egg:/g, "🥚") // Emoji :egg:
  .replace(/:waffle:/g, "🧇") // Emoji :waffle:
  .replace(/:pancake:/g, "🥞") // Emoji :pancake:
  .replace(/:butter:/g, "🧈") // Emoji :butter:
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
  .replace(/:100:/g, "💯") // Emoji :100:
  .replace(/:gift:/g, "🎁") // Emoji :gift:
  .replace(/:skull:/g, "💀") // Emoji :skull:
   // Gestes
   .replace(/:down_finger:/g, "👇") // Emoji :down_finger:
   .replace(/:left_finger:/g, "👈") // Emoji :left_finger:
   .replace(/:right_finger:/g, "👉") // Emoji :right_finger:
   .replace(/:fingers_crossed:/g, "🤞") // Emoji :fingers_crossed:
   .replace(/:middle_finger:/g, "🖕") // Emoji :middle_finger:
   .replace(/:hand_shake:/g, "👋") // Emoji :hand_shake:
   .replace(/:ok:/g, "👌"); // Emoji :ok:

// J'ai copier coller un exemple de la doc de twit donc j'ai aucune idée de ce que c'est ça mdrr
  T.post('media/metadata/create', meta_params, function (err, data, response) {
    if (!err) {
      var params = { status: input, media_ids: [mediaIdStr] }

      // Faire un tweet
      T.post('statuses/update', params, function (err, data, response) {
        term("\nEnvoie du tweet..."); // Message pour dire que le tweet s'envoie
                // Si il n'y a pas d'erreur
                if(!err){
                  term("\nTweet envoyé..."); // Dire que le tweet est envoyé
                  term("\nLien du tweet : ") + term.cyan(`https://twitter.com/${ data.user.screen_name }/status/${ data.id_str }\n`); // Donner le lien du tweet
                  clipboardy.writeSync(`https://twitter.com/${ data.user.screen_name }/status/${ data.id_str }`); // Copier le lien du tweet dans le presse papier
                  process.exit(); // Arrêter le processus
              } else {
                 // Si il y a une erreur

                  // Détection de l'erreur
                  if(err.message === "Status is a duplicate."){
                    var error = "Un tweet contenant le même contenu est déjà existant. | Code erreur #9";
                  } else {
                  if(err.message === "Missing required parameter: status."){
                    var error = "Votre tweet contient un caractère invalide ou est vide. | Code erreur #10";
                  } else {
                    if(err.message === "Tweet needs to be a bit shorter."){
                      var error = "Votre tweet est trop long. | Code erreur #11";
                    } else {
                      if(err.message === "Read-only application cannot POST."){
                        var error = "Votre application est en Read only, Pour utiliser Twitterminal vous avez besoin de la passer en \"Read and write\" via le Developer Portal de Twitter. | Code erreur #4"
                      } else {
                        var error = "Une erreur inconnue s'est produite, Vérifier votre connexion internet et/ou les permissions de votre app Twitter. Pour plus d'aide, Veuillez me contacter sur Twitter (@Johan_Perso). | Code erreur #2";
                      }
                    }
                  }
                  }

                  // Affichage de l'erreur
                  term.red("\nErreur de Twitter : " + err.message + "\n");
                  term.red("Erreur détecté par Twitterminal : " + error + "\n");
                  return process.exit(); // Arrêter le processus
              }

      })
    }
  })
})
});
}
)
}
);
}

function tweetImageSecond(){
   term.red("La fonctionnalité d'envoi d'images sur le compte secondaire n'est pas encore disponible.")
   process.exit()
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
    if(!config.consumer_key2 | !config.consumer_secret2 | !config.access_token2 | !config.access_token_secret2) return; // Vérification des champs 2 du fichier de config et si c'est vide : Ne pas utiliser le second compte
		numberInput++;
		tweetSecond();
	}
});

term.on('key', function(name, matches, data){
  // Si ENTER 300 fois : Easter egg
  if (name === 'ENTER'){
    numberInput++;
    if(numberInput != 300) return;
    term("Pauvre touche...\n");
    process.exit()
  }
  });

term.on('key', function(name, matches, data){
  // Si C : Tweeter une image avec le compte principal
	if (name === 'c'){
		if(numberInput !== 0) return;
		numberInput++;
		tweetImageFirst();
	}
});

term.on('key', function(name, matches, data){
  // Si D : Tweeter une image avec le second compte
	if (name === 'd'){
		if(numberInput !== 0) return;
    if(!config.consumer_key2 | !config.consumer_secret2 | !config.access_token2 | !config.access_token_secret2) return; // Vérification des champs 2 du fichier de config et si c'est vide : Ne pas utiliser le second compte
		numberInput++;
		tweetImageSecond();
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

term.on('key', function(name, matches, data){
  // Si G : Utiliser la recherche de gif
	if (name === 'g'){
		if(numberInput !== 0) return;
		numberInput++;
		gif();
	}
});

term.grabInput(true);
term.on('key', function(name, matches, data){
  // Si CTRL_Z : Arrêtez le processus
	if (name === 'CTRL_Z'){
		process.exit();
	}
  // Si CTRL_C : Arrêtez le processus
	if (name === 'CTRL_C'){
		process.exit();
	}
  // Si CTRL_D : Arrêtez le processus
	if (name === 'CTRL_D'){
		process.exit();
	}
  });

}).catch(err => {
  // En cas d'erreur avec le système de détéction des majs
  term.red("Il est impossible de récuperer les informations de mise à jour, Vérifiez votre connexion internet et si Github est down. Si le problème continue, Veuillez me contactez (Discord : Johan#8021     |     Twitter : @Johan_Perso). | Code erreur #15")
  process.exit()
});
