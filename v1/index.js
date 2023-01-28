const config = require('./config.json');const express = require('express');const Discord = require('discord.js');const session  = require('express-session');
const bodyParser = require('body-parser');const app = express();const fs = require("fs");const passport = require('passport');var DiscordStrategy = require('passport-discord').Strategy;
const axios = require('axios').default;const mysql = require('mysql');
const bot = new Discord.Client({
    intents: [
        "GUILDS",
        "GUILD_MEMBERS",
        "GUILD_MESSAGES",
    ],
    partials: [
        "CHANNEL",
        "GUILD_MEMBER",
        "MESSAGE",
        "REACTION",
        "USER"
    ],
});
const ms = require("ms");const disFunctions = require('./src/helpers/functions.js');

axios.defaults.baseURL = 'https://discord.com/api/v9'; 
axios.defaults.headers = { Authorization: config.axiosDiscordApiAuthHeader, 'Content-Type': 'application/json' }; 
var md = require('markdown-it')({ html: true, xhtmlOut: true, breaks: true, linkify: true, });

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: false, cookie: {maxAge: 253402300000000}, }));
app.use(passport.initialize());
app.use(passport.session());
var connection = mysql.createConnection({ host: "localhost", user: config.databaseUser, password: config.databasePassword, database: "disbot", charset: "utf8mb4", });

require('./src/api/apiv1.js')(app, connection);
require('./src/api/apiv2.js')(app, connection);
require('./src/api/apiv3.js')(app, connection);
require('./backend.js')(app, connection, bot, axios);

passport.serializeUser(function(user, done) { done(null, user); });
passport.deserializeUser(function(obj, done) { done(null, obj); });
var scopes = ['identify', 'guilds']; var prompt = 'consent';
passport.use(new DiscordStrategy({ clientID: config.oAuth2ClientId, clientSecret: config.oAuth2ClientToken, callbackURL: `${config.baseURL}/auth/discord/callback`, scope: scopes, prompt: prompt }, function(accessToken, refreshToken, profile, done) { process.nextTick(function() { return done(null, profile); }); }));

async function getDiscordUserInfo(req, callback) {
    var discordInfo = {
        loggedIn: false,
        id: null,
        username: null,
        avatar: null,
        discriminator: null,
        notificationCount: 0,
        perm: 0,
        blacklisted: 0,
        postban: 0,
    }
    if(req.isAuthenticated()) {
        connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, (err, results) => {
            if(results[0]) {
                discordInfo = {
                    loggedIn: true,
                    id: req.user.id,
                    username: req.user.username,
                    avatar: req.user.avatar,
                    discriminator: req.user.discriminator,
                    notificationCount: results[0].notifications,
                    perm: results[0].perm,
                    blacklisted: results[0].blacklisted,
                    postban: results[0].postban,
                }
                callback(discordInfo);
            }
        });
    } else {
        callback(discordInfo);
    }
}

/// Main ///
app.get('/', async function (req, res) {
    let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
    getDiscordUserInfo(req, function(data){
        if(data.blacklisted) return res.redirect('/blacklisted')
        connection.query("SELECT * FROM bots WHERE hidden = false ORDER BY RAND() LIMIT 1", (err, aRandomBot) => {
            connection.query("SELECT * FROM bots WHERE hidden = false ORDER BY votes DESC LIMIT 9", (err, topResults) => {
                var topBots = topResults;
                connection.query("SELECT * FROM bots WHERE hidden = false ORDER BY id DESC LIMIT 9", (err, newResults) => {
                    var newBots = newResults;
                    connection.query("SELECT * FROM bots WHERE hidden = false AND certified = true ORDER BY votes DESC LIMIT 9", (err, certResults) => {
                        var certBots = certResults
                        connection.query(`SELECT * FROM adverts`, function(err, results) {
                            const adIndex = Math.floor(Math.random() * results.length)
                            res.render('index', { discordInfo: data, alerts: alertsJson, certBots: certBots, newBots: newBots, topBots: topBots, adOne: results[adIndex], adTwo: results[adIndex], rand: aRandomBot[0] });
                        });
                    });
                });
            });
        });
    });
});

