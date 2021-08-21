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

// Importer quelques modules et fonctions locales
const term = require('terminal-kit').terminal;
const chalk = require('chalk');
const prompt = require('prompt');
JSON.minify = require("node-json-minify");
const hastebin = require('hastebin.js');
const haste = new hastebin({url: 'https://hasteb.herokuapp.com'});
const fs = require('fs');
const internetAvailable = require("internet-available");
const ora = require('ora');
var oauthConfig = require('./configOauth.js')
var writeClipboard = require('./writeClipboard.js')
var replaceText = require('./replaceText.js')

// Préparer un spinner
const spinner = ora('')

// Fonction pour vérifier si c'est du JSON ou non (https://stackoverflow.com/a/33369954/16155654)
function isJson(item) {
	item = typeof item !== "string"
		? JSON.stringify(item)
		: item;

	try {
		item = JSON.parse(item);
	} catch (e) {
		return false;
	}

	if (typeof item === "object" && item !== null) {
		return true;
	}

	return false;
}

// Vérifier si on est connecté à internet
async function checkInternet(){
	return new Promise((resolve, reject) => {
		// Vérifier la connexion
		internetAvailable({
			timeout: 3000,
			retries: 5,
			domainName: "twitter.com",
		}).then(() => resolve())
		.catch(() => {
			// Arrêter le spinner (avec un avertissement)
			spinner.text = " Impossible de se connecter à Twitter : vérifier votre connexion."
			spinner.color = "red"
			spinner.fail()

			// Arrêter tout
			return process.exit();
		})
	})
}

