const createAudit = require("../helpers/auditLogs"); const { MessageEmbed } = require('discord.js')
module.exports.run = (bot) => {
    bot.on('messageCreate', async function(message) {
        if(message.author.bot) return
        if(message.channel.name.startsWith('ticket-')) {
            let splitChannelName = message.channel.name.split('-')
            let date = new Date()
            let comment = message.content.replace(/'/gi, "''");
            bot.connection.query(`SELECT * FROM contacts WHERE id = ${Number(splitChannelName[1])}`, function(err, ticketResults) {
                if(ticketResults[0].userId == message.author.id) {

                } else {
                    bot.connection.query(`UPDATE users SET notifications = notifications + 1 WHERE userId = '${ticketResults[0].userId}'`, function(err, result) {
                        if(err) console.log(err)
                    })
                }
                bot.connection.query(`UPDATE contacts SET lastUpdated = '${date}', active = true WHERE id = ${Number(splitChannelName[1])}`, function(err, result) {
                    if(err) console.log(err)
                })
                bot.connection.query(`INSERT INTO contactComments (contactId, userId, userName, createDate, comment) VALUES (${Number(splitChannelName[1])}, '${message.author.id}', '${message.author.tag}', '${date}', '${comment} - Message sent through Discord.')`, function(err, result) {
                    if(err) console.log(err)
                    let options = {
                        action: 17,
                        string: `${message.author.tag} commented on a ticket through Discord. Ticket: ${splitChannelName[1]}`
                    }
                    createAudit(bot, options, message.author.tag)
                    const embedGuild = new MessageEmbed()
                        .setColor(bot.config.colors.discordGreyOne)
                        .setTitle(`New Comment | Ticket: ${splitChannelName[1]}`)
                        .setDescription(`**✧ ID:** ${splitChannelName[1]}\n**✧ Comment by:** ${message.author.tag}\n\n**✧ Comment:**\n${comment}\n\n[View](${bot.baseOpts.url}/ticket/${splitChannelName[1]}/view)`)
                        .setURL(`${bot.baseOpts.url}/ticket/${splitChannelName[1]}/view`)
                        .setFooter({ text: `From: ${message.author.tag} | Message via Discord.` })
                    setTimeout(() => { bot.siteLogSend(embedGuild) }, 500)
                })
            })
        } else {
            //
        }
    })
}