app.get('/oldlist', async function (req, res) {
    let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
    getDiscordUserInfo(req, function(data){
        if(data.blacklisted) return res.redirect('/blacklisted')
        connection.query("SELECT * FROM bots WHERE hidden = false ORDER BY RAND() LIMIT 1", (err, aRandomBot) => {
            connection.query("SELECT * FROM bots WHERE hidden = false ORDER BY votes DESC LIMIT 9", (err, topResults) => {
                var topBots = topResults;
                connection.query("SELECT * FROM bots WHERE hidden = false ORDER BY id DESC LIMIT 9", (err, newResults) => {
                    var newBots = newResults;
                    connection.query("SELECT * FROM bots WHERE hidden = false AND certified = true ORDER BY votes DESC LIMIT 9", (err, certResults) => {
                        var certBots = certResults
                        connection.query(`SELECT * FROM adverts`, function(err, results) {
                            const adIndex = Math.floor(Math.random() * results.length)
                            res.render('oldindex', { discordInfo: data, alerts: alertsJson, certBots: certBots, newBots: newBots, topBots: topBots, adOne: results[adIndex], adTwo: results[adIndex], rand: aRandomBot[0] });
                        });
                    });
                });
            });
        });
    });
});

app.get('/auth/discord', passport.authenticate('discord'));

app.get('/login', function(req, res) {
    req.session.refererFromLogin = req.headers.referer;
    res.redirect('/auth/discord');
});

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect(req.headers.referer);
});

app.get('/auth/discord/callback', passport.authenticate('discord', {
    failureRedirect: '/'
}), async function(req, res) {
    connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, async (err, results) => {
        if(!results[0]) {
            axios(`/users/${req.user.id}`).then((resDis) => {
                var userIcon = `/assets/images/noimage.png`;
                const userName = resDis.data.username+'#'+resDis.data.discriminator;
                if(resDis.data.avatar) {
                    userIcon = `https://cdn.discordapp.com/avatars/${resDis.data.id}/${resDis.data.avatar}?size=512`;
                }
                connection.query(`INSERT INTO users (userId, userIcon, userName, bio, perm, blacklisted, postban, discordSocial, githubSocial, twitterSocial) VALUES ('${req.user.id}', '${userIcon}', '${userName}', 'Welcome to my profile!', 0, 0, 0, 'null', 'null', 'null')`, function (err, result) {
                    if (err) console.log(err);
                });
            }).catch((err) => {
                console.log(err);
            });
        }
    });
    if(req.session.refererFromLogin == `${config.baseURL}/notloggedin`) req.session.refererFromLogin = '/';
    if(req.session.refererFromLogin == `${config.baseURL}/403`) req.session.refererFromLogin = '/';
    if(req.session.refererFromLogin == `${config.baseURL}/404`) req.session.refererFromLogin = '/';
    res.redirect(req.session.refererFromLogin || '/')
    delete req.session.refererFromLogin;
});

app.listen(3000, function () {
    console.log(`[Disbot@3000]: Launched`);
});

app.get('/add', async function (req, res) {
    if(!req.isAuthenticated()) return res.redirect('/login')
    let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
    getDiscordUserInfo(req, function(data){
        if(data.blacklisted) return res.redirect('/blacklisted')
        res.render('botadd', {discordInfo: data, alerts: alertsJson});
    });
});

app.get('/bot', function (req, res) {
    res.redirect('/')
});

app.get('/bot/:botId', async function (req, res) {
    let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
    let botId = req.params.botId;
    let adminType = 0
    let daCreator = false;
    if(!req.isAuthenticated()) return res.redirect('/login')
    getDiscordUserInfo(req, function(data) {
        if(data.blacklisted) return res.redirect('/blacklisted')
        connection.query(`SELECT * FROM bots WHERE botId = '${botId}' OR shorturl = '${botId}'`, function(err, result) {
            if(result[0]) {
                let formattedDesc = md.render(result[0].longDesc);
                connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, results) {
                    if(results[0]) {
                        if(results[0].perm == 1) adminType = 1;
                        else if(results[0].perm == 2) adminType = 2;
                        if(result[0].creatorId == req.user.id) daCreator = true;
                        if(result[0].otherOwners.includes(req.user.id)) daCreator = true;
                        let allOwners = []
                        connection.query(`SELECT * FROM users`, function(err, otherResults) {
                            otherResults.forEach(element => {
                                if(result[0].otherOwners.includes(element.userId)) {
                                    allOwners.push(`<a href="/user/${element.userId}">${element.userName}</a>`)
                                }
                            });
                            connection.query(`SELECT * FROM adverts`, function(err, results) {
                                const randIndex = Math.floor(Math.random() * results.length)
                                res.render('bot', { discordInfo: data, alerts: alertsJson, creator: daCreator, botInfo: result[0], owners: allOwners, adminType: adminType, advert: results[randIndex], longDescFormatted: formattedDesc });
                            })
                        })
                    }
                });
            } else res.render('404', { discordInfo: data });
        });
    });
});

