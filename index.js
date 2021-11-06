#!/usr/bin/env node

// Importer les fonctions locales de Twitterminal
var replaceText = require('./functions/replaceText.js')
var fetch = require('./functions/fetch.js')
var errorCheck = require('./functions/errorCheck.js')
var writeClipboard = require('./functions/writeClipboard.js')

// Importer quelques modules / fichiers locales
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');
const chalk = require('chalk');
const updateNotifier = require('update-notifier');
const moment = require('moment');
const boxen = require('boxen');
const ora = require('ora'); const spinner = ora('');
const open = require('open');
const inquirer = require('inquirer');
const Conf = require('conf');
const config = new Conf({projectName: "twitterminal", projectSuffix: ""});
const pkg = require('./package.json');

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

	// Version de la configuration
	if(!(config.get('configVersion'))) config.set('configVersion', pkg.version);
	if((config.get('configVersion')) !== pkg.version) config.set('configVersion', pkg.version);

// Définir oauth
const oauth = OAuth({
	consumer: {
		key: account?.consumer_key,
		secret: account?.consumer_secret,
	},
	signature_method: 'HMAC-SHA1',
	hash_function(base_string, key){
		return crypto.createHmac('sha1', key).update(base_string).digest('base64')
	},
})

// Définir les informations du token
const token = {
	key: account?.access_token,
	secret: account?.access_token_secret,
}

// Fonction pour vérifier le compte
async function checkAccount(){
	// Obtenir les informations du compte
	var accountInfo = await fetch({url: 'https://api.twitter.com/1.1/account/verify_credentials.json', method: 'GET'}, oauth, token)

	// Vérifiez si l'information contient une erreur
	var error = await (errorCheck(accountInfo))
	if(error.error === true) return console.log(chalk.red(`Impossible de se connecter à votre compte Twitter : ${error.frenchDescription}`) + chalk.cyan(` (Code erreur #${error.code})`))

	// On dit "bonjour", "bonsoir" ou "bonne année"
	if(moment().format("DD MM") === "31 12") var greet = "Bonne année "; else if(moment().hour() > 17) var greet = "Bonsoir "; else var greet = "Bonjour "

	// Mettre un message de bienvenue
	console.log(greet + chalk.cyan(accountInfo.name) + " !\n(Connecté en tant que " + chalk.cyan("@" + accountInfo.screen_name) + ")")
	console.log(chalk.yellow("[-----------------------------------------------]"))
}

// Fonction à executer au premier démarrage
function firstStart(){
	// Afficher des messages
	console.log(chalk.bold("Hmm salutation cher entrepreneur !"))
	console.log("Bienvenue à toi dans Twitterminal 👋")
	console.log("Twitterminal permet d'intéragir avec Twitter depuis son terminal...\n")

	// Afficher un menu
	inquirer.prompt([
		{
			type: 'list',
			name: 'action',
			message: 'Que voulez-vous faire ?',
			choices: [
				'Se connecter',
				'Importer une configuration',
				'Sortir'
		]
		}
	])
	.then(answer => {
		if(answer.action.toLowerCase() === "se connecter") return require('./functions/configOauth.js')()
		if(answer.action.toLowerCase() === "importer une configuration") return require('./functions/config.js')("importConfig")
		if(answer.action.toLowerCase() === "sortir") return process.exit()
	});
}

// Vérifier si Twitterminal a déjà été démarré
async function checkFirstStart(){
	var notFirstStart = config.get('not_first_start')
	if(!notFirstStart || notFirstStart === false) return true; else return false;
}

