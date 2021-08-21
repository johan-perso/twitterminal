#!/usr/bin/env node

// Importer les fonctions locales de Twitterminal
var fetch = require('./functions/fetch.js')
var errorCheck = require('./functions/errorCheck.js')
var configurateur = require('./functions/config.js')
var writeClipboard = require('./functions/writeClipboard.js')
var replaceText = require('./functions/replaceText.js')

// Importer quelques modules / fichiers locales
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');
const chalk = require('chalk');
const term = require('terminal-kit').terminal;
const updateNotifier = require('update-notifier');
const moment = require('moment');
const boxen = require('boxen');
const ora = require('ora');
const open = require('open');
const internetAvailable = require("internet-available");
const Conf = require('conf');
const config = new Conf({projectName: "twitterminal", projectSuffix: ""});
const pkg = require('./package.json');

// Préparer un spinner
const spinner = ora('')

// Changer le nom de la fenêtre
require('./functions/termName.js').default()

// Système de mise à jour
const notifier = updateNotifier({ pkg, updateCheckInterval: 10 });

if (notifier.update && pkg.version !== notifier.update.latest){
	console.log(boxen("Mise à jour disponible " + chalk.dim(pkg.version) + chalk.reset(" → ") + chalk.green(notifier.update.latest) + "\n" + chalk.cyan("npm i -g " + pkg.name) + " pour mettre à jour", {
		padding: 1,
		margin: 1,
		align: 'center',
		borderColor: 'yellow',
		borderStyle: 'round'
	}))
}

// Accèder a des valeurs de la config
    // Information du compte
    let account = config.get('account')
	if(!account || account && !account.name) config.set({ 'account.name': '' });
	if(!account || account && !account.consumer_key) config.set({ 'account.consumer_key': '' });
	if(!account || account && !account.consumer_secret) config.set({ 'account.consumer_secret': '' });
	if(!account || account && !account.access_token) config.set({ 'account.access_token': '' });
	if(!account || account && !account.access_token_secret) config.set({ 'account.access_token_secret': '' });

// Vérifier si on est connecté à internet
async function checkInternet(start){
	return new Promise((resolve, reject) => {
		// Afficher un spinner
		if(start === true){
			spinner.text = " Vérification de votre connexion..."
			spinner.start()
		}

		// Vérifier la connexion
		internetAvailable({
			timeout: 5000,
			retries: 10,
			domainName: "twitter.com",
		}).then(() => {
			// Si on dois démarrer Twitterminal
			if(start === true){
				// Arrêter le spinner
				spinner.text = " Vérification de votre connexion"
				spinner.color = "green"
				spinner.stop()

				// Démarrer Twitterminal
				main()
			}
			if(start === false) resolve()
		}).catch(() => {
			// Arrêter le spinner (avec un avertissement)
			spinner.text = " Impossible de se connecter à Twitter : vérifier votre connexion."
			spinner.color = "red"
			spinner.fail()

			// Démarrer Twitterminal tout de même
			if(start === true){
				setTimeout(function () { console.log("\n") }, 2000)
				setTimeout(function () { main() }, 1800)
			}

			// Si on dois pas démarrer, arrêter tout
			if(start === false) setTimeout(function () { process.exit() }, 200)
		})
	})
}

// Définir les paramètres oauth
const oauth = OAuth({
	consumer: {
		key: account.consumer_key,
		secret: account.consumer_secret,
	},
	signature_method: 'HMAC-SHA1',
	hash_function(base_string, key) {
		return crypto
			.createHmac('sha1', key)
			.update(base_string)
			.digest('base64')
	},
})

// Définir les informations du token
const token = {
	key: account.access_token,
	secret: account.access_token_secret,
}

