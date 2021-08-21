# Twitterminal

Twitterminal permet d'interagir avec l'API de Twitter dans un terminal. De cette façon, vous pourrez tweeter, voir un profil ou même crée un thread sans même ouvrir un navigateur !


## Installation

(vous avez besoin de [nodejs](https://nodejs.org) et [npm](https://npmjs.com/))
```
$ (sudo) npm install --global twitterminal
```


## Changelog

* [0.2.0](https://twiterminal.carrd.co/#changelog-020)
* [2.0.0](https://twiterminal.carrd.co/#changelog-200)


## Comment utiliser Twitterminal

Dans un terminal, faite la commande `twitterminal` pour lancer Twitterminal. Une fois cela fait, un menu apparaitra vous permettant de faire ce que vous voulez.


## Se connecter à Twitter - oauth

Lancer Twitterminal et sélectionnez l'option "Configuration" puis "Ajouter un compte (oauth)". Une fenêtre s'ouvrira dans votre navigateur, connectez vous à Twitter si besoin puis autoriser Twitterminal à accéder à votre compte. Une fois que "Les informations ont été transféré à Twitterminal", fermer l'onglet du navigateur et revenez dans votre terminal. Choisissez l'emplacement que vous voulez.
Une fois cela fait, relancez Twitterminal, resélectionnez "Configuration" puis "Choisir un compte par défaut" : choisissez l'emplacement que vous avez entré précédemment.


## Se connecter à Twitter - manuellement

Lancer Twitterminal, depuis le menu principal sélectionnez "Configuration" puis "Ajouter un compte (manuelle)" : Écrivez le nom du compte et les 4 tokens (consumer et access) trouvé dans votre compte Twitter Developer (cherchez sur Google pour comment obtenir les tokens d'une application twitter developper 😭😭). Ensuite, relancez Twitterminal et resélectionnez "Configuration" puis "Choisir un compte par défaut" : choisissez l'emplacement utilisé lors de l'ajout du compte précédemment effectué. Vous serez normalement connecté à votre compte Twitter. Pensez à mettre les tokens de votre application en Read and Write (vous aurez besoin de régénérer les tokens après ça) si vous ne l'avez pas déjà fait.


## Pour la création

La plupart des modules pour interagir avec l'API de Twitter ne sont pas suffisant pour ce que je souhaite. Du coup j'utilise mes propres "modules" pour interagir avec l'API (ainsi que twitter-lite), les fichiers peuvent être trouvés dans le dossier functions. Cependant, j'utilise quelques modules tiers.


## Licence

ISC © [Johan](https://johan-stickman.is-a.dev)