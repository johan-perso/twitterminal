// Importer node-fetch et conf
const fetch = require('node-fetch')
const Conf = require('conf')
var config = new Conf({projectName: "twitterminal", projectSuffix: ""})

// Exporter en tant que module
module.exports = async function(text){
	// (experiments) Si on ne doit pas vérifier la connexion, bah on va obéir ptdr
	if(config?.get('experiments')?.includes("DISABLE_CONNECTION_CHECK")) return true;

	// Faire une requête vers Twitter
	const fetched = await fetch(`http://api.twitter.com`)
	.then(res => res.text())
	.catch(err => {
		return false
	})

	// Si c'est false, y'a pas de co
	if(fetched === false) return false; else return true;
}