app.get('/bot/:botId/changelogs', async function(req, res) {
    let botId = req.params.botId;
    if(!req.isAuthenticated()) return res.redirect('/notloggedin');
    let daOwners = false;
    getDiscordUserInfo(req, function(data) {
        if(data.blacklisted) return res.redirect('/blacklisted')
        connection.query(`SELECT * FROM bots WHERE botId = '${botId}'`, function(err, botResult) {
            if(botResult[0]) {
                let botData = botResult[0];
                if(botResult[0].creatorId == req.user.id) daOwners = true;
                if(botResult[0].otherOwners.includes(req.user.id)) daOwners = true;
                connection.query(`SELECT * FROM botchangelogs WHERE botId = '${botId}'`, function(err, botChange) {
                    res.render('botchangelogs', { discordInfo: data, botInfo: botData, botChanges: botChange, formatD: md, creators: daOwners })
                });
            }
        });
    });
});

app.get('/bot/:botId/changelogs/:cId/remove', async function(req, res) {
    let botId = req.params.botId;
    let changelogId = req.params.cId;
    if(!req.isAuthenticated()) return res.redirect('/notloggedin');
    getDiscordUserInfo(req, function(data) {
        if(data.blacklisted) return res.redirect('/blacklisted')
        connection.query(`SELECT * FROM bots WHERE botId = '${botId}'`, function(err, botResult) {
            if(botResult[0]) {
                if(req.user.id == botResult[0].creatorId || botResult[0].otherOwners.includes(req.user.id)) {
                    connection.query(`DELETE FROM botchangelogs WHERE id = '${changelogId}'`, function(err, result) {
                        if(err) console.log(err)
                        disFunctions.audit(connection, 16, `${req.user.username} has delete a changelog from ${botResult[0].botName} (${botId}).`, req.user.username)
                        const embedGuild = new Discord.MessageEmbed()
                            .setColor(config["colors"].blurple)
                            .setTimestamp()
                            .setThumbnail(botResult[0].botIcon)
                            .setTitle(`${botResult[0].botName}'s Changelogs`)
                            .setURL(`${config.baseURL}/bot/${botId}/changelogs`)
                            .setDescription(`${req.user.username} has deleted a changelog from ${botResult[0].botName} (${botId}) `)
                        let dChan = bot.channels.cache.get(config.site_actions)
                        if(dChan) dChan.send({ embeds: [embedGuild] })
                        res.redirect(`/bot/${botId}/changelogs`)
                    });
                }
            }
        });
    });
});

app.get('/bot/:botId/vote', async function (req, res) {
    let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
    
    let botId = req.params.botId;
    if(!req.isAuthenticated()) return res.redirect('/login')
    getDiscordUserInfo(req, function(data){
        if(data.blacklisted) return res.redirect('/blacklisted')
        connection.query(`SELECT * FROM bots WHERE botId = '${botId}'`, function(err, result) {
            if(!result[0]) return res.render('404', { discordInfo: data });
            connection.query(`SELECT * FROM votes WHERE userId = '${req.user.id}' AND botId = '${botId}'`, function(err, voteResults) {
                if(voteResults[0]) {
                    res.redirect('/voted');
                } else {
                    connection.query(`SELECT * FROM adverts`, function(err, results) {
                        const randIndex = Math.floor(Math.random() * results.length)
                        res.render('vote', { discordInfo: data, alerts: alertsJson, botInfo: result[0], advert: results[randIndex] });
                    });
                }
            });
        });
    });
});

app.get('/bot/:botId/report', async function (req, res) {
    let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
    let botId = req.params.botId;
    if(!req.isAuthenticated()) return res.redirect('/login')
    getDiscordUserInfo(req, function(data){
        if(data.blacklisted) return res.redirect('/blacklisted')
        connection.query(`SELECT * FROM bots WHERE botId = '${botId}'`, function(err, result) {
            if(!result[0]) return res.render('404', { discordInfo: data });
            res.render('report', { discordInfo: data, alerts: alertsJson, botInfo: result[0] });
        });
    });
});