// Exporter en tant que module
module.exports = async function(){
	// Changer le nom de la fenêtre
	require('./termName.js').set("Configuration")

	// Afficher un menu
	console.log("Vous êtes actuellement dans le configurateur Twitterminal. Que voulez-vous faire ?")
	term.singleColumnMenu(["Ajouter un compte (oauth)", "Ajouter un compte (manuelle)", "Choisir un compte par défaut", "Gestion du presse-papier", "Importer/Exporter", "Sortir"], async function(error, response){
		// Option choisis
		if(response.selectedIndex === 0) var option = "addAccountOauth"
		if(response.selectedIndex === 1) var option = "addAccountDev"
		if(response.selectedIndex === 2) var option = "setAccount"
		if(response.selectedIndex === 3) var option = "clipboardSettings"
		if(response.selectedIndex === 4) var option = "import/export"
		if(response.selectedIndex === 5) var option = "stop"

		// Si l'option est "addAccountOauth"
		if(option === "addAccountOauth"){
			await checkInternet()
			require('./termName.js').set("Connexion")
			oauthConfig()
		}
		// Si l'option est "addAccountDev"
		if(option === "addAccountDev"){
			require('./termName.js').set("Connexion")
			// Liste des questions
			const properties = [
				{
					name: 'name',
					warning: "Entrer le nom de votre compte. Vous pouvez le trouver sur Twitter.",
					default: ''
				},
				{
					name: 'consumer_key',
					warning: "Entrer une information ici. Vous pouvez les trouver sur Twitter Developper.",
					default: ''
				},
				{
					name: 'consumer_secret',
					warning: "Entrer une information ici. Vous pouvez les trouver sur Twitter Developper.",
					default: ''
				},
				{
					name: 'access_token',
					warning: "Entrer une information ici. Vous pouvez les trouver sur Twitter Developper.",
					default: ''
				},
				{
					name: 'access_token_secret',
					warning: "Entrer une information ici. Vous pouvez les trouver sur Twitter Developper.",
					default: ''
				},
				{
					name: 'emplacement',
					warning: "Entrer l'emplacement où vous voulez enregistrer ces informations. Nombre entre 1 et 5",
					required: true,
					type: 'number',
					message: "Entrer l'emplacement où vous voulez enregistrer ces informations. Nombre entre 1 et 5."
				}
			];

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
					config.set({ 'accountList.1.name': `${result.name}` });
					config.set({ 'accountList.1.consumer_key': `${result.consumer_key}` });
					config.set({ 'accountList.1.consumer_secret': `${result.consumer_secret}` });
					config.set({ 'accountList.1.access_token': `${result.access_token}` });
					config.set({ 'accountList.1.access_token_secret': `${result.access_token_secret}` });
					config.set({ 'accountList.1.type': "manuel" });
				}
				if(result.emplacement === 2){
					config.set({ 'accountList.2.name': `${result.name}` });
					config.set({ 'accountList.2.consumer_key': `${result.consumer_key}` });
					config.set({ 'accountList.2.consumer_secret': `${result.consumer_secret}` });
					config.set({ 'accountList.2.access_token': `${result.access_token}` });
					config.set({ 'accountList.2.access_token_secret': `${result.access_token_secret}` });
					config.set({ 'accountList.2.type': "manuel" });
				}
				if(result.emplacement === 3){
					config.set({ 'accountList.3.name': `${result.name}` });
					config.set({ 'accountList.3.consumer_key': `${result.consumer_key}` });
					config.set({ 'accountList.3.consumer_secret': `${result.consumer_secret}` });
					config.set({ 'accountList.3.access_token': `${result.access_token}` });
					config.set({ 'accountList.3.access_token_secret': `${result.access_token_secret}` });
					config.set({ 'accountList.3.type': "manuel" });
				}
				if(result.emplacement === 4){
					config.set({ 'accountList.4.name': `${result.name}` });
					config.set({ 'accountList.4.consumer_key': `${result.consumer_key}` });
					config.set({ 'accountList.4.consumer_secret': `${result.consumer_secret}` });
					config.set({ 'accountList.4.access_token': `${result.access_token}` });
					config.set({ 'accountList.4.access_token_secret': `${result.access_token_secret}` });
					config.set({ 'accountList.4.type': "manuel" });
				}
				if(result.emplacement === 5){
					config.set({ 'accountList.5.name': `${result.name}` });
					config.set({ 'accountList.5.consumer_key': `${result.consumer_key}` });
					config.set({ 'accountList.5.consumer_secret': `${result.consumer_secret}` });
					config.set({ 'accountList.5.access_token': `${result.access_token}` });
					config.set({ 'accountList.5.access_token_secret': `${result.access_token_secret}` });
					config.set({ 'accountList.5.type': "manuel" });
				}

				// Arrêter le processus
				console.log(chalk.green("\nPour appliquer les modifications, Twitterminal a besoin d'être redémarrer.")) && process.exit()
			});
		}
		// Si l'option est "setAccount", afficher un menu
		if(option === "setAccount"){
			require('./termName.js').set("Connexion")
			term.singleColumnMenu(["Emplacement 1", "Emplacement 2", "Emplacement 3", "Emplacement 4", "Emplacement 5"], async function(error, response){

				// Obtenir les informations de compte
				if(response.selectedIndex + 1 === 1){
					var name = await config.get( 'accountList.1.name' );
					var consumer_key = await config.get( 'accountList.1.consumer_key' );
					var consumer_secret = await config.get( 'accountList.1.consumer_secret' );
					var access_token = await config.get( 'accountList.1.access_token' );
					var access_token_secret = await config.get( 'accountList.1.access_token_secret' );
				}
				
				if(response.selectedIndex + 1 === 2){
					var name = await config.get( 'accountList.2.name' );
					var consumer_key = await config.get( 'accountList.2.consumer_key' );
					var consumer_secret = await config.get( 'accountList.2.consumer_secret' );
					var access_token = await config.get( 'accountList.2.access_token' );
					var access_token_secret = await config.get( 'accountList.2.access_token_secret' );
				}
				
				if(response.selectedIndex + 1 === 3){
					var name = await config.get( 'accountList.3.name' );
					var consumer_key = await config.get( 'accountList.3.consumer_key' );
					var consumer_secret = await config.get( 'accountList.3.consumer_secret' );
					var access_token = await config.get( 'accountList.3.access_token' );
					var access_token_secret = await config.get( 'accountList.3.access_token_secret' );
				}
				
				if(response.selectedIndex + 1 === 4){
					var name = await config.get( 'accountList.4.name' );
					var consumer_key = await config.get( 'accountList.4.consumer_key' );
					var consumer_secret = await config.get( 'accountList.4.consumer_secret' );
					var access_token = await config.get( 'accountList.4.access_token' );
					var access_token_secret = await config.get( 'accountList.4.access_token_secret' );
				}
				
				if(response.selectedIndex + 1 === 5){
					var name = await config.get( 'accountList.5.name' );
					var consumer_key = await config.get( 'accountList.5.consumer_key' );
					var consumer_secret = await config.get( 'accountList.5.consumer_secret' );
					var access_token = await config.get( 'accountList.5.access_token' );
					var access_token_secret = await config.get( 'accountList.5.access_token_secret' );
				}
				
				// Effectuer les modifications
				config.set({ 'account.name': `${name}` });
				config.set({ 'account.consumer_key': `${consumer_key}` });
				config.set({ 'account.consumer_secret': `${consumer_secret}` });
				config.set({ 'account.access_token': `${access_token}` });
				config.set({ 'account.access_token_secret': `${access_token_secret}` });

				// Obtenir le pseudo du compte
				if(account.name === "undefined") var oldName = "Aucun pseudo"
				if(account.name !== "undefined") var oldName = account.name

				// Dire que les changement ont été effectué
				console.log("\n" + chalk.bold("Changement de compte effectué") + "\n\n" + chalk.cyan(oldName) + " --> " + chalk.cyan(name || "Aucun pseudo"))
			
				// Arrêter le processus
				process.exit()
			});
		}
		// Si l'option est "clipboardSettings"
		if(option === "clipboardSettings"){
			// Changer le nom de la fenêtre
			require('./termName.js').set("Gestion du presse-papier")

			// Afficher des informations
			console.log("\n" + chalk.underline.bold("Paramètres du presse-papier"))
			console.log("\nLa gestion du presse-papier n'est fonctionnelle que sur Windows et macOS. Vous pouvez quand même forcer son activation. Lors de certaines actions, le presse-papier peut être automatiquement utilisé.\n")
			console.log(chalk.bold("Ecriture automatique : ") + chalk.cyan(await(replaceText.truefalse(clipboardyConfig.use))))
			console.log(chalk.bold("Utilisation forcé : ") + chalk.cyan(await(replaceText.truefalse(clipboardyConfig.force))))
		
			// Proposer de modifier certaines choses
			console.log("\n\n" + chalk.underline.bold("Modifier les paramètres"))
			term.singleColumnMenu(["Ecriture automatique", "Utilisation forcé", "Annuler"], async function(error, response){
				// Si l'option est "Ecriture automatique"
				if(response.selectedIndex === 0){
					// Obtenir la nouvelle valeur
					if(clipboardyConfig.use === "false") var newValeur = "true"
					if(clipboardyConfig.use === "true") var newValeur = "false"

					// Modifier la valeur
					console.log("\n" + chalk.bold("Modification effectué") + "\n\n" + chalk.cyan(await(replaceText.truefalse((clipboardyConfig.use)))) + " --> " + chalk.cyan(await(replaceText.truefalse(newValeur))))
					config.set({ 'clipboardy.use': newValeur });
					process.exit()
				}
				// Si l'option est "Utilisation forcé"
				if(response.selectedIndex === 1){
					// Obtenir la nouvelle valeur
					if(clipboardyConfig.force === "false") var newValeur = "true"
					if(clipboardyConfig.force === "true") var newValeur = "false"

					// Modifier la valeur
					console.log("\n" + chalk.bold("Modification effectué") + "\n\n" + chalk.cyan(await(replaceText.truefalse((clipboardyConfig.force)))) + " --> " + chalk.cyan(await(replaceText.truefalse(newValeur))))
					config.set({ 'clipboardy.force': newValeur });
					process.exit()
				}
				// Si l'option est "Annuler"
				if(response.selectedIndex === 2){
					process.exit()
				}
			})
		}
		// Si l'option est "import/export", afficher un menu
		if(option === "import/export"){
			await checkInternet()
			require('./termName.js').set("Importer/Exporter")
			term.singleColumnMenu(["Importer une configuration", "Exporter la configuration"], async function(error, response){

				// Importer une configuration
				if(response.selectedIndex === 0){
					// Afficher un avertissement
					console.log(chalk.red("Importer une configuration va remplacer l'actuelle. Veuillez patienter..."))
					setTimeout(() => importConfig(), 3000);
				}

				// Exporter la configuration
				if(response.selectedIndex === 1){
					// Afficher un avertissement
					console.log(chalk.red("Votre configuration Twitterminal contient l'accès à tout vos comptes Twitter et plus : faites attention à qui vous la partagez."))
					setTimeout(() => exportConfig(), 3000);
				}
			});
		}
		// Si l'option est "stop"
		if(option === "stop"){
			process.exit()
		}
	})
}

