const { getDiscordUser } = require('../src/structures/discordUser'); const createAudit = require('../src/helpers/auditLogs');
const md = require('markdown-it')({ html: true, xhtmlOut: true, breaks: true, linkify: true }); const fs = require('fs');
const {convertStrings} = require('../src/helpers/stringconvert');

module.exports = (app, bot) => {
    if(bot.config.consoleDebug) {
        console.log(`| [Route - /ticket] Loaded. |`)
    }
    app.get('/ticket', function(req, res) {
        res.redirect('/')
    });
    app.get('/ticket/create', async function(req, res) {
        let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
        if(!req.isAuthenticated()) return res.redirect('/notloggedin');
        getDiscordUser(bot, req, function(data) {
            res.render('ticketcreate', { discordInfo: data, alerts: alertsJson })
        })
    });
    app.get('/ticket/:id/view', function(req, res) {
        let ticketid = req.params.id
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        getDiscordUser(bot, req, function(data) {
            bot.connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, userResult) {
                bot.connection.query(`SELECT * FROM contacts WHERE id = '${ticketid}'`, function(err, tickResult) {
                    if(tickResult[0]) {
                        if(tickResult[0].userId == req.user.id || userResult[0].perm > 0) {
                            bot.connection.query(`UPDATE users SET notifications = 0 WHERE userId = '${req.user.id}'`, function(err, result) {
                                if(err) console.log(err)
                            });
                            bot.connection.query(`SELECT * FROM contactComments WHERE contactId = '${ticketid}'`, function(err, commentResult) {
                                if(commentResult[0]) {
                                    res.render('ticketview', { discordInfo: data, intialTicket: tickResult[0], comments: commentResult, convertS: convertStrings });
                                } else {
                                    res.render('ticketview', { discordInfo: data, intialTicket: tickResult[0], comments: null, convertS: convertStrings })
                                }
                            })
                        } else res.redirect('/403')
                    } else res.redirect('/404')
                })
            })
        })
    });
}