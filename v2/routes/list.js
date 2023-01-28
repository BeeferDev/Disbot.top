const { getDiscordUser } = require('../src/structures/discordUser'); const createAudit = require('../src/helpers/auditLogs');
const md = require('markdown-it')({ html: true, xhtmlOut: true, breaks: true, linkify: true }); const fs = require('fs');
const {convertStrings} = require('../src/helpers/stringconvert');

module.exports = (app, bot) => {
    if(bot.config.consoleDebug) {
        console.log(`| [Route - /list] Loaded. |`)
    }
    app.get(`/list`, function(req, res) {
        res.redirect('/')
    });
    app.get(`/list/top`, function(req, res) {
        getDiscordUser(bot, req, function(data) {
            bot.connection.query(`SELECT * FROM bots WHERE hidden = false ORDER BY votes DESC`, function(err, results) {
                res.render('listtop', { discordInfo: data, results: results });
            })
        })
    });
    app.get(`/list/new`, function(req, res) {
        getDiscordUser(bot, req, function(data) {
            bot.connection.query(`SELECT * FROM bots WHERE hidden = false ORDER BY id DESC`, function(err, results) {
                res.render('listnew', { discordInfo: data, results: results });
            })
        })
    });
    app.get(`/list/certified`, function(req, res) {
        getDiscordUser(bot, req, function(data) {
            bot.connection.query(`SELECT * FROM bots WHERE certified = true AND hidden = false ORDER BY votes DESC`, function(err, results) {
                res.render('listcert', { discordInfo: data, results: results });
            })
        })
    });
}
