#!/usr/bin/env node

// Importer quelques modules
	// Les définir
	var chalk
	var jsonrepair
	var path
	var inquirer
	var Conf
	var fetch
	var open
	var fs

	// Les importer
	try { chalk = require('chalk') } catch (e){ failRequireModule("chalk") }
	try { jsonrepair = require('jsonrepair') } catch (e){ failRequireModule("jsonrepair") }
	try { path = require('path') } catch (e){ failRequireModule("path") }
	try { inquirer = require('inquirer') } catch (e){ failRequireModule("inquirer") }
	try { Conf = require('conf') } catch (e){ failRequireModule("conf") }
	try { fetch = require('node-fetch') } catch (e){ failRequireModule("node-fetch") }
	try { open = require('open') } catch (e){ failRequireModule("open") }
	try { fs = require('fs') } catch (e){ failRequireModule("fs") }

// Vérifier la version de NodeJS utilisé
if(parseInt(process.versions.node) < 15){
	console.log(`${chalk.red('[FATAL]')} Version de NodeJS (${process.version}) trop ancienne pour démarrer Twitterminal.`)
	process.exit();
}

// Préparer une configuration
var config
try {
	config = new Conf({ cwd: require('./functions/configPath')(false), configName: 'twitterminalConfig' })
} catch(e){
	console.log(`${chalk.red('[WARN]')} Impossible de charger la configuration.`)
}

// Fonction pour afficher qu'il faut installer un module
function failRequireModule(moduleName){
	// Afficher le fait que Twitterminal ne peut démarrer
	if(moduleName !== "chalk") console.log(`${chalk.red('[FATAL]')} Module ${chalk.cyan(moduleName)} impossible à lancer.`)
	if(moduleName === "chalk") console.log(`${chalk.red('[FATAL]')} Module ${moduleName} impossible à lancer.`)

	// Arrêter le processus
	process.exit();
}

// Fonction principale
main()
async function main(){
	// Obtenir la liste des choix pour le menu
		// Préparer un array
		var choices = []

		// Si la configuration a pu être chargé, ajouter quelques options
		if(config) choices.push('Ouvrir la configuration') & choices.push('Modifier la configuration')

		// Ajouter d'autres choix
		choices.push('Supprimer la configuration')
		choices.push('Analyser une configuration texte')
		choices.push('Analyser une sauvegarde cloud')

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
		if(answer.action.toLowerCase() === "supprimer la configuration") return deleteConfiguration()
		if(answer.action.toLowerCase() === "modifier la configuration") return editConfiguration()
		if(answer.action.toLowerCase() === "ouvrir la configuration") return console.log('Ouverture..') & open(path.join(config.path))
		if(answer.action.toLowerCase() === "analyser une configuration texte"){
			inquirer.prompt([
				{
					type: 'input',
					name: 'path',
					default: config?.path ? config?.path : null,
					message: 'Chemin de la configuration à analyser :'
				}
			]).then(answer => { showConfiguration(fs.readFileSync(answer.path, 'utf8')) })
		}
		if(answer.action.toLowerCase() === "analyser une sauvegarde cloud") return checkCloudSave()
	});
}

