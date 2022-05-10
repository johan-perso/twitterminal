// Importer quelques modules / fonctions
var fetch = require('./fetch.js');
var errorCheck = require('./errorCheck.js');
const chalk = require('chalk');
const open = require('open');
const inquirer = require('inquirer');
const boxen = require('boxen');
const term = require('terminal-kit').terminal
const ora = require('ora'); const spinner = ora('');

// Réactiver le CTRL+C avec terminal-kit
term.on('key', function(name, matches, data){
	if(name === 'CTRL_C') process.exit();
})

// Préparer un regex pour diviser un texte en plusieurs lignes (genre ça saute une ligne si le nombre de caractères équivalent à la taille de l'écran divisé par 2 est atteint)
var regex = new RegExp(`.{1,${parseInt(process.stdout.columns/2)}}`, "g");

// Exporter en tant que module
module.exports = async function(oauth, token, selfInfo){
	// Demander avec Inquirer si on veut afficher les tweets de son profil, ses notifications ou sa timeline
	var showWhat = await inquirer.prompt([
		{
			type: 'list',
			name: 'showWhat',
			message: 'Que voulez-vous afficher ?',
			choices: [
				{ name: 'Mes tweets', value: 'tweets' },
				{ name: 'Mes notifications', value: 'notifications' },
				{ name: 'Ma timeline', value: 'timeline'}
			]
		}
	])
	showWhat = showWhat.showWhat;

	// Afficher un spinner
	spinner.text = `Obtention de ${showWhat.replace('tweets', 'vos tweets').replace('notifications','vos notifications').replace('timeline','votre timeline')}...`;
	spinner.start();

	// Obtenir la timeline
	if(showWhat == 'tweets') var timeline = await fetch({url: 'https://api.twitter.com/1.1/statuses/user_timeline.json?count=100', method: 'GET'}, oauth, token)
	if(showWhat == 'notifications') var timeline = await fetch({url: 'https://api.twitter.com/1.1/statuses/mentions_timeline.json?count=100', method: 'GET'}, oauth, token)
	if(showWhat == 'timeline') var timeline = await fetch({url: 'https://api.twitter.com/1.1/statuses/home_timeline.json?exclude_replies=true&count=100', method: 'GET'}, oauth, token)

	// Vérifiez si l'information contient une erreur
	var error = await (errorCheck(timeline))
	if(error.error === true) return spinner.stop() && console.log(chalk.red(`\nImpossible d'afficher votre timeline : ${error.frenchDescription}`) + chalk.cyan(` (Code erreur #${error.code})`)) && process.exit()

	// Enlever les tweet qui contiennent des médias, ou qui sont des RT
	var timeline = timeline.filter(tweet => {
		if(tweet?.entities?.media || tweet?.entities?.media?.length) return false;
		if(showWhat == 'tweets' && tweet.retweeted_status) return false;
		return true;
	})

	// Arrêter le spinner
	spinner.stop()

	// Si la timeline est vide
	if(timeline.length == 0) return console.log(chalk.red("\nRien à afficher :("))

	// Informer comment ça marche
	console.log(chalk.bold('\nContrôles :'))
	console.log(`${chalk.blue('Entrer')}        :    Afficher le tweet suivant`)
	console.log(`${chalk.blue('Backspace')}     :    Afficher le précédent tweet`)
	console.log(`${chalk.blue('R')}             :    Répondre au tweet affiché`)
	console.log(`${chalk.blue('F')}             :    Like le tweet affiché`)
	console.log(`${chalk.blue('Q')}             :    RT le tweet affiché`)
	console.log(`${chalk.blue('S')}             :    Supprimer le tweet affiché (si vous êtes l'auteur)`)
	console.log(`${chalk.blue('I')}             :    Ouvrir dans le navigateur`)

	// Contrôle au clavier
	var i = -1;
	var isListening = true
	term.grabInput(true)
	term.on('key', async function(name){
		// Si on n'écoute pas, on sort
		if(!isListening) return;

		// Entrer - passer au tweet suivant
		if(name == 'ENTER' && timeline[i+1]){
			i++
			showTweet(timeline[i])
		}
		// Backspace - passer au tweet précédent
		if(name == 'BACKSPACE' && timeline[i-1]){
			i--
			showTweet(timeline[i])
		}
		// I - passer au tweet précédent
		if((name == 'i' || name == 'I') && timeline[i]){
			open(`https://twitter.com/${timeline[i]?.user?.screen_name}/status/${timeline[i]?.id_str}`)
		}
		// F - Like le tweet affiché
		if((name == 'f' || name == 'F') && timeline[i]){
			if(timeline[i].favorited){
				await fetch({url: `https://api.twitter.com/1.1/favorites/destroy.json?id=${timeline[i].id_str}`, method: 'POST'}, oauth, token)
				timeline[i].favorited = null
				console.log('Like supprimé !')
			} else {
				await fetch({url: `https://api.twitter.com/1.1/favorites/create.json?id=${timeline[i].id_str}`, method: 'POST'}, oauth, token)
				timeline[i].favorited = true
				console.log('Like ajouté !')
			}
		}
		// Q - RT le tweet affiché
		if((name == 'q' || name == 'Q') && timeline[i]){
			if(timeline[i].retweeted){
				await fetch({url: `https://api.twitter.com/1.1/statuses/unretweet/${timeline[i].id_str}.json`, method: 'POST'}, oauth, token)
				timeline[i].retweeted = null
				console.log('RT supprimé !')
			} else {
				await fetch({url: `https://api.twitter.com/1.1/statuses/retweet/${timeline[i].id_str}.json`, method: 'POST'}, oauth, token)
				timeline[i].retweeted = true
				console.log('RT ajouté !')
			}
		}
		// R - Répondre au tweet affiché
		if((name == 'r' || name == 'r') && timeline[i]){
			// Récupérer le tweet
			var tweet = timeline[i]

			// Arrêter d'écouter les appuis de touche
			isListening = false

			// Demander ce qu'on veut répondre
			var response = await inquirer.prompt([
				{
					type: 'input',
					name: 'response',
					message: 'Que voulez-vous répondre ?',
					validate(text){
						if(text.length < 1){ return 'Veuillez entrer un texte' }
						if(text.length > 255){ return `Ce texte est trop grand (${text.length} caractères)` }
						return true;
					}
				}
			])
			var response = response.response

			// Préparer twitter-lite
			var Twitter = require('twitter-lite');
			const client = new Twitter({
				subdomain: "api",
				version: "1.1",
				consumer_key: oauth?.consumer?.key,
				consumer_secret: oauth?.consumer?.secret,
				access_token_key: token?.key,
				access_token_secret: token?.secret
			})

			// Répondre au tweet
			await client.post('statuses/update', { status: await(require('./replaceText.js').tweet(response)), in_reply_to_status_id: tweet.id_str, auto_populate_reply_metadata: true })

			// Si ça a marché
			.then(results => {
				require('./writeClipboard.js')(`https://twitter.com/${results.user.screen_name}/status/${results.id_str}`)
				console.log('Réponse envoyé !')
			})

			// Si y'a une erreur
			.catch(async err => {
				// Donner des infos en plus avec le flag --debug
				if(!process.argv.includes("--debug")) console.log(err)

				// Obtenir des informations via un check, puis les donner
				var error = await (errorCheck(err))
				if(error.error === true) return console.log(chalk.red(`Impossible de tweeter : ${error.frenchDescription}`) + chalk.cyan(` (Code erreur #${error.code})`))

				// Sinon, donner l'erreurs comme Twitter la donne
				return console.log(chalk.red(err.errors || err))
			});

			// Récouter les appuis de touche
			isListening = true
			term.grabInput(true)
		}
		// S - Supprimer le tweet affiché
		if((name == 's' || name == 'S') && timeline[i] && timeline[i]?.user?.screen_name == selfInfo.screen_name){
			// Récupérer le tweet
			var tweet = timeline[i]

			// Arrêter d'écouter les appuis de touche
			isListening = false

			// Demander ce qu'on veut répondre
			var confirm = await inquirer.prompt([
				{
					type: 'confirm',
					name: 'confirm',
					message: 'Êtes-vous sûr de vouloir supprimer ce tweet ?',
					default: false
				}
			])
			var confirm = confirm.confirm

			// Si on refuse
			if(!confirm){
				isListening = true
				term.grabInput(true)
			}

			// Préparer twitter-lite
			var Twitter = require('twitter-lite');
			const client = new Twitter({
				subdomain: "api",
				version: "1.1",
				consumer_key: oauth?.consumer?.key,
				consumer_secret: oauth?.consumer?.secret,
				access_token_key: token?.key,
				access_token_secret: token?.secret
			})

			// Répondre au tweet
			await client.post(`statuses/destroy/${tweet.id_str}`)

			// Si ça a marché
			.then(results => {
				console.log('Tweet supprimé !')
			})

			// Si y'a une erreur
			.catch(async err => {
				// Donner des infos en plus avec le flag --debug
				if(!process.argv.includes("--debug")) console.log(err)

				// Obtenir des informations via un check, puis les donner
				var error = await (errorCheck(err))
				if(error.error === true) return console.log(chalk.red(`Impossible de supprimer : ${error.frenchDescription}`) + chalk.cyan(` (Code erreur #${error.code})`))

				// Sinon, donner l'erreurs comme Twitter la donne
				return console.log(chalk.red(err.errors || err))
			});

			// Récouter les appuis de touche
			isListening = true
			term.grabInput(true)
		}
	});

	// A chaque tweet présent dans la timeline
	function showTweet(tweet){
		// Obtenir le contenu du tweet
		var content = tweet?.text
		if(content.split('\n')[0]?.length < parseInt(process.stdout.columns/2)) var content = content + ' '.repeat(parseInt(process.stdout.columns/2) - content.split('\n')[0].length)
		if(content.split('\n')[1]?.length < parseInt(process.stdout.columns/2)) var content = content + ' '.repeat(parseInt(process.stdout.columns/2) - content.split('\n')[1].length)

		// Obtenir le texte pour les favs
		if(tweet.favorited == true && tweet.favorite_count > 2) var favText = `Vous et ${tweet.favorite_count - 1} autres personnes ont aimé ce tweet`
		if(tweet.favorited == true && tweet.favorite_count == 1) var favText = `Vous avez like`
		if(tweet.favorited == false && tweet.favorite_count > 1) var favText = `${tweet.favorite_count} likes`
		if(tweet.favorited == false && tweet.favorite_count < 2) var favText = `${tweet.favorite_count} like`
		if(tweet.favorite_count == 0) var favText = `Aucun like`

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
}
