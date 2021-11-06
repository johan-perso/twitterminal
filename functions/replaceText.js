// Importer de quoi obtenir des gifs
var gif = require('./gif.js')

// Convertir du texte en gras
function toBold(content){
	return content.replace(/a/g, "𝐚").replace(/b/g, "𝐛").replace(/c/g, "𝐜").replace(/d/g, "𝐝").replace(/e/g, "𝐞")
	.replace(/f/g, "𝐟").replace(/g/g, "𝐠").replace(/h/g, "𝐡").replace(/i/g, "𝐢").replace(/j/g, "𝐣").replace(/k/g, "𝐤")
	.replace(/l/g, "𝐥").replace(/m/g, "𝐦").replace(/n/g, "𝐧").replace(/o/g, "𝐨").replace(/p/g, "𝐩").replace(/q/g, "𝐪")
	.replace(/r/g, "𝐫").replace(/s/g, "𝐬").replace(/t/g, "𝐭").replace(/u/g, "𝐮").replace(/v/g, "𝐯").replace(/w/g, "𝐰")
	.replace(/x/g, "𝐱").replace(/y/g, "𝐲").replace(/z/g, "𝐳").replace(/é/g, "𝐞́").replace(/è/g, "𝐞̀").replace(/à/g, "𝐚̀")
	.replace(/1/g, "𝟏").replace(/2/g, "𝟐").replace(/3/g, "𝟑").replace(/4/g, "𝟒").replace(/5/g, "𝟓").replace(/6/g, "𝟔")
	.replace(/7/g, "𝟕").replace(/8/g, "𝟖").replace(/9/g, "𝟗").replace(/0/g, "𝟎").replace(/&/g, "&").replace(/'/g, "'")
	.replace(/\(/g, "(").replace(/ç/g, "𝐜̧").replace(/\)/g, ")").replace(/0/g, "𝟎").replace(/,/g, ",").replace(/€/g, "€")
}

// Exporter en tant que module
module.exports.truefalse = async function(content){
	return content.replace(/true/g,"activé").replace(/false/g,"désactivé")
}

module.exports.reverseBoolean = function(content){
	return (!(content === 'true') + "")
}

module.exports.tweet = async function(content){
	// Regex pour l'extraction de gifs // l'extraction de texte gras
	var regexGif = /%GIF_..*%/g
	var regexBold = /%BOLD_..*%/g

	// Modifier certaines choses pour les rendre en majuscule
	var content = content.replace(/%gif_/gi, "%GIF_").replace(/%bold_/gi, "%BOLD_")

	// Insérez des GIFS
	if(content.match(regexGif)) var content = content.replace(regexGif, (await gif(content.match(regexGif).toString().replace(/%GIF_/g,"").slice(0, -1))))

	// Insérez du texte en gras
	if(content.match(regexBold)) var content = content.replace(regexBold, (await toBold(content.match(regexBold).toString().replace(/%BOLD_/g,"").slice(0, -1))))

	// Ajouter des sauts de ligne avec \n et %JUMP%
	var content = content.replace(/\\n/g, "\n").replace(/%JUMP%/g, "\n")

	// Retourner le contenu modifié
	return content;
}