// Fonction pour supprimer une configuration
async function deleteConfiguration(){
	// Tenter de require la configuration
	var jsonConfig;
	try {
		// Lire le fichier
		jsonConfig = fs.readFileSync(require('./functions/configPath')(true), 'utf8')

		// Tenter une réparation du JSON
		jsonConfig = jsonrepair(jsonConfig)

		// Parse le JSON
		jsonConfig = JSON.parse(jsonConfig)

		// Si on peut accéder à "configVersion", on suppose que le JSON va bien : l'enregistrer (ptet la réparation a marcher)
		if(jsonConfig.configVersion) fs.writeFileSync(require('./functions/configPath')(true), JSON.stringify(jsonConfig, null, 2)) & console.log(`Tentative de réparation de la sauvegarde réussie, essayer de redémarrer Twitterminal`)
	} catch(e){
		jsonConfig = 'failed'
	}

	// Si ça a raté, vérifier au moins si le fichier existe
	if(jsonConfig === 'failed' && !fs.existsSync(path.join(require('./functions/configPath')(true)))) console.log(`${chalk.red('[FATAL]')} La configuration n'existe pas.`)

	// Obtenir les élements important qui sont dans la configuration
		// Obtenir le nombre de compte
		if(jsonConfig != 'failed') var accounts = Object?.keys(jsonConfig?.accountList || [])?.length

		// Obtenir le nom du compte utilisé
		if(jsonConfig != 'failed') var currentlyUsedAccount = jsonConfig?.account?.name

		// Obtenir le nombre de backup
		if(jsonConfig != 'failed') var configBackupList = jsonConfig?.configBackupList?.length

	// Afficher un avertissement
	console.log(`\nVous êtes sur le point de supprimer votre sauvegarde situé dans ${chalk.cyan(require('./functions/configPath')(true))}.`)
	if(accounts || currentlyUsedAccount || configBackupList) console.log(`${accounts ? `\n- Vous disposez de ${accounts} comptes enregistrés${currentlyUsedAccount ? ` (y compris ${currentlyUsedAccount})` : ''}.` : ''}${accounts ? `\n- Vous disposez de ${configBackupList} sauvegardes.` : ''}`)
	if(accounts || currentlyUsedAccount || configBackupList) console.log(`\nLa configuration est quand même lisible, n'oubliez donc pas qu'il est possible de la rendre fonctionnelle à nouveau, et que vous n'avez pas tout perdu.`)

	// Demander une confirmation
	var confirm = await inquirer.prompt([
		{
			type: 'confirm',
			name: 'confirm',
			message: 'Êtes-vous sûr ?'
		}
	])

	// Si on a confirmé, supprimer le fichier
	if(confirm.confirm) fs.unlinkSync(require('./functions/configPath')(true)) & console.log(`${chalk.green('[INFO]')} Configuration supprimée.`)
}

// Fonction pour analyser une sauvegarde qui est dans le cloud
async function checkCloudSave(){
	// Demander l'identifiant de la sauvegarde
	var cloudSaveID = await inquirer.prompt([
		{
			type: 'input',
			name: 'cloudSaveID',
			message: 'Identifiant de la sauvegarde :',
			validate: (input) => {
				if(!input) return 'Veuillez entrer un identifiant de sauvegarde.'
				if(!input.includes("-")) return 'Identifiant mal formé'
				return true
			}
		}
	])
	cloudSaveID = cloudSaveID.cloudSaveID

	// Obtenir la configuration originale
	var backup = await fetch(`https://text.johanstick.me/raw/${cloudSaveID}`, { headers: { 'User-Agent': `Twitterminal/${require('../package.json')?.version || 'undefined'} (+https://github.com/johan-perso/twitterminal)` } })
	.then(res => res.text())
	.catch(async err => {
		console.log(`${chalk.red('[FATAL]')} Impossible d'accéder à la sauvegarde.`)
		return spinner.fail()
	})

	// Si la taille du texte est supérieure à 999999 bits
	// (la limite est quand même plus élevé que quand on l'importe depuis Twitterminal)
	if(encodeURI(backup).split(/%..|./).length - 1 > 999999){
		console.log(`${chalk.red('[FATAL]')} Cette sauvegarde est trop volumineuse.`)
		return process.exit()
	}

	// Si Johan Text a renvoyé une erreur
	if(backup.startsWith("/\\ ERREUR /\\")){
		console.log(`${chalk.red('[FATAL]')} ${backup.split('\n')[2].replace("Impossible de trouver le texte que vous souhaitez",`Aucune sauvegarde associé à l'id ${chalk.cyan(cloudSaveID)} n'a été trouvée.`).replace("Impossible de déchiffrer le texte, assurez-vous d'avoir utilisé le bon lien.",`Impossible de déchiffrer la sauvegarde ${chalk.cyan(cloudSaveID.split("-")[0])} avec la clé ${chalk.cyan(cloudSaveID.split("-")[1])}.`).replace("L'ID du texte est mal formulé","L'identifiant n'est pas considéré comme valide. Il doit commencer par un nombre, suivi d'un tiret et d'une suite de caractères.")}`)
		return process.exit()
	}

	// Afficher la configuration
	showConfiguration(backup)
}

