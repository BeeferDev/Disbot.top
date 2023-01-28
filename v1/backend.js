const fs = require('fs');
const Discord = require('discord.js');
const config = require('./config.json');
const disFunctions = require('./src/helpers/functions.js');
var twitter = require('twit');

var twitterClient = new twitter({
    consumer_key:         config.twitterConsumerKey,
    consumer_secret:      config.twitterConsumerSecret,
    access_token:         config.twitterAccessTokenKey,
    access_token_secret:  config.twitterAccessTokenSecret,
    timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
    strictSSL:            true,     // optional - requires SSL certificates to be valid.
});

module.exports = function(app, connection, bot, axios) {
    console.log(`[Backend]: Launched`);
    app.post('/backend/permissions/add', (req, res) => {
        const userId = req.body.userid;
        const userpermission = req.body.userperm;
        if(req.isAuthenticated()) {
            connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, (err, result) => {
                if(result[0]) {
                    if(result[0].perm !== 2) return res.redirect('/')
                    connection.query(`UPDATE users SET perm = ${userpermission} WHERE userId = '${userId}'`, function(err, results) {
                        if(err) console.log(err)
                        res.redirect('/staff/permissions')
                    });
                    connection.query(`SELECT * FROM users WHERE userId = '${userId}'`, function(err, userResults) {
                        disFunctions.audit(connection, 1, `${result[0].userName} has added ${userResults[0].userName} (${userResults[0].userId}) to ${disFunctions.convertStrings("staff", userpermission)} position.`, result[0].userName)
                        const embedGuild = new Discord.MessageEmbed()
                            .setColor(config["colors"].blurple)
                            .setTimestamp()
                            .setThumbnail(userResults[0].userIcon)
                            .setTitle(`${userResults[0].userName}'s Profile`)
                            .setURL(`${config.baseURL}/user/${userResults[0].userId}`)
                            .setDescription(`${req.user.username} has added ${userResults[0].userName} (${userResults[0].userId}) to **${disFunctions.convertStrings("staff", userpermission)}** position.`)
                        
                            let dChan = bot.channels.cache.get(config.site_actions)
                        if(dChan) {
                            dChan.send({ embeds: [embedGuild] })
                        }
                    });
                } else {
                    res.redirect('/403')
                }
            });
        } else {
            res.redirect('/notloggedin')
        }
    });
    
    app.post('/backend/advertise/add', function(req, res) {
        const adTitle = req.body.adTitle;
        const adDesc = req.body.adDesc.replace(/'/gi, "''");
        const adLink = req.body.adLink;
        const adImage = req.body.adImage;
        const adOwner = req.body.adOwner;
        const expireD = req.body.expiredate || 30;

        let date = new Date()
        let d = date.setDate(date.getDate() + Number(expireD));

        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, results) {
            if(results[0]) {
                if(results[0].perm !== 2) return res.redirect('/403');
                connection.query(`INSERT INTO adverts (title, contact, extLink, imgLink, expireDate, owner) VALUES ('${adTitle}', '${adDesc}', '${adLink}', '${adImage}', '${d}', '${adOwner}')`, function(err, result) {
                    if(err) console.log(err)
                    res.redirect('/staff/advert/settings')
                    disFunctions.audit(connection, 27, `${req.user.username} has added a advertisement to the website.`, req.user.username)
                });
            }
        });
    });

    app.post('/backend/alert/:alert/update', async function(req, res) {
        if(!req.isAuthenticated()) return res.redirect('/notloggedin');
        let daAlert = req.params.alert;
        const title = req.body.title;
        const details = req.body.description.replace(/'/gi, "''");
        let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
        connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, result) {
            if(result[0]) {
                if(result[0].perm !== 2) return res.redirect('/403')
                if(daAlert == "homepage") {
                    alertsJson["home"] = {
                        title: title,
                        content: details,
                    };
                    fs.writeFile("./src/json/alerts.json", JSON.stringify(alertsJson, null, 4), (err) => {
                        if (err) console.log(err);
                        res.redirect('/staff/alert/settings')
                        disFunctions.audit(connection, 5, `${result[0].userName} has updated home-page alert.`, result[0].userName)
                    });

                    const embedGuild = new Discord.MessageEmbed()
                        .setColor(config["colors"].blurple)
                        .setFooter({ text: `Alert Update: Home-Page` })
                        .setTimestamp()
                        .setDescription(`${req.user.username} has updated alert for home-page.\n\n**Title:** ${title}\n**Details:** ${details}`)
                    let dChan = bot.channels.cache.get(config.site_actions)
                    if(dChan) {
                        dChan.send({ embeds: [embedGuild] })
                    }
                }
                if(daAlert == "botpage") {
                    alertsJson["bot"] = {
                        title: title,
                        content: details,
                    };
                    fs.writeFile("./src/json/alerts.json", JSON.stringify(alertsJson, null, 4), (err) => {
                        if (err) console.log(err);
                        res.redirect('/staff/alert/settings')
                        disFunctions.audit(connection, 5, `${result[0].userName} has updated bot-page alert.`, result[0].userName)
                    });

                    const embedGuild = new Discord.MessageEmbed()
                        .setColor(config["colors"].blurple)
                        .setTimestamp()
                        .setFooter({ text: `Alert Update: Bot-Page` })
                        .setDescription(`${req.user.username} has updated alert for bot-page.\n\n**Title:** ${title}\n**Details:** ${details}`)
                    let dChan = bot.channels.cache.get(config.site_actions)
                    if(dChan) {
                        dChan.send({ embeds: [embedGuild] })
                    }
                }
                if(daAlert == "votepage") {
                    alertsJson["vote"] = {
                        title: title,
                        content: details,
                    };
                    fs.writeFile("./src/json/alerts.json", JSON.stringify(alertsJson, null, 4), (err) => {
                        if (err) console.log(err);
                        res.redirect('/staff/alert/settings')
                        disFunctions.audit(connection, 5, `${result[0].userName} has updated vote-page alert.`, result[0].userName)
                    });

                    const embedGuild = new Discord.MessageEmbed()
                        .setColor(config["colors"].blurple)
                        .setFooter({ text: `Alert Update: Vote-Page` })
                        .setTimestamp()
                        .setDescription(`${req.user.username} has updated alert for vote-page.\n\n**Title:** ${title}\n**Details:** ${details}`)
                    let dChan = bot.channels.cache.get(config.site_actions)
                    if(dChan) {
                        dChan.send({ embeds: [embedGuild] })
                    }
                }
                if(daAlert == "addbot") {
                    alertsJson["addbot"] = {
                        title: title,
                        content: details,
                    };
                    fs.writeFile("./src/json/alerts.json", JSON.stringify(alertsJson, null, 4), (err) => {
                        if (err) console.log(err);
                        res.redirect('/staff/alert/settings')
                        disFunctions.audit(connection, 5, `${result[0].userName} has updated add-bot-page alert.`, result[0].userName)
                    });

                    const embedGuild = new Discord.MessageEmbed()
                        .setColor(config["colors"].blurple)
                        .setFooter({ text: `Alert Update: Add-Bot-Page` })
                        .setTimestamp()
                        .setDescription(`${req.user.username} has updated alert for add-bot-page.\n\n**Title:** ${title}\n**Details:** ${details}`)
                    let dChan = bot.channels.cache.get(config.site_actions)
                    if(dChan) {
                        dChan.send({ embeds: [embedGuild] })
                    }
                }
                if(daAlert == "reportpage") {
                    alertsJson["report"] = {
                        title: title,
                        content: details,
                    };
                    fs.writeFile("./src/json/alerts.json", JSON.stringify(alertsJson, null, 4), (err) => {
                        if (err) console.log(err);
                        res.redirect('/staff/alert/settings')
                        disFunctions.audit(connection, 5, `${result[0].userName} has updated report-page alert.`, result[0].userName)
                    });

                    const embedGuild = new Discord.MessageEmbed()
                        .setColor(config["colors"].blurple)
                        .setTimestamp()
                        .setFooter({ text: `Alert Update: Report-Page` })
                        .setDescription(`${req.user.username} has updated alert for report-page.\n\n**Title:** ${title}\n**Details:** ${details}`)
                    let dChan = bot.channels.cache.get(config.site_actions)
                    if(dChan){
                        dChan.send({ embeds: [embedGuild] })
                    }
                }
                if(daAlert == "advertpage") {
                    alertsJson["advertising"] = {
                        title: title,
                        content: details,
                    };
                    fs.writeFile("./src/json/alerts.json", JSON.stringify(alertsJson, null, 4), (err) => {
                        if (err) console.log(err);
                        res.redirect('/staff/alert/settings')
                        disFunctions.audit(connection, 5, `${result[0].userName} has updated advert-page alert.`, result[0].userName)
                    });

                    const embedGuild = new Discord.MessageEmbed()
                        .setColor(config["colors"].blurple)
                        .setTimestamp()
                        .setFooter({ text: `Alert Update: Advert-Page` })
                        .setDescription(`${req.user.username} has updated alert for advert-page.\n\n**Title:** ${title}\n**Details:** ${details}`)
                    let dChan = bot.channels.cache.get(config.site_actions)
                    if(dChan) {
                        dChan.send({ embeds: [embedGuild] })
                    }
                }
                if(daAlert == "userpage") {
                    alertsJson["user"] = {
                        title: title,
                        content: details,
                    };
                    fs.writeFile("./src/json/alerts.json", JSON.stringify(alertsJson, null, 4), (err) => {
                        if (err) console.log(err);
                        res.redirect('/staff/alert/settings')
                        disFunctions.audit(connection, 5, `${result[0].userName} has updated users-page alert.`, result[0].userName)
                    });

                    const embedGuild = new Discord.MessageEmbed()
                        .setColor(config["colors"].blurple)
                        .setTimestamp()
                        .setFooter({ text: `Alert Update: Users-Page` })
                        .setDescription(`${req.user.username} has updated alert for users-page.\n\n**Title:** ${title}\n**Details:** ${details}`)
                    let dChan = bot.channels.cache.get(config.site_actions)
                    if(dChan) {
                        dChan.send({ embeds: [embedGuild] })
                    }
                }
                if(daAlert == "apipage") {
                    alertsJson["api"] = {
                        title: title,
                        content: details,
                    };
                    fs.writeFile("./src/json/alerts.json", JSON.stringify(alertsJson, null, 4), (err) => {
                        if (err) console.log(err);
                        res.redirect('/staff/alert/settings')
                        disFunctions.audit(connection, 5, `${result[0].userName} has updated api-page alert.`, result[0].userName)
                    });

                    const embedGuild = new Discord.MessageEmbed()
                        .setColor(config["colors"].blurple)
                        .setTimestamp()
                        .setFooter({ text: `Alert Update: API-Page` })
                        .setDescription(`${req.user.username} has updated alert for api-page.\n\n**Title:** ${title}\n**Details:** ${details}`)
                    let dChan = bot.channels.cache.get(config.site_actions)
                    if(dChan) {
                        dChan.send({ embeds: [embedGuild] })
                    }
                }
                if(daAlert == "staffpage") {
                    alertsJson["staff"] = {
                        title: title,
                        content: details,
                    };
                    fs.writeFile("./src/json/alerts.json", JSON.stringify(alertsJson, null, 4), (err) => {
                        if (err) console.log(err);
                        res.redirect('/staff/alert/settings')
                        disFunctions.audit(connection, 5, `${result[0].userName} has updated staff-page alert.`, result[0].userName)
                    });
                    const embedGuild = new Discord.MessageEmbed()
                        .setColor(config["colors"].blurple)
                        .setFooter({ text: `Alert Update: Staff-Page` })
                        .setTimestamp()
                        .setDescription(`${req.user.username} has updated alert for staff-page.\n\n**Title:** ${title}\n**Details:** ${details}`)
                    let dChan = bot.channels.cache.get(config.site_actions)
                    if(dChan) {
                        dChan.send({ embeds: [embedGuild] })
                    }
                }
            } else res.redirect('/')
        });
    });

    app.post('/backend/bot/:botId/changelog/add', function(req, res) {
        let botId = req.params.botId;
        let changeV = req.body.changeVersion;
        let changeT = req.body.changeTitle.replace(/'/gi, "''") || "none";
        let changeD = req.body.changeDetails.replace(/'/gi, "''") || "none";
        let changeDate = new Date().toLocaleString()

        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        connection.query(`SELECT * FROM bots WHERE botId = '${botId}'`, function(err, botResult) {
            if(botResult[0]) {
                if(req.user.id == botResult[0].creatorId || botResult[0].otherOwners.includes(req.user.id)) {
                    connection.query(`INSERT INTO botchangelogs (botId, userName, change_date, change_title, change_version, change_details) VALUES ('${botId}', '${req.user.username}', '${changeDate}', '${changeT}', '${changeV}', '${changeD}')`, function(err, result) {
                        if(err) console.log(err)
                        disFunctions.audit(connection, 15, `${req.user.username} has created a changelog for ${botResult[0].botName} (${botResult[0].botId})`, req.user.username)
                        res.redirect(`/bot/${botId}/changelogs`)

                        const embedGuild = new Discord.MessageEmbed()
                            .setColor(config["colors"].blurple)
                            .setFooter({ text: `Changelog Creation: ${botResult[0].botName}` })
                            .setURL(`${config.baseURL}/bot/${botId}/changelogs`)
                            .setTitle(`${botResult[0].botName}'s Changelogs`)
                            .setThumbnail(botResult[0].botIcon)
                            .setTimestamp()
                            .setDescription(`${req.user.username} has created a changelog for ${botResult[0].botName} (${botId})`)
                        let dChan = bot.channels.cache.get(config.website_logs)
                        if(dChan) {
                            dChan.send({ embeds: [embedGuild] })
                        }
                    })
                } else res.redirect('/403')
            }
        })
    })

    app.post('/backend/bot/add', (req, res) => {
        connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, result) {
            if(result[0]) {
                if(result[0].postban) {
                    res.redirect('/postban')
                } else {
                    const botId = req.body.botid;
                    const otherOwners = req.body.otherowners.replace(/'/gi, "''") || null;
                    const creatorId = req.user.id;
                    const creatorName = req.user.username+'#'+req.user.discriminator.replace(/'/gi, "''");
                    const createDate = new Date();
                    const prefix = req.body.prefix.replace(/'/gi, "''");
                    const prefixChange = req.body.customprefix || 0;
                    const nsfwContent = req.body.nsfwcontent || 0;
                    const shortDesc = req.body.shortdesc.replace(/'/gi, "''");
                    var inviteUrl = req.body.inviteurl || null;
                    const supportGuild = req.body.supportguild.replace(/'/gi, "''") || null;
                    const websiteLink = req.body.websitelink.replace(/'/gi, "''") || null;
                    const GithubLink = req.body.githublink.replace(/'/gi, "''") || null;
                    const donateLink = req.body.donatelink.replace(/'/gi, "''") || null;
                    const library = req.body.library.replace(/'/gi, "''");
                    const longDesc = req.body.longdesc.replace(/'/gi, "''");
                    const tagFun = req.body.fun || 0;
                    const tagGames = req.body.games || 0;
                    const tagMusic = req.body.music || 0;
                    const tagEco = req.body.economy || 0;
                    const tagMod = req.body.moderation || 0;
                    const tagAutomod = req.body.automod || 0;
                    const tagLeveling = req.body.leveling || 0;
                    const tagSocial = req.body.social || 0;
                    const tagUtility = req.body.utility || 0;
                    const shorturl =  req.body.shorturl.replace(/'/gi, "''") || null;
                    if(!inviteUrl) {
                        inviteUrl = `https://discord.com/oauth2/authorize?client_id=${botId}&scope=bot&permissions=8`
                    }
                    axios(`/users/${botId}`).then((resDis) => {
                        var botIcon = `${config.baseURL}/assets/images/noimage.png`;
                        const botName = resDis.data.username.replace(/'/gi, "''");
                        if(resDis.data.avatar) {
                            botIcon = `https://cdn.discordapp.com/avatars/${botId}/${resDis.data.avatar}.png?size=512`;
                        }
                        let newAuthToken = disFunctions.makeid(35)
                        connection.query(`INSERT INTO bots (botId, botName, botIcon, otherOwners, creatorId, creatorName, createDate, prefix, prefixChange, shortDesc, inviteUrl, supportGuild, websiteLink, GithubLink, donateLink, library, longDesc, tagFun, tagGames, tagMusic, tagEco, tagMod, tagAutomod, tagLeveling, tagSocial, votes, avgRating, certified, hidden, nsfwContent, pending, authToken, shorturl, tagUtility) VALUES ('${botId}', '${botName}', '${botIcon}', '${otherOwners}', '${creatorId}', '${creatorName}', '${createDate}', '${prefix}', ${prefixChange}, '${shortDesc}', '${inviteUrl}', '${supportGuild}', '${websiteLink}', '${GithubLink}', '${donateLink}', '${library}', '${longDesc}', ${tagFun}, ${tagGames}, ${tagMusic}, ${tagEco}, ${tagMod}, ${tagAutomod}, ${tagLeveling}, ${tagSocial}, 0, '0', false, true, ${nsfwContent}, true, '${newAuthToken}', '${shorturl}', ${tagUtility})`, function (err, result) {
                            if (err) console.log(err);
                            res.redirect(`/bot/${botId}`)
                        });
                
                        disFunctions.audit(connection, 3, `${req.user.username} has added a bot. ${botName} (${botId})`, req.user.username)
            
                        // Guild Embedded Message
                        const embedGuild = new Discord.MessageEmbed()
                            .setColor(config["colors"].orange)
                            .setTitle(`Bot Pending - ${botName}`)
                            .setDescription(`Bot: ${botName}\nID: ${botId}\n\nAdded by: ${creatorName}\nTime: ${createDate.toLocaleString()}\n\nStatus: **Pending** - [View](${config.baseURL}/bot/${botId})`)
                            .setThumbnail(botIcon)
                            .setURL(`${config.baseURL}/bot/${botId}`)
                            .setFooter({ text: `Bot: ${botName} | Status: Pending` })

                        // User Embedded Message
                        const embedUser = new Discord.MessageEmbed()
                            .setColor(config["colors"].orange)
                            .setTitle(`${botName} is now pending approval`)
                            .setDescription(`Bot: ${botName}\nID: ${botId}\n\nStatus: **Pending**\nThis bot is now pending to be reviewed by our review team. Please be patient while we look over your bot to ensure its safe for our community.`)
                            .setURL(`${config.baseURL}/bot/${botId}`)
                            .setFooter({ text: `Bot: ${botName} | Status: Pending` })

                        let dChan = bot.channels.cache.get(config.website_logs)
                        let dUser = bot.users.cache.get(creatorId)
                        if(dChan) dChan.send({ content: `<@&${config.reviewer_role}>` }).then(() => {
                            dChan.send({ embeds: [embedGuild] })
                        });
                        if(dUser) {
                            try {
                                dUser.send(embedUser).catch((err) => {console.log(err)});
                            } catch (error) {
                                
                            }
                        }
                        ////////// BEEFTARD'S DOING ////////////
                        twitterClient.post('statuses/update', { status: `We have added a new bot too our bot list!\nhttps://disbot.top/bot/${botId}` }, function(err, data, response) {
                            // console.log(data)
                        })
                    }).catch((err) => {
                        console.log(err);
                        res.redirect('/')
                    });
                }
            }
        })
    });

    app.post('/backend/user/:userId/:optionType/update', function(req, res) {
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        let userId = req.params.userId;
        let option = req.params.optionType;
        //////////////////////////////////////////////////
        
        
        //////////////////////////////////////////////////
        if(req.user.id == userId) {
            if(option == "bio") {
                let newBio = req.body.bio.replace(/'/gi, "''");
                axios(`/users/${req.user.id}`).then((resDis) => {
                    var userIcon = `/assets/images/noimage.png`;
                    const userName = resDis.data.username;
                    if(resDis.data.avatar) {
                        userIcon = `https://cdn.discordapp.com/avatars/${resDis.data.id}/${resDis.data.avatar}?size=512`;
                    }
                    connection.query(`UPDATE users SET userIcon = '${userIcon}', userName = '${userName}', bio = '${newBio}' WHERE userId = '${req.user.id}'`, (err, result) => {
                        if (err) console.log(err);
                        res.redirect(`/user/${req.user.id}`)
                    });
                    disFunctions.audit(connection, 20, `${userName} has edited their profile.`, userName)
                    const embedGuild = new Discord.MessageEmbed()
                        .setColor(config["colors"].blurple)
                        .setTitle(`${userName}'s Profile`)
                        .setThumbnail(userIcon)
                        .setURL(`${config.baseURL}/user/${userId}`)
                        .setTimestamp()
                        .setDescription(`${userName} has updated their profile.`)
                    let dChan = bot.channels.cache.get(config.site_actions)
                    if(dChan) {
                        dChan.send({ embeds: [embedGuild] })
                    }
                }).catch((err) => {
                    console.log(err);
                });
            } if(option == "discord") {
                let dLink = req.body.discordlink || "null";
                axios(`/users/${req.user.id}`).then((resDis) => {
                    var userIcon = `/assets/images/noimage.png`;
                    const userName = resDis.data.username;
                    if(resDis.data.avatar) {
                        userIcon = `https://cdn.discordapp.com/avatars/${resDis.data.id}/${resDis.data.avatar}?size=512`;
                    }
                    connection.query(`UPDATE users SET userIcon = '${userIcon}', userName = '${userName}', discordSocial = '${dLink}' WHERE userId = '${req.user.id}'`, (err, result) => {
                        if (err) console.log(err);
                        res.redirect(`/user/${req.user.id}`)
                    });
                    disFunctions.audit(connection, 25, `${userName} has updated their Discord social on their profile.`, userName)
                }).catch((err) => {
                    console.log(err);
                });
            } if(option == "twitter") {
                let tLink = req.body.twitterlink || "null";
                axios(`/users/${req.user.id}`).then((resDis) => {
                    var userIcon = `/assets/images/noimage.png`;
                    const userName = resDis.data.username;
                    if(resDis.data.avatar) {
                        userIcon = `https://cdn.discordapp.com/avatars/${resDis.data.id}/${resDis.data.avatar}?size=512`;
                    }
                    connection.query(`UPDATE users SET userIcon = '${userIcon}', userName = '${userName}', twitterSocial = '${tLink}' WHERE userId = '${req.user.id}'`, (err, result) => {
                        if (err) console.log(err);
                        res.redirect(`/user/${req.user.id}`)
                    });
                    disFunctions.audit(connection, 25, `${userName} has updated their Twitter social on their profile.`, userName)
                }).catch((err) => {
                    console.log(err);
                });
            } if(option == "github") {
                let gLink = req.body.githublink || "null";
                axios(`/users/${req.user.id}`).then((resDis) => {
                    var userIcon = `/assets/images/noimage.png`;
                    const userName = resDis.data.username;
                    if(resDis.data.avatar) {
                        userIcon = `https://cdn.discordapp.com/avatars/${resDis.data.id}/${resDis.data.avatar}?size=512`;
                    }
                    connection.query(`UPDATE users SET userIcon = '${userIcon}', userName = '${userName}', githubSocial = '${gLink}' WHERE userId = '${req.user.id}'`, (err, result) => {
                        if (err) console.log(err);
                        res.redirect(`/user/${req.user.id}`)
                    });
                    disFunctions.audit(connection, 25, `${userName} has updated their Github social on their profile.`, userName)
                }).catch((err) => {
                    console.log(err);
                });
            }
        } else res.redirect('/403')   
    });

    app.post('/backend/bot/:botId/edit', (req, res) => {
        let botId = req.params.botId;
        if(req.isAuthenticated()) {
            const otherOwners = req.body.otherowners.replace(/'/gi, "''") || null;
            const prefix = req.body.prefix.replace(/'/gi, "''");
            const prefixChange = req.body.customprefix || 0;
            const nsfwContent = req.body.nsfwcontent || 0;
            const certified = req.body.certified || 0;
            const shortDesc = req.body.shortdesc.replace(/'/gi, "''");
            var inviteUrl = req.body.inviteurl.replace(/'/gi, "''") || null;
            const supportGuild = req.body.supportguild.replace(/'/gi, "''") || null;
            const websiteLink = req.body.websitelink.replace(/'/gi, "''") || null;
            const GithubLink = req.body.githublink.replace(/'/gi, "''") || null;
            const donateLink = req.body.donatelink.replace(/'/gi, "''") || null;
            const library = req.body.library.replace(/'/gi, "''");
            const longDesc = req.body.longdesc.replace(/'/gi, "''")
            const tagFun = req.body.fun || 0;
            const tagGames = req.body.games || 0;
            const tagMusic = req.body.music || 0;
            const tagEco = req.body.economy || 0;
            const tagMod = req.body.moderation || 0;
            const tagAutomod = req.body.automod || 0;
            const tagLeveling = req.body.leveling || 0;
            const tagSocial = req.body.social || 0;
            const tagUtility = req.body.utility || 0;
            const shorturl =  req.body.shorturl.replace(/'/gi, "''") || null;
            if(!inviteUrl) {
                inviteUrl = `https://discord.com/oauth2/authorize?client_id=${botId}&scope=bot&permissions=8`
            }
            axios(`/users/${botId}`).then((resDis) => {
                var botIcon = `https://disbot.top/assets/images/noimage.png`;
                const botName = resDis.data.username.replace(/'/gi, "''");
                if(resDis.data.avatar) {
                    botIcon = `https://cdn.discordapp.com/avatars/${botId}/${resDis.data.avatar}.png?size=512`;
                }

                disFunctions.audit(connection, 2, `${req.user.username} has edited ${botName} (${botId})`, req.user.username)

                connection.query(`UPDATE bots SET botName = '${botName}', botIcon = '${botIcon}', otherOwners = '${otherOwners}', prefix = '${prefix}', prefixChange = ${prefixChange}, nsfwContent = ${nsfwContent}, certified = ${certified}, shortDesc = '${shortDesc}', inviteUrl = '${inviteUrl}', supportGuild = '${supportGuild}', websiteLink = '${websiteLink}', GithubLink = '${GithubLink}', donateLink = '${donateLink}', library = '${library}', longDesc = '${longDesc}', tagFun = ${tagFun}, tagGames = ${tagGames}, tagMusic = ${tagMusic}, tagEco = ${tagEco}, tagMod = ${tagMod}, tagAutomod = ${tagAutomod}, tagLeveling = ${tagLeveling}, tagSocial = ${tagSocial}, shorturl = '${shorturl}', tagUtility = ${tagUtility} WHERE botId = '${botId}'`, (err, result) => {
                    if (err) console.log(err);
                    res.redirect(`/bot/${botId}`)
                    
                    const embedGuild = new Discord.MessageEmbed()
                        .setColor(config["colors"].blurple)
                        .setURL(`${config.baseURL}/bot/${botId}`)
                        .setFooter(`Bot Edit`)
                        .setTitle(`${botName}'s Page`)
                        .setThumbnail(botIcon)
                        .setTimestamp()
                        .setDescription(`${req.user.username} has edited ${botName} (${botId}).`)
                    let dChan = bot.channels.cache.get(config.website_logs)
                    if(dChan) {
                        dChan.send({ embeds:[embedGuild] })
                    }
                });
        
            }).catch((err) => {
                console.log(err);
                res.redirect('/')
            });
        } else {
            res.redirect('/notloggedin')
        }
    });

    app.post('/backend/vote/:botId', (req, res) => {
        let botId = req.params.botId;
        if(req.isAuthenticated()) {
            const creatorId = req.user.id;
            const createDate = new Date();
            const rating = req.body.rating || 0;
            connection.query(`INSERT INTO votes (botId, userId, rating, date) VALUES ('${botId}', '${creatorId}', '${rating}', '${createDate}')`, function (err, result) {
                if (err) console.log(err);
            });
    
            connection.query(`SELECT * FROM votes WHERE botId = '${botId}'`, (err, resultVotes) => {
                var ratingAvgArray = [];
                if(resultVotes) {
                    resultVotes.forEach(element => {
                        ratingAvgArray.push(element.rating);
                    });
                }
                var newAverage = Math.round(ratingAvgArray.reduce(function (a, b) { return a + b }) / ratingAvgArray.length)
                connection.query(`UPDATE bots SET votes = votes + 1, avgRating = '${newAverage}'WHERE botId = '${botId}'`, (err, result) => {
                    if (err) console.log(err);
                    res.redirect(`/bot/${botId}`)
                });
            });

            connection.query(`SELECT * FROM bots WHERE botId = '${botId}'`, function(err, resultss) {
                if(resultss[0]) {
                    disFunctions.audit(connection, 4, `${req.user.username} has up-voted ${resultss[0].botName} (${botId}). Rating: ${rating}`, req.user.username)

                    const embedGuild = new Discord.MessageEmbed()
                        .setColor(config["colors"].blurple)
                        .setURL(`${config.baseURL}/bot/${botId}`)
                        .setTitle(`${resultss[0].botName}'s Page`)
                        .setThumbnail(resultss[0].botIcon)
                        .setTimestamp()
                        .setDescription(`${req.user.username} has up-voted ${resultss[0].botName} (${resultss[0].botId}).`)
                    let dChan = bot.channels.cache.get(config.website_logs)
                    if(dChan) {
                        dChan.send({embeds: [embedGuild]})
                    }
                }
            })
        } else {
            res.redirect('/notloggedin')
        }
    });

    app.post('/backend/report/:botId', (req, res) => {
        let botId = req.params.botId;
        if(req.isAuthenticated()) {
            const creatorId = req.user.id;
            const creatorName = req.user.username+'#'+req.user.discriminator.replace(/'/gi, "''");
            const createDate = new Date();
            const reason = req.body.reason || 'Other';
            const addinfo = req.body.addinfo || null;
            connection.query(`INSERT INTO reports (active, creatorId, creatorName, botId, reason, addInfo, date) VALUES (true, '${creatorId}', '${creatorName}', '${botId}', '${reason}', '${addinfo}', '${createDate}')`, function (err, result) {
                if (err) console.log(err);
                res.redirect(`/bot/${botId}`)
                ////////// BEEFTARD'S DOING ////////////
                const embedGuild = new Discord.MessageEmbed()
                    .setColor(config["colors"].red)
                    .setTitle(`Bot Reported - By ${creatorName}`)
                    .setDescription(`Bot ID: ${botId}\nTime: ${createDate.toLocaleString()}\n\n**Details:** ${reason}\n\n[View Reports](${config.baseURL}/staff/reports)`)
                    .setURL(`${config.baseURL}/staff/reports`)
                let dChan = bot.channels.cache.get(config.site_actions)
                if(dChan) {
                    dChan.send(`<@&${config.reviewer_role}>`).then(() => {
                        dChan.send({ embeds: [embedGuild] })
                    });
                }
                
                connection.query(`SELECT * FROM bots WHERE botId = '${botId}'`, function(err, result) {
                    if(result[0]) {
                        disFunctions.audit(connection, 6, `${req.user.username} has created a bot report for ${result[0].botName} (${result[0].botId})`, req.user.username)
                    }
                })
            });
        } else {
            res.redirect('/notloggedin')
        }
    });

    app.post('/backend/ticket/create', (req, res) => {
        if(req.isAuthenticated()) {
            const creatorId = req.body.recipiant || req.user.id;
            const creatorName = req.user.username+'#'+req.user.discriminator.replace(/'/gi, "''");
            const createDate = new Date();
            const details = req.body.details.replace(/'/gi, "''");
            if(req.body.recipiant) {
                connection.query(`UPDATE users SET notifications = notifications + 1 WHERE userId = '${creatorId}'`, (err, result) => {
                    if (err) console.log(err);
                }); 
            }
            connection.query(`INSERT INTO contacts (active, userId, userName, lastUpdated, createDate, openComment) VALUES (true, '${creatorId}', '${creatorName}', '${createDate}', '${createDate}', '${details}')`, function (err, result) {
                if (err) console.log(err);
                res.redirect(`/ticket/view/${result.insertId}`);
                
                disFunctions.audit(connection, 9, `${req.user.username} has created a ticket. Ticket: (${result.insertId})`, req.user.username)
                //////// BEEFTARD'S DOING ////////////
                const embedGuild = new Discord.MessageEmbed()
                    .setColor(config["colors"].green)
                    .setFooter(`${createDate.toLocaleString()} | ${creatorName}`)
                    .setTitle(`Ticket Created | ID: ${result.insertId}`)
                    .setDescription(`[View](${config.baseURL}/ticket/view/${result.insertId})\n\nComment: ${details}`)
                    .setURL(`${config.baseURL}/ticket/view/${result.insertId}`)
                let dChan = bot.channels.cache.get(config.site_actions)
                if(dChan) {
                    dChan.send(`<@&${config.reviewer_role}>`).then(() => {
                        dChan.send({ embeds: [embedGuild] })
                    });
                }
    
                if(req.body.recipiant) {
                    const embedUser = new Discord.MessageEmbed()
                    .setColor(config["colors"].green)
                    .setFooter(`${createDate.toLocaleString()}`)
                    .setTitle(`Ticket Opened to You | ID: ${result.insertId}`)
                    .setDescription(`Disbot.top Staff has sent you a message via ticket, view details below.\n\nComment: ${details}\n\n[Reply Here](${config.baseURL}/ticket/view/${result.insertId})`)
                    .setURL(`${config.baseURL}/ticket/view/${result.insertId}`)
                    let dUser = bot.users.cache.get(req.body.recipiant)
                    if(dUser) {
                        try {
                            dUser.send({ embeds: [embedUser] }).catch((err) => {console.log(err)});
                        } catch (error) {
                            // lol error, beefos fault.
                        }
                    }
    
                } else {
                    const embedUser = new Discord.MessageEmbed()
                    .setColor(config["colors"].green)
                    .setFooter(`${createDate.toLocaleString()} | ${creatorName}`)
                    .setTitle(`Ticket Submitted | ID: ${result.insertId}`)
                    .setDescription(`Comment: ${details}`)
                    .setURL(`${config.baseURL}/ticket/view/${result.insertId}`)
                    let dUser = bot.users.cache.get(req.user.id)
                    if(dUser) {
                        try {
                            dUser.send({ embeds: [embedUser] }).catch((err) => {console.log(err)});
                        } catch (error) {
                            // lol error, beefos fault.
                        }
                    }
                }
                //////////// BEEFTARD'S DOING ////////////
            });
    
            
        } else {
            res.redirect('/notloggedin')
        }
    });

    app.post('/backend/endpoint/add', function(req, res) {
        let endpointTitle = req.body.endTitle || "none";
        let endpointMethod = req.body.endMethod || "none";
        let endpointURL = req.body.endURL || "none";
        let endpointDesc = req.body.endDesc.replace(/'/gi, "''") || "none";

        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, result) {
            if(result[0]) {
                if(result[0].perm <= 1) return res.redirect('/403')
                connection.query(`INSERT INTO apidocs (endpoint_title,endpoint_method,endpoint_url,endpoint_desc) VALUES ('${endpointTitle}', '${endpointMethod}', '${endpointURL}', '${endpointDesc}')`, function(err, result) {
                    if(err) console.log(err)
                    disFunctions.audit(connection, 18, `${req.user.username} has created a API endpoint for docs.`, req.user.username)
                    res.redirect('/staff/api/settings')
                })
            } else res.redirect('/403')
        })
    })

    app.post('/backend/comment/:tickId/create', (req, res) => {
        let tickId = req.params.tickId;
        if(req.isAuthenticated()) {
            const creatorId = req.user.id;
            const creatorName = req.user.username+'#'+req.user.discriminator.replace(/'/gi, "''");
            const createDate = new Date();
            const markSolved = req.body.marksolved || true;
            const details = req.body.details.replace(/'/gi, "''");
            connection.query(`SELECT * FROM contacts WHERE id = ${tickId}`, (err, result) => {
                if(result[0].userId == req.user.id) {
                    ///
                } else {
                    connection.query(`UPDATE users SET notifications = notifications + 1 WHERE userId = '${result[0].userId}'`, (err, result) => {
                        if (err) console.log(err);
                    });
                }
                connection.query(`UPDATE contacts SET lastUpdated = '${createDate}', active = ${markSolved} WHERE id = ${tickId}`, (err, result) => {
                    if (err) console.log(err);
                });
                connection.query(`INSERT INTO contactComments (contactId, userId, userName, createDate, comment) VALUES (${tickId}, '${creatorId}', '${creatorName}', '${createDate}', '${details}')`, function (err, result) {
                    if (err) console.log(err);
                    res.redirect(`/ticket/view/${tickId}`);
                });
                ////////// BEEFTARD'S DOING ////////////
                const embedGuild = new Discord.MessageEmbed()
                    .setColor(config["colors"].blurple)
                    .setTitle(`Ticket Comment - By ${creatorName}`)
                    .setDescription(`ID: ${tickId}\n\nComment by: ${creatorName}\n\nComment: ${details}\n\n[View](${config.baseURL}/ticket/view/${tickId})`)
                    .setURL(`${config.baseURL}/ticket/view/${tickId}`)
                let dChan = bot.channels.cache.get(config.site_actions)
                if(dChan) {
                    dChan.send({content: `<@&${config.reviewer_role}>`}).then(() => {
                        dChan.send({embeds: [embedGuild]})
                    });
                } 
                ////////// BEEFTARD'S DOING ////////////

                disFunctions.audit(connection, 17, `${req.user.username} has commented on a ticket. Ticket: (${tickId})`, req.user.username)
            }); 
        } else {
            res.redirect('/notloggedin')
        }
    });

    app.post('/backend/bot/deny', (req, res) => {
        let botId = req.body.botspend;
        let denyBy = req.user.username+'#'+req.user.discriminator.replace(/'/gi, "''");
        let denyDate = new Date();
        let dReason = req.body.denyreason;
    
        if(req.isAuthenticated()) {
            connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, (err, resulta) => {
                if(resulta[0]) {
                    if(resulta[0].perm < 0) return res.redirect('/403')
                    connection.query(`SELECT * FROM bots WHERE botId = '${botId}'`, function(err, result) {
                        if (err) console.log(err)
                        if(result[0]) {
                            const embedGuild = new Discord.MessageEmbed()
                                .setColor(config["colors"].red)
                                .setTitle(`Bot Denied - ${result[0].botName}`)
                                .setDescription(`Bot: ${result[0].botName}\nID: ${botId}\n\Denied by: ${denyBy}\nTime: ${denyDate.toLocaleString()}\n\n**Reason:** ${dReason}\n\nStatus: **Denied**`)
                                .setThumbnail(result[0].botIcon)
                                .setURL(`https://disbot.top/`)
                                .setFooter({ text: `Bot: ${result[0].botName} | Status: Denied` })
    
                            const embedUser = new Discord.MessageEmbed()
                                .setColor(config["colors"].red)
                                .setTitle(`${result[0].botName} is now Denied`)
                                .setDescription(`Bot: ${result[0].botName}\nID: ${botId}\Denied by: ${denyBy}\n\n**Reason:** ${dReason}\n\nStatus: **Denied**`)
                                .setURL(`https://disbot.top`)
                                .setFooter({ text: `Bot: ${result[0].botName} | Status: Denied` })
                            let dChan = bot.channels.cache.get(config.website_logs)
                            let dUser = bot.users.cache.get(result[0].creatorId)
                            if(dChan) {
                                dChan.send({ embeds: [embedGuild] });
                            }
                            if(dUser) {
                                try {
                                    dUser.send({embeds: [embedUser]}).catch((err) => {console.log(err)});
                                } catch (error) {
                                    
                                }
                            }
                        }
                        disFunctions.audit(connection, 8, `${req.user.username} has denied ${result[0].botName} (${botId}).`, req.user.username)
                    });
                    setTimeout(() => {
                        connection.query(`DELETE FROM bots WHERE botId = '${botId}'`, function (err, result) {
                            if (err) console.log(err);
                            res.redirect(`/staff/bots/pending`)
                        });
                    }, 1000)
                } else {
                    res.redirect('/403')
                }
            });
        } else {
            res.redirect('/notloggedin')
        }
    });

    app.post('/backend/partner/add', function(req, res) {
        let parterName = req.body.partnerName;
        let partnerDesc = req.body.partnerDesc.replace(/'/gi, "''");
        let partnerImage = req.body.partnerImage;
        let partnerLink = req.body.partnerLink;

        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, result) {
            if(result[0]) {
                if(result[0].perm !== 2) return res.redirect('/403')
                connection.query(`INSERT INTO partners (p_name, p_desc, p_link, p_image) VALUES ('${parterName}', '${partnerDesc}', '${partnerLink}', '${partnerImage}')`, function(err, result) {
                    if(err) console.log(err)
                    res.redirect('/staff/partner/settings')
                })
            }
        })
    })

    app.get('/backend/endpoint/:endId/remove', function(req, res) {
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        let endpointId = req.params.endId;
        connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, result) {
            if(result[0]) {
                if(result[0].perm <= 1) return res.redirect('/403')
                connection.query(`DELETE FROM apidocs WHERE id = '${endpointId}'`, function(err, results) {
                    if(err) console.log(err)
                    disFunctions.audit(connection, 19, `${req.user.username} has deleted a API endpoint from docs.`, req.user.username)
                    res.redirect('/staff/api/settings')
                });
            }
        });
    });
    
    app.get('/backend/permissions/:userId/remove', (req, res) => {
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        let userId = req.params.userId;
        connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, result) {
            if(result[0]) {
                if(result[0].perm !== 2) return res.redirect('/403')
                connection.query(`UPDATE users SET perm = 0 WHERE userId = '${userId}'`, function(err, results) {
                    res.redirect('/staff/permissions')
                    connection.query(`SELECT * FROM users WHERE userId = '${userId}'`, function(err, userResult) {
                        if(result[0]) {
                            disFunctions.audit(connection, 1, `${result[0].userName} has removed ${userResult[0].userName} from their position.`, result[0].userName)
                        }
                    });
                });
            } else res.redirect('/403')
        });
    });
    
    app.get('/backend/bot/:botId/approve', (req, res) => {
        let botId = req.params.botId;
        let approvedBy = req.user.username+'#'+req.user.discriminator.replace(/'/gi, "''");
        let approveDate = new Date();
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
    
        connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, result) {
            if(result[0]) {
                if(result[0].perm <= 0) return res.redirect('/403');
                connection.query(`UPDATE bots SET pending = false, hidden = false WHERE botId = '${botId}'`, function (err, result) {
                    if (err) console.log(err);
                    res.redirect(`/staff/bots/pending`)
                });
            } else res.redirect('/403');
        });
    
        connection.query(`SELECT * FROM bots WHERE botId = '${botId}'`, function(err, result) {
            if(result[0]) {
                disFunctions.audit(connection, 7, `${req.user.username} has approved ${result[0].botName} (${botId}).`, req.user.username)
                //////////////////////////////////////////
                const embedGuild = new Discord.MessageEmbed()
                .setColor(config["colors"].green)
                .setTitle(`Bot Approved - ${result[0].botName}`)
                .setDescription(`Bot: ${result[0].botName}\nID: ${botId}\n\nApproved by: ${approvedBy}\nTime: ${approveDate.toLocaleString()}\n\nStatus: **Approved** - [View](${config.baseURL}/bot/${botId})`)
                .setThumbnail(result[0].botIcon)
                .setURL(`${config.baseURL}/bot/${botId}`)
                .setFooter({ text: `Bot: ${result[0].botName} | Status: Approved` })
                
                const embedUser = new Discord.MessageEmbed()
                    .setColor(config["colors"].green)
                    .setTitle(`${result[0].botName} is now APPROVED`)
                    .setDescription(`Bot: ${result[0].botName}\nID: ${botId}\nApproved by: ${approvedBy}\n\nStatus: **Approved**\nYour bot is now approved for our bot list!`)
                    .setURL(`${config.baseURL}/bot/${botId}`)
                    .setFooter({ text: `Bot: ${result[0].botName} | Status: Approved` })
                    
                let dChan = bot.channels.cache.get(config.website_logs);
                let dUser = bot.users.cache.get(result[0].creatorId);
                let dGuild = bot.guilds.cache.get(config.guildId);
    
                if(dChan) dChan.send({ embeds: [embedGuild] });
                if(dUser && dGuild) {
                    let role = dGuild.roles.cache.get(config.devrole); 
                    if(role) {
                        dGuild.member(dUser).roles.add(role).catch(console.error);
                    }
                    try {
                        dUser.send({embeds: [embedUser]}).catch((err) => {console.log(err)});
                    } catch (error) {
                        //
                    }
                }
            }
        });
    });
    
    app.get('/backend/report/:id/complete', (req, res) => {
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        let id = req.params.id;
        connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, result) {
            if(result[0]) {
                if(result[0].perm <= 0) return res.redirect('/403')
                connection.query(`UPDATE reports SET active = false WHERE id = ${id}`, function(err, results) {
                    if(err) console.log(err)
                    res.redirect('/staff/reports/pending');
                    disFunctions.audit(connection, 10, `${req.user.username} has complete a report.`, req.user.username)
                });
            } else res.redirect('/403');
        });
    });
    
    app.get('/backend/bot/:botId/:boostType/:boostAmount', function(req, res) {
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        let botId = req.params.botId;
        let boostType = req.params.boostType;
        let boostAmount = req.params.boostAmount;
        ////////////////////////////////////////////////////////////////////////////////////////////////
        connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, result) {
            if(result[0]) {
                if(result[0].perm <= 0) return res.redirect('/403');
                if(boostType == "boost") { // boost votes
                    connection.query(`UPDATE bots SET votes = votes + ${boostAmount} WHERE botId = '${botId}'`, function(err, results) {
                        if(err) console.log(err);
                        res.redirect(`/bot/${botId}`)
                    });
                    connection.query(`SELECT * FROM bots WHERE botId = '${botId}'`, function(err, results) {
                        if(results[0]) {
                            disFunctions.audit(connection, 12, `${req.user.username} has boosted ${results[0].botName} (${results[0].botId}). ${boostAmount} boosts`, req.user.username);
                        }
                    })
                } if(boostType == "unboost") { // unboost votes
                    connection.query(`UPDATE bots SET votes = votes - ${boostAmount} WHERE botId = '${botId}'`, function(err, results) {
                        if(err) console.log(err);
                        res.redirect(`/bot/${botId}`)
                    });
                    connection.query(`SELECT * FROM bots WHERE botId = '${botId}'`, function(err, results) {
                        if(results[0]) {
                            disFunctions.audit(connection, 13, `${req.user.username} has unboosted ${results[0].botName} (${results[0].botId}). ${boostAmount} boosts`, req.user.username);
                        }
                    })
                }
            }
        })
    });
    
    app.get('/backend/bot/:botId/token/regen', function(req, res) {
        let botId = req.params.botId;
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, result) {
            if(result[0]) {
                connection.query(`SELECT * FROM bots WHERE botId = '${botId}'`, function(err, results) {
                    if(results[0]) {
                        if(results[0].creatorId !== req.user.id) return res.redirect('/403')
                        let newAuthToken = disFunctions.makeid(25)
                        connection.query(`UPDATE bots SET authToken = '${newAuthToken}' WHERE botId = '${botId}'`, function(err, resultss) {
                            if(err) console.log(err)
                            res.redirect('/api/bottokens')
                            disFunctions.audit(connection, 26, `${req.user.username} has regenerated the authorization token for ${results[0].botName} (${results[0].botId})`, req.user.username)
                        });
                    }
                });
            }
        });
    });
    
    app.get('/backend/bot/:botId/delete', (req, res) => {
        let botId = req.params.botId;
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, result) {
            if(result[0]) {
                if(result[0].perm <= 1) return res.redirect('/403')
                connection.query(`DELETE FROM bots WHERE botId = '${botId}'`, function(err, result) {
                    if(err) console.log(err)
                    res.redirect('/')
                    disFunctions.audit(connection, 11, `${req.user.username} has deleted ${botId} bot from listing.`, req.user.username)
                });
            } else res.redirect('/403')
        });
    });
    
    app.get('/backend/advertise/:Id/remove', function(req, res) {
        let ad = req.params.Id;
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, results) {
            if(results[0]) {
                if(results[0].perm !== 2) return res.redirect('/403')
                connection.query(`DELETE FROM adverts WHERE id = '${ad}'`, function(err, results) {
                    if(err) console.log(err)
                    res.redirect('/staff/advert/settings')
                    disFunctions.audit(connection, 28, `${req.user.username} has removed a advertisement from the website.`, req.user.username)
                });
            }
        });
    });

    app.get('/backend/partner/:Id/remove', function(req, res) {
        let pId = req.params.Id;
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, results) {
            if(results[0]) {
                if(results[0].perm !== 2) return res.redirect('/403')
                connection.query(`DELETE FROM partners WHERE id = '${pId}'`, function(err, results) {
                    if(err) console.log(err)
                    res.redirect('/staff/partner/settings')
                });
            }
        });
    });
    
    app.get('/backend/bot/:botId/hide', (req, res) => {
        let botId = req.params.botId;
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, result) {
            if(result[0]) {
                if(result[0].perm <= 0) return res.redirect('/403')
                connection.query(`SELECT * FROM bots WHERE botId = '${botId}'`, function(err, results) {
                    if(results[0]) {
                        if(results[0].hidden) {
                            connection.query(`UPDATE bots SET hidden = false WHERE botId = '${botId}'`, function(err, result) {
                                if(err) console.log(err)
                                res.redirect(`/bot/${botId}`)
                                const embedGuild = new Discord.MessageEmbed()
                                    .setColor(config["colors"].blurple)
                                    .setTimestamp()
                                    .setURL(`${config.baseURL}/bot/${botId}`)
                                    .setTitle(`${results[0].botName}`)
                                    .setThumbnail(results[0].botIcon)
                                    .setDescription(`${req.user.username} has unhidden ${results[0].botName} (${results[0].botId}) from listing.`)
                                let dChan = bot.channels.cache.get(config.site_actions)
                                if(dChan) {
                                    dChan.send({ embeds: [embedGuild] })
                                }
                                disFunctions.audit(connection, 14, `${req.user.username} has unhidden  ${results[0].botName} (${results[0].botId}) from listing.`, req.user.username)
                            });
                        } else {
                            connection.query(`UPDATE bots SET hidden = true WHERE botId = '${botId}'`, function(err, result) {
                                if(err) console.log(err)
                                res.redirect(`/bot/${botId}`)
                                const embedGuild = new Discord.MessageEmbed()
                                    .setColor(config["colors"].blurple)
                                    .setTimestamp()
                                    .setURL(`${config.baseURL}/bot/${botId}`)
                                    .setTitle(`${results[0].botName}`)
                                    .setThumbnail(results[0].botIcon)
                                    .setDescription(`${req.user.username} has hidden ${results[0].botName} (${results[0].botId}) from listing.`)
                                let dChan = bot.channels.cache.get(config.site_actions)
                                if(dChan) {
                                    dChan.send({embeds: [embedGuild]})
                                }
                                disFunctions.audit(connection, 14, `${req.user.username} has hidden  ${results[0].botName} (${results[0].botId}) from listing.`, req.user.username)
                            });
                        }
                    }
                });
            }
        });
    });
    
    app.get('/backend/blacklist/:userId', function(req, res) {
        let userId = req.params.userId;
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, results) {
            if(results[0]) {
                if(results[0].perm <= 1) return res.redirect('/403')
                connection.query(`SELECT * FROM users WHERE userId = '${userId}'`, function(err, result) {
                    if(result[0]) {
                        if(result[0].blacklisted) {
                            connection.query(`UPDATE users SET blacklisted = 0 WHERE userId = '${userId}'`, function(err, result1) {
                                if(err) console.log(err)
                                const embedGuild = new Discord.MessageEmbed()
                                    .setColor(config["colors"].blurple)
                                    .setTimestamp()
                                    .setURL(`${config.baseURL}/user/${userId}`)
                                    .setTitle(`${result[0].userName}'s Profile`)
                                    .setThumbnail(result[0].userIcon)
                                    .setDescription(`${req.user.username} has removed ${result[0].userName} (${results[0].userId}) from blacklist.`)
                                let dChan = bot.channels.cache.get(config.site_actions)
                                if(dChan) {
                                    dChan.send({embeds: [embedGuild]})
                                }
                                disFunctions.audit(connection, 22, `${results[0].userName} has removed ${result[0].userName} (${result[0].userId}) from the blacklist.`, results[0].userName)
                                res.redirect(`/user/${userId}`)
                            });
                        } else {
                            connection.query(`UPDATE users SET blacklisted = 1 WHERE userId = '${userId}'`, function(err, result1) {
                                if(err) console.log(err)
                                const embedGuild = new Discord.MessageEmbed()
                                    .setColor(config["colors"].blurple)
                                    .setTimestamp()
                                    .setURL(`${config.baseURL}/user/${userId}`)
                                    .setTitle(`${result[0].userName}'s Profile`)
                                    .setThumbnail(result[0].userIcon)
                                    .setDescription(`${req.user.username} has added ${result[0].userName} (${results[0].userId}) to blacklist.`)
                                let dChan = bot.channels.cache.get(config.site_actions)
                                if(dChan) {
                                    dChan.send({embeds: [embedGuild]})
                                }
                                disFunctions.audit(connection, 21, `${results[0].userName} has blacklisted ${result[0].userName} (${result[0].userId}) from using the website.`, results[0].userName)
                                res.redirect(`/user/${userId}`)
                            });
                        }
                    }
                });
            }
        });
    });
    
    app.get('/backend/postban/:userId', function(req, res) {
        let userId = req.params.userId;
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, results) {
            if(results[0]) {
                if(results[0].perm <= 1) return res.redirect('/403')
                connection.query(`SELECT * FROM users WHERE userId = '${userId}'`, function(err, result) {
                    if(result[0]) {
                        if(result[0].postban) {
                            connection.query(`UPDATE users SET postban = 0 WHERE userId = '${userId}'`, function(err, result1) {
                                if(err) console.log(err)
                                const embedGuild = new Discord.MessageEmbed()
                                    .setColor(config["colors"].blurple)
                                    .setTimestamp()
                                    .setURL(`${config.baseURL}/user/${userId}`)
                                    .setTitle(`${result[0].userName}'s Profile`)
                                    .setThumbnail(result[0].userIcon)
                                    .setDescription(`${req.user.username} has unbanned ${result[0].userName} (${results[0].userId}) from posting bots.`)
                                let dChan = bot.channels.cache.get(config.site_actions)
                                if(dChan) {
                                    dChan.send({embeds: [embedGuild]})
                                }
                                disFunctions.audit(connection, 24, `${results[0].userName} has unbanned ${result[0].userName} (${result[0].userId}) from posting bots.`, results[0].userName)
                                res.redirect(`/user/${userId}`)
                            });
                        } else {
                            connection.query(`UPDATE users SET postban = 1 WHERE userId = '${userId}'`, function(err, result1) {
                                if(err) console.log(err)
                                const embedGuild = new Discord.MessageEmbed()
                                    .setColor(config["colors"].blurple)
                                    .setTimestamp()
                                    .setURL(`${config.baseURL}/user/${userId}`)
                                    .setTitle(`${result[0].userName}'s Profile`)
                                    .setThumbnail(result[0].userIcon)
                                    .setDescription(`${req.user.username} has banned ${result[0].userName} (${results[0].userId}) from posting bots.`)
                                let dChan = bot.channels.cache.get(config.site_actions)
                                if(dChan) {
                                    dChan.send({embeds: [embedGuild]})
                                }
                                disFunctions.audit(connection, 23, `${results[0].userName} has banned ${result[0].userName} (${result[0].userId}) from posting bots.`, results[0].userName)
                                res.redirect(`/user/${userId}`)
                            });
                        }
                    }
                });
            }
        });
    });
}