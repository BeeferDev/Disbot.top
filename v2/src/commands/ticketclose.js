module.exports.data = {
    name: "ticketclose",
    description: "Close/Complete a support ticket."
}, module.exports.run = async (bot, interaction) => {
    if(!interaction.member.permissions.has('MANAGE_MESSAGES')) return interaction.reply({ content: `:x: Invalid Permissions ||MANAGE_MESSAGES||`, ephemeral: true })
    if(!interaction.channel.name.startsWith('ticket-')) return interaction.reply({ content: `Command can only be ran in ticket.`, ephemeral: true })
    let splitName = interaction.channel.name.split("-")
    bot.connection.query(`SELECT * FROM contacts WHERE id = ${Number(splitName[1])}`, function(err, ticketResults) {
        if(ticketResults[0]) {
            bot.connection.query(`UPDATE contacts SET active = false WHERE id = ${Number(splitName[1])}`, function(err, result) {
                interaction.reply({ content: `<@${ticketResults[0].userId}>, This ticket has been closed. You can view this ticket on the website via tickets page. Channel will be removed in 10 seconds.` }).then(() => {
                    setTimeout(() => {
                        interaction.channel.delete()
                    }, 10000)
                    let user = bot.users.cache.get(ticketResults[0].userId)
                    if(user) {
                        try {
                            user.send({ content: `Ticket: ${bot.baseOpts.url}/ticket/${ticketResults[0].id}/view` })
                        } catch (err) {}
                    }
                })
            })
        }
    })
}