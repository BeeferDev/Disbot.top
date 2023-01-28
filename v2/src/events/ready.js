
const config = require('../configs/config.js');
const ms = require('ms');

module.exports.run = (bot) => {
    bot.on('ready', async () => {
        setTimeout(() => {
            let both = bot.numbers.commands + bot.numbers.contextCommands
            console.log(`| [${both}]: Slash & Context Commands |\n| [${bot.numbers.events}]: Events |`)
            console.log(`| [${bot.numbers.users}]: Disbot.top Users |\n| [${bot.numbers.bots}]: Disbot.top Bots |`)
        }, 100)
        const commandData = [
            ...Array.from(bot.commands.values()).map((c) => c.data),
            ...Array.from(bot.contextCommands.values()).map((c) => c.data),
        ]
        bot.guilds.cache.get(config.discordInformation.Guild).commands.set(commandData)
    })
}