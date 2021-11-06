// Importer node-fetch
const fetch = require('node-fetch')

// Exporter en tant que module
module.exports = async function(text){
	// Faire une requête vers Twitter
	const fetched = await fetch(`http://api.twitter.com`)
    .then(res => res.text())
	.catch(err => {
		return false
	})

	// Si c'est false, y'a pas de co
	if(fetched === false) return false; else return true;
}