// Fonction pour afficher une configuration plus propre
async function showConfiguration(jsonConfig){	
	// Tenter une réparation du JSON
	try { jsonConfig = jsonrepair(jsonConfig) } catch(e){}

	// Parse le JSON
	try {
		jsonConfig = JSON.parse(jsonConfig)

		// Si on peut accéder à "configVersion", on suppose que le JSON va bien : l'enregistrer (ptet la réparation a marcher)
		// (je l'ai désactivé car bon bah ça pourrait remplacer la config d'un gars, peut importe le fichier qu'il ouvre)
		// if(jsonConfig.configVersion) fs.writeFileSync(require('./functions/configPath')(true), JSON.stringify(jsonConfig, null, 2)) & console.log(`Tentative de réparation de la sauvegarde réussie, essayer de redémarrer Twitterminal`)
	} catch(e){
		console.log(`${chalk.red('[FATAL]')} Impossible de charger la configuration.`)
	}

	// Afficher quelques infos en vrac
	console.log('\n')
	if(!jsonConfig.not_first_start) console.log(chalk.bold('Déjà démarré? : ') + `non (Twitterminal n'a jamais été démarré)`)
	if(jsonConfig.configVersion) console.log(chalk.bold('Version de la configuration : ') + jsonConfig.configVersion)
	console.log(chalk.bold('Presse papier : ') + `${(jsonConfig?.clipboardy?.force == "true") ? 'forcé' : (jsonConfig?.clipboardy?.use == "true" ? 'activé' : 'désactivé')}`)
	if(jsonConfig.johanstickman_account_uuid) console.log(chalk.bold('UUID du compte Johanstickman : ') + jsonConfig.johanstickman_account_uuid)

	// Afficher la liste des expérimentations
	if(jsonConfig.experiments){
		console.log(chalk.bold.cyan(`\nListe des expérimentations :`))
		console.log(jsonConfig.experiments.map(name => `- ${name}`).join('\n'))
	}

	// Afficher la liste des comptes
	if(Object.keys(jsonConfig.accountList || [])?.length){
		console.log(chalk.bold.cyan(`\nListe des comptes :`))
		console.log(Object.keys(jsonConfig.accountList || []).map(account => `- ${jsonConfig.accountList[account].name}`).join('\n'))
	}

	// Afficher la liste des sauvegardes
	if(jsonConfig.configBackupList){
		console.log(chalk.bold.cyan(`\nListe des sauvegardes :`))
		console.log(jsonConfig.configBackupList.map(save => `- ${chalk.bold(new Date(parseInt(save.createdAt)*1000).toLocaleString())} :\n    - ID : ${save.id}\n    - Clé de suppression : ${save.secretKey}`).join('\n'))
	}

	// Demander si on veut l'utiliser comme configuration principale
	var confirm = await inquirer.prompt([
		{
			type: 'confirm',
			name: 'confirm',
			message: 'Voulez-vous utiliser cette configuration comme configuration principale ?',
			default: false
		}
	])
	confirm = confirm.confirm

	// Si on veut l'utiliser comme configuration principale
	if(confirm){
		fs.writeFileSync(require('./functions/configPath')(true), JSON.stringify(jsonConfig, null, 2))
		console.log(`${chalk.green('[INFO]')} Configuration chargée.`)
		return process.exit()
	}
}

