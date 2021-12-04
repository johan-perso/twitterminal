// Crée une config / l'importer
const Conf = require('conf');
const config = new Conf({projectName: "twitterminal", projectSuffix: ""});

// Importer quelques modules et fonctions locales
const inquirer = require('inquirer');
const chalk = require('chalk');
const fetch = require('node-fetch');
const moment = require('moment');
const fs = require('fs');
const ora = require('ora'); const spinner = ora('')
var writeClipboard = require('./writeClipboard.js')
var replaceText = require('./replaceText.js');

// Fonction pour vérifier si c'est du JSON ou non (https://stackoverflow.com/a/33369954/16155654)
function isJson(item){
	item = typeof item !== "string" ? JSON.stringify(item) : item;

	try {
		item = JSON.parse(item);
	} catch (e){
		return false;
	}

	if(typeof item === "object" && item !== null) return true;

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
				'Importer/exporter',
				'Gérer les expérimentation',
				'Réinitialiser Twitterminal',
			]
		}
	])
	.then(answer => {
		if(answer.action.toLowerCase() === "ajouter un compte") return require('./configOauth.js')()
		if(answer.action.toLowerCase() === "ajouter un compte (dev/manuellement)") return addAccountLegacy() 
		if(answer.action.toLowerCase() === "choisir un compte par défaut") return defaultAccount()
		if(answer.action.toLowerCase() === "gestion du presse-papier") return clipboardSettings()
		if(answer.action.toLowerCase() === "importer/exporter") return importExportConfig()
		if(answer.action.toLowerCase() === "réinitialiser twitterminal") return resetTwitterminal()
		if(answer.action.toLowerCase() === "gérer les expérimentation") return manageExperiments()
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
	// Obtenir la liste des choix
	var choices = []
	if(!config.get('johanstickman_account_uuid')) choices.push('Configurer son compte');
	else choices.push('Importer une configuration') && choices.push('Exporter la configuration') && choices.push('Supprimer une sauvegarde') 

	// Afficher un menu
	var action = await inquirer.prompt([
		{
			type: 'list',
			name: 'action',
			message: 'Que voulez-vous faire ?',
			choices: choices
		}
	])
	var action = action.action

	// Selon le choix
	if(action.toLowerCase() === 'configurer son compte'){
		console.log(`\nPour sauvegarder votre configuration Twitterminal, accéder à ${chalk.cyan("johanstickman.com/uuid")} et entrer votre UUID de compte.`)
		setTimeout(() => addJohanstickmanAccount(), 500);
	}
	if(action.toLowerCase() === 'importer une configuration'){
		console.log("\nVotre configuration actuelle sera remplacer...")
		setTimeout(() => importConfig(), 2000);
	}
	if(action.toLowerCase() === 'exporter la configuration'){
		console.log(`\nVotre configuration Twitterminal contient l'accès à vos comptes enregistrés (telle que ${config.get('account.name')}) : faites attention à qui vous la partager.`)
		setTimeout(() => exportConfig(), 3250);
	}
	if(action.toLowerCase() === 'supprimer une sauvegarde'){
		deleteBackup()
	}
}

// Fonction pour importer une configuration
async function importConfig(){
	// Obtenir la liste des sauvegarde dans la configuration
	var configBackupList = []
	if(config.get('configBackupList')) config.get('configBackupList').sort((a,b) => b.createdAt-a.createdAt).forEach((backupInfo,i) => { configBackupList.push(`(${i+1}) Backup du ${moment.unix(backupInfo.createdAt).format("DD/MM/YYYY [à] HH:mm:ss")}`) })
	if(config.get('configBackupList')) configBackupList.push("Entrer un identifiant")

	// Si une backup est dans la liste, demander quel backup utilisé
	if(configBackupList[0]) var backupId = await inquirer.prompt([
		{
			type: 'list',
			name: 'backupId',
			message: 'Quel sauvegarde voulez-vous utiliser ?',
			choices: configBackupList
		}
	])
	if(configBackupList[0]) var backupId = backupId.backupId

	// Si la liste des backups est vide, demander un identifiant
	if(!configBackupList[0] || backupId === "Entrer un identifiant") var backupIdI = await inquirer.prompt([
		{
			type: 'input',
			name: 'backupId',
			message: 'Identifiant de la sauvegarde',
			validate(text){
				if(text.length < 1){ return 'Veuillez entrer un identifiant' }
				return true;
			}
		}
	])
	if(!configBackupList[0] || backupId === "Entrer un identifiant") var backupId = backupIdI.backupId

	// Obtenir l'identifiant
	if(configBackupList[0] && !backupIdI) var backupId = config.get('configBackupList').sort((a,b) => b.createdAt-a.createdAt)[(parseInt(backupId.split(')')[0].substr(1))-1)].id

	// Vérifier si l'identifiant contient un tiret (toute les backups contiennent ce caractère)
	if(!backupId.includes("-")){
		spinner.text = 'L\'identifiant est invalide.'
		spinner.fail()
		return process.exit()
	}

	// Afficher un spinner
	spinner.text = "Importation en cours..."
	spinner.start()

	// Obtenir la configuration originale
	var backup = await fetch(`https://text.johanstickman.com/raw/${backupId}`)
	.then(res => res.text())
	.catch(async err => {
		spinner.text = "FETCHERR_UNABLE_GET_BACKUP"
		return spinner.fail()
	})

	// Si la taille du texte est supérieure à 99999 bits
	if(encodeURI(backup).split(/%..|./).length - 1 > 99999){
		spinner.text = "Le contenu de cette sauvegarde est trop volumineuse pour être importée."
		spinner.fail()
		return process.exit()
	}

	// Si Johan Text a renvoyé une erreur
	if(backup.startsWith("/\\ ERREUR /\\")){
		spinner.text = backup.split('\n')[2].replace("Impossible de trouver le texte que vous souhaitez",`Aucune sauvegarde associé à l'id ${chalk.cyan(backupId)} n'a été trouvée.`).replace("Impossible de déchiffrer le texte, assurez-vous d'avoir utilisé le bon lien.",`Impossible de déchiffrer la sauvegarde ${chalk.cyan(backupId.split("-")[0])} avec la clé ${chalk.cyan(backupId.split("-")[1])}.`).replace("L'ID du texte est mal formulé","L'identifiant n'est pas considéré comme valide. Il doit commencer par un nombre, suivi d'un tiret et d'une suite de caractères.")
		return spinner.fail()
	}

	// Vérifier si la configuration est un contenu JSON
	if(!isJson(backup)){
		spinner.text = "Importation impossible : la sauvegarde n'est pas considéré comme du JSON"
		return spinner.fail()
	}

	// Modifier la configuration
	fs.writeFile(config.path, backup, function (err){
		// En cas d'erreur
		if(err){
			spinner.text = chalk.red(`Impossible d'accèder au fichier de configuration : ${err.message}`) + chalk.cyan(" (Code erreur #6.1)")
			spinner.fail()
		}

		// Arrêter le spinner
		spinner.text = "Configuration importée avec succès"
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
	fs.readFile(config.path, 'utf8', async function(err, data){
		// En cas d'erreur
		if(err){
			spinner.text = chalk.red(`Impossible d'accèder au fichier de configuration : ${err.message}`) + chalk.cyan(" (Code erreur #5.1)")
			spinner.fail()
		}

		// Si la taille du fichier est supérieure à 99999 bits
		if(encodeURI(data).split(/%..|./).length - 1 > 99999){
			spinner.text = "La configuration est trop volumineuse pour être exportée."
			spinner.fail()
			return process.exit()
		}

		// Crée un texte contenant la configuration
		var backup = await fetch(`https://text.johanstickman.com/api/create`, { method: 'post', body: new URLSearchParams({ title: `Twitterminal backup, ${moment().format("DD/MM/YYYY [at] HH:mm:ss")}`, content: data, type: 'code', codeLanguage: 'json', uuid: config.get('johanstickman_account_uuid') }) })
		.then(res => res.json())
		.catch(async err => {
			spinner.text = "FETCHERR_UNABLE_CREATE_BACKUP"
			return spinner.fail()
		})

		// Si Johan Text a renvoyé une erreur
		if(backup.error === true){
			spinner.text = backup.message.replace("Impossible de crée le texte.","Impossible de crée une sauvegarde : problème avec l'API")
			return spinner.fail()
		}

		// Ajouter l'id du haste au presse papier
		writeClipboard(`${backup.advancedInfo.id}-${backup.advancedInfo.encryptionKey}`)

		// Arrêter le spinner
		spinner.text = `Configuration exportée, identifiant ${chalk.cyan(`${backup.advancedInfo.id}-${backup.advancedInfo.encryptionKey}`)}, clé de suppression ${chalk.cyan(backup.advancedInfo.secretKey)}`
		spinner.succeed()

		// Ajouter la backup à la liste dans la configuration
		if(await config.get('configBackupList')) var configBackupList = config.get('configBackupList'); else var configBackupList = []
		var configBackupList = configBackupList.concat({ id: `${backup.advancedInfo.id}-${backup.advancedInfo.encryptionKey}`, secretKey: backup.advancedInfo.secretKey, createdAt: moment().unix() })
		config.set('configBackupList', configBackupList)

		// Arrêter le processus
		return process.exit()
	});
}

// Fonction pour supprimer une backup
async function deleteBackup(){
	// Obtenir la liste des sauvegarde dans la configuration
	var configBackupList = []
	if(config.get('configBackupList')) config.get('configBackupList').sort((a,b) => a.createdAt-b.createdAt).forEach((backupInfo,i) => { configBackupList.push(`(${i+1}) Backup du ${moment.unix(backupInfo.createdAt).format("DD/MM/YYYY [à] HH:mm:ss")}`) })
	if(config.get('configBackupList')) configBackupList.push("Entrer un identifiant")

	// Si une backup est dans la liste, demander quel backup utilisé
	if(configBackupList[0]) var backup = await inquirer.prompt([
		{
			type: 'list',
			name: 'backup',
			message: 'Quel sauvegarde voulez-vous supprimer ?',
			choices: configBackupList
		}
	])
	if(configBackupList[0] && backup.backup !== "Entrer un identifiant") var backup = { id: config.get('configBackupList').sort((a,b) => a.createdAt-b.createdAt)[(parseInt(backup.backup.split(')')[0].substr(1))-1)].id, secretKey: config.get('configBackupList').sort((a,b) => a.createdAt-b.createdAt)[(parseInt(backup.backup.split(')')[0].substr(1))-1)].secretKey }

	// Si la liste des backups est vide, demander un identifiant
	if(!configBackupList[0] || backup.backup === "Entrer un identifiant") var backupI = await inquirer.prompt([
		{
			type: 'input',
			name: 'backupId',
			message: 'Identifiant de la sauvegarde',
			validate(text){
				if(text.length < 1){ return 'Veuillez entrer un identifiant' }
				return true;
			}
		},
		{
			type: 'input',
			name: 'backupKey',
			message: 'Clé de suppression',
			validate(text){
				if(text.length < 1){ return 'Veuillez entrer une clé de suppression' }
				return true;
			}
		}
	])
	if(!configBackupList[0] || backup.backup === "Entrer un identifiant") var backup = { id: backupI.backupId, secretKey: backupI.backupKey }

	// Vérifier si l'identifiant contient un tiret (toute les backups contiennent ce caractère)
	if(!backup.id.includes("-")){
		spinner.text = 'L\'identifiant est invalide.'
		spinner.fail()
		return process.exit()
	}

	// Afficher un spinner
	spinner.text = "Suppression de la sauvegarde en cours..."
	spinner.start()

	// Supprimer la sauvegarde
	var deleted = await fetch(`https://text.johanstickman.com/api/delete`, { method: 'delete', body: new URLSearchParams({ id: backup.id.split("-")[0], secretKey: backup.secretKey }) })
	.then(res => res.json())
	.catch(async err => {
		spinner.text = "FETCHERR_UNABLE_DELETE_BACKUP"
		return spinner.fail()
	})

	// Si Johan Text a renvoyé une erreur
	if(deleted.error === true){
		spinner.text = deleted.message.replace("Le texte associé à cette identifiant n'a pas été trouvé",`Aucune sauvegarde associé à l'id ${chalk.cyan(backup.id)} et la clé ${chalk.cyan(backup.secretKey)} n'a été trouvée.`).replace("L'\"id\" est mal formé, celui-ci doit être un nombre.","L'identifiant n'est pas considéré comme valide. Il doit commencer par un nombre, suivi d'un tiret et d'une suite de caractères.").replace("Impossible de trouver le texte associé à cette identifiant et cette clé secrète","Aucune sauvegarde associé à cette identifiant et cette clé de suppression n'a été trouvée.")
		return spinner.fail()
	}
	
	// Arrêter le spinner
	spinner.text = `Sauvegarde supprimée avec succès !`
	spinner.succeed()

	// Supprimer la backup de la liste dans la configuration
	if(await config.get('configBackupList')) var configBackupList = config.get('configBackupList'); else var configBackupList = []
	var configBackupList = configBackupList.filter(function(obj){ return obj.id !== backup.id })
	config.set('configBackupList', configBackupList)
}

// Fonction pour configurer un compte Johanstickman
async function addJohanstickmanAccount(){
	// Demander l'UUID du compte
	var johanstickmanUuid = await inquirer.prompt([
		{
			type: 'input',
			name: 'johanstickmanUuid',
			message: 'UUID de votre compte'
		}
	])
	var johanstickmanUuid = johanstickmanUuid.johanstickmanUuid

	// Afficher un spinner
	spinner.text = "Vérification de votre compte..."
	spinner.start()

	// Obtenir des informations sur le compte
	var johanstickmanAccount = await fetch(`https://johanstickman.com/api/info?uuid=${johanstickmanUuid}`)
	.then(res => res.json())
	.catch(async err => {
		spinner.text = "FETCHERR_UNABLE_GET_USERINFO"
		return spinner.fail()
	})
	if(johanstickmanAccount?.error === true){
		spinner.text = johanstickmanAccount?.message
		return spinner.fail()
	}
	if((JSON.stringify(johanstickmanAccount?.data)).length === 2){
		spinner.text = `Impossible d'obtenir des informations sur votre compte`
		return spinner.fail()
	}

	// Afficher un texte de bienvenue
	spinner.text = `Connexion en tant que ${johanstickmanAccount?.data?.username} réussi !`
	spinner.succeed()

	// Ajouter l'UUID dans la configuration
	config.set('johanstickman_account_uuid',johanstickmanUuid)

	// Dire de redémarrer Twitterminal
	console.log(chalk.green("\nPour appliquer les modifications, Twitterminal a besoin d'être redémarrer."))
	return process.exit()
}

// Fonction pour réinitialiser la configuration de Twitterminal
async function resetTwitterminal(){
	// Demander si l'utilisateur est sûr de vouloir réinitialiser la configuration
	console.log(chalk.red(`ATTENTION : cette action va supprimer toutes les données de Twitterminal ${chalk.red.bold('Y COMPRIS LA LISTE DE VOS SAUVEGARDES')}. Avez-vous pensé à sauvegarder vos données ainsi que son identifiant ?\n`))
	await inquirer.prompt([
		{
			type: 'input',
			name: 'resetPhrase',
			message: 'Entrer "Oui, je suis sûr." pour réinitialiser la configuration :',
			validate(text){
				if(text !== "Oui, je suis sûr."){ return 'Veuillez entrer "Oui, je suis sûr." pour confirmer la supression de vos données.' }
				return true;
			}
		}
	])

	// Afficher un spinner
	spinner.text = "Réinitialisation de la configuration en cours..."
	spinner.start()

	// Attendre 3.5 secondes avant de tout supprimer
	setTimeout(async () => {
		await config.clear()

		spinner.text = "Configuration réinitialisée avec succès !"
		spinner.succeed()

		console.log(chalk.green("\nPour appliquer les modifications, Twitterminal a besoin d'être redémarrer."))
		return process.exit()
	}, 3500)
}

// Fonction pour activer/désactiver des expérimentation
async function manageExperiments(){
	// Afficher des informations sur les expérimentation
	console.log(chalk.red(`Notez que ces fonctionnalités sont en cours de développement, signaler les bugs à @Johan_Stickman :)\n`))

	// Obtenir la liste des expérimentation
	var experimentChoices = []
	await config.get('experiments')?.forEach(experiment => { if(!JSON.stringify(experimentChoices).includes(`"name":"${experiment}"`)) experimentChoices.push({ name: experiment, checked: true }) })
	var allExperiments = ["CONFIG_IN_TEXT_EDITOR","DISABLE_CONNECTION_CHECK","SHOW_TIMELINE"]
	allExperiments.forEach(experiment => { if(!JSON.stringify(experimentChoices).includes(`"name":"${experiment}"`)) experimentChoices.push({ name: experiment, checked: false }) })

	// Afficher un menu avec la liste des expérimentation
	var experiments = await inquirer.prompt([
		{
			type: 'checkbox',
			name: 'experiments',
			message: 'Choisissez les expérimentations à activer',
			choices: experimentChoices
		}
	])

	// Afficher un spinner
	spinner.text = "Modification de la configuration..."
	spinner.start()

	// Modifier la configuration
	config.set('experiments', experiments.experiments)

	// Dire de redémarrer Twitterminal
	spinner.text = "Liste des expérimentation mise à jour !"
	spinner.succeed()

	console.log(chalk.green("\nPour appliquer les modifications, Twitterminal a besoin d'être redémarrer."))
	return process.exit()
}