app.get('/bot/:botId/edit', async function (req, res) {
    let botId = req.params.botId;
    let daCreator = false;
    let daStaff = false;
    if(!req.isAuthenticated()) return res.redirect('/login')
    getDiscordUserInfo(req, function(data){
        if(data.blacklisted) return res.redirect('/blacklisted')
        connection.query(`SELECT * FROM bots WHERE botId = '${botId}'`, function(err, result) {
            connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, results) {
                if(results[0].perm > 0) daStaff = true;
                if(result[0].creatorId == req.user.id) daCreator = true;
                if(result[0].otherOwners.includes(req.user.id)) daCreator = true;
                if(daCreator || daStaff) {
                    res.render('edit', { discordInfo: data, botInfo: result[0], adminType: daStaff });
                } else res.redirect('/403')
            });
        });
    });
});

app.get('/b/:botCode', async function (req, res) {
    let botCode = req.params.botCode;
    getDiscordUserInfo(req, function(data){
        if(data.blacklisted) return res.redirect('/blacklisted')
        connection.query(`SELECT * FROM bots WHERE shorturl = '${botCode}'`, function(err, result) {
            if(!result[0]) return res.render('404', { discordInfo: data });
            res.redirect(`/bot/${result[0].botId}`);
        });
    });
});

// User Shit //
app.get('/user', function (req, res) {
    res.redirect('/')
});

app.get('/user/:userId', async function (req, res) {
    let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
    let userId = req.params.userId;
    getDiscordUserInfo(req, function(data){
        if(data.blacklisted) return res.redirect('/blacklisted')
        connection.query(`SELECT * FROM users WHERE userId = '${userId}' OR userName = '${userId}'`, function(err, result) {
            if(result[0]) {
                connection.query(`SELECT * FROM bots WHERE creatorId = '${result[0].userId}' AND hidden = false`, function(err, botResult) {
                    var profileBots = {};
                    if(botResult) { profileBots = botResult; }
                    connection.query(`SELECT * FROM adverts`, function(err, results) {
                        const randIndex = Math.floor(Math.random() * results.length)
                        res.render('user', { discordInfo: data, alerts: alertsJson, profile: result[0], profileBots: profileBots, botDev: botResult[0], ad: results[randIndex], permCon: disFunctions.convertStrings });
                    });
                });
            } else res.render('404', { discordInfo: data });
        });
    });    
});

app.get('/tickets', async function (req, res) {
    if(!req.isAuthenticated()) return res.redirect('/login')
    let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));

    getDiscordUserInfo(req, function(data){
        connection.query(`SELECT * FROM contacts WHERE userId = '${req.user.id}'`, (err, results) => {
            if(results[0]) {
                res.render('tickets', { discordInfo: data, alerts: alertsJson, userTickets: results });
            } else {
                res.render('tickets', { discordInfo: data, alerts: alertsJson, userTickets: false });
            }
        }); 
    });
});

app.get('/ticket/create', async function (req, res) {
    if(!req.isAuthenticated()) return res.redirect('/login')
    let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
    daStaff = false;

    getDiscordUserInfo(req, function(data){
        connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, (err, result) => {
            if(result[0].perm == 1 || result[0].perm == 2) daStaff = true;
            res.render('ticketcreate', {discordInfo: data, alerts: alertsJson, isAdmin: daStaff});
        }); 
    });
});

app.get('/ticket/view/:ticketId', async function (req, res) {
    if(!req.isAuthenticated()) return res.redirect('/login')
    let ticketId = req.params.ticketId;
    var daStaff = false;
    var daCreator = false;

    getDiscordUserInfo(req, function(data) {
        connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, result) {
            if(result[0].perm == 1 || result[0].perm == 2) daStaff = true;
            connection.query(`SELECT * FROM contacts WHERE id = '${ticketId}'`, function(err, results) {
                if(results[0]) {
                    if(results[0].userId == req.user.id) daCreator = true;
                    if(daCreator || daStaff) {
                        connection.query(`UPDATE users SET notifications = 0 WHERE userId = '${req.user.id}'`, function(err, result) {
                            if(err) console.log(err)
                        });
                        connection.query(`SELECT * FROM contactComments WHERE contactId = '${ticketId}'`, function(err, commentResults) {
                            if(commentResults[0]) {
                                res.render('ticketview', { discordInfo: data, intialTicket: results[0], comments: commentResults, convertS: disFunctions.convertStrings });
                            } else {
                                res.render('ticketview', { discordInfo: data, intialTicket: results[0], comments: null, convertS: disFunctions.convertStrings })
                            }
                        });
                    } else res.redirect('/403')
                } else res.render('404', { discordInfo: data });
            });
        });
    });
});

