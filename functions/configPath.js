module.exports = function (jsonExtension=true){
	if(require('os').platform() === "win32") var configPath = require('path').join(process.env.APPDATA, "johanstickman-cli", "twitterminal")
	if(require('os').platform() === "darwin") var configPath = require('path').join(require('os').homedir(), "library", "Preferences", "johanstickman-cli", "twitterminal")
	if(require('os').platform() === "linux") var configPath = require('path').join(require('os').homedir(), ".config", "johanstickman-cli", "twitterminal")
	if(require('os').platform() === "android") var configPath = require('path').join(require('os').homedir(), ".config", "johanstickman-cli", "twitterminal")

	if(jsonExtension === true) configPath = require('path').join(configPath, "twitterminalConfig.json")
	return configPath;
}
