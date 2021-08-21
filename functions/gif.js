// Importer une fonction locale
var fetch = require('node-fetch')

// Exporter en tant que module
module.exports = async function(text){
	// Faire une requête vers tenor
	var gif = await fetch(`https://api.tenor.com/v1/search?q=${text}&key=LIVDSRZULELA&limit=1`, {
        method: 'get'
    })
    .then(res => res.json())
	.catch(err => {})

	// Retourner le lien du gif
	if(gif && gif.results && gif.results[0]) return gif.results[0].url; else return ""
}