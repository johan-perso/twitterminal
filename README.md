# Twitterminal

## Prérequis

  - Environ 100 mo d'espace disque
  - Un terminal compatible avec terminal-kit
  - Un compte Twitter développeur (Faites votre demande sur https://developer.twitter.com/)
  - Quelques connaissances brefs (même si tout est énuméré ici)
  

## Installer Twitterminal

### Installation classique (Compatible avec la plupart des OS)
Installez Node.js depuis le site de [nodejs](https://nodejs.org/) ou un autre endroit tierce ayant npm embarqué, Créez un dossier "Twitterminal", Ouvrez un invite de commande / terminal depuis ce dossier puis faites cette commande pour installez toutes les dépendance `npm i terminal-kit twit node-fetch clipboardy markdown-chalk`. Téléchargez les fichier suivants depuis ce Github : tweetConfig.json, package.json, debug.js et index.js dans le dossier précédemment créé. Une fois ceci fait tout est bon : Rendez vous à l'étape pour lancer Twitterminal.


### Installation rapide (Compatible avec la plupart des distributions Linux et MacOS)
Installez [nodejs](https://nodejs.org/) puis faites cette commande dans un terminal
```
curl -curl -s -L https://raw.githubusercontent.com/johan-perso/twitterminal/main/installer.txt | bash
```


## Comment configurer Twitterminal

Ouvrez le fichier configTwitter.json et modifier les valeurs "consumer_key1", "consumer_secret1", "access_token1", "access_token_secret1" par celles de votre application crée sur votre compte Twitter développeur (https://developer.twitter.com/). Vous pouvez modifier les valeurs "consumer_key2", "consumer_secret2", "access_token2", "access_token_secret2" par celles d'une deuxième app Twitter (Pour utiliser un autre compte par exemple) : Ceci n'est pas obligatiore et vous pouvez utiliser Twitterminal sans.


## Comment lancer Twitterminal

Ouvrez un invite de commande / terminal dans le dossier que vous avez créé lors de l'installation puis entrez la commande `twitterminal`, Si vous avez utiliser l'installateur pour Linux / MacOS faite cette commande `node Twitterminal` ou `twitterminal`.


## Remplacement de texte

Liste des remplacements de texte disponible dans les nouvelles version de Twitterminal (Si vous utilisez une version récente mais pas trop, Twitterminal affichera des remplacements de textes qui ne sont pas dans votre version mais dans la dernière) ou [ici](https://github.com/johan-perso/twitterminal/blob/main/replace-text.md).


## J'ai besoin d'aide

Si vous avez besoin d'aide, Venez m'envoyer un message privé sur Discord ou Twitter (https://twitter.com/Johan_Perso) (Johan#8021). Vous pouvez aussi utiliser les issues disponible sur GitHub.