// Faire un tweet
async function tweet(){
	// Changer le nom de la fenêtre
	require('./functions/termName.js').set("Tweet")

	// Demander du texte
	term("\nContenu du tweet : ")
	term.inputField(async function(error, input){
		// En cas d'erreur
		if(error) return console.log(chalk.red("Impossible d'obtenir votre choix.") + chalk.cyan(" (Code erreur #1.1)")) && process.exit()

		// Si aucun texte donné
		if(!input) return console.log(chalk.red("Impossible de tweeter : Vous devez entrer du texte.") + chalk.cyan(" (Code erreur #1.2)")) && process.exit()

		// Afficher un spinner
		spinner.text = "Tweet en cours de publication...";
		spinner.start();

		// Préparer twitter-lite
		var Twitter = require('twitter-lite');
		const client = new Twitter({
			subdomain: "api",
			version: "1.1",
			consumer_key: account.consumer_key,
			consumer_secret: account.consumer_secret,
			access_token_key: account.access_token,
			access_token_secret: account.access_token_secret
		});

		// Poster le tweet
		var tweet = await client.post("statuses/update", { status: await(replaceText.tweet(input)) })
			// Une fois le tweet posté
			.then(results => {
				writeClipboard(`https://twitter.com/${results.user.screen_name}/status/${results.id_str}`)
				spinner.text = "Tweet publié avec succès : " + chalk.cyan(`https://twitter.com/${results.user.screen_name}/status/${results.id_str}`);
				spinner.succeed()
				process.exit()
			})
			// Si y'a une erreur
			.catch(async err => {
				// Arrêter le spinner
				spinner.stop()

				// Obtenir des informations via un check, puis les donner
				var error = await (errorCheck(err))
				if(error.error === true) return console.log(chalk.red("Impossible de tweeter : " + error.frenchDescription) + chalk.cyan(" (Code erreur #" + error.code + ")"))

				// Sinon, donner l'erreurs comme Twitter la donne
				return console.log(chalk.red(err.errors))
			});
	})
}

