const { getDiscordUser } = require('../src/structures/discordUser'); const createAudit = require('../src/helpers/auditLogs');
const md = require('markdown-it')({ html: true, xhtmlOut: true, breaks: true, linkify: true }); const fs = require('fs');
const {convertStrings} = require('../src/helpers/stringconvert');

module.exports = (app, bot) => {
    if(bot.config.consoleDebug) {
        console.log(`| [Route - /api] Loaded. |`)
    }
    app.get('/api', async function(req, res) {
        let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
        getDiscordUser(bot, req, function(data) {
            res.render('apihome', { discordInfo: data, alerts: alertsJson })
        })
    });
    app.get('/api/docs', async function(req, res) {
        let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
        getDiscordUser(bot, req, function(data) {
            bot.connection.query(`SELECT * FROM apidocs`, function(err, apiResults) {
                res.render('apidocs', { discordInfo: data, alerts: alertsJson, apiInfo: apiResults, markd: md })
            })
        })
    });
    app.get('/api/bottokens', async function(req, res) {
        let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        getDiscordUser(bot, req, function(data) {
            bot.connection.query(`SELECT * FROM bots WHERE creatorId = '${req.user.id}'`, function(err, botResults) {
                res.render('apibottokens', { discordInfo: data, alerts: alertsJson, userBots: botResults })
            })
        })
    });
    
    app.use('/api/v1', require('../src/api/v1.js'));
    app.use('/api/v2', require('../src/api/v2.js'));
    app.use('/api/v3', require('../src/api/v3.js'));
    app.use('/api/v4', require('../src/api/v4.js'));
}