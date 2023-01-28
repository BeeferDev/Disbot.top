const { getDiscordUser } = require('../src/structures/discordUser'); const createAudit = require('../src/helpers/auditLogs');
const md = require('markdown-it')({ html: true, xhtmlOut: true, breaks: true, linkify: true }); const fs = require('fs');
const {convertStrings} = require('../src/helpers/stringconvert');

module.exports = (app, bot) => {
    if(bot.config.consoleDebug) {
        console.log(`| [Route - /user] Loaded. |`)
    }
    app.get('/user', function(req, res) {
        res.redirect('/')
    });
    app.get('/user/:id', async function(req, res) {
        let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
        let userid = req.params.id
        getDiscordUser(bot, req, function(data) {
            bot.connection.query(`SELECT * FROM adverts`, function(err, adResults) {
                bot.connection.query(`SELECT * FROM users WHERE userId = '${userid}' OR userName = '${userid}'`, function(err, userResults) {
                    if(userResults[0]) {
                        bot.connection.query(`SELECT * FROM bots WHERE creatorId = '${userResults[0].userId}' AND hidden = false`, function(err, botResults) {
                            let bots = {}
                            if(botResults) bots = botResults
                            const randIndex = Math.floor(Math.random() * adResults.length)
                            res.render('user', { discordInfo: data, alerts: alertsJson, profile: userResults[0], profileBots: bots, botDev: botResults[0], ad: adResults[randIndex], convert: convertStrings })
                        })
                    } else res.redirect('/404')
                })
            })
        })
    });
}