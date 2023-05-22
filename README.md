### Disclaimer

Depuis le mois de janvier 2023, l'utilisation de client tiers (par exemple, Twitterminal) n'est plus autorisée. Le développement de Twitterminal est donc interdit selon les nouvelles [conditions d'utilisations pour développeurs](https://developer.twitter.com/en/developer-terms/agreement).

Sources : [iGen](https://www.igen.fr/app-store/2023/01/cest-officiellement-mort-pour-les-apps-twitter-135047), [The Verge](https://www.theverge.com/2023/1/19/23562947/twitter-third-party-client-tweetbot-twitterific-ban-rules), [Engadget](https://www.engadget.com/twitter-new-developer-terms-ban-third-party-clients-211247096.html).

Pour l'instant, les fonctionnalités de Twitterminal semblent toujours fonctionner, mais celles-ci pourraient s'arrêter à tout moment, sans préavis.

EDIT MAI 2023 : on s'est fait ban 💀💀

# Twitterminal

Twitterminal est un CLI permettant d'utiliser Twitter depuis son terminal, tout en ayant la possibilité d'utiliser des comptes développeurs (ou compte utilisateur/régulier), sans jamais avoir à sortir du terminal.

## Fonctionnalité

* Tweeter (avec/sans géolocalisation)
* Affichage de sa timeline, et de ses notifications
* Support de comptes illimités (compte dev supportés)
* Recherche d'utilisateur et de tweets
* Système de sauvegarde intégré (cloud et local)
* Vérifier et obtenir des informations sur un compte à partir de clés d'API (OAuth v1)
* [Actions de masse](https://github.com/johan-perso/twitterminal/wiki/Actions-de-masse)
* User-friendly (même dans un terminal)


## Installation

> [Node.js](https://nodejs.org/) v15 ou plus nécessaire

> [Git](https://git-scm.com/) nécessaire dans l'installation manuelle

**Installer avec npm *(recommendé)* :**

```bash
npm install --global twitterminal
```

**Installer manuellement :**

```bash
git clone https://github.com/johan-perso/twitterminal.git
cd twitterminal
npm install
npm link
```


## Changelog

* [6.1.0](https://github.com/johan-perso/twitterminal/wiki/Changelog#v610)
* [6.0.0](https://github.com/johan-perso/twitterminal/wiki/Changelog#v600)
* [5.0.0](https://github.com/johan-perso/twitterminal/wiki/Changelog#v500)
* [4.2.0](https://github.com/johan-perso/twitterminal/wiki/Changelog#v420)
* [4.1.0](https://github.com/johan-perso/twitterminal/wiki/Changelog#v410)
* [4.0.0](https://github.com/johan-perso/twitterminal/wiki/Changelog#v400)
* [3.0.0](https://github.com/johan-perso/twitterminal/wiki/Changelog#v300)
* [2.0.0](https://github.com/johan-perso/twitterminal/wiki/Changelog#v200)
* [0.2.0](https://github.com/johan-perso/twitterminal/wiki/Changelog#v020-refonte-entière-du-code-depuis-la-branche-old)


## Comment utiliser Twitterminal

Dans un terminal, faite la commande `twitterminal` pour lancer Twitterminal. Une fois cela fait, un menu apparaitra vous permettant de faire ce que vous voulez.


## Se connecter à Twitter

Lancer Twitterminal et sélectionnez l'option "Configuration" puis "Ajouter un compte". Une fenêtre s'ouvrira dans votre navigateur, connectez vous à Twitter si besoin puis autoriser Twitterminal à accéder à votre compte. Un message apparaitra quand vous pourrez fermer la page et revenir dans le terminal. Finissez par choisir l'emplacement que vous souhaitez utiliser pour enregistrer ce compte.


## Pour la création

La plupart des modules pour interagir avec l'API de Twitter ne sont pas suffisant pour ce que je souhaite. Du coup j'utilise mes propres "modules" pour interagir avec l'API (ainsi que [twitter-lite](https://npmjs.com/package/twitter-lite)), les fichiers peuvent être trouvés dans le dossier functions. Cependant, j'utilise également quelques modules tiers.


## Licence

MIT © [Johan](https://johanstick.me)