// Fonction pour exporter la configuration
async function exportConfig(){
	// Changer le nom de la fenêtre
	require('./termName.js').set("Exportation")

	// Afficher un spinner
	spinner.start()
	spinner.text = " Exportation de la configuration..."

	// Obtenir le contenu du fichier de configuration
	fs.readFile(config.path, 'utf8', async function(err, data) {
		// En cas d'erreur
		if(err) spinner.fail() && console.log(chalk.red("Impossible d'accèder au fichier de configuration : " + err.message) + chalk.cyan(" (Code erreur #5.1)"))

		// Obtenir une configuration minifié
		var mini = JSON.minify(data)

		// Crée un hastebin avec la configuration minifié
		var exported = await (await haste.post(mini, "json")).replace("https://hasteb.herokuapp.com/","").replace(".json","")

		// Ajouter l'id du haste au presse papier
		writeClipboard(exported)

		// Arrêter le spinner
		spinner.text = " Configuration exportée"
		spinner.succeed()

		// Afficher l'id du haste
		console.log("\nIdentifiant d'exportation : " + chalk.gray.dim(exported) + "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑")

		// Arrêter le processus
		process.exit()
	});
}

// Fonction pour importer la configuration
async function importConfig(){
	// Changer le nom de la fenêtre
	require('./termName.js').set("Importation")

	// Liste des questions
	const properties = [
		{
			name: 'id',
			warning: "Entrer l'identifiant de l'exportation.",
			required: true,
			message: "ID d'exportation"
		}
	]

	// Demander des réponses
	prompt.start();

	// Obtenir les réponses
	prompt.get(properties, async function (err, result) {
		if (err) return term.red("\n" + err) && process.exit()

		// Afficher un spinner
		spinner.start()
		spinner.text = " Importation de la configuration...   "

		// Obtenir le code original à partir de l'id du haste
		var imported = await haste.get(result.id).catch(err => {
			console.log(chalk.red("Impossible d'obtenir la configuration à partir de son ID."))
			return process.exit()
		})

		// Vérifier si le contenu est du JSON
		if(!isJson(imported)){
			spinner.text = " Importation impossible (Le contenu n'est pas du JSON)"
			return spinner.fail()
		}

		// Modifier la configuration
		fs.writeFile(config.path, imported, function (err) {
			// En cas d'erreur
			if(err) spinner.fail() && console.log(chalk.red("Impossible d'accèder au fichier de configuration : " + err.message) + chalk.cyan(" (Code erreur #6.1)"))

			// Arrêter le spinner
			spinner.text = " Configuration importée"
			spinner.succeed()
			
			// Arrêter le processus
			process.exit()
		});
	});
}