// Crée une config / l'importer
const Conf = require('conf');
const config = new Conf({projectName: "twitterminal", projectSuffix: ""});

// Importer quelques modules et fonctions locales
const inquirer = require('inquirer');
const chalk = require('chalk');
JSON.minify = require("node-json-minify");
const hastebin = require('hastebin.js');
const haste = new hastebin({url: 'https://hasteb.herokuapp.com'});
const fs = require('fs');
const ora = require('ora'); const spinner = ora('')
var writeClipboard = require('./writeClipboard.js')
var replaceText = require('./replaceText.js');

// Fonction pour vérifier si c'est du JSON ou non (https://stackoverflow.com/a/33369954/16155654)
function isJson(item) {
	item = typeof item !== "string" ? JSON.stringify(item) : item;

	try {
		item = JSON.parse(item);
	} catch (e) {
		return false;
	}

	if (typeof item === "object" && item !== null) return true;

	return false;
}

// Exporter en tant que module
module.exports = async function(option){
	// Si une option a été ajouté
	if(option === "importConfig") importConfig()

	// Afficher un menu
	if(!option) inquirer.prompt([
		{
			type: 'list',
			name: 'action',
			message: 'Que voulez-vous faire ?',
			choices: [
				'Ajouter un compte',
				'Ajouter un compte (dev/manuellement)',
				'Choisir un compte par défaut',
				'Gestion du presse-papier',
				'Importer/exporter'
			]
		}
	])
	.then(answer => {
		if(answer.action.toLowerCase() === "ajouter un compte") return require('./configOauth.js')()
		if(answer.action.toLowerCase() === "ajouter un compte (dev/manuellement)") return addAccountLegacy() 
		if(answer.action.toLowerCase() === "choisir un compte par défaut") return defaultAccount()
		if(answer.action.toLowerCase() === "gestion du presse-papier") return clipboardSettings()
		if(answer.action.toLowerCase() === "importer/exporter") return importExportConfig()
	});
}