app.get('/search', async function (req, res) {
    let searchQuery = req.query.q;
    getDiscordUserInfo(req, function(data){
        if(data.blacklisted) return res.redirect('/blacklisted')
        connection.query("SELECT * FROM bots WHERE hidden = false ORDER BY votes DESC LIMIT 12", (err, topResults) => {
            var topBots = topResults;
            if(!searchQuery) return res.render('search', {discordInfo: data, results: false, qResults: {}, topBots: topBots, query: null});
            if(searchQuery.startsWith('tag:')) {
                let tag = searchQuery.split(":")[1]
                connection.query(`SELECT * FROM bots WHERE tag${tag} = true AND hidden = false`, (err, results) => {
                    if(!results) return res.render('search', {discordInfo: data, results: false, qResults: {}, topBots: topBots, query: null});
                    res.render('search', {discordInfo: data, results: true, qResults: results, topBots: topBots, query: searchQuery});
                });
            } else {
                connection.query(`SELECT * FROM bots WHERE botName LIKE '%${searchQuery.replace(/'/gi, "''")}%' OR shortDesc LIKE '%${searchQuery.replace(/'/gi, "''")}%' OR longDesc LIKE '%${searchQuery.replace(/'/gi, "''")}%' AND hidden = false`, (err, results) => {
                    if(!results) return res.render('search', {discordInfo: data, results: false, qResults: {}, topBots: topBots});
                    res.render('search', {discordInfo: data, results: true, qResults: results, topBots: topBots, query: searchQuery});
                });
            }
        });
    });
});

// Lists //
app.get('/list', function (req, res) {
    res.redirect('/')
});

app.get('/list/top', async function (req, res) {
    getDiscordUserInfo(req, function(data){
        if(data.blacklisted) return res.redirect('/blacklisted')
        connection.query("SELECT * FROM bots WHERE hidden = false ORDER BY votes DESC", (err, results) => {
            res.render('listtop', { discordInfo: data, results: results });
        });
    });
});

app.get('/list/new', async function (req, res) {
    getDiscordUserInfo(req, function(data){
        if(data.blacklisted) return res.redirect('/blacklisted')
        connection.query("SELECT * FROM bots WHERE hidden = false ORDER BY id DESC", (err, results) => {
            res.render('listnew', { discordInfo: data, results: results });
        });
    });
});

app.get('/list/certified', async function (req, res) {
    getDiscordUserInfo(req, function(data){
        if(data.blacklisted) return res.redirect('/blacklisted')
        connection.query("SELECT * FROM bots WHERE certified = true AND hidden = false ORDER BY votes DESC", (err, results) => {
            res.render('listcert', { discordInfo: data, results: results });
        });
    });
});

// Misc //
app.get('/partners', async function (req, res) {
    await getDiscordUserInfo(req, async function(data){
        if(data.blacklisted) return res.redirect('/blacklisted')
        connection.query(`SELECT  * FROM partners`, function(err, result) {
            if(result) {
                res.render('partners', { discordInfo: data, partners: result });
            } else res.render('partners', { discordInfo: data, partners: null });
        })
        
    });
});

app.get('/404', async function (req, res) {
    getDiscordUserInfo(req, async function(data){
        if(data.blacklisted) return res.redirect('/blacklisted')
        res.render('404', { discordInfo: data });
    });
});

app.get('/403', async function (req, res) {
    await getDiscordUserInfo(req, async function(data){
        if(data.blacklisted) return res.redirect('/blacklisted')
        res.render('403', { discordInfo: data });
    });
});

app.get('/voted', async function (req, res) {
    await getDiscordUserInfo(req, async function(data){
        if(data.blacklisted) return res.redirect('/blacklisted')
        res.render('voted', { discordInfo: data });
    });
});

app.get('/notloggedin', async function (req, res) {
    await getDiscordUserInfo(req, async function(data){
        if(data.blacklisted) return res.redirect('/blacklisted')
        res.render('notloggedin', { discordInfo: data });
    });
});

app.get('/blacklisted', async function (req, res) {
    await getDiscordUserInfo(req, async function(data){
        res.render('blacklisted', { discordInfo: data });
    });
});

app.get('/postban', async function (req, res) {
    await getDiscordUserInfo(req, async function(data){
        res.render('postban', { discordInfo: data });
    });
});

app.get('/discord', async function (req, res) {
    res.redirect('https://discord.gg/bprrCFK8rD')
});

