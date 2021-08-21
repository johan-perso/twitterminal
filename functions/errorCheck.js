/*
	Liste des codes d'erreur Twitter :
	https://developer.twitter.com/ja/docs/basics/response-codes
*/

// Fonction pour valider si c'est du JSON ou non (https://stackoverflow.com/a/33369954/16155654)
function isJson(item) {
	item = typeof item !== "string"
		? JSON.stringify(item)
		: item;

	try {
		item = JSON.parse(item);
	} catch (e) {
		return false;
	}

	if (typeof item === "object" && item !== null) {
		return true;
	}

	return false;
}

// Exporter en tant que module
module.exports = async function(json){
	// Vérifier si c'est du JSON
	if(!isJson(json)) return { error: false, description: "Not JSON", frenchDescription: "Le JSON n'est pas du JSON", code: "921323" }

	// Si une erreur non Twitter est présente
	if(json.error) return { error: true, description: json.description, frenchDescription: json.description, code: "2429391" }

	// Si aucune erreur Twitter n'est présente
	if(!json.errors || json.errors && !json.errors[0]) return { error: false, description: "", frenchDescription: "", code: "" }

	// Si une erreur a été détecté
	if(json.errors && json.errors[0]){
		// Ajouter dans une variable des informations
		var returned = {
			error: true,
			description: json.errors[0].message,
			frenchDescription: json.errors[0].message.replace("Could not authenticate you","Impossible de vous connecter. Vérifiez vos informations de compte (token et autre).").replace("A media id was not found","Un ID de média n'a pas été trouvé.")
			.replace("No user matches for specified terms","Aucun utilisateur trouvé").replace("Sorry, that page does not exist","Cette page n'existe pas").replace("Owner must allow dms from anyone","Vous devez accepter les DM de tout le monde")
			.replace("You cannot report yourself for spam","Vous ne pouvez pas vous auto-signaler pour spam").replace("parameter is missing"," paramètre non spécifié").replace("Bad Authentication data.","Données d'authentication incorrect.")
			.replace("User not found","Utilisateur introuvable").replace("User has been suspended","Cet utilisateur a été suspendu").replace("You are over the limit for spam reports","Vous avez atteint la limite de signalement pour spam.")
			.replace("Your account is suspended and is not permitted to access this feature","Votre compte est suspendu et ne permet pas d'effectuer ceci").replace("Application cannot perform write actions.","Votre app n'a pas la permissions d'écrire.")
			.replace("The Twitter REST API v1 is no longer active. Please migrate to API v1.1","La v1 de l'API Twitter n'est plus active. Veuillez signaler ce problème.").replace("You can’t mute yourself.","Vous ne pouvez pas masquer votre compte.")
			.replace("Rate limit exceeded","Vous avez effectué trop d'actions et vous êtes rate limit.").replace("Invalid or expired token","Les informations de connexion (token et autre) sont invalide/expiré.")
			.replace("This application is not allowed to access or delete your direct messages","L'application que vous avez utiliser pour accèder à Twitterminal via compte développeur ne permet pas d'utiliser les fonctionnalités de message privé")
			.replace("Unable to verify your credentials.","Impossible de valider vos informations de connexion, tenter de les régénérer.").replace("Account update failed:","Impossible de mettre à jour votre compte : ")
			.replace("is too long (maximum is","est trop long (le maximum est ").replace(" characters)"," caractères)").replace("Over capacity","Twitter est actuellement en \"surcapacité\".").replace("The given URL is invalid.","L'URL donné est invalide")
			.replace("Internal error","Une erreur interne (chez Twitter) s'est produite").replace("You have already favorited this status","Vous avez déjà liké ce tweet.").replace("You have already retweeted this Tweet.","Vous avez déjà RT ce tweet")
			.replace("No status found with that ID","Aucun tweet n'a été trouvé avec cette ID.").replace("There was an error sending your message:","Une erreur s'est produite lors de l'envoie du message : ")
			.replace("You cannot send messages to users who are not following you.","Vous ne pouvez pas envoyer de message privé à cet utilisateur car il ne vous follow pas.").replace("Subscription already exists.","Vous êtes déjà abonné.")
			.replace("You've already requested to follow user","Vous avez déjà tenter de suivre cette utilisateur").replace("You are unable to follow more people at this time","Vous ne pouvez plus suivre de personne en plus à ce moment (vous êtes rate limit)")
			.replace("Sorry, you are not authorized to see this status","Vous n'êtes pas autorisé à voir ce tweet : son auteur a mit son compte en privé.").replace("User is over daily status update limit","Vous avez atteint votre limite journalière de tweet.")
			.replace("Tweet needs to be a bit shorter","Le contenu de votre tweet dépasse la limite de caractères autorisé").replace("Status is a duplicate","Vous avez récemment poster le même tweet")
			.replace("Your credentials do not allow access to this resource.","Vos informations de connexions ne vous autorisent pas à faire cela.").replace("This endpoint has been retired and should not be used.","Ce point d'API a été supprimé.")
			.replace("This request looks like it might be automated. To protect our users from spam and other malicious activity, we can’t complete this action right now.","Cette action a l'air d'être fait par un robot.")
			.replace("Animated GIFs are not allowed when uploading multiple images.","Impossible d'ajouter des GIFs et plusieurs images.").replace("The validation of media ids failed","Validation des ID de medias échoués")
			.replace("To protect our users from spam and other malicious activity, this account is temporarily locked.","Ce compte est temporairement bloqué : veuillez vous y connecter depuis https://twitter.com")
			.replace("You cannot send messages to this user.","Vous ne pouvez pas envoyer de messages privé à cette utilisateur").replace("The text of your direct message is over the max character limit.","Le contenu de votre DM est trop long.")
			.replace("You attempted to reply to a Tweet that is deleted or not visible to you.","Il est impossible de répondre à ce tweet car il est supprimé ou non visible pour vous.").replace("Invalid / suspended application","L'application utilisé est invalide ou suspendu.")
			.replace("The Tweet exceeds the number of allowed attachment types.","Votre tweet dépasse le nombre maximum d'attachements.").replace("Timestamp out of bounds.","L'horloge de votre appareil est mal réglé."),
			code: json.errors[0].code
		}

		// Retourner la variable
		return returned;
	}
}