#!/usr/bin/env node

// Importer quelques modules + le package.json
	// Les définir
	var chalk
	var OAuth
	var updateNotifier
	var moment
	var boxen
	var ora
	var path
	var inquirer
	var FormData
	var Conf
	var open
	var fs
	var spinner
	var pkg

	// Les importer
	try { chalk = require('chalk') } catch (e){ failRequireModule("chalk","4.1.1") }
	try { OAuth = require('oauth-1.0a') } catch (e){ failRequireModule("oauth-1.0a") }
	try { updateNotifier = require('update-notifier') } catch (e){ failRequireModule("update-notifier","5.1.0") }
	try { moment = require('moment') } catch (e){ failRequireModule("moment") }
	try { boxen = require('boxen') } catch (e){ failRequireModule("boxen","5.1.2") }
	try { ora = require('ora'); spinner = ora('')} catch (e){ failRequireModule("ora","5.4.1") }
	try { path = require('path') } catch (e){ failRequireModule("path") }
	try { inquirer = require('inquirer') } catch (e){ failRequireModule("inquirer", "8.2.4") }
	try { FormData = require('form-data') } catch (e){ failRequireModule("form-data") }
	try { Conf = require('conf') } catch (e){ failRequireModule("conf") }
	try { open = require('open') } catch (e){ failRequireModule("open","8.2.1") }
	try { fs = require('fs') } catch (e){ failRequireModule("fs") }
	try { pkg = require('./package.json') } catch (e){ pkg = { name: 'twitterminal', version: 'undefined' } }

	// Importer crypto sans vérification (préinstallé dans NodeJS)
	var crypto = require('crypto')

	// Quelques importations supplémentaire (pas pour les utiliser mais pour check si ils sont installé)
	try { require('terminal-kit') } catch (e){ failRequireModule("terminal-kit") }
	try { require('node-fetch') } catch (e){ failRequireModule("node-fetch","2.6.1") }
	try { require('clipboardy') } catch (e){ failRequireModule("clipboardy","2.3.0") }
	try { require('express') } catch (e){ failRequireModule("express") }
	try { require('twitter-lite') } catch (e){ failRequireModule("twitter-lite") }

// Vérifier la version de NodeJS utilisé
if(parseInt(process.versions.node) < 15){
	// Si il y'a une erreur, le dire
	console.log(chalk.red(`Impossible de démarrer Twitterminal : votre version de NodeJS (${process.version}) est trop ancienne.`))

	// Afficher l'erreur
	console.log("─".repeat(parseInt(process.stdout.columns)))
	console.log(chalk.dim("- Tenter d'installer NodeJS 15 ou plus"))

	// Arrêter le processus
	process.exit();
}

// Argument pour afficher la version
if(process.argv.slice(2)[0] === "--version" || process.argv.slice(2)[0] === "-v"){
	// Afficher la version
	console.log("Twitterminal utilise actuellement la version " + chalk.cyan(pkg.version))
	console.log(chalk.dim("────────────────────────────────────────────"))

	// Afficher le chemin de Twitterminal
	console.log("Chemin de Twitterminal")
	console.log(chalk.cyan(`	${path.join(__dirname)}`))
	console.log(chalk.dim("────────────────────────────────────────────"))

	// Afficher le chemin de la configuration
	console.log("Chemin de la configuration")
	console.log(`	${chalk.cyan(require('./functions/configPath')())}`)
	console.log(chalk.dim("────────────────────────────────────────────"))

	// Afficher que ✨ le grand maitre stickman ✨ est le créateur de Twitterminal
	console.log("Développé par Johan le stickman")
	console.log(chalk.cyan("	https://johanstick.me"))
	process.exit()
}
// Argument pour afficher le chemin de la configuration
if(process.argv.slice(2)[0] === "-cp" || process.argv.slice(2)[0] === "--cp"){
	console.log(require('./functions/configPath')())
	process.exit()
}

// Préparer une configuration
var config
try {
	config = new Conf({ cwd: require('./functions/configPath')(false), configName: 'twitterminalConfig' })
} catch(e){
	// Si il y'a une erreur, le dire
	console.log(chalk.red(`Impossible de démarrer Twitterminal : le chargement de la configuration de Twitterminal a rencontré une erreur fatal empêchant le démarrage.`))

	// Afficher le chemin de la configuration
	console.log(`Chemin de la configuration : ${chalk.cyan(require('./functions/configPath')())}`)

	// Afficher l'erreur
	console.log("─".repeat(parseInt(process.stdout.columns)))
	console.log(chalk.dim(e))

	// Arrêter le processus
	process.exit();
}

// Importer les fonctions locales de Twitterminal
	// Les définir
	var replaceText
	var fetch
	var errorCheck
	var writeClipboard
	var checkInternet

	// Les importer
	try { replaceText = require('./functions/replaceText.js') } catch (e){ failRequireFunction("replaceText.js") }
	try { fetch = require('./functions/fetch.js') } catch (e){ failRequireFunction("fetch.js") }
	try { errorCheck = require('./functions/errorCheck.js') } catch (e){ failRequireFunction("errorCheck.js") }
	try { writeClipboard = require('./functions/writeClipboard.js') } catch (e){ failRequireFunction("writeClipboard.js") }
	try { checkInternet = require('./functions/checkInternet.js') } catch (e){ failRequireFunction("checkInternet.js") }

	// Vérifier des fonctions locales non utilisé dans l'index.js
	try { require('./functions/config.js') } catch (e){ failRequireFunction("config.js") }
	try { require('./functions/configOauth.js') } catch (e){ failRequireFunction("configOauth.js") }
	try { require('./functions/gif.js') } catch (e){ failRequireFunction("gif.js") }

