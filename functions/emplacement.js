// Crée une config / l'importer
const Conf = require('conf');
var config = new Conf({ cwd: require('./configPath')(false), configName: 'twitterminalConfig' })

// Fonction pour obtenir le nombre de comptes
module.exports.accountsLength = function(){
	// Obtenir tout les comptes dans la configuration
	var accountList = config.get('accountList')

	// Retourner le nombre de comptes utilisés
	return Object.keys(accountList || []).length
}

// Fonction pour obtenir le nombre d'emplacement, sous forme de texte en array
// note: moreFakeEmplacement permet d'ajouter des emplacement en plus
module.exports.emplacementList = function(moreFakeEmplacement=0){
	// Crée un array vide
	var emplacementList = []

	// Pour chaque compte, rajouter un nouvel élement dans l'array
	for (var i = 0; i < (this.accountsLength() + moreFakeEmplacement); i++){
		emplacementList.push(`Emplacement ${i+1} - ${config.get('accountList.'+(i+1))?.name || 'non utilisé'}`)
	}

	// Retourner l'array
	return emplacementList
}
