// Importer quelques modules / fonctions
var fetch = require('./fetch.js');
var errorCheck = require('./errorCheck.js');
const chalk = require('chalk');
const boxen = require('boxen');
const ora = require('ora'); const spinner = ora('');

// Préparer un regex pour diviser un texte en plusieurs lignes (genre ça saute une ligne si le nombre de caractères équivalent à la taille de l'écran divisé par 2 est atteint)
var regex = new RegExp(`.{1,${parseInt(process.stdout.columns/2)}}`, "g");

// Exporter en tant que module
module.exports = async function(oauth, token){
	// Afficher un spinner
	spinner.text = "Obtention de votre timeline...";
	spinner.start();

	// Obtenir la timeline
	var timeline = await fetch({url: 'https://api.twitter.com/1.1/statuses/home_timeline.json?exclude_replies=true&count=100', method: 'GET'}, oauth, token)

	// Vérifiez si l'information contient une erreur
	var error = await (errorCheck(timeline))
	if(error.error === true) return spinner.stop() && console.log(chalk.red(`\nImpossible d'afficher votre timeline : ${error.frenchDescription}`) + chalk.cyan(` (Code erreur #${error.code})`)) && process.exit()

	// Arrêter le spinner
	spinner.stop()

	// A chaque tweet présent dans la timeline
	timeline.forEach(async tweet => {
		// Masquer le tweet si il est court + il contient un media
		if(tweet?.entities?.media && tweet?.text?.length < 48) return;

		// Si le tweet n'est pas un RT
		if(!tweet.retweeted_status){
			// Obtenir le contenu du tweet
			var content = tweet?.text
			if(content.split('\n')[0]?.length < parseInt(process.stdout.columns/2)) var content = content + ' '.repeat(parseInt(process.stdout.columns/2) - content.split('\n')[0].length)
			if(content.split('\n')[1]?.length < parseInt(process.stdout.columns/2)) var content = content + ' '.repeat(parseInt(process.stdout.columns/2) - content.split('\n')[1].length)

			// Obtenir le texte pour les favs
			if(tweet.favorited === true && tweet.favorite_count > 2) var favText = `Vous et ${tweet.favorite_count - 1} autres personnes ont aimé ce tweet`
			if(tweet.favorited === true && tweet.favorite_count === 1) var favText = `Vous avez like`
			if(tweet.favorited === false && tweet.favorite_count > 1) var favText = `${tweet.favorite_count} likes`
			if(tweet.favorited === false && tweet.favorite_count === 0) var favText = `Aucun like`

			// Afficher le tweet
			console.log(boxen(`${content}`.match(regex).join('\n'), {
				title: `${chalk.dim((tweet.user.verified === true) ? `✔️  ` : '')}${chalk.dim("@"+tweet?.user?.screen_name)}${chalk.dim((favText?.length > 2) ? ` ─────── ${favText}` : '')}${chalk.dim((tweet.source === `<a href="https://twiterminal.carrd.co" rel="nofollow">Twitterminal </a>`) ? ` ────────── Via Twitterminal` : '')}`,
				titleAlignment: 'left',
				padding: 1,
				margin: 1,
				borderColor: 'yellow',
				borderStyle: 'round'
			}))
		}
	})
}
