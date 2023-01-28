const { getDiscordUser } = require('../src/structures/discordUser'); const createAudit = require('../src/helpers/auditLogs');
const md = require('markdown-it')({ html: true, xhtmlOut: true, breaks: true, linkify: true }); const fs = require('fs');const { createid } = require('../src/helpers/makeid');

module.exports = (app, bot) => {
    if(bot.config.consoleDebug) {
        console.log(`| [Route - /bot] Loaded. |`)
    }
    app.get('/bot', function(req, res) {
        res.redirect('/')
    });
    app.get('/bot/:id', async function(req, res) {
        let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
        let botid = req.params.id;
        getDiscordUser(bot, req, function(data) {
            bot.connection.query(`SELECT * FROM adverts`, function(err, adResults) {
                bot.connection.query(`SELECT * FROM bots WHERE botId = '${botid}'`, function(err, botResults) {
                    if(botResults[0]) {
                        const randIndex = Math.floor(Math.random() * adResults.length)
                        res.render('bot', { discordInfo: data, alerts: alertsJson, botInfo: botResults[0], advert: adResults[randIndex], md: md })
                    } else res.redirect('/404')
                })
            })
        })
    });
    app.get('/bot/:id/vote', async function(req, res) {
        let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
        let botid = req.params.id
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        getDiscordUser(bot, req, function(data) {
            bot.connection.query(`SELECT * FROM adverts`, function(err, adResults) {
                bot.connection.query(`SELECT * FROM bots WHERE botId = '${botid}'`, function(err, botResults) {
                    if(botResults[0]) {
                        bot.connection.query(`SELECT * FROM votes WHERE userId = '${req.user.id}' AND botId = '${botid}'`, function(err, voteResults) {
                            if(voteResults[0]) {
                                res.redirect('/voted')
                            } else {
                                const randIndex = Math.floor(Math.random() * adResults.length)
                                res.render('vote', { discordInfo: data, alerts: alertsJson, botInfo: botResults[0], advert: adResults[randIndex] })
                            }
                        })
                    } else res.redirect('/404')
                })
            })
        })
    });
    app.get('/bot/:id/report', async function(req, res) {
        let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
        let botid = req.params.id
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        getDiscordUser(bot, req, function(data) {
            bot.connection.query(`SELECT * FROM bots WHERE botId = '${botid}'`, function(err, results) {
                if(results[0]) {
                    res.render('report', { discordInfo: data, alerts: alertsJson, botInfo: results[0] })
                } else res.redirect('/404')
            })
        })
    });
    app.get('/bot/:id/edit', function(req, res) {
        let botid = req.params.id
        let staff = false; let creator = false;
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        getDiscordUser(bot, req, function(data) {
            bot.connection.query(`SELECT * FROM bots WHERE botId = '${botid}'`, function(err, botResults) {
                bot.connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, userResults) {
                    if(userResults[0].perm > 0) staff = true
                    if(botResults[0].creatorId == req.user.id) creator = true
                    if(botResults[0].otherOwners.includes(req.user.id)) creator = true
                    if(creator || staff) {
                        res.render('edit', { discordInfo: data, botInfo: botResults[0], adminType: staff })
                    } else res.redirect('/403')
                })
            })
        })
    });
    app.get('/bot/:id/changelogs', function(req, res) {
        let botid = req.params.id
        getDiscordUser(bot, req, function(data) {
            bot.connection.query(`SELECT * FROM bots WHERE botId = '${botid}'`, function(err, botResults) {
                if(botResults[0]) {
                    bot.connection.query(`SELECT * FROM botchangelogs WHERE botId = '${botid}'`, function(err, changeResults) {
                        res.render('botchangelogs', { discordInfo: data, botInfo: botResults[0], botChanges: changeResults, md: md })
                    })
                } else res.redirect('/404')
            })
        })
    });
    app.get('/bot/:id/changelog/:cid/remove', function(req, res) {
        let botid = req.params.id
        let changelogid = req.params.cid
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        getDiscordUser(bot, req, function(data) {
            bot.connection.query(`SELECT * FROM bots WHERE botid = '${botid}'`, function(err, botResults) {
                if(botResults[0]) {
                    bot.connection.query(`DELETE FROM botchangelogs WHERE id = '${changelogid}'`, function(err, results) {
                        let options = {
                            action: 16,
                            string: `${req.user.username} deleted a changelog from ${botResults[0].botName} (${botResults[0].botId}).`
                        }
                        createAudit(bot, options, req.user.username)
                        res.redirect(`/bot/${botid}/changelogs`)
                    })
                } else res.redirect('/404')
            })
        })
    });
}