// Fonction pour afficher qu'il faut installer un module
function failRequireModule(moduleName, version){
	path = require('path')

	// Afficher le fait que Twitterminal ne peut démarrer
	if(moduleName !== "chalk") console.log(chalk.red(`Impossible de démarrer Twitterminal : le chargement du module ${chalk.cyan(moduleName)} n'a pas pu aboutir.`))
	if(moduleName === "chalk") console.log(`Impossible de démarrer Twitterminal : le chargement du module ${moduleName} n'a pas pu aboutir.`)

	// Afficher une commande pour installer le module
	console.log(`───  Installer le module  ${"─".repeat(parseInt(process.stdout.columns-26))}`)
	if(moduleName !== "chalk") console.log(chalk.dim(`cd "${path.join(__dirname)}"\nnpm install ${moduleName}${(version) ? `@${version}` : ''}`))
	if(moduleName === "chalk") console.log(`cd "${path.join(__dirname)}"\nnpm install ${moduleName}${(version) ? `@${version}` : ''}`)

	// Afficher une commande pour installer TOUT les modules
	var allModule = `chalk@4.1.1 boxen@5.1.2 ora@5.4.1 node-fetch@2.6.1 clipboardy@2.3.0 open@8.2.1 oauth-1.0a update-notifier moment inquirer conf express twitter-lite`
	console.log(`\n───  Installer TOUT les modules  ${"─".repeat(parseInt(process.stdout.columns-33))}`)
	if(moduleName !== "chalk") console.log(chalk.dim(`cd "${path.join(__dirname)}"\nnpm install ${allModule}`))
	if(moduleName === "chalk") console.log(`cd "${path.join(__dirname)}"\nnpm install ${allModule}`)

	// Arrêter le processus
	process.exit();
}

// Fonction pour afficher qu'un fichier fonction est manquant
function failRequireFunction(functionName){
	path = require('path')

	// Afficher le fait que Twitterminal ne peut démarrer
	console.log(chalk.red(`Impossible de démarrer Twitterminal : le chargement de la fonction ${chalk.cyan(functionName)} n'a pas pu aboutir.`))

	// Afficher des informations pour réparer le problème
	console.log("─".repeat(parseInt(process.stdout.columns)))
	console.log(chalk.dim(`- Tenter une réinstallation de Twitterminal`))
	console.log(chalk.dim(`- ou télécharger le ${functionName} de Twitterminal sur GitHub`))
	console.log(chalk.dim(`	github.com/johan-perso/twitterminal/blob/main/functions/${functionName}`))

	// Arrêter le processus, si le flag debug n'est pas présent
	if(!process.argv.includes("--debug")) process.exit();
}

// Système de mise à jour
const notifier = updateNotifier({ pkg, updateCheckInterval: 10 })
if(notifier.update && pkg.version !== notifier.update.latest){
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

	// Liste des backups
	if(config.get('configBackupList') && !config.get('configBackupList')[0]) config.delete('configBackupList');

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
var connectedAccountUsername;
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
	console.log(chalk.yellow("[───────────────────────────────────────────────]"))

	// Définir une variable pour plus tard
	connectedAccountUsername = accountInfo.screen_name

	// Retourner le compte
	return accountInfo
}