// Fonction principale
main()
async function main(){
	// Vérifier la connexion, si Twitterminal a déjà été démarré et le compte
	if(await require('./functions/checkInternet.js')() === false) console.log(chalk.red(`Oupsi, Je n'ai pas l'impression que tu as accès à internet..`)) & process.exit();
	if((await checkFirstStart()) === true) return firstStart()
	await checkAccount()

	// Afficher un menu
	inquirer.prompt([
		{
			type: 'list',
			name: 'action',
			message: 'Que voulez-vous faire ?',
			choices: [
				'Tweeter',
				'Créer un thread',
				'Profil',
				'Configuration'
			]
		}
	])
	.then(answer => {
		if(answer.action.toLowerCase() === "tweeter") return tweet()
		if(answer.action.toLowerCase() === "créer un thread") return thread() 
		if(answer.action.toLowerCase() === "profil") return showProfil()
		if(answer.action.toLowerCase() === "configuration") return require('./functions/config.js')()
	});
}

// Fonction pour tweeter
async function tweet(){
	// Obtenir le contenu du texte à tweeter
	var tweetContent = await inquirer.prompt([
		{
			type: 'input',
			name: 'tweetContent',
			message: 'Contenu du tweet',
			validate(text) {
				if (text.length < 1) { return 'Veuillez entrer un texte' }
				if (text.length > 255) { return `Ce texte est trop grand (${text.length} caractères)` }
				return true;
			}
		}
	])
	var tweetContent = tweetContent.tweetContent

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
	var tweet = await client.post("statuses/update", { status: await(replaceText.tweet(tweetContent)) })
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
			if(error.error === true) return console.log(chalk.red(`Impossible de tweeter : ${error.frenchDescription}`) + chalk.cyan(` (Code erreur #${error.code})`))

			// Sinon, donner l'erreurs comme Twitter la donne
			return console.log(chalk.red(err.errors || err))
		});
}

