// Importer node-fetch
const fetch = require('node-fetch')

// Exporter en tant que module
module.exports = async function(requestInfo, oauth, token){
	// Obtenir les informations de requêtes modifié
	var newRequestInfo = {
		url: encodeURI(requestInfo.url),
		method: requestInfo.method
	}

	// Effectuer un fetch
	var fetched = await fetch(newRequestInfo.url, {
        method: newRequestInfo.method,
        headers: oauth.toHeader(oauth.authorize(newRequestInfo, token)),
    })
    .then(res => res.json())
	.catch(err => { return { error: true, description: err, code: 2429391 } })

	// Retourner l'information
	return fetched;
}