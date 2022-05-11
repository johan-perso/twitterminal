# Twitterminal

Twitterminal est un CLI permettant d'utiliser Twitter depuis son terminal, tout en ayant la possibilité d'utiliser des comptes développeurs (ou compte utilisateur/régulier), sans jamais avoir à sortir du terminal.


## Installation

**Installer avec npm :** *(le plus simple)*

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

La plupart des modules pour interagir avec l'API de Twitter ne sont pas suffisant pour ce que je souhaite. Du coup j'utilise mes propres "modules" pour interagir avec l'API (ainsi que twitter-lite), les fichiers peuvent être trouvés dans le dossier functions. Cependant, j'utilise également quelques modules tiers.


## Licence

MIT © [Johan](https://johanstickman.com)
