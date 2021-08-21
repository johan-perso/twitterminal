// Importer terminal-kit
const term = require('terminal-kit').terminal;

// Exporter en tant que modules
module.exports.set = async function(name){
	term.windowTitle("Twitterminal | " + name)
}

module.exports.default = async function(){
	term.windowTitle("Twitterminal")
}