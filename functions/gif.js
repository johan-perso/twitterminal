// Exporter en tant que module
module.exports = async function(text){
	// Faire une requête vers tenor
	var gif = await require('node-fetch')(`https://api.tenor.com/v1/search?q=${text}&key=LIVDSRZULELA&limit=1`) // pov : c'est la clé qu'ils ont mit dans l'exemple sur leur documentation, sauf qu'elle marche vraiment
	.then(res => res.json())
	.catch(err => { return "" })

	// Retourner le lien du gif
	if(gif && gif.results && gif.results[0]) return gif.results[0].url; else return ""
}