app.get('/d', async function (req, res) {
    res.redirect('https://discord.gg/bprrCFK8rD')
});

app.get('/twitter', function(req, res) {
    res.redirect('https://twitter.com/disbotdottop')
})

app.get('/advertise', async function (req, res) {
    let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
    await getDiscordUserInfo(req, async function(data){
        if(data.blacklisted) return res.redirect('/blacklisted')
        res.render('advertise', { discordInfo: data, alerts: alertsJson });
    });
});

app.get('/rules', async function (req, res) {
    await getDiscordUserInfo(req, async function(data){
        if(data.blacklisted) return res.redirect('/blacklisted')
        res.render('rules', { discordInfo: data });
    });
});

app.get('/certification', async function (req, res) {
    await getDiscordUserInfo(req, async function(data){
        if(data.blacklisted) return res.redirect('/blacklisted')
        res.render('certification', { discordInfo: data });
    });
});

// API //
app.get('/api', async function (req, res) {
    let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
    await getDiscordUserInfo(req, async function(data){
        if(data.blacklisted) return res.redirect('/blacklisted')
        res.render('apihome', { discordInfo: data, alerts: alertsJson });
    });
});

app.get('/api/docs', async function (req, res) {
    let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
    if(!req.isAuthenticated()) return res.redirect('/login')
    await getDiscordUserInfo(req, async function(data){
        if(data.blacklisted) return res.redirect('/blacklisted')
        connection.query(`SELECT * FROM apidocs`, function(err, results) {
            res.render('apidocs', { discordInfo: data, alerts: alertsJson, apiInfo: results, markd: md });
        });
    });
});

app.get('/api/bottokens', async function (req, res) {
    let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
    if(!req.isAuthenticated()) return res.redirect('/login')
    await getDiscordUserInfo(req, async function(data){  
        if(data.blacklisted) return res.redirect('/blacklisted') 
        connection.query(`SELECT * FROM bots WHERE creatorId = '${req.user.id}'`, (err, botResults) => {
            res.render('apibottokens', {discordInfo: data, userBots: botResults, alerts: alertsJson});
        });
    });
});

// Staff //
app.get('/staff', async function (req, res) {
    if(!req.isAuthenticated()) return res.redirect('/login')
    let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
    getDiscordUserInfo(req, function(data){
        if(data.blacklisted) return res.redirect('/blacklisted')
        connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, result) {
            if(result[0]) {
                if(result[0].perm <= 0) return res.redirect('/403')
                connection.query(`SELECT * FROM bots WHERE pending = true`, (err, resultsPending) => {
                    var pendingCount = resultsPending.length;
                    connection.query(`SELECT * FROM reports WHERE active = true`, (err, resultsReports) => {
                        var reportCount = resultsReports.length;
                        connection.query(`SELECT * FROM votes ORDER BY id DESC LIMIT 9`, (err, voteResults) => {
                            var voteResults = voteResults;
                            connection.query(`SELECT * FROM bots WHERE hidden = false ORDER BY id DESC LIMIT 9`, (err, newbotsResults) => {
                                var newbotsResults = newbotsResults;
                                res.render('staff', {discordInfo: data, pendingCount: pendingCount, reportCount: reportCount, voteResults: voteResults, newbotsResults: newbotsResults, alerts: alertsJson});
                            });
                        });
                    });
                });
            } else res.redirect('/403')
        })
    });
});

app.get('/staff/permissions', async function (req, res) {
    if(!req.isAuthenticated()) return res.redirect('/login')
    let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
    getDiscordUserInfo(req, function(data){
        if(data.blacklisted) return res.redirect('/blacklisted')
        connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, result) {
            if(result[0]) {
                if(result[0].perm <= 1) return res.redirect('/403')
                connection.query(`SELECT * FROM users`, function(err, userResult) {
                    res.render('staffmanager', { discordInfo: data, permUsers: userResult, alerts: alertsJson, conVert: disFunctions.convertStrings })
                })
            } else res.redirect('/403')
        })
    });
});

app.get('/staff/api/settings', async function(req, res) {
    let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
    if(!req.isAuthenticated()) return res.redirect('/notloggedin')
    getDiscordUserInfo(req, function(data) {
        if(data.blacklisted) return res.redirect('/blacklisted')
        connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, results) {
            if(results[0]) {
                if(results[0].perm <= 1) return res.redirect('/403')
                connection.query(`SELECT * FROM apidocs`, function(err, apiResults) {
                    res.render('staffapi', { discordInfo: data, apiData: apiResults, alerts: alertsJson })
                })
            }
        })
    })
})

