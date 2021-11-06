// Crée une config / l'importer
const Conf = require('conf');
const config = new Conf({projectName: "twitterminal", projectSuffix: ""});

// Importer quelques modules
const fetch = require('node-fetch')
const OAuth = require('oauth-1.0a')
const crypto = require('crypto')
const chalk = require('chalk')
const open = require('open')
const ora = require('ora'); const spinner = ora('')
const inquirer = require('inquirer');

// Définir oauth
const oauth = OAuth({
	consumer: {
		"key": "\u004d\u006e\u0069\u005a\u0077\u004d\u004a\u0066\u0031\u0049\u006b\u0079\u0055\u0070\u006d\u0035\u004d\u004c\u006c\u006a\u0044\u0078\u0059\u0057\u0030",
		"secret": "\u0076\u004e\u0068\u0039\u007a\u007a\u0054\u0068\u0079\u006a\u0075\u0058\u0066\u0066\u0031\u0030\u0074\u0069\u0033\u0064\u0069\u0070\u0058\u004f\u0061\u0069\u0068\u0038\u0041\u0053\u0067\u006d\u0057\u004c\u006d\u006e\u0053\u0049\u004d\u0072\u0051\u0038\u0049\u004f\u0043\u0047\u0073\u005a\u006e\u0056"
	},
	signature_method: 'HMAC-SHA1',
	hash_function(base_string, key){
		return crypto.createHmac('sha1', key).update(base_string).digest('base64')
	},
})

// Exporter en tant que module
module.exports = async function(){
	// Afficher un spinner
	spinner.text = "Obtention d'un token oauth..."
	spinner.start()

	// Demander un token oauth
	var request_token = await fetch('https://api.twitter.com/oauth/request_token', {
        method: 'post',
        headers: oauth.toHeader(oauth.authorize({ url: 'https://api.twitter.com/oauth/request_token', method: 'post' })),
    })
    .then(res => res.text())
	.catch(err => console.log(chalk.red("Impossible d'obtenir un token oauth : vérifier votre connexion, sinon veuillez contacter @Johan_Stickman") + chalk.cyan(" (Code erreur #7.1)")) && process.exit())

	var oauth_token = request_token.split("&oauth_token_secret=")[0]

	// Arrêter le spinner, en afficher un autre
	spinner.text = "Obtention de tokens oauth"
	spinner.succeed()

	spinner.text = "Veuillez autoriser Twitterminal à accèder à votre compte Twitter..."
	spinner.start()

	// Ouvrir une page d'authentification
	await open(`https://api.twitter.com/oauth/authenticate?${oauth_token}`)

	// Importer tout ce qui est lié à express
	const express = require('express')
	const app = express()

	// Démarrer un serveur web prêt à recevoir les requêtes callback
	app.get('/twitterminalCallback', (req, res) => {
		// Renvoyer un message via le serveur
		res.send(`<!DOCTYPE html><html class="bg-gray-800 flex h-screen"><head><title>Connexion à Twitterminal</title><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0" ><link href="https://firebasestorage.googleapis.com/v0/b/storage-bf183.appspot.com/o/otherContent%2Fstyle.css?alt=media" rel="stylesheet"><script src="https://kit.fontawesome.com/4b4e1c29fe.js" crossorigin="anonymous"></script></head><body class="bg-gray-800 flex m-auto items-center" id="body"><div class="text-center w-full mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 z-20"><h2 class="text-8xl font-extrabold"><span class="block text-green-400"><i class="far fa-check-circle"></i></span></h2><p class="text-xl mt-4 max-w-lg mx-auto text-gray-400">Connexion réussie !<br>Vous pouvez fermer cet onglet et retourner à Twitterminal.</p><footer class="mt-4 max-w-lg mx-auto items-center p-6 footer text-neutral-content invisible md:visible"><div class="items-center grid-flow-col text-gray-400"><p>Crée par <a href="https://johanstickman.com" class="underline">Johan</a> le stickman</p></div><div class="grid-flow-col gap-4 md:place-self-center md:justify-self-end"><a href="https://twitter.com/Johan_Stickman" class="text-gray-400 hover:text-gray-200"><span class="w-6 h-6" style="font-size: 1.25em;"><i class="fab fa-twitter"></i> </span></a><a href="https://github.com/johan-perso" class="text-gray-400 hover:text-gray-200"><span class="w-6 h-6" style="font-size: 1.25em;"><i class="fab fa-github"></i> </span></a><a href="https://johanstickman.com" class="text-gray-400 hover:text-gray-200"><span class="w-6 h-6" style="font-size: 1.25em;"><i class="fas fa-globe"></i> </span></a></div></footer></div></body></html>`)

		// Arrêter le spinner, en afficher un autre
		spinner.text = "Veuillez autoriser Twitterminal à accèder à votre compte Twitter."
		spinner.succeed()

		spinner.text = "Conversion des tokens..."
		spinner.start()

		// Convertir les tokens
		convertToken(req.query)
	})
	app.listen(3310, () => {})
}