// Fonction pour crée un thread
async function thread(){
	// Disclaimer
	console.log(chalk.dim(`(La fonctionnalité de thread est encore en bêta)`))

	// Obtenir le contenu du texte à tweeter
	var tweetContent = await inquirer.prompt([
		{
			type: 'input',
			name: 'tweetContent',
			message: 'Contenu du tweet',
			validate(text) {
				if (text.length < 1) { return 'Veuillez entrer un texte' }
				if (text.length > 9999) { return `Ce texte est trop grand (${text.length} caractères, max 9999 caractères)` }
				return true;
			}
		}
	])
	var tweetContent = tweetContent.tweetContent

	// Afficher un spinner
	spinner.text = "Thread en cours de publication...";
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
	var threadArray = (await (replaceText.tweet(tweetContent))).match(/.{1,251}/g)

	// Préparer quelques variables
	let lastTweetID = "";
	let firstTweet = "";

	// A chaque tweet dans l'array
	threadArray.forEach(async status => {
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
		.catch(async err => {
			// Arrêter le spinner
			spinner.stop()

			// Obtenir des informations via un check, puis les donner
			var error = await (errorCheck(err))
			if(error.error === true) return console.log(chalk.red("Impossible de tweeter : " + error.frenchDescription) + chalk.cyan(" (Code erreur #" + error.code + ")"))

			// Sinon, donner l'erreur comme Twitter la donne
			console.log(chalk.red(err.errors || err))

			// Arrêter le processus
			return process.exit()
		});

		// Une fois le tweet posté...
			// Si c'est le premier tweet
			if(threadArray.indexOf(status) === 0){
				// Modifier le presse-papier
				writeClipboard(`https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`)

				// Modifier le spinner
				spinner.text = "Thread en cours de publication : " + chalk.cyan(`https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`);
				spinner.start()

				// Définir que le premier tweet est... le premier tweet
				firstTweet = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`;
			}

			// Si c'est le dernier tweet
			if(threadArray.indexOf(status) + 1 === threadArray.length){
				// Modifier le spinner
				spinner.text = `Thread publié avec succès : ${chalk.cyan(firstTweet)}`
				spinner.succeed()

				// Arrêter le processus
				process.exit()
			}

		// Modifier l'id du dernier tweet
		lastTweetID = tweet.id_str;
	})
}

// Fonction pour afficher un profil
async function showProfil(){
	var username = await inquirer.prompt([
		{
			type: 'input',
			name: 'username',
			message: 'Entrer un nom d\'utilisateur'
		}
	])
	var username = username.username

	// Afficher un spinner
	if(!username) spinner.text = 'Obtention de votre profil...'
	if(username) spinner.text = `Obtention du profil de ${chalk.cyan(`@${username}`)}...`
	spinner.start()

	// Si y'a pas de pseudo donné : obtenir les informations sur soi-même
	if(!username){
		// Obtenir les informations du compte
		var accountInfo = await fetch({url: 'https://api.twitter.com/1.1/account/verify_credentials.json', method: 'GET'}, oauth, token)

		// Arrêter le spinner
		spinner.stop()

		// Vérifiez si l'information contient une erreur
		var error = await (errorCheck(accountInfo))
		if(error.error === true) return console.log(chalk.red(`\nImpossible d'obtenir votre profil : ${error.frenchDescription}`) + chalk.cyan(` (Code erreur #${error.code})`))
	}

	// Si y'a un pseudo donné : obtenir les informations sur ce pseudo
	if(username){
		// Obtenir les informations du compte souhaité
		var accountInfo = await fetch({url: 'https://api.twitter.com/1.1/users/show.json?screen_name=' + username.replace(/&/g, encodeURIComponent("&#38;")).replace(/\?/g, encodeURIComponent("&#63;")), method: 'GET'}, oauth, token)

		// Arrêter le spinner
		spinner.stop()

		// Vérifiez si l'information contient une erreur
		var error = await (errorCheck(accountInfo))
		if(error.error === true) return console.log(chalk.red(`\nImpossible d'obtenir le profil : ${error.frenchDescription}`) + chalk.cyan(` (Code erreur #${error.code})`)) && process.exit()
	}

	// Afficher des informations
		// Obtenir les badges
		var badge = []
		if(accountInfo.verified === true) badge.push("✔")
		if(accountInfo.protected === true) badge.push("🔐")

		// Afficher dans le terminal - Basique
		console.log("\n" + ((badge[0]) ? `${badge.map(b => b).join("")}  ` : '') + chalk.bold.underline("Basique"))
		console.log(chalk.bold("Nom : ") + ((accountInfo.name || "Aucun")) + `${((accountInfo.screen_name) ? `  (@${accountInfo.screen_name})` : 'Inconnu')}`)
		console.log(chalk.bold("Identifiant : ") + ((accountInfo.id_str || "Inconnu")))

		// Afficher dans le terminal - Supplémentaire
		console.log("\n" + chalk.bold.underline("Supplémentaire"))
		if(accountInfo.location) console.log(chalk.bold("Localisation : ") + accountInfo.location)
		if(accountInfo?.entities?.url?.urls[0]?.display_url) console.log(chalk.bold("Site : ") + accountInfo?.entities?.url?.urls[0]?.display_url)
		if(accountInfo.created_at) console.log(chalk.bold("Création du compte : ") + moment(new Date(accountInfo.created_at)).format('D MMMM YYYY').toLowerCase().replace("january", "janvier").replace("february", "février").replace("march", "mars").replace("april", "avril").replace("may", "mai").replace("june", "juin").replace("july", "juillet").replace("august", "août").replace("september", "septembre").replace("october", "octobre").replace("november", "novembre").replace("december", "décembre"))
		if(accountInfo.description && accountInfo.description.length < 24) console.log(chalk.bold("Description : ") + accountInfo.description)
		if(accountInfo.description && accountInfo.description.length > 24) console.log(chalk.bold("\nDescription : ") + accountInfo.description)

		// Afficher dans le terminal - Nombres
		console.log("\n" + chalk.bold.underline("Nombres"))
		if(accountInfo.followers_count) console.log(chalk.bold("Abonnés : ") + accountInfo.followers_count)
		if(accountInfo.friends_count) console.log(chalk.bold("Abonnements : ") + accountInfo.friends_count)
		if(accountInfo.statuses_count) console.log(chalk.bold("Tweet : ") + accountInfo.statuses_count)
		if(accountInfo.favourites_count) console.log(chalk.bold("Tweet liké : ") + accountInfo.favourites_count)
}
