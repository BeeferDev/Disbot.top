const { getDiscordUser } = require('../src/structures/discordUser'); const createAudit = require('../src/helpers/auditLogs');
const md = require('markdown-it')({ html: true, xhtmlOut: true, breaks: true, linkify: true }); const fs = require('fs');
const {convertStrings} = require('../src/helpers/stringconvert'); const passport = require('passport');const DiscordStrategy = require('passport-discord').Strategy;

module.exports = (app, bot, axios) => {
    if(bot.config.consoleDebug) {
        console.log(`| [Route - /] Loaded. |`)
    }
    app.get('/auth/discord', passport.authenticate('discord'));
    app.get('/login', function(req, res) {req.session.refererFromLogin = req.headers.referer;res.redirect('/auth/discord');});
    app.get('/logout', function(req, res) {req.logout();res.redirect(req.headers.referer);});
    app.get('/auth/discord/callback', passport.authenticate('discord', {
        failureRedirect: '/'
    }), async function(req, res) {
        bot.connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, async (err, results) => {
            if(!results[0]) {
                axios(`/users/${req.user.id}`).then((resDis) => {
                    var userIcon = `/assets/images/noimage.png`;
                    const userName = resDis.data.username+'#'+resDis.data.discriminator;
                    if(resDis.data.avatar) {
                        userIcon = `https://cdn.discordapp.com/avatars/${resDis.data.id}/${resDis.data.avatar}?size=512`;
                    }
                    bot.connection.query(`INSERT INTO users (userId, userIcon, userName, bio, perm, blacklisted, postban, discordSocial, githubSocial, twitterSocial) VALUES ('${req.user.id}', '${userIcon}', '${userName}', 'Welcome to my profile!', 0, 0, 0, 'null', 'null', 'null')`, function (err, result) {
                        if (err) console.log(err);
                    });
                }).catch((err) => {
                    console.log(err);
                });
            }
        });
        if(req.session.refererFromLogin == `${bot.baseOpts.url}/notloggedin`) req.session.refererFromLogin = '/';
        if(req.session.refererFromLogin == `${bot.baseOpts.url}/403`) req.session.refererFromLogin = '/';
        if(req.session.refererFromLogin == `${bot.baseOpts.url}/404`) req.session.refererFromLogin = '/';
        res.redirect(req.session.refererFromLogin || '/')
        delete req.session.refererFromLogin;
    });
    app.get('/', async function(req, res) {
        let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
        getDiscordUser(bot, req, function(data){
            bot.connection.query("SELECT * FROM bots WHERE hidden = false ORDER BY RAND() LIMIT 1", (err, aRandomBot) => {
                bot.connection.query("SELECT * FROM bots WHERE hidden = false ORDER BY votes DESC LIMIT 9", (err, topResults) => {
                    bot.connection.query("SELECT * FROM bots WHERE hidden = false ORDER BY id DESC LIMIT 9", (err, newResults) => {
                        bot.connection.query("SELECT * FROM bots WHERE hidden = false AND certified = true ORDER BY votes DESC LIMIT 9", (err, certResults) => {
                            bot.connection.query(`SELECT * FROM adverts`, function(err, results) {
                                const adIndex = Math.floor(Math.random() * results.length)
                                res.render('index', { discordInfo: data, alerts: alertsJson, certBots: certResults, newBots: newResults, topBots: topResults, adOne: results[adIndex], adTwo: results[adIndex], rand: aRandomBot[0] });
                            });
                        });
                    });
                });
            });
        });
    });
    app.get('/search', async function (req, res) {
        let searchQuery = req.query.q;
        getDiscordUser(bot, req, function(data){
            bot.connection.query("SELECT * FROM bots WHERE hidden = false ORDER BY votes DESC LIMIT 12", (err, topResults) => {
                var topBots = topResults;
                if(!searchQuery) return res.render('search', {discordInfo: data, results: false, qResults: {}, topBots: topBots, query: null});
                if(searchQuery.startsWith('tag:')) {
                    let tag = searchQuery.split(":")[1]
                    bot.connection.query(`SELECT * FROM bots WHERE tag${tag} = true AND hidden = false`, (err, results) => {
                        if(!results) return res.render('search', {discordInfo: data, results: false, qResults: {}, topBots: topBots, query: null});
                        res.render('search', {discordInfo: data, results: true, qResults: results, topBots: topBots, query: searchQuery});
                    });
                } else {
                    bot.connection.query(`SELECT * FROM bots WHERE botName LIKE '%${searchQuery.replace(/'/gi, "''")}%' OR shortDesc LIKE '%${searchQuery.replace(/'/gi, "''")}%' OR longDesc LIKE '%${searchQuery.replace(/'/gi, "''")}%' AND hidden = false`, (err, results) => {
                        if(!results) return res.render('search', {discordInfo: data, results: false, qResults: {}, topBots: topBots});
                        res.render('search', {discordInfo: data, results: true, qResults: results, topBots: topBots, query: searchQuery});
                    });
                }
            });
        });
    });
    app.get('/tickets', async function (req, res) {
        let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        getDiscordUser(bot, req, function(data){
            bot.connection.query(`SELECT * FROM contacts WHERE userId = '${req.user.id}'`, (err, results) => {
                if(results[0]) {
                    res.render('tickets', { discordInfo: data, alerts: alertsJson, userTickets: results });
                } else {
                    res.render('tickets', { discordInfo: data, alerts: alertsJson, userTickets: false });
                }
            }); 
        });
    });
    app.get('/add', async function (req, res) {
        if(!req.isAuthenticated()) return res.redirect('/login')
        let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
        getDiscordUser(bot, req, function(data){
            res.render('botadd', {discordInfo: data, alerts: alertsJson});
        });
    });
    app.get('/partners', async function (req, res) {
        getDiscordUser(bot, req, async function(data){
            bot.connection.query(`SELECT  * FROM partners`, function(err, result) {
                if(result) {
                    res.render('partners', { discordInfo: data, partners: result });
                } else res.render('partners', { discordInfo: data, partners: null });
            })
        })
    });
    app.get('/404', function (req, res) {getDiscordUser(bot, req, function(data){res.render('404', { discordInfo: data });});});
    app.get('/403', function (req, res) {getDiscordUser(bot, req, function(data){res.render('403', { discordInfo: data });});});
    app.get('/voted', function (req, res) {getDiscordUser(bot, req, function(data){res.render('voted', { discordInfo: data });});});
    app.get('/notloggedin', function (req, res) {getDiscordUser(bot, req, function(data){res.render('notloggedin', { discordInfo: data });});});
    app.get('/twitter', function(req, res) {res.redirect('https://twitter.com/disbotdottop');});
    app.get('/advertise', async function (req, res) {let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));getDiscordUser(bot, req, function(data){res.render('advertise', { discordInfo: data, alerts: alertsJson });});});
    app.get('/rules', function (req, res) {getDiscordUser(bot, req, function(data){res.render('rules', { discordInfo: data });});});
    app.get('/certification', function (req, res) {getDiscordUser(bot, req, function(data){res.render('certification', { discordInfo: data });});});
    app.get('/discord', async function (req, res) {res.redirect('https://discord.gg/bprrCFK8rD')});
    app.get('/d', async function (req, res) {res.redirect('https://discord.gg/bprrCFK8rD')});
    app.get('/blacklisted', function (req, res) {getDiscordUser(bot, req, function(data) {res.render('blacklisted', { discordInfo: data });});});
    app.get('/postban', function (req, res) {getDiscordUser(bot, req, async function(data){res.render('postban', { discordInfo: data });});});
}