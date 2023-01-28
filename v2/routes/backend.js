const createAudit = require('../src/helpers/auditLogs');const { convertStrings } = require('../src/helpers/stringconvert');
const { createid } = require('../src/helpers/makeid');const { MessageEmbed } = require('discord.js');const fs = require('fs');

module.exports = (app, bot, axios) => {
    if(bot.config.consoleDebug) {
        console.log(`| [Route - /backend] Loaded. |`)
    }
    app.post('/backend/permissions/set', function(req, res) {
        let userid = req.body.userid;
        let permission = req.body.userperm;
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        bot.connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, userResult) {
            if(userResult[0]) {
                if(userResult[0].perm <= 1) return res.redirect('/403')
                bot.connection.query(`UPDATE users SET perm = ${permission} WHERE userId = '${userid}'`, function(err, result) {
                    bot.connection.query(`SELECT * FROM users WHERE userId = '${userid}'`, function(err, addedResults) {
                        let options = {
                            action: 1,
                            string: `${req.user.username} added ${addedResults[0].userName} (${addedResults[0].userId}) to ${convertStrings("staffroles", permission)}.`
                        }
                        createAudit(bot, options, req.user.username)
                        res.redirect('/staff/permissions')
                        const embedGuild = new MessageEmbed()
                            .setColor(bot.config.colors.discordGreyOne)
                            .setFooter({ text: `Permission Update | Disbot.top`, iconURL: `https://disbot.top/assets/images/image01.png` })
                            .setDescription(`[${req.user.username}](${bot.baseOpts.url}/user/${req.user.id}) has added [${addedResults[0].userName}](${bot.baseOpts.url}/user/${addedResults[0].userId}) to ${convertStrings("staffroles", permission)} position.`)
                        bot.siteLogSend(embedGuild)
                    })
                })
            }
        })
    });
    app.post('/backend/advert/add', function(req, res) {
        let advertOptions = {
            title: req.body.adTitle,
            description: req.body.adDesc.replace(/'/gi, "''"),
            link: req.body.adLink,
            image: req.body.adImage,
            owner: req.body.adOwner,
            expiredate: req.body.expiredate || 30
        }
        let date = new Date()
        let newDate = date.setDate(date.getDate() + Number(advertOptions.expiredate))
    
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        bot.connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, userResult) {
            if(userResult[0]) {
                if(userResult[0].perm <= 1) return res.redirect('/403')
                bot.connection.query(`INSERT INTO adverts (title, contact, extLink, imgLink, expireDate, owner) VALUES ('${advertOptions.title}', '${advertOptions.description}', '${advertOptions.link}', '${advertOptions.image}', '${newDate}', '${advertOptions.owner}')`, function(err, results) {
                    let options = {
                        action: 27,
                        string: `${req.user.username} added a advert to the website.`
                    }
                    createAudit(bot, options, req.user.username)
                    res.redirect('/staff/advert/settings')
                    const embedGuild = new MessageEmbed()
                        .setColor(bot.config.colors.discordGreyOne)
                        .setFooter({ text: `Advertisement Add | Disbot.top`, iconURL: `https://disbot.top/assets/images/image01.png` })
                        .setDescription(`[${req.user.username}](${bot.baseOpts.url}/user/${req.user.id}) added an advertisement to the website.`)
                    bot.siteLogSend(embedGuild)
                })
            }
        })
    });
    app.post('/backend/alert/:alert/update', async function(req, res) {
        let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
        let alertOptions = {
            alertType: req.params.alert,
            title: req.body.title,
            details: req.body.description.replace(/'/gi, "''")
        }
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        bot.connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, userResults) {
            if(userResults[0]) {
                if(userResults[0].perm <= 1) return res.redirect('/403')
                let embed = new MessageEmbed()
                    .setColor(bot.config.colors.discordGreyOne)   
                if(alertOptions.alertType == "homepage") {
                    alertsJson["home"] = {
                        title: alertOptions.title,
                        content: alertOptions.details
                    }
                    fs.writeFile('./src/json/alerts.json', JSON.stringify(alertsJson, null, 4), (err) => {
                        if(err) console.log(err)
                        res.redirect('/staff/alert/settings')
                    })
                    let options = {
                        action: 5,
                        string: `${req.user.username} updated the home-page alert.`
                    }
                    createAudit(bot, options, req.user.username)
                    embed.setFooter({ text: `Alert Update: Home-Page | Disbot.top`, iconURL: `https://disbot.top/assets/images/image01.png` })
                        .setDescription(`[${req.user.username}](${bot.baseOpts.url}/user/${req.user.id}) updated the home-page alert.`)
                    bot.siteLogSend(embed)
                } if(alertOptions.alertType == "botpage") {
                    alertsJson["bot"] = {
                        title: alertOptions.title,
                        content: alertOptions.details
                    }
                    fs.writeFile('./src/json/alerts.json', JSON.stringify(alertsJson, null, 4), (err) => {
                        if(err) console.log(err)
                        res.redirect('/staff/alert/settings')
                    })
                    let options = {
                        action: 5,
                        string: `${req.user.username} updated the bot-page alert.`
                    }
                    createAudit(bot, options, req.user.username)
                    embed.setFooter({ text: `Alert Update: Bot-Page | Disbot.top`, iconURL: `https://disbot.top/assets/images/image01.png` })
                        .setDescription(`[${req.user.username}](${bot.baseOpts.url}/user/${req.user.id}) updated the bot-page alert.`)
                    bot.siteLogSend(embed)
                } if(alertOptions.alertType == "votepage") {
                    alertsJson["vote"] = {
                        title: alertOptions.title,
                        content: alertOptions.details
                    }
                    fs.writeFile('./src/json/alerts.json', JSON.stringify(alertsJson, null, 4), (err) => {
                        if(err) console.log(err)
                        res.redirect('/staff/alert/settings')
                    })
                    let options = {
                        action: 5,
                        string: `${req.user.username} updated the vote-page alert.`
                    }
                    createAudit(bot, options, req.user.username)
                    embed.setFooter({ text: `Alert Update: Vote-Page | Disbot.top`, iconURL: `https://disbot.top/assets/images/image01.png` })
                        .setDescription(`[${req.user.username}](${bot.baseOpts.url}/user/${req.user.id}) updated the vote-page alert.`)
                    bot.siteLogSend(embed)
                } if(alertOptions.alertType == "addbot") {
                    alertsJson["addbot"] = {
                        title: alertOptions.title,
                        content: alertOptions.details
                    }
                    fs.writeFile('./src/json/alerts.json', JSON.stringify(alertsJson, null, 4), (err) => {
                        if(err) console.log(err)
                        res.redirect('/staff/alert/settings')
                    })
                    let options = {
                        action: 5,
                        string: `${req.user.username} updated the add-bot-page alert.`
                    }
                    createAudit(bot, options, req.user.username)
                    embed.setFooter({ text: `Alert Update: Add-Bot-Page | Disbot.top`, iconURL: `https://disbot.top/assets/images/image01.png` })
                        .setDescription(`[${req.user.username}](${bot.baseOpts.url}/user/${req.user.id}) updated the add-bot-page alert.`)
                    bot.siteLogSend(embed)
                } if(alertOptions.alertType == "reportpage") {
                    alertsJson["report"] = {
                        title: alertOptions.title,
                        content: alertOptions.details
                    }
                    fs.writeFile('./src/json/alerts.json', JSON.stringify(alertsJson, null, 4), (err) => {
                        if(err) console.log(err)
                        res.redirect('/staff/alert/settings')
                    })
                    let options = {
                        action: 5,
                        string: `${req.user.username} updated the report-page alert.`
                    }
                    createAudit(bot, options, req.user.username)
                    embed.setFooter({ text: `Alert Update: Report-Page | Disbot.top`, iconURL: `https://disbot.top/assets/images/image01.png` })
                        .setDescription(`[${req.user.username}](${bot.baseOpts.url}/user/${req.user.id}) updated the report-page alert.`)
                    bot.siteLogSend(embed)
                } if(alertOptions.alertType == "advertpage") {
                    alertsJson["advertising"] = {
                        title: alertOptions.title,
                        content: alertOptions.details
                    }
                    fs.writeFile('./src/json/alerts.json', JSON.stringify(alertsJson, null, 4), (err) => {
                        if(err) console.log(err)
                        res.redirect('/staff/alert/settings')
                    })
                    let options = {
                        action: 5,
                        string: `${req.user.username} updated the advertising-page alert.`
                    }
                    createAudit(bot, options, req.user.username)
                    embed.setFooter({ text: `Alert Update: Advert-Page | Disbot.top`, iconURL: `https://disbot.top/assets/images/image01.png` })
                        .setDescription(`[${req.user.username}](${bot.baseOpts.url}/user/${req.user.id}) updated the advert-page alert.`)
                    bot.siteLogSend(embed)
                } if(alertOptions.alertType == "userpage") {
                    alertsJson["user"] = {
                        title: alertOptions.title,
                        content: alertOptions.details
                    }
                    fs.writeFile('./src/json/alerts.json', JSON.stringify(alertsJson, null, 4), (err) => {
                        if(err) console.log(err)
                        res.redirect('/staff/alert/settings')
                    })
                    let options = {
                        action: 5,
                        string: `${req.user.username} updated the user-page alert.`
                    }
                    createAudit(bot, options, req.user.username)
                    embed.setFooter({ text: `Alert Update: User-Page | Disbot.top`, iconURL: `https://disbot.top/assets/images/image01.png` })
                        .setDescription(`[${req.user.username}](${bot.baseOpts.url}/user/${req.user.id}) updated the user-page alert.`)
                    bot.siteLogSend(embed)
                } if(alertOptions.alertType == "apipage") {
                    alertsJson["api"] = {
                        title: alertOptions.title,
                        content: alertOptions.details
                    }
                    fs.writeFile('./src/json/alerts.json', JSON.stringify(alertsJson, null, 4), (err) => {
                        if(err) console.log(err)
                        res.redirect('/staff/alert/settings')
                    })
                    let options = {
                        action: 5,
                        string: `${req.user.username} updated the api-page alert.`
                    }
                    createAudit(bot, options, req.user.username)
                    embed.setFooter({ text: `Alert Update: API-Page | Disbot.top`, iconURL: `https://disbot.top/assets/images/image01.png` })
                        .setDescription(`[${req.user.username}](${bot.baseOpts.url}/user/${req.user.id}) updated the API-page alert.`)
                    bot.siteLogSend(embed)
                } if(alertOptions.alertType == "staffpage") {
                    alertsJson["staff"] = {
                        title: alertOptions.title,
                        content: alertOptions.details
                    }
                    fs.writeFile('./src/json/alerts.json', JSON.stringify(alertsJson, null, 4), (err) => {
                        if(err) console.log(err)
                        res.redirect('/staff/alert/settings')
                    })
                    let options = {
                        action: 5,
                        string: `${req.user.username} updated the staff-page alert.`
                    }
                    createAudit(bot, options, req.user.username)
                    embed.setFooter({ text: `Alert Update: Staff-Page | Disbot.top`, iconURL: `https://disbot.top/assets/images/image01.png` })
                        .setDescription(`[${req.user.username}](${bot.baseOpts.url}/user/${req.user.id}) updated the staff-page alert.`)
                    bot.siteLogSend(embed)
                } 
            }
        })
    });
    app.post('/backend/user/:id/:option/update', function(req, res) {
        let userOptions = {
            userid: req.params.id,
            option: req.params.option
        }
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        if(req.user.id == userOptions.userid) {
            let embed = new MessageEmbed()
                .setColor(bot.config.colors.discordGreyOne)
            if(userOptions.option == "bio") {
                let newBio = req.body.bio.replace(/'/gi, "''");
                axios(`/users/${req.user.id}`).then((resDis) => {
                    var userIcon = `/assets/images/noimage.png`;
                    const userName = resDis.data.username;
                    if(resDis.data.avatar) {
                        userIcon = `https://cdn.discordapp.com/avatars/${resDis.data.id}/${resDis.data.avatar}?size=512`;
                    }
                    bot.connection.query(`UPDATE users SET userIcon = '${userIcon}', userName = '${userName}', bio = '${newBio}' WHERE userId = '${req.user.id}'`, (err, result) => {
                        if (err) console.log(err);
                        res.redirect(`/user/${req.user.id}`)
                        let options = {
                            action: 20,
                            string: `${userName} updated their bio.`
                        }
                        createAudit(bot, options, userName)
                        embed.setFooter({ text: `Bio Updated | Disbot.top`, iconURL: 'https://disbot.top/assets/images/image01.png' })
                            .setDescription(`[${req.user.username}](${bot.baseOpts.url}/user/${req.user.id}) updated their bio.`)
                        bot.siteLogSend(embed)
                    });
                }).catch((err) => {
                    console.log(err);
                });
            } if(userOptions.option == "discord") {
                let discord = req.body.discordlink || "null";
                axios(`/users/${req.user.id}`).then((resDis) => {
                    var userIcon = `/assets/images/noimage.png`;
                    const userName = resDis.data.username;
                    if(resDis.data.avatar) {
                        userIcon = `https://cdn.discordapp.com/avatars/${resDis.data.id}/${resDis.data.avatar}?size=512`;
                    }
                    bot.connection.query(`UPDATE users SET userIcon = '${userIcon}', userName = '${userName}', discordSocial = '${discord}' WHERE userId = '${req.user.id}'`, (err, result) => {
                        if (err) console.log(err);
                        res.redirect(`/user/${req.user.id}`)
                        let options = {
                            action: 25,
                            string: `${userName} updated their Discord social.`
                        }
                        createAudit(bot, options, userName)
                        embed.setFooter({ text: `Social Update | Disbot.top`, iconURL: 'https://disbot.top/assets/images/image01.png' })
                            .setDescription(`[${req.user.username}](${bot.baseOpts.url}/user/${req.user.id}) updated their discord social.`)
                        bot.siteLogSend(embed)
                    });
                }).catch((err) => {
                    console.log(err);
                });
            } if(userOptions.option == "twitter") {
                let twitter = req.body.twitterlink || "null";
                axios(`/users/${req.user.id}`).then((resDis) => {
                    var userIcon = `/assets/images/noimage.png`;
                    const userName = resDis.data.username;
                    if(resDis.data.avatar) {
                        userIcon = `https://cdn.discordapp.com/avatars/${resDis.data.id}/${resDis.data.avatar}?size=512`;
                    }
                    bot.connection.query(`UPDATE users SET userIcon = '${userIcon}', userName = '${userName}', twitterSocial = '${twitter}' WHERE userId = '${req.user.id}'`, (err, result) => {
                        if (err) console.log(err);
                        res.redirect(`/user/${req.user.id}`)
                        let options = {
                            action: 25,
                            string: `${userName} updated their Twitter social.`
                        }
                        createAudit(bot, options, userName)
                        embed.setFooter({ text: `Social Update | Disbot.top`, iconURL: 'https://disbot.top/assets/images/image01.png' })
                            .setDescription(`[${req.user.username}](${bot.baseOpts.url}/user/${req.user.id}) updated their twitter social.`)
                        bot.siteLogSend(embed)
                    });
                }).catch((err) => {
                    console.log(err);
                });
            } if(userOptions.option == "github") {
                let github = req.body.githublink || "null";
                axios(`/users/${req.user.id}`).then((resDis) => {
                    var userIcon = `/assets/images/noimage.png`;
                    const userName = resDis.data.username;
                    if(resDis.data.avatar) {
                        userIcon = `https://cdn.discordapp.com/avatars/${resDis.data.id}/${resDis.data.avatar}?size=512`;
                    }
                    bot.connection.query(`UPDATE users SET userIcon = '${userIcon}', userName = '${userName}', githubSocial = '${github}' WHERE userId = '${req.user.id}'`, (err, result) => {
                        if (err) console.log(err);
                        res.redirect(`/user/${req.user.id}`)
                        let options = {
                            action: 25,
                            string: `${userName} updated their Github social.`
                        }
                        createAudit(bot, options, userName)
                        embed.setFooter({ text: `Social Update | Disbot.top`, iconURL: 'https://disbot.top/assets/images/image01.png' })
                            .setDescription(`[${req.user.username}](${bot.baseOpts.url}/user/${req.user.id}) updated their github social.`)
                        bot.siteLogSend(embed)
                    });
                }).catch((err) => {
                    console.log(err);
                });
            }
        }
    });
    app.post('/backend/bot/add', function(req, res) {
        bot.connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, result) {
            if(result[0]) {
                if(result[0].postban) {
                    let options = {
                        action: 32,
                        string: `${req.user.username} (${req.user.id}) tried to add bot while post-banned.`
                    }
                    createAudit(bot, options, req.user.username)
                    return res.redirect('/postban')
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
                        var botIcon = `${bot.baseOpts.url}/assets/images/noimage.png`;
                        const botName = resDis.data.username.replace(/'/gi, "''");
                        if(resDis.data.avatar) {
                            botIcon = `https://cdn.discordapp.com/avatars/${botId}/${resDis.data.avatar}.png?size=512`;
                        }
                        let newAuthToken = createid(35)
                        bot.connection.query(`INSERT INTO bots (botId, botName, botIcon, otherOwners, creatorId, creatorName, createDate, prefix, prefixChange, shortDesc, inviteUrl, supportGuild, websiteLink, GithubLink, donateLink, library, longDesc, tagFun, tagGames, tagMusic, tagEco, tagMod, tagAutomod, tagLeveling, tagSocial, votes, avgRating, certified, hidden, nsfwContent, pending, authToken, shorturl, tagUtility) VALUES ('${botId}', '${botName}', '${botIcon}', '${otherOwners}', '${creatorId}', '${creatorName}', '${createDate}', '${prefix}', ${prefixChange}, '${shortDesc}', '${inviteUrl}', '${supportGuild}', '${websiteLink}', '${GithubLink}', '${donateLink}', '${library}', '${longDesc}', ${tagFun}, ${tagGames}, ${tagMusic}, ${tagEco}, ${tagMod}, ${tagAutomod}, ${tagLeveling}, ${tagSocial}, 0, '0', false, true, ${nsfwContent}, true, '${newAuthToken}', '${shorturl}', ${tagUtility})`, function (err, result) {
                            if (err) console.log(err);
                            res.redirect(`/bot/${botId}`)
                        });
        
                        const embedGuild = new MessageEmbed()
                            .setColor(bot.config.colors.orange)
                            .setTitle(`Bot Pending - ${botName}`)
                            .setDescription(`**✧ Bot:** ${botName}\n**✧ ID:** ${botId}\n\n**✧ Added by:** ${creatorName}\n**✧ Time:** ${createDate.toLocaleString()}\n\n**✧ Status:** Pending - [View](${bot.baseOpts.url}/bot/${botId})`)
                            .setThumbnail(botIcon)
                            .setURL(`${bot.baseOpts.url}/bot/${botId}`)
                            .setFooter({ text: `Bot: ${botName} | Status: Pending`, iconURL: `https://disbot.top/assets/images/image01.png` })
                        bot.pingReviewer(bot.config.discordInformation.channels.weblogs)
                        setTimeout(() => { bot.webLogSend(embedGuild) }, 500)
    
                        const embedUser = new MessageEmbed()
                            .setColor(bot.config.colors.orange)
                            .setTitle(`${botName} is now pending approval`)
                            .setDescription(`**✧ Bot:** ${botName}\n**✧ ID:** ${botId}\n\n**✧ Status:** Pending\nThis bot is now pending to be reviewed by our review team. Please be patient while we look over your bot to ensure its safe for our community.`)
                            .setURL(`${bot.baseOpts.url}/bot/${botId}`)
                            .setFooter({ text: `Bot: ${botName} | Status: Pending`, iconURL: `https://disbot.top/assets/images/image01.png` })
                        let user = bot.users.cache.get(creatorId)
                        if(user) {
                            try {
                                user.send({ embeds: [embedUser] })
                            } catch (err) {}
                        }

                        let options = {
                            action: 1,
                            string: `${creatorName} added ${botName} (${botId}) to listing. - Pending Approval`
                        }
                        createAudit(bot, options, req.user.username)
                    }).catch((err) => {
                        console.log(err);
                        res.redirect('/')
                    });
                }
            }
        })
    });
    app.post('/backend/bot/:id/report', function(req, res) {
        let reportOptions = {
            botid: req.params.id,
            creatorid: req.user.id,
            creatorname: req.user.username+'#'+req.user.discriminator.replace(/'/gi, "''"),
            createdate: new Date(),
            reason: req.body.reason || "Other",
            addinfo: req.body.addinfo || null
        }
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        bot.connection.query(`INSERT INTO reports (active, creatorId, creatorName, botId, reason, addInfo, date) VALUES (true, '${reportOptions.creatorid}', '${reportOptions.creatorname}', '${reportOptions.botid}', '${reportOptions.reason}', '${reportOptions.addinfo}', '${reportOptions.createdate}')`, function(err, results) {
            bot.connection.query(`SELECT * FROM bots WHERE botId = '${reportOptions.botid}'`, function(err, botResult) {
                if(botResult[0]) {
                    let options = {
                        action: 6,
                        string: `${req.user.username} reported ${botResult[0].botName} (${botResult[0].botId})`
                    }
                    createAudit(bot, options, req.user.username)
                    res.redirect(`/bot/${reportOptions.botid}`)
                    const embedGuild = new MessageEmbed()
                        .setColor(bot.config.colors.red)
                        .setFooter({ text: `Bot Reported | Disbot.top`, iconURL: "https://disbot.tp/assets/images/image01.png" })
                        .setTitle(`New Report`)
                        .setDescription(`**✧ Bot ID:** ${botResult[0].botId}\n**✧ Bot Name:** [${botResult[0].botName}](${bot.baseOpts.url}/bot/${botResult[0].botId})\n**✧ Reporter:** [${reportOptions.creatorname}](${bot.baseOpts.url}/user/${reportOptions.creatorid})\n**✧ Time:** ${reportOptions.createdate.toLocaleString()}\n\n**✧ Details:** ${reportOptions.reason}\n\n[View Reports](${bot.baseOpts.url}/staff/reports)`)
                        .setURL(`${bot.baseOpts.url}/staff/reports`)
                    bot.siteLogSend(embedGuild)
                }
            })
        })
    });
    app.post('/backend/bot/:id/changelog/add', function(req, res) {
        let changelogOptions = {
            botid: req.params.id,
            version: req.body.changeVersion,
            title: req.body.changeTitle.replace(/'/gi, "''") || "none",
            description: req.body.changeDetails.replace(/'/gi, "''") || "none",
            date: new Date().toLocaleString()
        }
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        bot.connection.query(`SELECT * FROM bots WHERE botId = '${changelogOptions.botid}'`, async function(err, botResult) {
            if(botResult[0]) {
                if(req.user.id == botResult[0].creatorId || botResult[0].otherOwners.includes(req.user.id)) {
                    bot.connection.query(`INSERT INTO botchangelogs (botId, userName, change_date, change_title, change_version, change_details) VALUES ('${changelogOptions.botid}','${req.user.username}','${changelogOptions.date}','${changelogOptions.title}','${changelogOptions.version}','${changelogOptions.description}')`, async function(err, results) {
                        let options = {
                            action: 15,
                            string: `${req.user.username} added a new changelog for ${botResult[0].botName} (${botResult[0].botId})`
                        }
                        createAudit(bot, options, req.user.username)
                        res.redirect(`/bot/${changelogOptions.botid}/changelogs`)
    
                        const embedGuild = new MessageEmbed()
                            .setColor(bot.config.colors.discordGreyOne)
                            .setFooter({ text: `Changelog Creation: ${botResult[0].botName}`, iconURL: `https://disbot.top/assets/images/image01.png` })
                            .setURL(`${bot.baseOpts.url}/bot/${changelogOptions.botid}/changelogs`)
                            .setTitle(`${botResult[0].botName}'s Changelogs`)
                            .setThumbnail(botResult[0].botIcon)
                            .setTimestamp()
                            .setDescription(`${req.user.username} has created a changelog for ${botResult[0].botName} (${changelogOptions.botid})`)
                        bot.webLogSend(embedGuild)
                    })
                }
            }
        })
    });
    app.post('/backend/bot/:id/edit', function(req, res) {
        let botId = req.params.id;
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
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
            bot.connection.query(`UPDATE bots SET botName = '${botName}', botIcon = '${botIcon}', otherOwners = '${otherOwners}', prefix = '${prefix}', prefixChange = ${prefixChange}, nsfwContent = ${nsfwContent}, certified = ${certified}, shortDesc = '${shortDesc}', inviteUrl = '${inviteUrl}', supportGuild = '${supportGuild}', websiteLink = '${websiteLink}', GithubLink = '${GithubLink}', donateLink = '${donateLink}', library = '${library}', longDesc = '${longDesc}', tagFun = ${tagFun}, tagGames = ${tagGames}, tagMusic = ${tagMusic}, tagEco = ${tagEco}, tagMod = ${tagMod}, tagAutomod = ${tagAutomod}, tagLeveling = ${tagLeveling}, tagSocial = ${tagSocial}, shorturl = '${shorturl}', tagUtility = ${tagUtility} WHERE botId = '${botId}'`, (err, result) => {
                if (err) console.log(err);
                res.redirect(`/bot/${botId}`)
                let options = {
                    action: 2,
                    string: `${req.user.username} edited ${botName} (${botId})`
                }
                createAudit(bot, options, req.user.username)
                const embedGuild = new MessageEmbed()
                    .setColor(bot.config.colors.discordGreyOne)
                    .setURL(`${bot.baseOpts.url}/bot/${botId}`)
                    .setFooter({ text: `Bot Edit | Disbot.top`, iconURL: `https://disbot.top/assets/images/image01.png` })
                    .setTitle(`${botName}'s Page`)
                    .setThumbnail(botIcon)
                    .setTimestamp()
                    .setDescription(`${req.user.username} has edited ${botName} (${botId}).`)
                bot.webLogSend(embedGuild)
            });
    
        }).catch((err) => {
            console.log(err);
            res.redirect('/')
        });
    });
    app.post('/backend/bot/:id/vote', function(req, res) {
        let voteOptions = {
            botid: req.params.id,
            creatorid: req.user.id,
            createdate: new Date(),
            rating: req.body.rating || 0
        }
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        bot.connection.query(`INSERT INTO votes (botId, userId, rating, date) VALUES ('${voteOptions.botid}', '${voteOptions.creatorid}', '${voteOptions.rating}', '${voteOptions.createdate}')`, function(err, results) {
            bot.connection.query(`SELECT * FROM votes WHERE botId = '${voteOptions.botid}'`, function(err, voteResults) {
                let ratingArray = []
                if(voteResults) {
                    voteResults.forEach(element => {
                        ratingArray.push(element.rating)
                    })
                }
                let newRating = Math.round(ratingArray.reduce(function(a,b) { return a + b }) / ratingArray.length)
                bot.connection.query(`UPDATE bots SET votes = votes + 1, avgRating = '${newRating}' WHERE botId = '${voteOptions.botid}'`, function(err, results) {
                    bot.connection.query(`SELECT * FROM bots WHERE botId = '${voteOptions.botid}'`, function(err, botResults) {
                        if(botResults[0]) {
                            let options = {
                                action: 4,
                                string: `${req.user.username} has up-voted ${botResults[0].botName} (${botResults[0].botId}).`
                            }
                            createAudit(bot, options, req.user.username)
                            res.redirect(`/bot/${voteOptions.botid}`)
                            const embedGuild = new MessageEmbed()
                                .setColor(bot.config.colors.discordGreyOne)
                                .setURL(`${bot.baseOpts.url}/bot/${voteOptions.botid}`)
                                .setTitle(`${botResults[0].botName}'s Page`)
                                .setFooter({ text: `Bot Vote | Disbot.top`, iconURL: `https://disbot.top/assets/images/image01.png` })
                                .setTimestamp()
                                .setDescription(`[${req.user.username}](${bot.baseOpts.url}/user/${req.user.id}) has up-voted [${botResults[0].botName}](${botResults[0].botId})`)
                            bot.webLogSend(embedGuild)
                        } 
                    })
                })
            })
        })
    });
    app.post('/backend/ticket/create', function(req, res) {
        let ticketOptions = {
            creatorid: req.body.recipiant || req.user.id,
            creatorname: req.user.username+'#'+req.user.discriminator.replace(/'/gi, "''"),
            createdate: new Date(),
            details: req.body.details.replace(/'/gi, "''")
        }
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        if(req.body.recipiant) {
            bot.connection.query(`UPDATE users SET notifications = notifications + 1 WHERE userId = '${ticketOptions.creatorid}'`, (err, result) => {
                if (err) console.log(err);
            }); 
        }
        bot.connection.query(`INSERT INTO contacts (active, userId, userName, lastUpdated, createDate, openComment) VALUES (true, '${ticketOptions.creatorid}', '${ticketOptions.creatorname}', '${ticketOptions.createdate}', '${ticketOptions.createdate}', '${ticketOptions.details}')`, function(err, results) {
            let options = {
                action: 9,
                string: `${req.user.username} created a ticket.`
            }
            createAudit(bot, options, req.user.username)
            res.redirect(`/ticket/${result.insertId}/view`)
    
            const embedGuild = new MessageEmbed()
                .setColor(bot.config.colors.discordGreyOne)
                .setFooter({ text: `${ticketOptions.createdate.toLocaleString()} | ${ticketOptions.creatorname}`, iconURL: `https://disbot.top/assets/images/image01.png` })
                .setTitle(`Ticket Created | ID: ${results.insertId}`)
                .setDescription(`[View](${bot.baseOpts.url}/ticket/view/${result.insertId})\n\nComment: ${details}`)
                .setURL(`${bot.baseOpts.url}/ticket/${result.insertId}/view`)
            bot.pingReviewer(bot.config.discordInformation.channels.sitelogs)
            setTimeout(() => { bot.siteLogSend(embedGuild) }, 200)

            if(req.body.recipiant) {
                const embedUser = new MessageEmbed()
                    .setColor(bot.config.colors.discordGreyOne)
                    .setFooter({ text: `${ticketOptions.createdate.toLocaleString()}`, iconURL: `https://disbot.top/assets/images/image01.png` })
                    .setTitle(`Ticket Opened to You | ID: ${result.insertId}`)
                    .setDescription(`Disbot.top Staff has sent you a message via ticket, view details below.\n\nComment: ${details}\n\n[Reply Here](${bot.baseOpts.url}/ticket/view/${result.insertId})`)
                    .setURL(`${bot.baseOpts.url}/ticket/view/${result.insertId}`)
                let user = bot.users.cache.get(req.body.recipiant)
                if(user) {
                    try {
                        user.send({ embeds: [embedUser] })
                    } catch (error) {}
                }
            } else {
                const embedUser = new MessageEmbed()
                    .setColor(bot.config.colors.discordGreyOne)
                    .setFooter({ text: `${ticketOptions.createdate.toLocaleString()}`, iconURL: `https://disbot.top/assets/images/image01.png` })
                    .setTitle(`Ticket Submitted | ID: ${result.insertId}`)
                    .setDescription(`Comment: ${details}`)
                    .setURL(`${bot.baseOpts.url}/ticket/view/${result.insertId}`)
                let user = bot.users.cache.get(req.user.id)
                if(user) {
                    try {
                        user.send({ embeds: [embedUser] })
                    } catch (error) {}
                }
            }
        })
    });
    app.post('/backend/endpoint/add', function(req, res) {
        let endpointOptions = {
            title: req.body.endTitle || "none",
            method: req.body.endMethod || "none",
            url: req.body.endURL || "none",
            description: req.body.endDesc.replace(/'/gi, "''") || "none"
        }
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        bot.connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, userResult) {
            if(userResult[0]) {
                if(userResult[0].perm <= 1) return res.redirect('/403')
                bot.connection.query(`INSERT INTO apidocs (endpoint_title,endpoint_method,endpoint_url,endpoint_desc) VALUES ('${endpointOptions.title}', '${endpointOptions.method}', '${endpointOptions.url}', '${endpointOptions.description}')`, function(err, result) {
                    let options = {
                        action: 18,
                        string: `${req.user.username} created a API endpoint for docs.`
                    }
                    createAudit(bot, options, req.user.username)
                    res.redirect('/staff/api/settings')
                })
            }
        })
    });
    app.post('/backend/comment/:id/create', function(req, res) {
        let ticketOptions = {
            ticketid: req.params.id,
            creatorid: req.user.id,
            creatorname: req.user.username+'#'+req.user.discriminator.replace(/'/gi, "''"),
            createdate: new Date(),
            solved: req.body.marksolved || true,
            details: req.body.details.replace(/'/gi, "''")
        }
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        bot.connection.query(`SELECT * FROM contacts WHERE id = '${ticketOptions.ticketid}'`, function(err, ticketResults) {
            if(ticketResults[0].userId !== req.user.id) {
                bot.connection.query(`UPDATE users SET notifications = notifications + 1 WHERE userId = '${ticketResults[0].userId}'`, (err, result) => {
                    if (err) console.log(err);
                });
            }
            bot.connection.query(`UPDATE contacts SET lastUpdated = '${ticketOptions.createdate}', active = ${ticketOptions.solved} WHERE id = ${ticketOptions.ticketid}`, (err, result) => {
                bot.connection.query(`INSERT INTO contactComments (contactId, userId, userName, createDate, comment) VALUES (${ticketOptions.ticketid}, '${ticketOptions.creatorid}', '${ticketOptions.creatorname}', '${ticketOptions.createdate}', '${ticketOptions.details}')`, function (err, result) {
                    res.redirect(`/ticket/${ticketOptions.ticketid}/view`);
                    let options = {
                        action: 17,
                        string: `${req.user.username} commented on a ticket.`
                    }
                    createAudit(bot, options, req.user.username)
                    const embedGuild = new MessageEmbed()
                        .setColor(bot.config.colors.discordGreyOne)
                        .setTitle(`New Comment | Ticket: ${ticketOptions.ticketid}`)
                        .setDescription(`**✧ ID:** ${ticketOptions.ticketid}\n**✧ Comment by:** ${ticketOptions.creatorname}\n\n**✧ Comment:**\n${ticketOptions.details}\n\n[View](${bot.baseOpts.url}/ticket/${ticketOptions.ticketid}/view)`)
                        .setURL(`${bot.baseOpts.url}/ticket/${ticketOptions.ticketid}/view`)
                        .setFooter({ text: `From: ${ticketOptions.creatorname} | Message via website.`, iconURL: `https://disbot.top/assets/images/image01.png` })
                    bot.pingReviewer(bot.config.discordInformation.channels.sitelogs)
                    setTimeout(() => { bot.siteLogSend(embedGuild) }, 500)
                    const embedMessage = new MessageEmbed()
                        .setColor(bot.config.colors.discordGreyOne)
                        .setTitle(`New Comment | Ticket: ${ticketOptions.ticketid}`)
                        .setURL(`${bot.baseOpts.url}/ticket/${ticketOptions.ticketid}/view`)
                        .setDescription(`**✧ ID:** ${ticketOptions.ticketid}\n\n**✧ Comment:**\n${ticketOptions.details}\n\n[View](${bot.baseOpts.url}/ticket/${ticketOptions.ticketid}/view)`)
                        .setFooter({ text: `From: ${ticketOptions.creatorname} | Message via website.`, iconURL: `https://disbot.top/assets/images/image01.png` })
                    bot.ticketSend(ticketOptions.ticketid, embedMessage)
                });
            })
        })
    });
    app.post('/backend/partner/add', function(req, res) {
        let partnerOptions = {
            name: req.body.partnerName,
            description: req.body.partnerDesc.replace(/'/gi, "''"),
            image: req.body.partnerImage,
            link: req.body.partnerLink
        }
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        bot.connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, userResult) {
            if(userResult[0]) {
                if(userResult[0].perm <= 1) return res.redirect('/403')
                bot.connection.query(`INSERT INTO partners (p_name, p_desc, p_link, p_image) VALUES ('${partnerOptions.name}', '${partnerOptions.description}', '${partnerOptions.link}', '${partnerOptions.image}')`, function(err, result) {
                    if(err) console.log(err)
                    res.redirect('/staff/partner/settings')
                    let options = {
                        action: 31,
                        string: `${req.user.username} has added a partner to the website.`
                    }
                    createAudit(bot, options, req.user.username)
                    const embedGuild = new MessageEmbed()
                        .setColor(bot.config.colors.discordGreyOne)
                        .setFooter({ text: `Partner Add | Disbot.top`, iconURL: `https://disbot.top/assets/images/image01.png` })
                        .setDescription(`[${req.user.username}](${bot.baseOpts.url}/user?${req.user.id}) has added a partner to the website.`)
                    bot.siteLogSend(embedGuild)
                })
            }
        })
    });
    app.post('/backend/bot/deny', function(req, res) {
        let denyOptions = {
            botid: req.body.botspend,
            denyby: req.user.username+'#'+req.user.discriminator.replace(/'/gi, "''"),
            denydate: new Date(),
            denyreason: req.body.denyreason
        }
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        bot.connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, userResults) {
            if(userResults[0]) {
                if(userResults[0].perm <= 0) return res.redirect('/403')
                bot.connection.query(`SELECT * FROM bots WHERE botId = '${denyOptions.botid}'`, function(err, botResult) {
                    if(botResult[0]) {
                        let options = {
                            action: 8,
                            string: `${req.user.username} denied ${botResult[0].botName} (${botResult[0].botId})`
                        }
                        createAudit(bot, options, req.user.username)
                        const embedGuild = new MessageEmbed()
                            .setColor(bot.config.colors.red)
                            .setTitle(`Bot Denied - ${botResult[0].botName}`)
                            .setDescription(`**✧ Bot:** ${botResult[0].botName}\n**✧ ID:** ${denyOptions.botid}\n\n**✧ Denied by:** ${denyOptions.denyby}\n**✧ Time:** ${denyOptions.denydate.toLocaleString()}\n\n**✧ Reason:** ${denyOptions.denyreason}\n\n**✧ Status:** Denied`)
                            .setThumbnail(botResult[0].botIcon)
                            .setURL(`https://disbot.top/`)
                            .setFooter({ text: `Bot: ${botResult[0].botName} | Status: Denied`, iconURL: `https://disbot.top/assets/images/image01.png` })
                        let channel = bot.channels.cache.get(bot.config.discordInformation.channels.weblogs)
                        if(channel) {
                            channel.send({ embeds: [embedGuild] })
                        }
                        const embedUser = new MessageEmbed()
                            .setColor(bot.config.colors.discordGreyOne)
                            .setTitle(`${botResult[0].botName} is now Denied`)
                            .setDescription(`**✧ Bot:** ${botResult[0].botName}\n**✧ ID:** ${denyOptions.botid}\n**✧ Denied by:** ${denyOptions.denyby}\n\n**✧ Reason:** ${denyOptions.denyreason}\n\n**✧ Status:** Denied`)
                            .setURL(`https://disbot.top`)
                            .setFooter({ text: `Bot: ${botResult[0].botName} | Status: Denied`, iconURL: `https://disbot.top/assets/images/image01.png` })
                        let user = bot.users.cache.get(botResult[0].creatorId)
                        if(user) {
                            try {
                                user.send({ embeds: [embedUser] })
                            } catch (err) {}
                        }
                        setTimeout(() => {
                            bot.connection.query(`DELETE FROM bots WHERE botId = '${denyOptions.botid}'`, function(err, result) {
                                if(err) console.log(err)
                                res.redirect('/staff/bots/pending')
                            })
                        }, 1000)
                    }
                })
            }
        })
    });
    app.get('/backend/:id/permissions/remove', function(req, res) {
        let userid = req.params.id
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        bot.connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, userResult) {
            if(userResult[0]) {
                if(userResult[0].perm <= 1) return res.redirect('/403')
                bot.connection.query(`UPDATE users SET perm = 0 WHERE userId = '${userid}'`, function(err, result) {
                    bot.connection.query(`SELECT * FROM users WHERE userId = '${userid}'`, function(err, userResults) {
                        if(results[0]) {
                            let options = {
                                action: 1,
                                string: `${req.user.username} updated ${userResults[0].userName} (${userResults[0].userId}) permission to User.`
                            }
                            createAudit(bot, options, req.user.username)
                            res.redirect('/staff/permissions')
                            const embedGuild = new MessageEmbed()
                                .setColor(bot.config.colors.discordGreyOne)
                                .setFooter({ text: `Permission Update | Disbot.top`, iconURL: `https://disbot.top/assets/images/image01.png` })
                                .setDescription(`[${req.user.username}](${bot.baseOpts.url}/user/${req.user.id}) has removed [${userResults[0].userName}](${bot.baseOpts.url}/user/${userResults[0].userId}) from their staff position.`)
                            bot.siteLogSend(embedGuild)
                        }
                    })
                })
            }
        })
    });
    app.get('/backend/endpoint/:id/remove', function(req, res) {
        let endid = req.params.id
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        bot.connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, userResult) {
            if(userResult[0]) {
                if(userResult[0].perm <= 1) return res.redirect('/403')
                bot.connection.query(`DELETE FROM apidocs WHERE id = '${endid}'`, function(err, results) {
                    let options = {
                        action: 19,
                        string: `${req.user.username} deleted an API endpoint from docs.`
                    }
                    createAudit(bot, options, req.user.username)
                    res.redirect('/staff/api/settings')
                })
            }
        })
    });
    app.get('/backend/report/:id/complete', function(req, res) {
        let reportid = req.params.id
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        bot.connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, userResults) {
            if(userResults[0]) {
                if(userResults[0].perm <= 0) return res.redirect('/403')
                bot.connection.query(`UPDATE reports SET active = false WHERE id = '${reportid}'`, function(err, results) {
                    let options = {
                        action: 10,
                        string: `${req.user.username} completed a report: (${reportid}).`
                    }
                    createAudit(bot, options, req.user.username)
                    res.redirect('/staff/reports/pending')
                    const embedGuild = new MessageEmbed()
                        .setColor(bot.config.colors.discordGreyOne)
                        .setFooter({ text: `Report Completed | Disbot.top`, iconURL: `https://disbot.top/assets/images/image01.png` })
                        .setDescription(`[${req.user.username}](${bot.baseOpts.url}/user?${req.user.id}) has completed report: (${reportid})`)
                    bot.siteLogSend(embedGuild)
                })
            }
        })
    });
    app.get('/backend/bot/:id/:boostType/:boostAmount', function(req, res) {
        let boostOptions = {
            botid: req.params.id,
            boostType: req.params.boostType,
            boostAmount: req.params.boostAmount
        }
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        bot.connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, userResults) {
            if(userResults[0]) {
                if(userResults[0].perm <= 1) return res.redirect('/403')
                if(boostOptions.boostType == "boost") {
                    bot.connection.query(`UPDATE bots SET votes = votes + ${boostOptions.boostAmount} WHERE botId = '${boostOptions.botid}'`, function(err, results) {
                        bot.connection.query(`SELECT * FROM bots WHERE botId = '${boostOptions.botid}'`, function(err, botResult) {
                            if(botResult[0]) {
                                let options = {
                                    action: 12,
                                    string: `${req.user.username} has boosted ${botResult[0].botName} (${botResult[0].botId}).`
                                }
                                createAudit(bot, options, req.user.username)
                                res.redirect(`/bot/${boostOptions.botid}`)
                                const embedGuild = new MessageEmbed()
                                    .setColor(bot.config.colors.discordGreyOne)
                                    .setFooter({ text: `Bot Unboosted | Disbot.top`, iconURL: `https://disbot.top/assets/images/image01.png` })
                                    .setDescription(`[${req.user.username}](${bot.baseOpts.url}/user?${req.user.id}) boosted [${botResult[0].botName}](${bot.baseOpts.url}/bot/${botResult[0].botId}) votes by ${boostOptions.boostAmount} boost.`)
                                bot.siteLogSend(embedGuild)
                            }
                        })
                    })
                } if(boostOptions.boostType == "unboost") {
                    bot.connection.query(`UPDATE bots SET votes = votes - ${boostOptions.boostAmount} WHERE botId = '${boostOptions.botid}'`, function(err, results) {
                        bot.connection.query(`SELECT * FROM bots WHERE botId = '${boostOptions.botid}'`, function(err, botResult) {
                            if(botResult[0]) {
                                let options = {
                                    action: 13,
                                    string: `${req.user.username} has unboosted ${botResult[0].botName} (${botResult[0].botId}).`
                                }
                                createAudit(bot, options, req.user.username)
                                res.redirect(`/bot/${boostOptions.botid}`)
                                const embedGuild = new MessageEmbed()
                                    .setColor(bot.config.colors.discordGreyOne)
                                    .setFooter({ text: `Bot Unboosted | Disbot.top`, iconURL: `https://disbot.top/assets/images/image01.png` })
                                    .setDescription(`[${req.user.username}](${bot.baseOpts.url}/user?${req.user.id}) unboosted [${botResult[0].botName}](${bot.baseOpts.url}/bot/${botResult[0].botId}) votes by ${boostOptions.boostAmount} boost.`)
                                bot.siteLogSend(embedGuild)
                            }
                        })
                    })
                }
            }
        })
    });
    app.get('/backend/bot/:id/regen', function(req, res) {
        let botid = req.params.id
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        bot.connection.query(`SELECT * FROM bots WHERE botId = '${botid}'`, function(err, botResult) {
            if(botResult[0]) {
                if(botResult[0].creatorId == req.user.id) {
                    let newToken = createid(35)
                    bot.connection.query(`UPDATE bots SET authToken = '${newToken}' WHERE botId = '${botid}'`, function(err, result) {
                        let options = {
                            action: 26,
                            string: `${req.user.username} regenerated the authorization token for ${botResult[0].botName} (${botResult[0].botId})`
                        }
                        createAudit(bot, options, req.user.username)
                        res.redirect('/api/bottokens')
                        const embedGuild = new MessageEmbed()
                            .setColor(bot.config.colors.discordGreyOne)
                            .setFooter({ text: `Token Regeneration | Disbot.top`, iconURL: `https://disbot.top/assets/images/image01.png` })
                            .setDescription(`[${req.user.username}](${bot.baseOpts.url}/user?${req.user.id}) regenerated authorization token for [${botResult[0].botName}](${bot.baseOpts.url}/bot/${botResult[0].botId})`)
                        bot.siteLogSend(embedGuild)
                    })
                } else {
                    return res.redirect('/403')
                }
            }
        })
    });
    app.get('/backend/bot/:id/delete', function(req, res) {
        let botid = req.params.id
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        bot.connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, userResult) {
            if(userResult[0]) {
                if(userResult[0].perm <= 1) return res.redirect('/403')
                bot.connection.query(`SELECT * FROM bots WHERE botId = '${botid}'`, function(err, botResult) {
                    if(botResult[0]) {
                        let options = {
                            action: 11,
                            string: `${req.user.username} deleted ${botResult[0].botName} (${botResult[0].botId}) from the listing.`
                        }
                        createAudit(bot, options, req.user.username)
                        const embedGuild = new MessageEmbed()
                            .setColor(bot.config.colors.discordGreyOne)
                            .setFooter({ text: `Bot Deleted | Disbot.top`, iconURL: `https://disbot.top/assets/images/image01.png` })
                            .setDescription(`[${req.user.username}](${bot.baseOpts.url}/user?${req.user.id}) has deleted [${botResult[0].botName}](${bot.baseOpts.url}/bot/${botResult[0].botId}) from the listing.`)
                        bot.siteLogSend(embedGuild)
                    }
                })
                setTimeout(() => {
                    bot.connection.query(`DELETE FROM bots WHERE botId = '${botid}'`, function(err, results) {
                        res.redirect('/')
                    })
                }, 500)
            }
        })
    });
    app.get('/backend/advertise/:id/remove', function(req, res) {
        let adid = req.params.id
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        bot.connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, userResult) {
            if(userResult[0]) {
                if(userResult[0].perm <= 1) return res.redirect('/403')
                bot.connection.query(`DELETE FROM adverts WHERE id = '${adid}'`, function(err, results) {
                    let options = {
                        action: 28,
                        string: `${req.user.username} removed a advertisment from the website.`
                    }
                    createAudit(bot, options, req.user.username)
                    res.redirect('/staff/advert/settings')
                    const embedGuild = new MessageEmbed()
                        .setColor(bot.config.colors.discordGreyOne)
                        .setFooter({ text: `Hidden Status | Disbot.top`, iconURL: `https://disbot.top/assets/images/image01.png` })
                        .setDescription(`[${req.user.username}](${bot.baseOpts.url}/user?${req.user.id}) has removed a advertisment from the website.`)
                    bot.siteLogSend(embedGuild)
                })
            }
        })
    });
    app.get('/backend/partner/:id/remove', function(req, res) {
        let partnerid = req.params.id
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        bot.connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, userResult) {
            if(userResult[0]) {
                if(userResult[0].perm <= 1) return res.redirect('/403')
                bot.connection.query(`DELETE FROM partners WHERE id = '${partnerid}'`, function(err, results) {
                    res.redirect('/staff/partner/settings')
                    let options = {
                        action: 30,
                        string: `${req.user.username} has removed a partner from the website.`
                    }
                    createAudit(bot, options, req.user.username)
                    const embedGuild = new MessageEmbed()
                        .setColor(bot.config.colors.discordGreyOne)
                        .setFooter({ text: `Partner Remove | Disbot.top`, iconURL: `https://disbot.top/assets/images/image01.png` })
                        .setDescription(`[${req.user.username}](${bot.baseOpts.url}/user?${req.user.id}) has removed a partner from the website.`)
                    bot.siteLogSend(embedGuild)
                })
            }
        })
    });
    app.get('/backend/bot/:id/hide', function(req, res) {
        let botid = req.params.id
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        bot.connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, userResult) {
            if(userResult[0]) {
                if(userResult[0].perm <= 0) return res.redirect('/403')
                bot.connection.query(`SELECT * FROM bots WHERE botId = '${botid}'`, function(err, botResult) {
                    if(botResult[0]) {
                        if(botResult[0].hidden) {
                            bot.connection.query(`UPDATE bots SET hidden = false WHERE botId = '${botid}'`, function(err, result) {
                                let options = {
                                    action: 14,
                                    string: `${req.user.username} unhidden ${botResult[0].botName} (${botResult[0].botId}) from listing.`
                                }
                                createAudit(bot, options, req.user.username)
                                res.redirect(`/bot/${botid}`)
                                const embedGuild = new MessageEmbed()
                                    .setColor(bot.config.colors.discordGreyOne)
                                    .setFooter({ text: `Hidden Status | Disbot.top`, iconURL: `https://disbot.top/assets/images/image01.png` })
                                    .setDescription(`[${req.user.username}](${bot.baseOpts.url}/user?${req.user.id}) unhidden [${botResult[0].botName}](${bot.baseOpts.url}/bot/${botResult[0].botId}) from listing.`)
                                bot.siteLogSend(embedGuild)
                            })
                        } else {
                            bot.connection.query(`UPDATE bots SET hidden = true WHERE botId = '${botid}'`, function(err, result) {
                                let options = {
                                    action: 14,
                                    string: `${req.user.username} hidden ${botResult[0].botName} (${botResult[0].botId}) from listing.`
                                }
                                createAudit(bot, options, req.user.username)
                                res.redirect(`/bot/${botid}`)
                                const embedGuild = new MessageEmbed()
                                    .setColor(bot.config.colors.discordGreyOne)
                                    .setFooter({ text: `Hidden Status | Disbot.top`, iconURL: `https://disbot.top/assets/images/image01.png` })
                                    .setDescription(`[${req.user.username}](${bot.baseOpts.url}/user?${req.user.id}) hidden [${botResult[0].botName}](${bot.baseOpts.url}/bot/${botResult[0].botId}) from listing.`)
                                bot.siteLogSend(embedGuild)
                            })
                        }
                    }
                })
            }
        })
    });
    app.get('/backend/bot/:id/approve', function(req, res) {
        let approveOptions = {
            botid: req.params.id,
            approveby: req.user.username+'#'+req.user.discriminator.replace(/'/gi, "''"),
            approvedate: new Date()
        }
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        bot.connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, userResult) {
            if(userResult[0]) {
                if(userResult[0].perm <= 0) return res.redirect('/403')
                bot.connection.query(`UPDATE bots SET pending = false, hidden = false WHERE botId = '${approveOptions.botid}'`, function(err, results) {
                    bot.connection.query(`SELECT * FROM bots WHERE botId = '${approveOptions.botid}'`, function(err, botResults) {
                        if(botResults[0]) {
                            let options = {
                                action: 7,
                                string: `${req.user.username} has approved ${botResults[0].botName} (${botResults[0].botId})`
                            }
                            createAudit(bot, options, req.user.username)
                            res.redirect(`/staff/bots/pending`)
                            const embedGuild = new MessageEmbed()
                                .setColor(bot.config.colors.green)
                                .setFooter({ text: `Bot: ${botResults[0].botName} | Status: Approved`, iconURL: `https://disbot.top/assets/images/image01.png` })
                                .setTitle(`Bot Approved - ${botResults[0].botName}`)
                                .setDescription(`**✧ Bot:** ${botResults[0].botName}\n**✧ ID:** ${approveOptions.botid}\n\n**✧ Approved by:** ${approveOptions.approveby}\n**✧ Time:** ${approveOptions.approvedate.toLocaleString()}\n\n**✧ Status:** Approved - [View](${bot.baseOpts.url}/bot/${approveOptions.botid})`)
                                .setThumbnail(botResults[0].botIcon)
                                .setURL(`${bot.baseOpts.url}/bot/${approveOptions.botid}`)
                            bot.webLogSend(embedGuild)
                            const embedUser = new MessageEmbed()
                                .setColor(bot.config.colors.green)
                                .setTitle(`${botResults[0].botName} is now APPROVED`)
                                .setDescription(`**✧ Bot:** ${botResults[0].botName}\n**✧ ID:** ${approveOptions.botid}\n**✧ Approved by:** ${approveOptions.approveby}\n\n**✧ Status:** Approved - Your bot is now approved for our bot list!`)
                                .setURL(`${bot.baseOpts.url}/bot/${approveOptions.botid}`)
                                .setFooter({ text: `Bot: ${botResults[0].botName} | Status: Approved`, iconURL: `https://disbot.top/assets/images/image01.png` })
                            let user = bot.users.cache.get(botResults[0].creatorId)
                            let guild = bot.guilds.cache.get(bot.config.discordInformation.Guild)
                            if(user) {
                                let role = guild.roles.cache.get(bot.config.discordInformation.roles.developer)
                                if(role){
                                    guild.members.cache.get(user).roles.add(role)
                                }
                                try {
                                    user.send({ embeds: [embedUser] })
                                } catch (err) {}
                            }
                        }
                    })
                })
            }
        })
    });
    app.get('/backend/:id/blacklist', function(req, res) {
        let userid = req.params.id;
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        bot.connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, results) {
            if(results[0]) {
                if(results[0].perm <= 1) return res.redirect('/403')
                bot.connection.query(`SELECT * FROM users WHERE userId = '${userid}'`, function(err, result) {
                    if(result[0]) {
                        if(result[0].blacklisted) {
                            bot.connection.query(`UPDATE users SET blacklisted = 0 WHERE userId = '${userid}'`, function(err, result1) {
                                let options = {
                                    action: 22,
                                    string: `${req.user.username} removed ${result[0].userName} from the website blacklist.`
                                }
                                createAudit(bot, options, req.user.username)
                                res.redirect(`/user/${userid}`)
                                const embedGuild = new MessageEmbed()
                                    .setColor(bot.config.colors.discordGreyOne)
                                    .setFooter({ text: `Blacklist Remove | Disbot.top`, iconURL: `https://disbot.top/assets/images/image01.png` })
                                    .setDescription(`[${req.user.username}](${bot.baseOpts.url}/user?${req.user.id}) removed [${result[0].userName}](${bot.baseOpts.url}/user/${result[0].userId}) from website blacklist.`)
                                bot.siteLogSend(embedGuild)
                            });
                        } else {
                            bot.connection.query(`UPDATE users SET blacklisted = 1 WHERE userId = '${userid}'`, function(err, result1) {
                                let options = {
                                    action: 21,
                                    string: `${req.user.username} added ${result[0].userName} to the website blacklist.`
                                }
                                createAudit(bot, options, req.user.username)
                                res.redirect(`/user/${userid}`)
                                const embedGuild = new MessageEmbed()
                                    .setColor(bot.config.colors.discordGreyOne)
                                    .setFooter({ text: `Blacklist Add | Disbot.top`, iconURL: `https://disbot.top/assets/images/image01.png` })
                                    .setDescription(`[${req.user.username}](${bot.baseOpts.url}/user?${req.user.id}) added [${result[0].userName}](${bot.baseOpts.url}/user/${result[0].userId}) to the website blacklist.`)
                                bot.siteLogSend(embedGuild)
                            });
                        }
                    }
                });
            }
        });
    });
    app.get('/backend/:id/postban', function(req, res) {
        let userid = req.params.id;
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        bot.connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, results) {
            if(results[0]) {
                if(results[0].perm <= 1) return res.redirect('/403')
                bot.connection.query(`SELECT * FROM users WHERE userId = '${userid}'`, function(err, result) {
                    if(result[0]) {
                        if(result[0].postban) {
                            bot.connection.query(`UPDATE users SET postban = 0 WHERE userId = '${userid}'`, function(err, result1) {
                                let options = {
                                    action: 24,
                                    string: `${req.user.username} removed ${result[0].userName} from the website postban.`
                                }
                                createAudit(bot, options, req.user.username)
                                res.redirect(`/user/${userid}`)
                                const embedGuild = new MessageEmbed()
                                    .setColor(bot.config.colors.discordGreyOne)
                                    .setFooter({ text: `Postban Remove | Disbot.top`, iconURL: `https://disbot.top/assets/images/image01.png` })
                                    .setDescription(`[${req.user.username}](${bot.baseOpts.url}/user?${req.user.id}) removed [${result[0].userName}](${bot.baseOpts.url}/user/${result[0].userId}) from website postban.`)
                                bot.siteLogSend(embedGuild)
                            });
                        } else {
                            bot.connection.query(`UPDATE users SET postban = 1 WHERE userId = '${userid}'`, function(err, result1) {
                                let options = {
                                    action: 23,
                                    string: `${req.user.username} added ${result[0].userName} to the website postban.`
                                }
                                createAudit(bot, options, req.user.username)
                                res.redirect(`/user/${userid}`)
                                const embedGuild = new MessageEmbed()
                                    .setColor(bot.config.colors.discordGreyOne)
                                    .setFooter({ text: `Postban Add | Disbot.top`, iconURL: `https://disbot.top/assets/images/image01.png` })
                                    .setDescription(`[${req.user.username}](${bot.baseOpts.url}/user?${req.user.id}) added [${result[0].userName}](${bot.baseOpts.url}/user/${result[0].userId}) to the website postban.`)
                                bot.siteLogSend(embedGuild)
                            });
                        }
                    }
                });
            }
        });
    });
}