// Fonction pour pouvoir modifier une configuration
async function editConfiguration(){
	// Obtenir le chemin de la configuration
	var configPath = await inquirer.prompt([
		{
			type: 'input',
			name: 'path',
			default: config?.path ? config?.path : null,
			message: 'Chemin de la configuration à analyser :',
			validate: function(value){
				if(!value) return 'Veuillez entrer un chemin valide.'
				if(!fs.existsSync(value)) return 'Ce chemin n\'existe pas.'
				return true
			}
		}
	])
	configPath = configPath.path

	// Essayer de parse le JSON
	var jsonConfig;
	try { jsonConfig = JSON.parse(fs.readFileSync(configPath, 'utf8')) } catch(e){ jsonConfig = 'failed' }

	// Si le parse de JSON a échoué
	if(jsonConfig == 'failed'){
		// Avertir
		console.log(`${chalk.red('[WARN]')} Impossible de charger la configuration.`)

		// Tenter de réparer
		try { jsonConfig = jsonrepair(fs.readFileSync(configPath, 'utf8')) } catch(e){}

		// Si le parse a encore échoué
		if(jsonConfig == 'failed') console.log(`${chalk.red('[FATAL]')} Impossible de réparer la configuration.`) & process.exit()
	}

	// Appeller la fonction
	whatToDo()

	// Fonction principale pour demander les modifications à faire
	async function whatToDo(){
		// Liste des actions possibles
			// Préparer un array
			var choices = []

			// Ajouter les actions possibles
			if(Object?.keys(jsonConfig?.accountList || [])?.length) choices.push({ name: 'Supprimer un compte', value: 'removeAccount' })
			if(jsonConfig.clipboardy) choices.push({ name: 'Réinitialiser le presse-papier', value: 'resetClipboard' })
			if(jsonConfig.johanstickman_account_uuid) choices.push({ name: 'Déconnexion johanstick.me', value: 'disconnectJohanstickman' })
			if(jsonConfig.experiments?.length) choices.push({ name: 'Réinitialiser les expérimentations', value: 'resetExperiments' })
			if(jsonConfig.configBackupList?.length) choices.push({ name: 'Réinitialiser les sauvegardes', value: 'resetSaves' })

			// Si aucun choix
			if(!choices.length) return console.log(`${chalk.red('[FATAL]')} Aucune modification à faire.`) & process.exit()

		// Demander quelles modifications faire
		var modification = await inquirer.prompt([
			{
				type: 'list',
				name: 'whatToDo',
				message: 'Quelle modification souhaitez-vous faire ?',
				choices: choices
			}
		])
		modification = modification.whatToDo

		// Si on veut supprimer un compte
		if(modification == 'removeAccount'){
			// Demander quel compte supprimer
			var account = await inquirer.prompt([
				{
					type: 'list',
					name: 'account',
					message: 'Quel compte souhaitez-vous supprimer ?',
					choices: Object.keys(jsonConfig.accountList || []).map(account => ({ name: jsonConfig.accountList[account].name, value: account }))
				}
			])

			// Supprimer le compte et enregistrer
			delete jsonConfig.accountList[account.account]
			fs.writeFileSync(configPath, JSON.stringify(jsonConfig, null, 2))
			console.log(`${chalk.green('[INFO]')} Compte supprimé.\n`)
			return whatToDo()
		}

		// Si on veut réinitialiser le presse-papier
		if(modification == 'resetClipboard'){
			delete jsonConfig.clipboardy
			fs.writeFileSync(configPath, JSON.stringify(jsonConfig, null, 2))
			console.log(`${chalk.green('[INFO]')} Presse-papier réinitialisé.\n`)
			return whatToDo()
		}

		// Si on veut déconnecter johanstick.me
		if(modification == 'disconnectJohanstickman'){
			delete jsonConfig.johanstickman_account_uuid
			fs.writeFileSync(configPath, JSON.stringify(jsonConfig, null, 2))
			console.log(`${chalk.green('[INFO]')} Déconnexion johanstick.me réussie.\n`)
			return whatToDo()
		}

		// Si on veut réinitialiser les expérimentations
		if(modification == 'resetExperiments'){
			delete jsonConfig.experiments
			fs.writeFileSync(configPath, JSON.stringify(jsonConfig, null, 2))
			console.log(`${chalk.green('[INFO]')} Expérimentations réinitialisées.\n`)
			return whatToDo()
		}

		// Si on veut réinitialiser les sauvegardes
		if(modification == 'resetSaves'){
			delete jsonConfig.configBackupList
			fs.writeFileSync(configPath, JSON.stringify(jsonConfig, null, 2))
			console.log(`${chalk.green('[INFO]')} Sauvegardes réinitialisées.\n`)
			return whatToDo()
		}
	}
}