// Convertir les tokens oauth en token utilisables
async function convertToken(query){
	var request_convert = await fetch(`https://api.twitter.com/oauth/access_token?oauth_token=${query.oauth_token}&oauth_verifier=${query.oauth_verifier}`, { method: 'post' })
    .then(res => res.text())
	.catch(err => console.log(chalk.red("Impossible de convertir les tokens oauth : vérifier votre connexion, sinon veuillez contacter @Johan_Stickman") + chalk.cyan(" (Code erreur #7.2)")) && process.exit())

	// Arrêter le spinner
	spinner.text = "Conversion des tokens"
	spinner.succeed()
	
	// Retourner les tokens
	addToConfig(new URLSearchParams(request_convert))
}

// Ajouter à la configuration
async function addToConfig(token){
	// Demander l'emplacement
	var emplacement = await inquirer.prompt([
		{
			type: 'list',
			name: 'emplacement',
			message: 'Quel emplacement souhaitez vous utiliser pour sauvegarder ce compte ?',
			choices: [
				'Emplacement 1',
				'Emplacement 2',
				'Emplacement 3',
				'Emplacement 4',
				'Emplacement 5'
			]
		}
	])
	var emplacement = emplacement.emplacement

	// Enregistrer dans la configuration
		// Ajouter un emplacement
		if(emplacement === 'Emplacement 1') config.set({ 'accountList.1.name': `@${token.get('screen_name')}`, 'accountList.1.consumer_key': oauth.consumer.key, 'accountList.1.consumer_secret': oauth.consumer.secret, 'accountList.1.access_token': token.get('oauth_token'), 'accountList.1.access_token_secret': token.get('oauth_token_secret'), 'accountList.1.type': "oauth" });
		if(emplacement === 'Emplacement 2') config.set({ 'accountList.2.name': `@${token.get('screen_name')}`, 'accountList.2.consumer_key': oauth.consumer.key, 'accountList.2.consumer_secret': oauth.consumer.secret, 'accountList.2.access_token': token.get('oauth_token'), 'accountList.2.access_token_secret': token.get('oauth_token_secret'), 'accountList.2.type': "oauth" });
		if(emplacement === 'Emplacement 3') config.set({ 'accountList.3.name': `@${token.get('screen_name')}`, 'accountList.3.consumer_key': oauth.consumer.key, 'accountList.3.consumer_secret': oauth.consumer.secret, 'accountList.3.access_token': token.get('oauth_token'), 'accountList.3.access_token_secret': token.get('oauth_token_secret'), 'accountList.3.type': "oauth" });
		if(emplacement === 'Emplacement 4') config.set({ 'accountList.4.name': `@${token.get('screen_name')}`, 'accountList.4.consumer_key': oauth.consumer.key, 'accountList.4.consumer_secret': oauth.consumer.secret, 'accountList.4.access_token': token.get('oauth_token'), 'accountList.4.access_token_secret': token.get('oauth_token_secret'), 'accountList.4.type': "oauth" });
		if(emplacement === 'Emplacement 5') config.set({ 'accountList.5.name': `@${token.get('screen_name')}`, 'accountList.5.consumer_key': oauth.consumer.key, 'accountList.5.consumer_secret': oauth.consumer.secret, 'accountList.5.access_token': token.get('oauth_token'), 'accountList.5.access_token_secret': token.get('oauth_token_secret'), 'accountList.5.type': "oauth" });

		// Définir le compte par défaut
		config.set({ 'account.name': `@${token.get('screen_name')}`, 'account.consumer_key': oauth.consumer.key, 'account.consumer_secret': oauth.consumer.secret, 'account.access_token': token.get('oauth_token'), 'account.access_token_secret': token.get('oauth_token_secret') });

	// Arrêter le processus
	config.set('not_first_start','true')
	console.log(chalk.green("\nPour appliquer les modifications, Twitterminal a besoin d'être redémarrer."))
	return process.exit()
}
