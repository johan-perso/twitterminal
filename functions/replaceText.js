// Convertir du texte en gras
function toBold(content){
	return content.replace(/a/gi, "𝐚").replace(/b/gi, "𝐛").replace(/c/gi, "𝐜").replace(/d/gi, "𝐝").replace(/e/gi, "𝐞")
	.replace(/f/gi, "𝐟").replace(/g/gi, "𝐠").replace(/h/gi, "𝐡").replace(/i/gi, "𝐢").replace(/j/gi, "𝐣").replace(/k/gi, "𝐤")
	.replace(/l/gi, "𝐥").replace(/m/gi, "𝐦").replace(/n/gi, "𝐧").replace(/o/gi, "𝐨").replace(/p/gi, "𝐩").replace(/q/gi, "𝐪")
	.replace(/r/gi, "𝐫").replace(/s/gi, "𝐬").replace(/t/gi, "𝐭").replace(/u/gi, "𝐮").replace(/v/gi, "𝐯").replace(/w/gi, "𝐰")
	.replace(/x/gi, "𝐱").replace(/y/gi, "𝐲").replace(/z/gi, "𝐳").replace(/é/gi, "𝐞́").replace(/è/gi, "𝐞̀").replace(/à/gi, "𝐚̀")
	.replace(/1/gi, "𝟏").replace(/2/gi, "𝟐").replace(/3/gi, "𝟑").replace(/4/gi, "𝟒").replace(/5/gi, "𝟓").replace(/6/gi, "𝟔")
	.replace(/7/gi, "𝟕").replace(/8/gi, "𝟖").replace(/9/gi, "𝟗").replace(/0/gi, "𝟎").replace(/&/gi, "&").replace(/'/gi, "'")
	.replace(/\(/gi, "(").replace(/ç/gi, "𝐜̧").replace(/\)/gi, ")").replace(/0/gi, "𝟎").replace(/,/gi, ",").replace(/€/gi, "€")
}

// Exporter en tant que module
module.exports.truefalse = async function(content){
	return content.replace(/true/gi,"activé").replace(/false/gi,"désactivé")
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
	if(content.match(regexGif)) var content = content.replace(regexGif, (await require('./gif.js')(content.match(regexGif).toString().replace(/%GIF_/gi,"").slice(0, -1))))

	// Insérez du texte en gras
	if(content.match(regexBold)) var content = content.replace(regexBold, (await toBold(content.match(regexBold).toString().replace(/%BOLD_/gi,"").slice(0, -1))))

	// Ajouter des sauts de ligne avec \n et %JUMP%
	var content = content.replace(/\\n/gi, "\n").replace(/%JUMP%/gi, "\n")

	// Retourner le contenu modifié
	return content;
}