app.get('/staff/partner/settings', async function(req, res) {
    if(!req.isAuthenticated()) return res.redirect('/notloggedin')
    let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
    getDiscordUserInfo(req, function(data) {
        connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, results) {
            if(results[0]) {
                if(results[0].perm <= 1) return res.redirect('/403')
                connection.query(`SELECT * FROM partners`, function(err, resultPartners) {
                    res.render('staffpartner', { discordInfo: data, partners: resultPartners, alerts: alertsJson })
                })
            }
        })
    })
})

app.get('/staff/users', async function (req, res) {
    if(!req.isAuthenticated()) return res.redirect('/login')
    let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
    getDiscordUserInfo(req, function(data){
        if(data.blacklisted) return res.redirect('/blacklisted')
        connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, result) {
            if(result[0]) {
                if(result[0].perm <= 1) return res.redirect('/403')
                connection.query(`SELECT * FROM users`, function(err, userResult) {
                    res.render('staffusers', { discordInfo: data, users: userResult, alerts: alertsJson, conVert: disFunctions.convertStrings })
                })
            } else res.redirect('/403')
        })
    });
});

app.get('/staff/bots', async function (req, res) {
    if(!req.isAuthenticated()) return res.redirect('/login')
    let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
    getDiscordUserInfo(req, function(data){
        if(data.blacklisted) return res.redirect('/blacklisted')
        connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, result) {
            if(result[0]) {
                if(result[0].perm <= 1) return res.redirect('/403')
                connection.query(`SELECT * FROM bots`, function(err, botResult) {
                    res.render('staffbots', { discordInfo: data, bots: botResult, alerts: alertsJson, convertS: disFunctions.convertStrings })
                })
            } else res.redirect('/403')
        })
    });
});

app.get('/staff/auditlogs', async function (req, res) {
    if(!req.isAuthenticated()) return res.redirect('/login')
    let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
    getDiscordUserInfo(req, function(data){
        if(data.blacklisted) return res.redirect('/blacklisted')
        connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, result) {
            if(result[0]) {
                if(result[0].perm <= 0) return res.redirect('/403')
                connection.query(`SELECT * FROM auditlogs ORDER BY id DESC`, function(err, audResults) {
                    if(err) console.log(err)
                    res.render('auditlogs', { discordInfo: data, audits: audResults, alerts: alertsJson, conVert: disFunctions.convertStrings })
                })
            } else res.redirect('/403')
        });
    });
});

app.get('/staff/bots/pending', async function (req, res) {
    if(!req.isAuthenticated()) return res.redirect('/login')
    let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
    getDiscordUserInfo(req, function(data){
        if(data.blacklisted) return res.redirect('/blacklisted')
        connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, result) {
            if(result[0]) {
                if(result[0].perm <= 0) return res.redirect('/403')
                connection.query(`SELECT * FROM bots WHERE pending = true`, function(err, results) {
                    if(err) console.log(err)
                    res.render('pending', { discordInfo: data, pendingBots: results, alerts: alertsJson })
                });
            } else res.redirect('/403')
        });
    });
});

app.get('/staff/reports/pending', async function (req, res) {
    if(!req.isAuthenticated()) return res.redirect('/login')
    let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
    getDiscordUserInfo(req, function(data){
        if(data.blacklisted) return res.redirect('/blacklisted')
        connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, result) {
            if(result[0]) {
                if(result[0].perm <= 0) return res.redirect('/403')
                connection.query(`SELECT * FROM reports WHERE active = true`, function(err, aReports) {
                    let actReports = aReports;
                    connection.query(`SELECT * FROM reports WHERE active = false`, function(err, cReports) {
                        let cloReports = cReports;
                        connection.query(`SELECT * FROM reports`, function(err, allReports) {
                            let num_of_reports = 0;
                            allReports.forEach(e => { num_of_reports++; })
                            res.render('reports', { discordInfo: data, pendingReports: actReports, closedReports: cloReports, totalReports: num_of_reports, alerts: alertsJson });
                        });
                    });
                });
            } else res.redirect('/403');
        });
    });
});

app.get('/staff/tickets', async function (req, res) {
    if(!req.isAuthenticated()) return res.redirect('/login')
    let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
    getDiscordUserInfo(req, function(data){
        if(data.blacklisted) return res.redirect('/blacklisted')
        connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, result) {
            if(result[0]) {
                if(result[0].perm <= 0) return res.redirect('/403')
                connection.query(`SELECT * FROM contacts`, function(err, results) {
                    res.render('ticketsstaff', { discordInfo: data, alerts: alertsJson, tickets: results })
                });
            } else res.redirect('/403')
        });
    });
});