// Faire un thread
async function thread(){
	// Vérfier la connexion internet
	await checkInternet(false)

	// Changer le nom de la fenêtre
	require('./functions/termName.js').set("Thread")

	// Demander du texte
	term("\nContenu du thread : ")
	term.inputField(async function(error, input){
		// En cas d'erreur
		if(error) return console.log(chalk.red("Impossible d'obtenir votre choix.") + chalk.cyan(" (Code erreur #2.1)")) && process.exit()

		// Si aucun texte donné
		if(!input) return console.log(chalk.red("Impossible de tweeter : Vous devez entrer du texte.") + chalk.cyan(" (Code erreur #2.2)")) && process.exit()

		// Sauter une ligne
		console.log("")

		// Afficher un spinner
		spinner.text = " Thread en cours de publication...";
		spinner.start();

		// Préparer twitter-lite
		var Twitter = require('twitter-lite');
		const client = new Twitter({
			subdomain: "api",
			version: "1.1",
			consumer_key: account.consumer_key,
			consumer_secret: account.consumer_secret,
			access_token_key: account.access_token,
			access_token_secret: account.access_token_secret
		});

		// Obtenir un array des tweets
		var threadArray = (await (replaceText.tweet(input))).match(/.{1,251}/g)

		// Préparer quelques variables
		let lastTweetID = "";
		let firstTweet = "";

		// A chaque tweet dans l'array'
		for (var status of threadArray) {
			// Remplacer les textes du tweet
			var status = await replaceText.tweet(status)

			// Si le tweet n'est pas le dernier de la liste, ajouter des points de suspensions
			if(threadArray.indexOf(status) + 1 !== threadArray.length) var statusTW = status + "..."

			// Poster le tweet
			const tweet = await client.post("statuses/update", {
				status: `${statusTW || status} [${threadArray.indexOf(status) + 1}/${threadArray.length}]`.replace(/\\n/g, "\n").replace(/%JUMP%/g, "\n"),
				in_reply_to_status_id: lastTweetID,
				auto_populate_reply_metadata: true
		  	})
			// En cas d'erreur
			.catch (async err => {
				// Arrêter le spinner
				spinner.stop()

				// Obtenir des informations via un check, puis les donner
				var error = await (errorCheck(err))
				if(error.error === true) return console.log(chalk.red("Impossible de tweeter : " + error.frenchDescription) + chalk.cyan(" (Code erreur #" + error.code + ")"))

				// Sinon, donner l'erreur comme Twitter la donne
				console.log(chalk.red(err));

				// Arrêter le processus
				return process.exit()
			});

			// Une fois le tweet posté...
				// Si c'est le premier tweet
				if(threadArray.indexOf(status) === 0){
					// Modifier le presse-papier
					writeClipboard(`https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`)
					
					// Modifier le spinner
					spinner.text = " Thread en cours de publication : " + chalk.cyan(`https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`);
					spinner.start()
					
					// Définir que le premier tweet est... le premier tweet
					firstTweet = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`;
				}

				// Si c'est le dernier tweet
				if(threadArray.indexOf(status) + 1 === threadArray.length){
					// Modifier le spinner
					spinner.text = " Thread publié avec succès : " + chalk.cyan(firstTweet);
					spinner.succeed()

					// Arrêter le processus
					process.exit()
				}
				
			// Modifier l'id du dernier tweet
			lastTweetID = tweet.id_str;
		}
	})
}

// Vérifier le compte
async function checkAccount(){
	// Obtenir les informations du compte
	var accountInfo = await fetch({url: 'https://api.twitter.com/1.1/account/verify_credentials.json', method: 'GET'}, oauth, token)

	// Vérifiez si l'information contient une erreur
	var error = await (errorCheck(accountInfo))
	if(error.error === true) return console.log(chalk.red("Impossible de se connecter à votre compte Twitter : " + error.frenchDescription) + chalk.cyan(" (Code erreur #" + error.code + ")"))

	// On dit "bonjour", "bonsoir" ou "bonne année"
	if(moment().format("DD MM") === "31 12") var greet = "Bonne année "; else if(moment().hour() > 17) var greet = "Bonsoir "; else var greet = "Bonjour "

	// Changer le nom de la fenêtre
	require('./functions/termName.js').set("Accueil")

	// Mettre un message de bienvenue
	console.log(greet + chalk.cyan(accountInfo.name) + " !\n(Connecté en tant que " + chalk.cyan("@" + accountInfo.screen_name) + ")")
	console.log(chalk.yellow("[-----------------------------------------------]"))
}

// Obtenir des informations sur un profil
async function showProfil(){
	// Vérfier la connexion internet
	await checkInternet(false)

	// Changer le nom de la fenêtre
	require('./functions/termName.js').set("Profil")

	// Demander un pseudo
	term("\nObtenir le profil de : @")
	term.inputField(async function(error, input){
		// En cas d'erreur
		if(error) return console.log(chalk.red("Impossible d'obtenir votre choix.") + chalk.cyan(" (Code erreur #3.1)")) && process.exit()

		// Afficher un spinner
		spinner.text = "Obtention du profil...";
		spinner.start();

		// Si y'a pas de pseudo entré, obtenir les informations de soi-même
		if(!input){
			// Obtenir les informations du compte
			var accountInfo = await fetch({url: 'https://api.twitter.com/1.1/account/verify_credentials.json', method: 'GET'}, oauth, token)

			// Arrêter le spinner
			spinner.stop()

			// Vérifiez si l'information contient une erreur
			var error = await (errorCheck(accountInfo))
			if(error.error === true) return console.log(chalk.red("\nImpossible d'obtenir votre profil : " + error.frenchDescription) + chalk.cyan(" (Code erreur #" + error.code + ")"))
		}

		// Si y'a un pseudo entré, obtenir les informations de ce pseudo
		if(input){
			// Obtenir les informations du compte souhaité
			var accountInfo = await fetch({url: 'https://api.twitter.com/1.1/users/show.json?screen_name=' + input.replace(/&/g, encodeURIComponent("&#38;")).replace(/\?/g, encodeURIComponent("&#63;")), method: 'GET'}, oauth, token)

			// Arrêter le spinner
			spinner.stop()

			// Vérifiez si l'information contient une erreur
			var error = await (errorCheck(accountInfo))
			if(error.error === true) return console.log(chalk.red("\nImpossible d'obtenir le profil : " + error.frenchDescription) + chalk.cyan(" (Code erreur #" + error.code + ")")) && process.exit()
		}

		// Afficher des informations
			// Afficher un badge certifié ou non
			if(accountInfo.verified === true) var certif = "✔ "
			if(accountInfo.verified === false) var certif = ""

			// Afficher un badge protégé (compte privé) ou non
			if(accountInfo.protected === true) var protected = "🔐 "
			if(accountInfo.protected === false) var protected = ""

			// Afficher des éléments
			console.log("\n") // Séparateur de catégorie
			term.bold.underline("Basique") // Catégorie
			term.bold("\nNom : ") && term((accountInfo.name) ? certif + protected + accountInfo.name : 'Inconnu')
			term.bold("\n@Pseudo : ") && term((accountInfo.screen_name) ? accountInfo.screen_name : 'Inconnu')
			term("\n") && term.bold("\nID : ") && term((accountInfo.id) ? accountInfo.id : 'Inconnu')
			term.bold("\nID_STR : ") && term((accountInfo.id_str) ? accountInfo.id_str : 'Inconnu')

			console.log("\n\n") // Séparateur de catégorie
			term.bold.underline("Supplémentaire") // Catégorie
			term.bold("\nLocalisation : ") && term((accountInfo.location) ? accountInfo.location : 'Inconnu')
			term.bold("\nURL : ") && term((accountInfo.url) ? accountInfo.url : 'Inconnu')
			term.bold("\nDescription : ") && term((accountInfo.description) ? accountInfo.description : 'Inconnu')
			term.bold("\nCréation du compte : ") && term(moment(new Date(accountInfo.created_at)).format('D MMMM YYYY').toLowerCase().replace("january", "janvier")
			.replace("february", "février").replace("march", "mars").replace("april", "avril").replace("may", "mai").replace("june", "juin").replace("july", "juillet")
			.replace("august", "août").replace("september", "septembre").replace("october", "octobre").replace("november", "novembre").replace("december", "décembre") || "inconnu")

			console.log("\n\n") // Séparateur de catégorie
			term.bold.underline("Nombres") // Catégorie
			term.bold("\nAbonnés : ") && term((accountInfo.followers_count) ? accountInfo.followers_count : '0')
			term.bold("\nAbonnements : ") && term((accountInfo.friends_count) ? accountInfo.friends_count : '0')
			term.bold("\nListe crée : ") && term((accountInfo.listed_count) ? accountInfo.listed_count : '0')
			term.bold("\nTweet : ") && term((accountInfo.statuses_count) ? accountInfo.statuses_count : '0')
			term.bold("\nTweet liké : ") && term((accountInfo.favourites_count) ? accountInfo.favourites_count : '0')

			// Proposer d'ouvrir des choses dans un navigateur
				// Afficher un texte
				term.bold("\n\nCertaines actions ne peuvent pas être réalisé dans un terminal. Souhaitez-vous les effectuer dans un navigateur ?")

				// Liste des options
				if(accountInfo.status) var options = ["Voir le dernier tweet","Voir le profil","Annuler"]
				if(!accountInfo.status) var options = ["Voir le profil","Annuler"]

				// Afficher un menu
				term.singleColumnMenu(options, async function(error, response){
					// "Voir le dernier tweet"
					if(response.selectedText === "Voir le dernier tweet") await open("http://twitter.com/" + accountInfo.screen_name + "/status/" + accountInfo.status.id_str)

					// "Voir le profil"
					if(response.selectedText === "Voir le profil") await open("https://twitter.com/" + accountInfo.screen_name)

					// "Annuler"
					if(response.selectedText === "Annuler") return process.exit()
				})
	});
}

// Afficher le menu principal de Twitterminal
async function main(){
	await checkAccount()

	console.log("Que voulez-vous faire ?")
	term.singleColumnMenu(["Tweeter", "Crée un thread", "Profil", "Configuration", "Sortir"], function(error, response){
		// Option choisis
		if(response.selectedIndex === 0) var option = "tweet"
		if(response.selectedIndex === 1) var option = "thread"
		if(response.selectedIndex === 2) var option = "profil"
		if(response.selectedIndex === 3) var option = "config"
		if(response.selectedIndex === 4) var option = "stop"

		// Si l'option est "tweet"
		if(option === "tweet") return tweet()

		// Si l'option est "thread"
		if(option === "thread") return thread()

		// Si l'option est "profil"
		if(option === "profil") return showProfil()

		// Si l'option est "config"
		if(option === "config") return configurateur()

		// Si l'option est "stop"
		if(option === "stop") return process.exit()
	});
}

// Vérfier la connexion internet (l'affichage du menu principal est gérer par cette fonction)
checkInternet(true)

// Ecouter les appuis de touche
term.grabInput(true);
term.on('key', function(name){
    // Arrêter le processus avec CTRL_Z ou CTRL_C
    if(name === 'CTRL_Z' || name === 'CTRL_C'){
		// Sauter quelques lignes (au cas où on est dans un menu)
		console.log("\n\n")

		// Arrêter un spinner si il est en cours
		spinner.stop()

        // Arrêter le processus
        process.exit()
    } 
});