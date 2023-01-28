module.exports.run = (bot) => {
    bot.on('interactionCreate', async function(interaction) {
        if(interaction.isCommand()) {
            const command = bot.commands.get(interaction.commandName); if(!command) return;
            await command.run(bot, interaction)
        }
        if(interaction.isContextMenu()) {
            const command = bot.contextCommands.get(interaction.commandName); if(!command) return;
            await command.run(bot, interaction)
        }
    })
}