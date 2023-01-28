const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const ms = require('ms');
const { convertStrings } = require('../../helpers/stringconvert');
// 2 USER | 3 MESSAGE
module.exports = {
    data: {
        name: "Check if blacklisted?",
        type: 2,    
    },
    async run(bot, interaction) {
        if(!interaction.member.permissions.has('MANAGE_MESSAGES')) return interaction.reply({ content: `:x: Invalid Permissions ||MANAGE_MESSAGES||`, ephemeral: true })
        bot.connection.query(`SELECT * FROM users WHERE userId = '${interaction.targetId}'`, function(err, userResult) {
            if(userResult[0]) {
                let embed = new MessageEmbed()
                    .setColor(bot.config.colors.discordGreyOne)
                    .setFooter({ text: "Blacklist Check | Disbot.top", iconURL: interaction.guild.iconURL() })
                    .setTimestamp()
                    if(userResult[0].blacklisted) {
                        embed.setDescription(`[${userResult[0].userName}](${bot.baseOpts.url}/user/${userResult[0].userId}) is blacklisted from the website.`)
                    } else {
                        embed.setDescription(`[${userResult[0].userName}](${bot.baseOpts.url}/user/${userResult[0].userId}) is not blacklisted.`)
                    }
                interaction.reply({ embeds: [embed], ephemeral: true })
            } else {
                let embed = new MessageEmbed()
                    .setColor(bot.config.colors.discordGreyOne)
                    .setFooter({ text: "User not found | Disbot.top", iconURL: interaction.guild.iconURL() })
                    .setTimestamp()
                    .setDescription(`Sorry, I could not find a user with that ID.`)
                interaction.reply({ embeds: [embed], ephemeral: true })
            }
        })
    }
}
    