app.get('/staff/alert/settings', async function (req, res) {
    if(!req.isAuthenticated()) return res.redirect('/login')
    let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
    getDiscordUserInfo(req, function(data){
        if(data.blacklisted) return res.redirect('/blacklisted')
        connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, result) {
            if(result[0]) {
                if(result[0].perm !== 2) return res.redirect('/403')
                res.render('alerts', { discordInfo: data, alerts: alertsJson })
            } else res.redirect('/403')
        });
    });
});

app.get('/staff/advert/settings', async function (req, res) {
    if(!req.isAuthenticated()) return res.redirect('/login')
    let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
    getDiscordUserInfo(req, function(data){
        if(data.blacklisted) return res.redirect('/blacklisted')
        connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, result) {
            if(result[0]) {
                if(result[0].perm <= 0) return res.redirect('/403')
                connection.query(`SELECT * FROM adverts`, function(err, results) {
                    res.render('staffadvertise', { discordInfo: data, ads: results, alerts: alertsJson })
                });
            } else res.redirect('/403')
        })
    });
});

app.get('/staff/bot/deny', async (req, res) => {
    if(!req.isAuthenticated()) return res.redirect('/login')
    let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
    getDiscordUserInfo(req, function(data){
        if(data.blacklisted) return res.redirect('/blacklisted')
        connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, result) {
            if(result[0]) {
                if(result[0].perm <= 0) return res.redirect('/403')
                connection.query(`SELECT * FROM bots`, function(err, results) {
                    res.render('deny', { discordInfo: data, botInfo: results, alerts: alertsJson });
                });
            } else res.redirect('/403')
        });
    });
});

//// Keep this at the bottom ////
bot.login(config.discordBotToken)
bot.on('ready', function() {
    bot.user.setPresence({ activities: [{ name: 'https://disbot.top/add' }], status: 'idle' });
    let disbotGuild = bot.guilds.cache.get(config.guildId); 
    let topRole = disbotGuild.roles.cache.get(config.toprole);
    let userRole = disbotGuild.roles.cache.get(config.disbot_user_role)
    // setInterval(() => {
    //     disbotGuild.members.cache.forEach(member => {
    //         if(!member.user.bot) {
    //             connection.query(`SELECT * FROM users WHERE userId = '${member.user.id}'`, function(err, results) {
    //                 if(results[0]) {
    //                     if(disbotGuild.member(member.user.id)) {
    //                         if(!member.roles.cache.has(userRole.id)) {
    //                             member.roles.add(userRole)
    //                         }
    //                     }
    //                 }
    //             })
    //         }
    //     });
    // }, 10000)

    // topRole.members.forEach((member, i) => {
    //     setTimeout(() => {
    //         member.roles.remove(topRole);
    //     }, 1000);
    // });
    // setTimeout(() => {
    //     connection.query(`SELECT * FROM bots WHERE hidden = false ORDER BY votes DESC LIMIT 5`, (err, results) => {
    //         if(err) console.log(err);
    //         if(results) {
    //             results.forEach(element => {
    //                 if(disbotGuild.members.cache.get(element.creatorId)) {
    //                     disbotGuild.members.cache.get(element.creatorId).roles.add(topRole).catch(console.error);
    //                 }
    //             });
    //         }
    //     });
    // }, 5000);
    // setInterval(() => {
    //     topRole.members.forEach((member, i) => {
    //         setTimeout(() => {
    //             member.roles.remove(topRole);
    //         }, 1000);
    //     });
    //     setTimeout(() => {
    //         connection.query(`SELECT * FROM bots WHERE hidden = false ORDER BY votes DESC LIMIT 5`, (err, results) => {
    //             if(err) console.log(err);
    //             if(results) {
    //                 results.forEach(element => {
    //                     if(disbotGuild.member(element.creatorId)) {
    //                         disbotGuild.member(element.creatorId).roles.add(topRole).catch(console.error);
    //                     }
    //                 });
    //             }
    //         });
    //     }, 5000);
    // }, ms('30m'));
});
app.use(function (req, res, next) {
    if(res.status(404)) {
        getDiscordUserInfo(req, async function(data){
            res.render('404', {discordInfo: data});
        });
    }
});