// Crée une config / l'importer
const Conf = require('conf');
var config = new Conf({ cwd: require('./configPath')(false), configName: 'twitterminalConfig' })

// Ajouter une valeur par défaut à la configuration
let clipboardyConfig = config.get('clipboardy')
if(!clipboardyConfig || clipboardyConfig && !clipboardyConfig.use) config.set({ 'clipboardy.use': 'true' });
if(!clipboardyConfig || clipboardyConfig && !clipboardyConfig.force) config.set({ 'clipboardy.force': 'false' });

// Exporter en tant que module
module.exports = async function(content){
	// Si l'utilisation de clipboardy est désactivé
	if(clipboardyConfig.use !== "true") return;

	// Si l'os n'est pas Windows ou macOS, annuler
	if(require('os').platform() !== "win32" && require('os').platform() !== "darwin" && clipboardyConfig.force !== "true") return;

	// Copier le texte au presse papier
	require('clipboardy').writeSync("" + content)
}
