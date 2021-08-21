// Crée une config / l'importer
const Conf = require('conf');
const config = new Conf({projectName: "twitterminal", projectSuffix: ""});

// Accèder a des valeurs de la config
    // Information du compte
    let account = config.get('account')
	if(!account || account && !account.name) config.set({ 'account.name': '' });
	if(!account || account && !account.consumer_key) config.set({ 'account.consumer_key': '' });
	if(!account || account && !account.consumer_secret) config.set({ 'account.consumer_secret': '' });
	if(!account || account && !account.access_token) config.set({ 'account.access_token': '' });
	if(!account || account && !account.access_token_secret) config.set({ 'account.access_token_secret': '' });
	if(!account || account && !account.type) config.set({ 'account.type': '' });

	// Configuration de clipboardy
	let clipboardyConfig = config.get('clipboardy')
	if(!clipboardyConfig || clipboardyConfig && !clipboardyConfig.use) config.set({ 'clipboardy.use': 'true' });
	if(!clipboardyConfig || clipboardyConfig && !clipboardyConfig.force) config.set({ 'clipboardy.force': 'false' });

// Importer node-fetch, oauth-1.0a, crypto, chalk, open, ora, prompt et terminal-kit
const fetch = require('node-fetch')
const OAuth = require('oauth-1.0a')
const crypto = require('crypto')
const chalk = require('chalk')
const open = require('open')
const ora = require('ora')
const prompt = require('prompt')
const term = require('terminal-kit').terminal;

// Préparer un spinner
const spinner = ora('')

// Importer tout ce qui est lié à express
const express = require('express')
const app = express()

// Définir les paramètres oauth
const oauth = OAuth({
	consumer: {
		"key": "\u004d\u006e\u0069\u005a\u0077\u004d\u004a\u0066\u0031\u0049\u006b\u0079\u0055\u0070\u006d\u0035\u004d\u004c\u006c\u006a\u0044\u0078\u0059\u0057\u0030",
		"secret": "\u0076\u004e\u0068\u0039\u007a\u007a\u0054\u0068\u0079\u006a\u0075\u0058\u0066\u0066\u0031\u0030\u0074\u0069\u0033\u0064\u0069\u0070\u0058\u004f\u0061\u0069\u0068\u0038\u0041\u0053\u0067\u006d\u0057\u004c\u006d\u006e\u0053\u0049\u004d\u0072\u0051\u0038\u0049\u004f\u0043\u0047\u0073\u005a\u006e\u0056"
	},
	signature_method: 'HMAC-SHA1',
	hash_function(base_string, key) {
		return crypto
			.createHmac('sha1', key)
			.update(base_string)
			.digest('base64')
	},
})

// Exporter en tant que module
module.exports = async function(){
	// Afficher un spinner
	spinner.text = " Obtention d'un token oauth..."
	spinner.start()

	// Demander un token oauth
	var request_token = await fetch('https://api.twitter.com/oauth/request_token', {
        method: 'post',
        headers: oauth.toHeader(oauth.authorize({ url: 'https://api.twitter.com/oauth/request_token', method: 'post' })),
    })
    .then(res => res.text())
	.catch(err => console.log(chalk.red("Impossible d'obtenir un token oauth : vérifier votre connexion, sinon veuillez contacter @Johan_Stickman") + chalk.cyan(" (Code erreur #7.1)")) && process.exit())

	var [oauth_token, useless] = request_token.split("&oauth_token_secret=")

	// Arrêter le spinner, en afficher un autre
	spinner.text = " Obtention de tokens oauth"
	spinner.succeed()

	console.log("Une page d'authentification s'est ouverte dans votre navigateur.")

	spinner.text = " Veuillez autoriser Twitterminal à accèder à votre compte Twitter..."
	spinner.start()

	// Ouvrir une page d'authentification
	await open('https://api.twitter.com/oauth/authenticate?' + oauth_token)

	// Démarrer un serveur web prêt à recevoir les requêtes callback
	app.get('/twitterminalCallback', (req, res) => {
		// Renvoyer un message via le serveur
		res.send('<h1>Les informations ont été transféré à Twitterminal.</h1><h3>Vous pouvez désormais fermer cet page.</h3>')

		// Arrêter le spinner, en afficher un autre
		spinner.text = " Veuillez autoriser Twitterminal à accèder à votre compte Twitter."
		spinner.succeed()

		spinner.text = " Conversion des tokens..."
		spinner.start()

		// Convertir les tokens
		convertToken(req.query)
	})
	app.listen(3310, () => {})
}