// Ajouter un compte (legacy)
async function addAccountLegacy(){
	// Afficher un menu
	var account = await inquirer.prompt([
		{
			type: 'input',
			name: 'name',
			message: 'Nom du compte'
		},
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
		if(emplacement === 'Emplacement 1') config.set({ 'accountList.1.name': account.name, 'accountList.1.consumer_key': account.consumer_key, 'accountList.1.consumer_secret': account.consumer_secret, 'accountList.1.access_token': account.access_token, 'accountList.1.access_token_secret': account.access_token_secret, 'accountList.1.type': "legacy" });
		if(emplacement === 'Emplacement 2') config.set({ 'accountList.2.name': account.name, 'accountList.2.consumer_key': account.consumer_key, 'accountList.2.consumer_secret': account.consumer_secret, 'accountList.2.access_token': account.access_token, 'accountList.2.access_token_secret': account.access_token_secret, 'accountList.2.type': "legacy" });
		if(emplacement === 'Emplacement 3') config.set({ 'accountList.3.name': account.name, 'accountList.3.consumer_key': account.consumer_key, 'accountList.3.consumer_secret': account.consumer_secret, 'accountList.3.access_token': account.access_token, 'accountList.3.access_token_secret': account.access_token_secret, 'accountList.3.type': "legacy" });
		if(emplacement === 'Emplacement 4') config.set({ 'accountList.4.name': account.name, 'accountList.4.consumer_key': account.consumer_key, 'accountList.4.consumer_secret': account.consumer_secret, 'accountList.4.access_token': account.access_token, 'accountList.4.access_token_secret': account.access_token_secret, 'accountList.4.type': "legacy" });
		if(emplacement === 'Emplacement 5') config.set({ 'accountList.5.name': account.name, 'accountList.5.consumer_key': account.consumer_key, 'accountList.5.consumer_secret': account.consumer_secret, 'accountList.5.access_token': account.access_token, 'accountList.5.access_token_secret': account.access_token_secret, 'accountList.5.type': "legacy" });

		// Définir le compte par défaut
		config.set({ 'account.name': account.name, 'account.consumer_key': account.consumer_key, 'account.consumer_secret': account.consumer_secret, 'account.access_token': account.access_token, 'account.access_token_secret': account.access_token_secret });

	// Arrêter le processus
	config.set('not_first_start','true')
	console.log(chalk.green("\nPour appliquer les modifications, Twitterminal a besoin d'être redémarrer."))
	return process.exit()
}

// Choisir le compte par défaut
async function defaultAccount(){
	// Obtenir la liste des comptes
	var listAccount = []
	if(config.get('accountList.1.name')) listAccount.push(`(1) ${config.get('accountList.1.name')}`)
	if(config.get('accountList.2.name')) listAccount.push(`(2) ${config.get('accountList.2.name')}`)
	if(config.get('accountList.3.name')) listAccount.push(`(3) ${config.get('accountList.3.name')}`)
	if(config.get('accountList.4.name')) listAccount.push(`(4) ${config.get('accountList.4.name')}`)
	if(config.get('accountList.5.name')) listAccount.push(`(5) ${config.get('accountList.5.name')}`)

	// Si il n'y a aucun compte
	if(listAccount.length === 0){
		console.log(chalk.red(`Vous ne possédez aucun compte, retournez dans la configuration pour en ajouter un.`))
		return process.exit()
	}

	// Afficher un menu
	var account = await inquirer.prompt([
		{
			type: 'list',
			name: 'account',
			message: 'Quel compte souhaitez-vous définir par défaut ?',
			choices: listAccount
		}
	])
	var account = account.account.split(')')[0].replace('(','')

	// Définir le compte par défaut
		// Obtenir plus d'information sur le compte
		var account = config.get(`accountList.${account}`)

		// Modifier la configuration
		config.set({ 'account.name': account.name, 'account.consumer_key': account.consumer_key, 'account.consumer_secret': account.consumer_secret, 'account.access_token': account.access_token, 'account.access_token_secret': account.access_token_secret });

	// Arrêter le processus
	console.log(chalk.green("\nPour appliquer les modifications, Twitterminal a besoin d'être redémarrer."))
	return process.exit()
}

// Paramètre du presse-papier
async function clipboardSettings(){
	// Affichage de quelques informations
	console.log("\nLa gestion du presse-papier n'est fonctionnelle que sur Windows et macOS. Vous pouvez quand même forcer son activation. Lors de certaines actions, le presse-papier peut être automatiquement utilisé.\n")

	// Afficher un menu
	var settings = await inquirer.prompt([
		{
			type: 'list',
			name: 'settings',
			message: 'Quel paramètre souhaitez vous modifier ?',
			choices: [
				`Ecriture automatique (actuellement ${await(replaceText.truefalse((config.get('clipboardy')).use))})`,
				`Utilisation forcé (actuellement ${await(replaceText.truefalse((config.get('clipboardy')).force))})`
			]
		}
	])
	var settings = settings.settings

	// Selon le paramètres à modifié choisi
	if(settings.toLowerCase().startsWith('ecriture automatique')){
		// Modifier la configuration
		config.set('clipboardy.use', (replaceText.reverseBoolean((config.get('clipboardy')).use)))

		// Afficher un message
		console.log(chalk.green(`L'écriture automatique du presse-papier a été modifié.`))
	}
	if(settings.toLowerCase().startsWith('utilisation forcé')){
		// Modifier la configuration
		config.set('clipboardy.force', (replaceText.reverseBoolean((config.get('clipboardy')).force)))

		// Afficher un message
		console.log(chalk.green(`L'utilisation forcé du presse-papier a été modifié.`))
	}

	// Arrêter le processus
	return process.exit()
}

// Importer/exporter la configuration
async function importExportConfig(){
	// Afficher un menu
	var action = await inquirer.prompt([
		{
			type: 'list',
			name: 'action',
			message: 'Que voulez-vous faire ?',
			choices: [
				'Importer une configuration',
				'Exporter la configuration'
			]
		}
	])
	var action = action.action

	// Selon le choix
	if(action.toLowerCase() === 'importer une configuration'){
		console.log("\nVotre configuration actuelle sera remplacer...\n")
		setTimeout(() => importConfig(), 2000);
	}
	if(action.toLowerCase() === 'exporter la configuration'){
		console.log(`\nVotre configuration Twitterminal contient l'accès à vos comptes enregistrés (telle que ${config.get('account.name')}) : faites attention à qui vous la partager car elle ne peut être supprimé.\n`)
		setTimeout(() => exportConfig(), 3250);
	}
}

// Fonction pour importer une configuration
async function importConfig(){
	// Obtenir "l'identifiant d'exportation" (code du haste)
	var exportId = await inquirer.prompt([
		{
			type: 'input',
			name: 'exportId',
			message: 'Identifiant de l\'exportation'
		}
	])
	var exportId = exportId.exportId

	// Afficher un spinner
	spinner.text = "Importation de la configuration..."
	spinner.start()

	// Si aucun identifiant n'a été donné
	if(!exportId){
		spinner.text = "Aucun identifiant d'exportation n'a été donnée"
		spinner.fail()
		return process.exit()
	}

	// Obtenir la configuration originale
	var hasteContent = await haste.get(exportId).catch(err => {
		spinner.text = "Aucune configuration associé à cette identifiant n'a été trouvée"
		spinner.fail()
		return process.exit()
	})

	// Vérifier si la configuration est du JSON
	if(!isJson(hasteContent)){
		spinner.text = "Importation impossible (Le contenu n'est pas du JSON)"
		return spinner.fail()
	}

	// Modifier la configuration
	fs.writeFile(config.path, hasteContent, function (err) {
		// En cas d'erreur
		if(err) spinner.fail() && console.log(chalk.red(`Impossible d'accèder au fichier de configuration : ${err.message}`) + chalk.cyan(" (Code erreur #6.1)"))

		// Arrêter le spinner
		spinner.text = "Configuration importée"
		spinner.succeed()
		
		// Arrêter le processus
		process.exit()
	});
}

// Fonction pour exporter la configuration
async function exportConfig(){
	// Afficher un spinner
	spinner.text = "Exportation de la configuration..."
	spinner.start()

	// Obtenir le contenu du fichier de configuration
	fs.readFile(config.path, 'utf8', async function(err, data) {
		// En cas d'erreur
		if(err) spinner.fail() && console.log(chalk.red(`Impossible d'accèder au fichier de configuration : ${err.message}`) + chalk.cyan(" (Code erreur #5.1)"))

		// Obtenir une configuration minifié
		var mini = JSON.minify(data)

		// Crée un hastebin avec la configuration minifié
		var exported = (await haste.post(mini, "json")).replace("https://hasteb.herokuapp.com/","").replace(".json","")

		// Ajouter l'id du haste au presse papier
		writeClipboard(exported)

		// Arrêter le spinner
		spinner.text = "Configuration exportée"
		spinner.succeed()

		// Afficher l'id du haste
		console.log(`\nIdentifiant d'exportation : ${chalk.gray.dim(exported)}\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑`)

		// Arrêter le processus
		return process.exit()
	});
}
