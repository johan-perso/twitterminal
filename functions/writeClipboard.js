// Crée une config / l'importer
const Conf = require('conf');
const config = new Conf({projectName: "twitterminal", projectSuffix: ""});

// Ajouter une valeur par défaut à la configuration
let clipboardyConfig = config.get('clipboardy')
if(!clipboardyConfig || clipboardyConfig && !clipboardyConfig.use) config.set({ 'clipboardy.use': 'true' });
if(!clipboardyConfig || clipboardyConfig && !clipboardyConfig.force) config.set({ 'clipboardy.force': 'false' });

// Importer clipboardy et os
const clipboardy = require('clipboardy')
const os = require('os')

// Exporter en tant que module
module.exports = async function(content){
	// Si l'utilisation de clipboardy est désactivé
	if(clipboardyConfig.use !== "true") return;

	// Si l'os n'est pas Windows ou macOS, annuler
	if(os.platform() !== "win32" && os.platform() !== "darwin" && clipboardyConfig.force !== "true") return;

	// Copier le texte au presse papier
	clipboardy.writeSync("" + content)
}