// Convertir les tokens oauth en token utilisables
async function convertToken(query){
	var request_convert = await fetch(`https://api.twitter.com/oauth/access_token?oauth_token=${query.oauth_token}&oauth_verifier=${query.oauth_verifier}`, {
        method: 'post',
    })
    .then(res => res.text())
	.catch(err => console.log(chalk.red("Impossible de convertir les tokens oauth : vérifier votre connexion, sinon veuillez contacter @Johan_Stickman") + chalk.cyan(" (Code erreur #7.2)")) && process.exit())

	// Arrêter le spinner
	spinner.text = " Conversion des tokens"
	spinner.succeed()
	
	// Retourner les tokens
	addConfig(new URLSearchParams(request_convert))
}

// Ajouter à la configuration
async function addConfig(token){
	// Liste des questions
	const properties = [{
		name: 'emplacement',
		warning: "Entrer l'emplacement où vous voulez enregistrer ces informations. Nombre entre 1 et 5",
		required: true,
		type: 'number',
		message: "Entrer l'emplacement où vous voulez enregistrer ces informations. Nombre entre 1 et 5."
	}];

	// Demander des réponses
	prompt.start();

	// Obtenir les réponses
	prompt.get(properties, function (err, result) {
		if (err) return term.red("\n" + err) && process.exit()

		// Vérification de l'emplacement
		var regex = new RegExp(/^[1-9]\d*$/)
		if(!regex.test(result.emplacement)) return console.log(chalk.red("L'emplacement doit être un nombre entre 1 et 5.")) && process.exit()
		if(result.emplacement > 5) return console.log(chalk.red("L'emplacement doit être un nombre entre 1 et 5.")) && process.exit()
		if(result.emplacement < 1) return console.log(chalk.red("L'emplacement doit être un nombre entre 1 et 5.")) && process.exit()

		// Enregistrer dans la configuration
		if(result.emplacement === 1){
			config.set({ 'accountList.1.name': "@" + token.get('screen_name') });
			config.set({ 'accountList.1.consumer_key': oauth.consumer.key });
			config.set({ 'accountList.1.consumer_secret': oauth.consumer.secret });
			config.set({ 'accountList.1.access_token': token.get('oauth_token') });
			config.set({ 'accountList.1.access_token_secret': token.get('oauth_token_secret') });
			config.set({ 'accountList.1.type': "oauth" });
		}
		if(result.emplacement === 2){
			config.set({ 'accountList.2.name': "@" + token.get('screen_name') });
			config.set({ 'accountList.2.consumer_key': oauth.consumer.key });
			config.set({ 'accountList.2.consumer_secret': oauth.consumer.secret });
			config.set({ 'accountList.2.access_token': token.get('oauth_token') });
			config.set({ 'accountList.2.access_token_secret': token.get('oauth_token_secret') });
			config.set({ 'accountList.2.type': "oauth" });
		}
		if(result.emplacement === 3){
			config.set({ 'accountList.3.name': "@" + token.get('screen_name') });
			config.set({ 'accountList.3.consumer_key': oauth.consumer.key });
			config.set({ 'accountList.3.consumer_secret': oauth.consumer.secret });
			config.set({ 'accountList.3.access_token': token.get('oauth_token') });
			config.set({ 'accountList.3.access_token_secret': token.get('oauth_token_secret') });
			config.set({ 'accountList.3.type': "oauth" });
		}
		if(result.emplacement === 4){
			config.set({ 'accountList.4.name': "@" + token.get('screen_name') });
			config.set({ 'accountList.4.consumer_key': oauth.consumer.key });
			config.set({ 'accountList.4.consumer_secret': oauth.consumer.secret });
			config.set({ 'accountList.4.access_token': token.get('oauth_token') });
			config.set({ 'accountList.4.access_token_secret': token.get('oauth_token_secret') });
			config.set({ 'accountList.4.type': "oauth" });
		}
		if(result.emplacement === 5){
			config.set({ 'accountList.5.name': "@" + token.get('screen_name') });
			config.set({ 'accountList.5.consumer_key': oauth.consumer.key });
			config.set({ 'accountList.5.consumer_secret': oauth.consumer.secret });
			config.set({ 'accountList.5.access_token': token.get('oauth_token') });
			config.set({ 'accountList.5.access_token_secret': token.get('oauth_token_secret') });
			config.set({ 'accountList.5.type': "oauth" });
		}

		// Arrêter le processus
		console.log(chalk.green("\nPour appliquer les modifications, Twitterminal a besoin d'être redémarrer.")) && process.exit()
	});
}