// Fonction à executer au premier démarrage
async function firstStart(){
	// Si aucun compte est trouvé, en profiter pour check si une configuration est trouvable dans l'ancien chemin de la configuration
	var checkOldConfig = new Promise(async (resolve, reject) => {
		if(!config.get('accountList')){
			// Déterminer le chemin de la potentiel configuration en fonction de l'OS
			if(require('os').platform() === "win32") var configPath = path.join(process.env.APPDATA, "twitterminal", "config", "config.json")
			if(require('os').platform() === "darwin") var configPath = path.join(require('os').homedir(), "library", "Preferences", "twitterminal", "config.json")
			if(require('os').platform() === "linux") var configPath = path.join(require('os').homedir(), ".config", "twitterminal", "config.json")

			// Vérifier si le fichier de la configuration est trouvable
			if(fs.existsSync(configPath)){
				// Si oui, la convertir en JSON
				var oldConfig
				try { oldConfig = JSON.parse(fs.readFileSync(configPath)) } catch (e){}
				
				// Afficher que la configuration existe
				if(oldConfig && oldConfig.accountList || oldConfig.account){
					// Afficher que la configuration a été trouvée
					console.log(chalk.bold(`Ancienne configuration Twittterminal trouvée (version ${chalk.cyan(oldConfig.configVersion || "inconnue")})`))
					console.log("La configuration se trouve ici --> " + chalk.cyan(configPath))
					console.log(chalk.yellow("─".repeat(parseInt(process.stdout.columns))))

					// Afficher des informations supplémentaires
						// Les obtenir
						if(oldConfig.accountList) var accountsNumber = Object?.keys(oldConfig?.accountList)?.length
						if(oldConfig.account) var mainAccountName = oldConfig?.account?.name
						if(oldConfig.configBackupList) var backupsCount = parseInt(oldConfig?.configBackupList?.length)

						// Les afficher
						if(accountsNumber) console.log(chalk.dim(`- ${accountsNumber} compte${(accountsNumber > 1) ? "s" : ""} trouvé${(accountsNumber > 1) ? "s" : ""}`))
						if(mainAccountName) console.log(chalk.dim(`- Compte principal : ${mainAccountName}`))
						if(backupsCount) console.log(chalk.dim(`- Contient ${backupsCount} sauvegarde${(backupsCount > 1) ? "s" : ""}`))

					// Afficher un menu pour choisir entre l'ignorer, ou l'utiliser
					console.log(chalk.yellow("─".repeat(parseInt(process.stdout.columns))))
					inquirer.prompt([
						{
							type: "list",
							name: "action",
							message: "Que souhaitez-vous faire ?",
							choices: [
								"Utiliser cette configuration",
								"Ignorer cette configuration"
							]
						}
					]).then(async answer => {
						// Si la réponse est de l'utiliser
						if(answer.action === "Utiliser cette configuration"){
							// Si la configuration existe, la remplacer
							await fs.writeFileSync(require('./functions/configPath')(), fs.readFileSync(configPath))

							// Afficher que hop c'est bon
							console.log(chalk.green("Pour appliquer les modifications, Twitterminal a besoin d'être redémarrer."))
						} else { resolve() }
					})
				}
			} else { resolve() }
		} else resolve()
	})

	// Vérifier si une ancienne ncoonfiguration existe
	await checkOldConfig

	// Vider l'écran
	process.stdout.write("\x1Bc")

	// Afficher des messages
	console.log(chalk.bold("Hmm salutation !"))
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
				'Connexion manuelle (déconseillée)',
				'Importer une configuration',
				'Sortir'
			]
		}
	])
	.then(answer => {
		if(answer.action.toLowerCase() === "se connecter") return require('./functions/configOauth.js')()
		if(answer.action.toLowerCase() === "connexion manuelle (déconseillée)") return require('./functions/config.js')("addAccountLegacy")
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
	// Vérifier la connexion et si Twitterminal a déjà été démarré
	if(await checkInternet() === false) console.log(chalk.red(`Oupsi, je n'ai pas l'impression que tu as accès à internet..`)) & process.exit();
	if((await checkFirstStart()) === true) return firstStart()

	// Vérifier le compte
	var accountInfo = await checkAccount()

	// Arguments
	if(process.argv.slice(2)[0] === "tweet") return tweet()
	if(process.argv.slice(2)[0] === "thread") return thread()
	if(process.argv.slice(2)[0] === "config") return open(path.join(config.path))
	if(process.argv.slice(2)[0] === "timeline") return require('./functions/timeline.js')(oauth, token, accountInfo, config?.get("experiments"))
	if(process.argv.slice(2)[0] === "profil") return showProfil(accountInfo)
	if(process.argv.slice(2)[0] === "search") return search(accountInfo)

	if(process.argv.slice(2)[0] === "mass-follow") return massFollow()
	if(process.argv.slice(2)[0] === "mass-like") return massLike()
	if(process.argv.slice(2)[0] === "mass-rt") return massRt()
	if(process.argv.slice(2)[0] === "mass-comment") return massComment()

	// Obtenir la liste des choix pour le menu
	var choices = []
	choices.push('Tweeter','Voir sa timeline','Créer un thread','Profil','Rechercher','Vérifier des tokens','Configuration')

	// Afficher un menu
	inquirer.prompt([
		{
			type: 'list',
			name: 'action',
			message: 'Que voulez-vous faire ?',
			choices: choices
		}
	])
	.then(answer => {
		if(answer.action.toLowerCase() === "voir sa timeline") return require('./functions/timeline.js')(oauth, token, accountInfo, config?.get("experiments"))
		if(answer.action.toLowerCase() === "tweeter") return tweet()
		if(answer.action.toLowerCase() === "créer un thread") return thread() 
		if(answer.action.toLowerCase() === "profil") return showProfil(accountInfo)
		if(answer.action.toLowerCase() === "rechercher") return search(accountInfo)
		if(answer.action.toLowerCase() === "vérifier des tokens") return tokenChecker()

		if(answer.action.toLowerCase() === "configuration" && !config?.get("experiments")?.includes("CONFIG_IN_TEXT_EDITOR")) return require('./functions/config.js')()
		if(answer.action.toLowerCase() === "configuration" && config?.get("experiments")?.includes("CONFIG_IN_TEXT_EDITOR")) return open(path.join(config.path))
	});
}

// Fonction pour tweeter
async function tweet(){
	// Obtenir quelques informations
	var questions = await inquirer.prompt([
		{
			type: 'input',
			name: 'tweetContent',
			message: 'Contenu du tweet',
			validate(text){
				if(text.length < 1){ return 'Veuillez entrer un texte' }
				if(text.length > 255){ return `Ce texte est trop grand (${text.length} caractères)` }
				return true;
			}
		},
		{
			type: 'confirm',
			name: 'addLocalization',
			message: 'Ajouter une localisation ?',
			default: false
		}
	])
	var tweetContent = questions.tweetContent

	// Si on veut ajouter une localisation
	if(questions.addLocalization) console.log(chalk.dim("Vous devez activer la géolocalisation pour tout les tweets dans les paramètres de votre profil Twitter pour que cette option puisse s'appliquer."))
	if(questions.addLocalization) var localisation = await inquirer.prompt([
		{
			type: 'input',
			name: 'lat',
			message: 'Latitude',
			validate(text){
				if(!RegExp('^-?([1-8]?[1-9]|[1-9]0)\\.{1}\\d{1,6}').test(text)){ return 'Veuillez entrer une donnée valide, exemple : 63.4333' }
				return true;
			}
		},
		{
			type: 'input',
			name: 'long',
			message: 'Longitude',
			validate(text){
				if(!RegExp('^-?([1-8]?[1-9]|[1-9]0)\\.{1}\\d{1,6}').test(text)){ return 'Veuillez entrer une donnée valide, exemple : 10.9000' }
				return true;
			}
		}
	]);

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

	// Préparer les paramètres du tweet
	var settings = { status: await(replaceText.tweet(tweetContent)) }
	if(localisation) settings = { ...settings, ...localisation }

	// Poster le tweet
	var tweet = await client.post((config?.get("experiments")?.includes('DISABLE_TWITTER_REQUEST_MAJOR_ACTIONS') ? 'EXPERIMENT-DISABLE_TWITTER_REQUEST_MAJOR_ACTIONS-IS-ENABLED' : 'statuses/update'), settings)
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

			// Donner des infos en plus avec le flag --debug
			if(process.argv.includes("--debug")) console.log(err)

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
	var {tweetContent} = await inquirer.prompt([
		{
			type: 'input',
			name: 'tweetContent',
			message: 'Contenu du tweet',
			validate(text){
				if(text.length < 1){ return 'Veuillez entrer un texte' }
				if(text.length > 9999){ return `Ce texte est trop grand (${text.length} caractères, max 9999 caractères)` }
				return true;
			}
		}
	])

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
		if(threadArray.indexOf(status) + 1 !== threadArray.length) var statusTW = `${status}...`

		// Poster le tweet
		var tweet = await client.post((config?.get("experiments")?.includes('DISABLE_TWITTER_REQUEST_MAJOR_ACTIONS') ? 'EXPERIMENT-DISABLE_TWITTER_REQUEST_MAJOR_ACTIONS-IS-ENABLED' : 'statuses/update'), {
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
				writeClipboard(`https://twitter.com/${tweet?.user?.screen_name}/status/${tweet.id_str}`)

				// Modifier le spinner
				spinner.text = "Thread en cours de publication : " + chalk.cyan(`https://twitter.com/${tweet?.user.screen_name}/status/${tweet?.id_str}`);
				spinner.start()

				// Définir que le premier tweet est... le premier tweet
				firstTweet = `https://twitter.com/${tweet?.user?.screen_name}/status/${tweet?.id_str}`;
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
async function showProfil(ownAccountInfo){
	var {username} = await inquirer.prompt([
		{
			type: 'input',
			name: 'username',
			message: 'Entrer un nom d\'utilisateur'
		}
	])

	// Afficher un spinner
	if(!username) spinner.text = 'Obtention de votre profil...'
	if(username) spinner.text = `Obtention du profil de ${chalk.cyan(`@${username}`)}...` && spinner.start()

	// Si y'a pas de pseudo donné : obtenir les informations sur soi-même
	if(!username) var accountInfo = ownAccountInfo

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
		if(accountInfo.verified === true) badge.push("✔️")
		if(accountInfo.protected === true) badge.push("🔒")

		// Afficher dans le terminal - Basique
		console.log("\n" + ((badge[0]) ? `${badge.map(b => b).join("")}  ` : '') + chalk.bold.underline("Basique"))
		console.log(chalk.bold("Nom : ") + ((accountInfo.name || "Aucun")) + `${((accountInfo.screen_name) ? `  (@${accountInfo.screen_name})` : 'Inconnu')}`)
		console.log(chalk.bold("Identifiant : ") + ((accountInfo.id_str || "Inconnu")))

		// Afficher dans le terminal - Supplémentaire
		console.log("\n" + chalk.bold.underline("Supplémentaire"))
		if(accountInfo.location) console.log(chalk.bold("Localisation : ") + accountInfo.location)
		if(accountInfo?.entities?.url?.urls[0]?.display_url) console.log(chalk.bold("Site : ") + accountInfo?.entities?.url?.urls[0]?.display_url)
		if(accountInfo.created_at) console.log(chalk.bold("Création du compte : ") + moment(new Date(accountInfo.created_at)).format('D MMMM YYYY').toLowerCase().replace("january", "janvier").replace("february", "février").replace("march", "mars").replace("april", "avril").replace("may", "mai").replace("june", "juin").replace("july", "juillet").replace("august", "août").replace("september", "septembre").replace("october", "octobre").replace("november", "novembre").replace("december", "décembre"))
		if(accountInfo.description && accountInfo.description.length < 48) console.log(chalk.bold("Description : ") + accountInfo.description)
		else if(accountInfo.description) console.log(chalk.bold("\nDescription : ") + accountInfo.description)

		// Afficher dans le terminal - Nombres
		console.log("\n" + chalk.bold.underline("Nombres"))
		if(accountInfo.followers_count) console.log(chalk.bold("Abonnés : ") + accountInfo.followers_count)
		if(accountInfo.friends_count) console.log(chalk.bold("Abonnements : ") + accountInfo.friends_count)
		if(accountInfo.statuses_count) console.log(chalk.bold("Tweet : ") + accountInfo.statuses_count)
		if(accountInfo.favourites_count) console.log(chalk.bold("Tweet liké : ") + accountInfo.favourites_count)

		// Si le flag debug est activé, afficher les informations complète sur l'utilisateur
		if(process.argv.includes("--debug")){
			console.log("─".repeat(parseInt(process.stdout.columns)))
			console.log(chalk.bold.underline("Argument --debug :"))
			console.log(JSON.stringify(accountInfo))
			console.log("─".repeat(parseInt(process.stdout.columns)))
		}

	// Séparer les résultats affichés et Inquirer
	console.log()

	// Préparer une liste d'actions possibles
		// Quelques actions
		var actions = [
			{ name: 'Afficher les tweets', value: 'tweets' },
			{ name: 'Ouvrir dans le navigateur', value: 'open' },
		]

		// Pouvoir follow/unfollow
		if(accountInfo.following == true) actions.push({ name: 'Unfollow', value: 'unfollow' })
		else if(accountInfo.screen_name != connectedAccountUsername) actions.push({ name: 'Follow', value: 'follow' })

		// Pouvoir éditer le profil si c'est notre compte
		if(accountInfo.screen_name == connectedAccountUsername) actions.push({ name: 'Éditer le profil', value: 'edit' })

		// Ajouter de quoi quitter l'interface
		actions.push({ name: 'Quitter', value: 'quit' })
	
	// Pouvoir effectuer des actions sur le profil
	var {action} = await inquirer.prompt([
		{
			type: 'list',
			name: 'action',
			message: 'Que souhaitez-vous faire ?',
			choices: actions
		}
	])

	// Si l'action est "tweets"
	if(action == "tweets") return require('./functions/timeline.js')(oauth, token, ownAccountInfo, config?.get("experiments"), accountInfo.screen_name)

	// Si l'action est "open"
	if(action == "open") return open(`https://twitter.com/${accountInfo.screen_name}`)

	// Si l'action est "follow"
	if(action == "follow"){
		// Spinner
		spinner.text = 'Action en cours...'
		spinner.start()

		// Follow
		var follow = await fetch({url: `https://api.twitter.com/1.1/friendships/create.json?screen_name=${accountInfo.screen_name}`, method: 'POST'}, oauth, token)

		// Arrêter le spinner
		spinner.stop()

		// Vérifiez si l'information contient une erreur
		var error = await (errorCheck(follow))
		if(error.error === true) return console.log(chalk.red(`\nImpossible de follow : ${error.frenchDescription}`) + chalk.cyan(` (Code erreur #${error.code})`)) && process.exit()

		// Afficher dans le terminal
		console.log(chalk.green(`\nVous suivez désormais @${accountInfo.screen_name}`))
	}

	// Si l'action est "unfollow"
	if(action == "unfollow"){
		// Spinner
		spinner.text = 'Action en cours...'
		spinner.start()

		// Follow
		var follow = await fetch({url: `https://api.twitter.com/1.1/friendships/destroy.json?screen_name=${accountInfo.screen_name}`, method: 'POST'}, oauth, token)

		// Arrêter le spinner
		spinner.stop()

		// Vérifiez si l'information contient une erreur
		var error = await (errorCheck(follow))
		if(error.error === true) return console.log(chalk.red(`\nImpossible d'un follow : ${error.frenchDescription}`) + chalk.cyan(` (Code erreur #${error.code})`)) && process.exit()

		// Afficher dans le terminal
		console.log(chalk.green(`\nVous ne suivez plus @${accountInfo.screen_name}`))
	}

	// Si l'action est "edit"
	if(action == "edit"){
		// Afficher un avertissement
		console.log(chalk.dim("(les options non remplis ne seront pas modifiés)"))
		console.log(chalk.dim(`(faite CTRL+C pour quitter Twitterminal)`))

		// Demander certains élements
		var profile = await inquirer.prompt([
			{
				type: 'input',
				name: 'name',
				message: 'Nom',
				validate(input){
					input = input.trim()
					if(input.length > 50) return "Le nom d'utilisateur est trop long (maximum 50 caractères)"
					if(input && input.replace(/ /g,'').length < 4 && input.replace(/ /g,'').length > 0) return "Le nom d'utilisateur est trop court (minimum 4 caractères)"
					return true
				}
			},
			{
				type: 'input',
				name: 'url',
				message: 'Lien',
				validate(input){
					input = input.trim()
					if(!input.startsWith("http") || !input.startsWith("https")) input = `https://${input}`
					if(!input || (input && input.replace(/ /g,'').length < 10)) return "Ce lien est invalide, si vous ne voulez pas en spécifier un, laissez le champ vide"
					return true
				}
			},
			{
				type: 'input',
				name: 'location',
				message: 'Localisation',
				validate(input){
					input = input.trim()
					if(input.length > 30) return "La localisation est trop longue (maximum 30 caractères)"
					if(input && input.replace(/ /g,'').length < 2 && input.replace(/ /g,'').length > 0) return "La localisation est trop courte (minimum 2 caractères)"
					return true
				}
			},
			{
				type: 'input',
				name: 'description',
				message: 'Description',
				validate(input){
					input = input.trim()
					if(input.length > 160) return "La description est trop longue (maximum 160 caractères)"
					if(input && input.replace(/ /g,'').length < 2 && input.replace(/ /g,'').length > 0) return "La description est trop courte (minimum 2 caractères)"
					return true
				}
			}
		])

		// Supprimer les valeurs vides
		profile = Object.fromEntries(Object.entries(profile).filter(entry => entry[1]))

		// Si aucune valeur
		if(Object.keys(profile).length == 0) return console.log(chalk.red("\nVous n'avez rien rempli")) && process.exit()

		// Afficher un spinner
		spinner.text = `Modification de ${(new Intl.ListFormat('fr', { style: 'long', type: 'conjunction' })).format(Object.keys(profile).map(na => na.replace("name", "nom d'utilisateur").replace("url", "URL").replace("location","localisation")))}`
		spinner.start()

		// Délai volontaire pour que la personne puisse voir les modifications
		// (imagine mettre une demande de confirmation ptdr)
		await new Promise(resolve => setTimeout(resolve, 3000))

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

		// Effectuer les modifications
		await client.post((config?.get("experiments")?.includes('DISABLE_TWITTER_REQUEST_MAJOR_ACTIONS') ? 'EXPERIMENT-DISABLE_TWITTER_REQUEST_MAJOR_ACTIONS-IS-ENABLED' : 'account/update_profile'), profile)
			// Une fois le tweet posté
			.then(results => {
				spinner.text = "Votre profil a été modifié"
				spinner.succeed()
				process.exit()
			})
			// Si y'a une erreur
			.catch(async err => {
				// Arrêter le spinner
				spinner.stop()

				// Donner des infos en plus avec le flag --debug
				if(process.argv.includes("--debug")) console.log(err)

				// Obtenir des informations via un check, puis les donner
				var error = await (errorCheck(err))
				if(error.error === true) return console.log(chalk.red(`Impossible de modifier votre profil : ${error.frenchDescription}`) + chalk.cyan(` (Code erreur #${error.code})`))

				// Sinon, donner l'erreurs comme Twitter la donne
				return console.log(chalk.red(err.errors || err))
			});
	}

	// Si l'action est "quit"
	if(action == "quit") return process.exit()
}

// Fonction pour faire des recherches
async function search(ownAccountInfo){
	// Demander quelques informations
	var informations = await inquirer.prompt([
		{
			type: 'list',
			name: 'type',
			message: 'Type de recherche',
			choices: [
				{ name: 'Utilisateurs', value: 'user' },
				{ name: 'Tweet', value: 'tweet' }
			]
		},
		{
			type: 'list',
			name: 'method',
			message: 'Méthode de recherche',
			choices: [
				{ name: 'Mot clé', value: 'text' },
				{ name: 'Identifiant', value: 'id' }
			]
		}
	])
	var {searchParams} = await inquirer.prompt([
		{
			type: 'input',
			name: 'searchParams',
			message: 'Terme à chercher',
			validate(input){
				input = input.trim()
				if(informations.method == 'id' && !/^\d+$/.test(input)){ return `Identifiant mal formée, exemple (il est en jaune) : https://twitter.com/TwitterAPI/status/${chalk.yellow('210462857140252672')}` }
				if(informations.method == 'tweet' && input.length > 500){ return "Le terme est trop long (maximum 500 caractères)" }
				return true
			}
		}
	])

	// Séparer les résultats affichés et Inquirer
	console.log()

	// Afficher un spinner
	spinner.text = `Recherche...`
	spinner.start()

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

	// Préparer une variable qui contiendra les résultats de recherche
	var results;

	// Faire la recherche
	if(informations.type == 'user' && informations.method == 'text') results = await client.get('users/search', { q: searchParams }).catch(err => { return err })
	if(informations.type == 'user' && informations.method == 'id') results = await client.get('users/show', { user_id: searchParams }).catch(err => { return err })
	if(informations.type == 'tweet' && informations.method == 'text') results = await client.get('search/tweets', { q: searchParams }).catch(err => { return err })
	if(informations.type == 'tweet' && informations.method == 'id') results = await client.get('statuses/show', { id: searchParams }).catch(err => { return err })

	// Si le flag debug est activé, afficher les informations complète sur l'utilisateur
	if(process.argv.includes("--debug")){
		spinner.stop()
		console.log("─".repeat(parseInt(process.stdout.columns)))
		console.log(chalk.bold.underline("Argument --debug :"))
		console.log(JSON.stringify(results))
		console.log("─".repeat(parseInt(process.stdout.columns)))
		spinner.start()
	}

	// Vérifiez si l'information contient une erreur
	var error = await (errorCheck(results))
	if(error.error === true){
		spinner.text = chalk.red(`Impossible d'effectuer la recherche : ${error.frenchDescription}`) + chalk.cyan(` (Code erreur #${error.code})`)
		return spinner.fail()
	}

	// Si la variable contient un objet, ne stocker que son contenu
	if(results.statuses) results = results.statuses
	if(typeof results == 'object' && !Array.isArray(results)) results = [results]

	// Si aucun résultat
	if(results.length == 0){
		spinner.text = chalk.red('Aucun résultat trouvé')
		return spinner.fail()
	}

	// Enlever le spinner
	spinner.stop()

	// Afficher les résultats
	if(informations.type == 'user'){
		console.log(chalk.underline.bold(`${results.length} résultats :`))
		results.forEach(element => {
			console.log(`• ${element.name} (${chalk.yellow('@'+element.screen_name)})       ${chalk.dim(element.id_str)}`)
		})
	}
	if(informations.type == 'tweet') return require('./functions/timeline.js')(oauth, token, ownAccountInfo, config?.get("experiments"), null, results)
}

// Fonction pour demander, puis vérifier si des tokens d'accès sont valides
async function tokenChecker(){
	// Demander les tokens
	var {consumer_key,consumer_secret,access_token,access_token_secret} = await inquirer.prompt([
		{
			type: 'input',
			name: 'consumer_key',
			message: 'consumer_key'
		},
		{
			type: 'input',
			name: 'consumer_secret',
			message: 'consumer_secret'
		},
		{
			type: 'input',
			name: 'access_token',
			message: 'access_token'
		},
		{
			type: 'input',
			name: 'access_token_secret',
			message: 'access_token_secret'
		}
	])

	// Obtenir les informations du compte
	var accountInfo = await fetch({url: 'https://api.twitter.com/1.1/account/verify_credentials.json', method: 'GET'}, OAuth({ consumer: { key: consumer_key, secret: consumer_secret }, signature_method: 'HMAC-SHA1', hash_function(base_string, key){return crypto.createHmac('sha1', key).update(base_string).digest('base64')} }), { key: access_token, secret: access_token_secret })

	// Vérifiez si l'information contient une erreur
	var error = await (errorCheck(accountInfo))
	if(error.error === true){
		console.log(chalk.red(`Impossible de se connecter au compte Twitter : ${error.frenchDescription}`) + chalk.cyan(` (Code erreur #${error.code})`))
		return tokenChecker()
	}

	// Afficher les informations du compte
	console.log(`=========================================`)
	console.log(Object.entries(accountInfo).map(([key, value]) => (key && value && (typeof value == 'string' || typeof value == 'number' || typeof value == 'boolean')) ? `${key}: ${value}` : null).filter(a => a?.length).join('\n'))
	console.log(`=========================================`)

	// Si le compte est valide, demander si l'utilisateur souhaite sauvegarder les tokens dans un emplacement de la config, ou proposer d'en vérifier d'autres
	var {whatToDo} = await inquirer.prompt([
		{
			type: 'list',
			name: 'whatToDo',
			message: 'Que souhaitez vous faire ?',
			choices: [
				{
					name: 'Ajouter le compte à Twitterminal',
					value: 'save'
				},
				{
					name: 'Vérifier un autre compte',
					value: 'check'
				},
				{
					name: 'Quitter',
					value: 'exit'
				}
			]
		}
	])

	// En fonction de ce que l'on souhaite faire
	if(whatToDo == 'save') return require('./functions/config.js')("addAccountLegacy", { consumer_key, consumer_secret, access_token, access_token_secret })
	if(whatToDo == 'check') return tokenChecker()
	if(whatToDo == 'exit') return process.exit()
}

// Fonction pour follow un compte en masse
async function massFollow(){
	// Demander quelques infos
	var informations = await inquirer.prompt([
		{
			type: 'input',
			name: 'screenName',
			message: 'Nom d\'utilisateur du compte',
			validate(input){
				if(input?.startsWith('@')) input = input.substring(1)
				if(!/(^|[^@\w])(\w{1,15})\b/.test(input)){ return "Nom d'utilisateur mal formée" }
				return true
			}
		},
		{
			type: 'checkbox',
			name: 'accountsList',
			message: 'Quel comptes souhaitez vous utiliser ?',
			choices: require('./functions/emplacement.js').emplacementList(0),
			pageSize: (process.stdout.rows-10 > 4) ? process.stdout.rows-10 : null
		}
	])
	var accounts = informations.accountsList

	// N'avoir que le pseudo à chaque fois
	accounts = accounts.map(account => account.replace('Emplacement ','')?.split(' ')[0]?.trim())
	if(accounts.length == 0) return console.log(chalk.red("\nVous n'avez sélectionné aucun compte")) && process.exit()

	// Obtenir les accès de chaque compte
	accounts = accounts.map(account => config.get(`accountList.${account}`))
	if(accounts.length == 0) return console.log(chalk.red("\nAccès aux comptes manquants")) && process.exit()

	// Afficher un spinner
	spinner.text = `Vérification de l'existance d'${chalk.cyan(informations.screenName)}`; spinner.start()

	// Vérifier l'existance du compte
	var accountInfo = await fetch({url: 'https://api.twitter.com/1.1/users/show.json?screen_name=' + informations.screenName.replace(/&/g, encodeURIComponent("&#38;")).replace(/\?/g, encodeURIComponent("&#63;")), method: 'GET'}, OAuth({ consumer: { key: accounts[0]?.consumer_key, secret: accounts[0]?.consumer_secret }, signature_method: 'HMAC-SHA1', hash_function(base_string, key){return crypto.createHmac('sha1', key).update(base_string).digest('base64')} }), { key: accounts[0]?.access_token, secret: accounts[0]?.access_token_secret })

	// Vérifiez si l'information contient une erreur
	var error = await (errorCheck(accountInfo))
	if(error.error === true){
		spinner.text = chalk.red(`Impossible d'obtenir le profil : ${error.frenchDescription}`) + chalk.cyan(` (Code erreur #${error.code})`)
		spinner.fail()
		process.exit()
	}

	// Préparer quelques variables
	var passedAccountNumber = 0;
	var errorsNumber = 0;
	var errorsMessages = [];

	// Avec chaque compte, effectuer l'action
	for(var i = 0; i < accounts.length; i++){
		await new Promise(resolve => setTimeout(resolve, 1500))
		var doAction = await fetch({url: `https://api.twitter.com/1.1/friendships/create.json?screen_name=${accountInfo?.screen_name}`, method: 'POST'}, OAuth({ consumer: { key: accounts[i]?.consumer_key, secret: accounts[i]?.consumer_secret }, signature_method: 'HMAC-SHA1', hash_function(base_string, key){return crypto.createHmac('sha1', key).update(base_string).digest('base64')} }), { key: accounts[i]?.access_token, secret: accounts[i]?.access_token_secret })
	
		// Vérifiez si l'information contient une erreur
		var error = await (errorCheck(doAction))
		if(error.error === true){
			errorsNumber++
			spinner.text = `${passedAccountNumber} ok | ${errorsNumber} fail`
			errorsMessages.push(`• ${accounts[i]?.name} : ${error.frenchDescription || error.errors || error}`)
		} else {
			passedAccountNumber++
			spinner.text = `${passedAccountNumber} ok | ${errorsNumber} fail`
		}
	}

	// Une fois toutes les actions effectuées, afficher le résultat
	spinner.stop()
	if(errorsNumber == 0) return console.log(`\n${passedAccountNumber} comptes ont effectué l'action avec succès`)
	else return console.log(`\n${passedAccountNumber} comptes ont effectué l'action avec succès\n${errorsNumber} comptes échoués :\n${errorsMessages.join('\n')}`)
}

// Fonction pour like un tweet en masse
async function massLike(){
	// Demander quelques infos
	var informations = await inquirer.prompt([
		{
			type: 'input',
			name: 'tweetID',
			message: 'Identifiant du tweet',
			validate(input){
				if(!/^\d+$/.test(input)){ return `Identifiant mal formée, exemple (il est en jaune) : https://twitter.com/TwitterAPI/status/${chalk.yellow('210462857140252672')}` }
				return true
			}
		},
		{
			type: 'checkbox',
			name: 'accountsList',
			message: 'Quel comptes souhaitez vous utiliser ?',
			choices: require('./functions/emplacement.js').emplacementList(0),
			pageSize: (process.stdout.rows-10 > 4) ? process.stdout.rows-10 : null
		}
	])
	var accounts = informations.accountsList

	// N'avoir que le pseudo à chaque fois
	accounts = accounts.map(account => account.replace('Emplacement ','')?.split(' ')[0]?.trim())
	if(accounts.length == 0) return console.log(chalk.red("\nVous n'avez sélectionné aucun compte")) && process.exit()

	// Obtenir les accès de chaque compte
	accounts = accounts.map(account => config.get(`accountList.${account}`))
	if(accounts.length == 0) return console.log(chalk.red("\nAccès aux comptes manquants")) && process.exit()

	// Afficher un spinner
	spinner.text = `Vérification de l'existance du tweet`; spinner.start()

	// Vérifier l'existance du tweet
	var tweetInfo = await fetch({url: `https://api.twitter.com/1.1/statuses/show.json?id=${informations.tweetID}`, method: 'GET'}, OAuth({ consumer: { key: accounts[0]?.consumer_key, secret: accounts[0]?.consumer_secret }, signature_method: 'HMAC-SHA1', hash_function(base_string, key){return crypto.createHmac('sha1', key).update(base_string).digest('base64')} }), { key: accounts[0]?.access_token, secret: accounts[0]?.access_token_secret })

	// Vérifiez si l'information contient une erreur
	var error = await (errorCheck(tweetInfo))
	if(error.error === true){
		spinner.text = chalk.red(`Impossible d'obtenir le tweet : ${error.frenchDescription}`) + chalk.cyan(` (Code erreur #${error.code})`)
		spinner.fail()
		process.exit()
	}

	// Préparer quelques variables
	var passedAccountNumber = 0;
	var errorsNumber = 0;
	var errorsMessages = [];

	// Avec chaque compte, effectuer l'action
	for(var i = 0; i < accounts.length; i++){
		await new Promise(resolve => setTimeout(resolve, 1500))
		var doAction = await fetch({url: `https://api.twitter.com/1.1/favorites/create.json?id=${informations?.tweetID}`, method: 'POST'}, OAuth({ consumer: { key: accounts[i]?.consumer_key, secret: accounts[i]?.consumer_secret }, signature_method: 'HMAC-SHA1', hash_function(base_string, key){return crypto.createHmac('sha1', key).update(base_string).digest('base64')} }), { key: accounts[i]?.access_token, secret: accounts[i]?.access_token_secret })
	
		// Vérifiez si l'information contient une erreur
		var error = await (errorCheck(doAction))
		if(error.error === true){
			errorsNumber++
			spinner.text = `${passedAccountNumber} ok | ${errorsNumber} fail`
			errorsMessages.push(`• ${accounts[i]?.name} : ${error.frenchDescription || error.errors || error}`)
		} else {
			passedAccountNumber++
			spinner.text = `${passedAccountNumber} ok | ${errorsNumber} fail`
		}
	}

	// Une fois toutes les actions effectuées, afficher le résultat
	spinner.stop()
	if(errorsNumber == 0) return console.log(`\n${passedAccountNumber} comptes ont effectué l'action avec succès`)
	else return console.log(`\n${passedAccountNumber} comptes ont effectué l'action avec succès\n${errorsNumber} comptes échoués :\n${errorsMessages.join('\n')}`)
}

// Fonction pour RT un tweet en masse
async function massRt(){
	// Demander quelques infos
	var informations = await inquirer.prompt([
		{
			type: 'input',
			name: 'tweetID',
			message: 'Identifiant du tweet',
			validate(input){
				if(!/^\d+$/.test(input)){ return `Identifiant mal formée, exemple (il est en jaune) : https://twitter.com/TwitterAPI/status/${chalk.yellow('210462857140252672')}` }
				return true
			}
		},
		{
			type: 'checkbox',
			name: 'accountsList',
			message: 'Quel comptes souhaitez vous utiliser ?',
			choices: require('./functions/emplacement.js').emplacementList(0),
			pageSize: (process.stdout.rows-10 > 4) ? process.stdout.rows-10 : null
		}
	])
	var accounts = informations.accountsList

	// N'avoir que le pseudo à chaque fois
	accounts = accounts.map(account => account.replace('Emplacement ','')?.split(' ')[0]?.trim())
	if(accounts.length == 0) return console.log(chalk.red("\nVous n'avez sélectionné aucun compte")) && process.exit()

	// Obtenir les accès de chaque compte
	accounts = accounts.map(account => config.get(`accountList.${account}`))
	if(accounts.length == 0) return console.log(chalk.red("\nAccès aux comptes manquants")) && process.exit()

	// Afficher un spinner
	spinner.text = `Vérification de l'existance du tweet`; spinner.start()

	// Vérifier l'existance du tweet
	var tweetInfo = await fetch({url: `https://api.twitter.com/1.1/statuses/show.json?id=${informations.tweetID}`, method: 'GET'}, OAuth({ consumer: { key: accounts[0]?.consumer_key, secret: accounts[0]?.consumer_secret }, signature_method: 'HMAC-SHA1', hash_function(base_string, key){return crypto.createHmac('sha1', key).update(base_string).digest('base64')} }), { key: accounts[0]?.access_token, secret: accounts[0]?.access_token_secret })

	// Vérifiez si l'information contient une erreur
	var error = await (errorCheck(tweetInfo))
	if(error.error === true){
		spinner.text = chalk.red(`Impossible d'obtenir le tweet : ${error.frenchDescription}`) + chalk.cyan(` (Code erreur #${error.code})`)
		spinner.fail()
		process.exit()
	}

	// Préparer quelques variables
	var passedAccountNumber = 0;
	var errorsNumber = 0;
	var errorsMessages = [];

	// Avec chaque compte, effectuer l'action
	for(var i = 0; i < accounts.length; i++){
		await new Promise(resolve => setTimeout(resolve, 1500))
		var doAction = await fetch({url: `https://api.twitter.com/1.1/statuses/retweet.json?id=${informations?.tweetID}`, method: 'POST'}, OAuth({ consumer: { key: accounts[i]?.consumer_key, secret: accounts[i]?.consumer_secret }, signature_method: 'HMAC-SHA1', hash_function(base_string, key){return crypto.createHmac('sha1', key).update(base_string).digest('base64')} }), { key: accounts[i]?.access_token, secret: accounts[i]?.access_token_secret })
	
		// Vérifiez si l'information contient une erreur
		var error = await (errorCheck(doAction))
		if(error.error === true){
			errorsNumber++
			spinner.text = `${passedAccountNumber} ok | ${errorsNumber} fail`
			errorsMessages.push(`• ${accounts[i]?.name} : ${error.frenchDescription || error.errors || error}`)
		} else {
			passedAccountNumber++
			spinner.text = `${passedAccountNumber} ok | ${errorsNumber} fail`
		}
	}

	// Une fois toutes les actions effectuées, afficher le résultat
	spinner.stop()
	if(errorsNumber == 0) return console.log(`\n${passedAccountNumber} comptes ont effectué l'action avec succès`)
	else return console.log(`\n${passedAccountNumber} comptes ont effectué l'action avec succès\n${errorsNumber} comptes échoués :\n${errorsMessages.join('\n')}`)
}

// Fonction pour commenter un tweet en masse
async function massComment(){
	// Demander quelques infos
	var informations = await inquirer.prompt([
		{
			type: 'input',
			name: 'tweetID',
			message: 'Identifiant du tweet',
			validate(input){
				if(!/^\d+$/.test(input)){ return `Identifiant mal formée, exemple (il est en jaune) : https://twitter.com/TwitterAPI/status/${chalk.yellow('210462857140252672')}` }
				return true
			}
		},
		{
			type: 'input',
			name: 'content',
			message: 'Que dire ?',
			validate(input){
				if(input.length < 1){ return 'Veuillez entrer un texte' }
				if(input.length > 255){ return `Ce texte est trop grand (${input.length} caractères)` }
				return true
			}
		},
		{
			type: 'checkbox',
			name: 'accountsList',
			message: 'Quel comptes souhaitez vous utiliser ?',
			choices: require('./functions/emplacement.js').emplacementList(0),
			pageSize: (process.stdout.rows-10 > 4) ? process.stdout.rows-10 : null
		}
	])
	var accounts = informations.accountsList

	// N'avoir que le pseudo à chaque fois
	accounts = accounts.map(account => account.replace('Emplacement ','')?.split(' ')[0]?.trim())
	if(accounts.length == 0) return console.log(chalk.red("\nVous n'avez sélectionné aucun compte")) && process.exit()

	// Obtenir les accès de chaque compte
	accounts = accounts.map(account => config.get(`accountList.${account}`))
	if(accounts.length == 0) return console.log(chalk.red("\nAccès aux comptes manquants")) && process.exit()

	// Afficher un spinner
	spinner.text = `Vérification de l'existance du tweet`; spinner.start()

	// Vérifier l'existance du tweet
	var tweetInfo = await fetch({url: `https://api.twitter.com/1.1/statuses/show.json?id=${informations.tweetID}`, method: 'GET'}, OAuth({ consumer: { key: accounts[0]?.consumer_key, secret: accounts[0]?.consumer_secret }, signature_method: 'HMAC-SHA1', hash_function(base_string, key){return crypto.createHmac('sha1', key).update(base_string).digest('base64')} }), { key: accounts[0]?.access_token, secret: accounts[0]?.access_token_secret })

	// Vérifiez si l'information contient une erreur
	var error = await (errorCheck(tweetInfo))
	if(error.error === true){
		spinner.text = chalk.red(`Impossible d'obtenir le tweet : ${error.frenchDescription}`) + chalk.cyan(` (Code erreur #${error.code})`)
		spinner.fail()
		process.exit()
	}

	// Préparer quelques variables
	var passedAccountNumber = 0;
	var errorsNumber = 0;
	var errorsMessages = [];

	// Avec chaque compte, effectuer l'action
	for(var i = 0; i < accounts.length; i++){
		await new Promise(resolve => setTimeout(resolve, 1500))
		var bodyFormData = new FormData()
		bodyFormData.append('status', informations.content)
		bodyFormData.append('in_reply_to_status_id', informations.tweetID)
		bodyFormData.append('auto_populate_reply_metadata', 'true')
		var doAction = await fetch({url: `https://api.twitter.com/1.1/statuses/update.json`, method: 'POST', body: bodyFormData}, OAuth({ consumer: { key: accounts[i]?.consumer_key, secret: accounts[i]?.consumer_secret }, signature_method: 'HMAC-SHA1', hash_function(base_string, key){return crypto.createHmac('sha1', key).update(base_string).digest('base64')} }), { key: accounts[i]?.access_token, secret: accounts[i]?.access_token_secret })

		// Vérifiez si l'information contient une erreur
		var error = await (errorCheck(doAction))
		if(error.error === true){
			errorsNumber++
			spinner.text = `${passedAccountNumber} ok | ${errorsNumber} fail`
			errorsMessages.push(`• ${accounts[i]?.name} : ${error.frenchDescription || error.errors || error}`)
		} else {
			passedAccountNumber++
			spinner.text = `${passedAccountNumber} ok | ${errorsNumber} fail`
		}
	}

	// Une fois toutes les actions effectuées, afficher le résultat
	spinner.stop()
	if(errorsNumber == 0) return console.log(`\n${passedAccountNumber} comptes ont effectué l'action avec succès`)
	else return console.log(`\n${passedAccountNumber} comptes ont effectué l'action avec succès\n${errorsNumber} comptes échoués :\n${errorsMessages.join('\n')}`)
}
