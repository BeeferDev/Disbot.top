const { MessageEmbed } = require("discord.js")
const createAudit = require("../helpers/auditLogs")
const { convertStrings } = require("../helpers/stringconvert")
module.exports.run = (bot) => {
    bot.on('modalSubmit', async function(modal) {
        let guild = modal.guild
        let member = modal.user
        let date = new Date()

        if(modal.customId == 'modal-tickets') {
            let responseOne = modal.getTextInputValue('question-1')
            await modal.deferReply({ ephemeral: true })

            let channelPermissions = ["VIEW_CHANNEL", "SEND_MESSAGES"]
            let channelPermArray = [
                {
                    id: bot.user.id,
                    allow: channelPermissions
                },
                {
                    id: modal.guild.id,
                    deny: channelPermissions
                },
                {
                    id: modal.user.id,
                    allow: channelPermissions
                }
            ]

            bot.config.discordInformation.tickets.roles.forEach(element => {
                let roles = guild.roles.cache.get(element)
                if(roles) {
                    let roleArray = {
                        id: roles.id,
                        allow: channelPermissions
                    }
                    channelPermArray.push(roleArray)
                }
            })
            bot.connection.query(`INSERT INTO contacts (active, userId, userName, lastUpdated, createDate, openComment) VALUES (true, '${member.id}', '${member.username}', '${date}', '${date}', '${responseOne} - Ticket Created inside Discord')`, function(err, ticketResult) {
                guild.channels.create(`ticket-${ticketResult.insertId}`, {
                    type: "text",
                    parent: bot.config.discordInformation.tickets.category,
                    permissionOverwrites: channelPermArray
                }).then(chan => {
                    modal.followUp({ content: `<@${member.id}> your ticket channel has been created. Please click here <#${chan.id}>`, ephemeral: true })
                    let embed = new MessageEmbed()
                        .setColor(bot.config.colors.discordGreyOne)
                        .setTimestamp()
                        .setTitle(`Ticket: ${ticketResult.insertId}`)
                        .setURL(`${bot.baseOpts.url}/ticket/${ticketResult.insertId}/view`)
                        .setDescription(`<@${member.id}>, Thank you for creating support ticket. Please be patient while one of our support members come to help! If you have any questions feel free to post them now!`)
                        .addFields(
                            {
                                name: "How may we help you today?",
                                value: `${responseOne}`
                            }
                        )
                    chan.send({ embeds: [embed] })
                })

                let options = {
                    action: 29,
                    string: `${member.username} created a ticket through Discord. Ticket ID: (${ticketResult.insertId})`
                }
                createAudit(bot, options, member.username)
            })
        }
    })
}