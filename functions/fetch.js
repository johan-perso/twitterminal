// Crée une config / l'importer
const Conf = require('conf');
var config = new Conf({ cwd: require('./configPath')(false), configName: 'twitterminalConfig' })

// Exporter en tant que module
module.exports = async function(requestInfo, oauth, token){
	// Obtenir les informations de requêtes modifié
	var newRequestInfo = {
		url: encodeURI(requestInfo.url),
		method: requestInfo.method,
		body: requestInfo.body || null
	}

	// Si les requêtes majeurs sont désactivé via une experimentation
	var fetched;
	if(config?.get("experiments")?.includes('DISABLE_TWITTER_REQUEST_MAJOR_ACTIONS')){
		requestInfo.url = requestInfo.url.replace('https://api.twitter.com/1.1','')
		if(requestInfo.url.startsWith('/friendships/create.json')) fetched = { error: true, description: "L'expérimentation DISABLE_TWITTER_REQUEST_MAJOR_ACTIONS est actif. Les requêtes majeurs sont désactivés.", code: 49012 }
		if(requestInfo.url.startsWith('/friendships/destroy.json')) fetched = { error: true, description: "L'expérimentation DISABLE_TWITTER_REQUEST_MAJOR_ACTIONS est actif. Les requêtes majeurs sont désactivés.", code: 49012 }
		if(requestInfo.url.startsWith('/favorites/create.json')) fetched = { error: true, description: "L'expérimentation DISABLE_TWITTER_REQUEST_MAJOR_ACTIONS est actif. Les requêtes majeurs sont désactivés.", code: 49012 }
		if(requestInfo.url.startsWith('/favorites/destroy.json')) fetched = { error: true, description: "L'expérimentation DISABLE_TWITTER_REQUEST_MAJOR_ACTIONS est actif. Les requêtes majeurs sont désactivés.", code: 49012 }
		if(requestInfo.url.startsWith('/statuses/update.json')) fetched = { error: true, description: "L'expérimentation DISABLE_TWITTER_REQUEST_MAJOR_ACTIONS est actif. Les requêtes majeurs sont désactivés.", code: 49012 }
		if(requestInfo.url.startsWith('/statuses/retweet.json')) fetched = { error: true, description: "L'expérimentation DISABLE_TWITTER_REQUEST_MAJOR_ACTIONS est actif. Les requêtes majeurs sont désactivés.", code: 49012 }
		if(requestInfo.url.startsWith('/statuses/unretweet.json')) fetched = { error: true, description: "L'expérimentation DISABLE_TWITTER_REQUEST_MAJOR_ACTIONS est actif. Les requêtes majeurs sont désactivés.", code: 49012 }
	}

	// Effectuer un fetch
	if(!fetched){
		fetched = await require('node-fetch')(newRequestInfo.url, {
			method: newRequestInfo.method,
			headers: oauth.toHeader(oauth.authorize(newRequestInfo, token)),
			body: newRequestInfo.body
		})
		.then(res => res.json())
		.catch(err => { return { error: true, description: err, code: 2429391 } })
	}

	// Retourner l'information
	return fetched;
}
