async function getDiscordUser(bot, req, callback) {
    var discordInfo = {
        loggedIn: false,
        id: null,
        username: null,
        avatar: null,
        discriminator: null,
        notificationCount: 0,
        permission: 0,
        blacklisted: 0,
        postban: 0
    }
    if(req.isAuthenticated()) {
        bot.connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, results) {
            if(results[0]) {
                discordInfo = {
                    loggedIn: true,
                    id: req.user.id,
                    username: req.user.username,
                    avatar: req.user.avatar,
                    discriminator: req.user.discriminator,
                    notificationCount: results[0].notifications,
                    permission: results[0].perm,
                    blacklisted: results[0].blacklisted,
                    postban: results[0].postban,
                }
            }
            callback(discordInfo)
        })
    } else callback(discordInfo)
}

exports.getDiscordUser = getDiscordUser