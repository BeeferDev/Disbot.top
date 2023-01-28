const { getDiscordUser } = require('../src/structures/discordUser'); const createAudit = require('../src/helpers/auditLogs');
const md = require('markdown-it')({ html: true, xhtmlOut: true, breaks: true, linkify: true }); const fs = require('fs');
const {convertStrings} = require('../src/helpers/stringconvert');

module.exports = (app, bot) => {
    if(bot.config.consoleDebug) {
        console.log(`| [Route - /staff] Loaded. |`)
    }
    app.get(`/staff`, async function(req, res) {
        let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        getDiscordUser(bot, req, function(data) {
            bot.connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, userResult) {
                if(userResult[0]) {
                    if(userResult[0].perm <= 0) {
                        let options = {
                            action: 32,
                            string: `${req.user.username} (${req.user.id}) attempted to access the staff panel.`
                        }
                        createAudit(bot, options, req.user.username)
                        return res.redirect('/403')
                    }
                    bot.connection.query(`SELECT * FROM bots WHERE pending = true`, function(err, pendingResults) {
                        bot.connection.query(`SELECT * FROM reports WHERE active = true`, function(err, reportResults) {
                            bot.connection.query(`SELECT * FROM votes ORDER BY id DESC LIMIT 9`, function(err, voteResults) {
                                bot.connection.query(`SELECT * FROM bots WHERE hidden = false ORDER BY id DESC LIMIT 9`, function(err, botResults) {
                                    res.render('staff', { discordInfo: data, pendingCount: pendingResults.length, reportCount: reportResults.length, voteResults: voteResults, newbotsResults: botResults, alerts: alertsJson })
                                })
                            })
                        })
                    })
                }
            })
        })
    });
    app.get(`/staff/permissions`, async function(req, res) {
        let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        getDiscordUser(bot, req, function(data) {
            bot.connection.query(`SELECT * FROM users`, function(err, results) {
                bot.connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, userResult) {
                    if(userResult[0]) {
                        if(userResult[0].perm <= 1) {
                            let options = {
                                action: 32,
                                string: `${req.user.username} (${req.user.id}) attempted to access the staff manager page.`
                            }
                            createAudit(bot, options, req.user.username)
                            return res.redirect('/403')
                        }
                        res.render('staffmanager', { discordInfo: data, permUsers: results, alerts: alertsJson, conVert: convertStrings })
                    }
                })
            })
        })
    });
    app.get(`/staff/api/settings`, async function(req, res) {
        let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        getDiscordUser(bot, req, function(data) {
            bot.connection.query(`SELECT * FROM apidocs`, function(err, apiResults) {
                bot.connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, userResult) {
                    if(userResult[0]) {
                        if(userResult[0].perm <= 1) {
                            let options = {
                                action: 32,
                                string: `${req.user.username} (${req.user.id}) attempted to access the api settings page.`
                            }
                            createAudit(bot, options, req.user.username)
                            return res.redirect('/403')
                        }
                        res.render('staffapi', { discordInfo: data, apiData: apiResults, alerts: alertsJson })
                    }
                })
            })
        })
    });
    app.get(`/staff/partner/settings`, async function(req, res) {
        let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        getDiscordUser(bot, req, function(data) {
            bot.connection.query(`SELECT * FROM partners`, function(err, partnerResults) {
                bot.connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, userResult) {
                    if(userResult[0]) {
                        if(userResult[0].perm <= 1) {
                            let options = {
                                action: 32,
                                string: `${req.user.username} (${req.user.id}) attempted to access the partner settings page.`
                            }
                            createAudit(bot, options, req.user.username)
                            return res.redirect('/403')
                        }
                        res.render('staffpartner', { discordInfo: data, partners: partnerResults, alerts: alertsJson })
                    }
                })
            })
        })
    });
    app.get(`/staff/users`, async function(req, res) {
        let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
        if(!req.isAuthenticated()) return res.redirect('/403')
        getDiscordUser(bot, req, function(data) {
            bot.connection.query(`SELECT * FROM users`, function(err, userResults) {
                bot.connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, userResult) {
                    if(userResult[0]) {
                        if(userResult[0].perm <= 1) {
                            let options = {
                                action: 32,
                                string: `${req.user.username} (${req.user.id}) attempted to access the staff panel users-page.`
                            }
                            createAudit(bot, options, req.user.username)
                            return res.redirect('/403')
                        }
                        res.render('staffusers', { discordInfo: data, users: userResults, alerts: alertsJson, conVert: convertStrings })
                    }
                })
            })
        })
    });
    app.get(`/staff/bots`, async function(req, res) {
        let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        getDiscordUser(bot, req, function(data) {
            bot.connection.query(`SELECT * FROM bots`, function(err, botResults) {
                bot.connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, userResult) {
                    if(userResult[0]) {
                        if(userResult[0].perm <= 1) {
                            let options = {
                                action: 32,
                                string: `${req.user.username} (${req.user.id}) attempted to access the staff panel bots-page.`
                            }
                            createAudit(bot, options, req.user.username)
                            return res.redirect('/403')
                        }
                        res.render('staffbots', { discordInfo: data, bots: botResults, alerts: alertsJson, conVert: convertStrings })
                    }
                })
            })
        })
    });
    app.get(`/staff/auditlogs`, async function(req, res) {
        let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        getDiscordUser(bot, req, function(data) {
            bot.connection.query(`SELECT * FROM auditlogs ORDER BY id DESC`, function(err, auditResults) {
                bot.connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, userResult) {
                    if(userResult[0]) {
                        if(userResult[0].perm <= 0) {
                            let options = {
                                action: 32,
                                string: `${req.user.username} (${req.user.id}) attempted to access the auditlogs page.`
                            }
                            createAudit(bot, options, req.user.username)
                            return res.redirect('/403')
                        }
                        res.render('auditlogs', { discordInfo: data, audits: auditResults, alerts: alertsJson, conVert: convertStrings })
                    }
                })
            })
        })
    }); 
    app.get(`/staff/bots/pending`, async function(req, res) {
        let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        getDiscordUser(bot, req, function(data) {
            bot.connection.query(`SELECT * FROM bots WHERE pending = true`, function(err, botResults) {
                bot.connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, userResult) {
                    if(userResult[0]) {
                        if(userResult[0].perm <= 0) {
                            let options = {
                                action: 32,
                                string: `${req.user.username} (${req.user.id}) attempted to access the bots pending page.`
                            }
                            createAudit(bot, options, req.user.username)
                            return res.redirect('/403')
                        }
                        res.render('pending', { discordInfo: data, pendingBots: botResults, alerts: alertsJson })
                    }
                })
            })
        })
    });
    app.get(`/staff/reports/pending`, async function(req, res) {
        let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        getDiscordUser(bot, req, function(data) {
            bot.connection.query(`SELECT * FROM reports WHERE active = true`, function(err, activeReports) {
                bot.connection.query(`SELECT * FROM reports WHERE active = false`, function(err, inactiveReports) {
                    bot.connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, userResult) {
                        if(userResult[0]) {
                            if(userResult[0].perm <= 0) {
                                let options = {
                                    action: 32,
                                    string: `${req.user.username} (${req.user.id}) attempted to access the reports pending page.`
                                }
                                createAudit(bot, options, req.user.username)
                                return res.redirect('/403')
                            }
                            let total = activeReports.length + inactiveReports.length
                            res.render('reports', { discordInfo: data, pendingReports: activeReports, closedReports: inactiveReports, totalReports: total, alerts: alertsJson })
                        }
                    })
                })
            })
        })
    });
    app.get(`/staff/tickets`, async function(req, res) {
        let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        getDiscordUser(bot, req, function(data) {
            bot.connection.query(`SELECT * FROM contacts`, function(err, ticketResults) {
                bot.connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, userResult) {
                    if(userResult[0]) {
                        if(userResult[0].perm <= 0) {
                            let options = {
                                action: 32,
                                string: `${req.user.username} (${req.user.id}) attempted to access the staff tickets page.`
                            }
                            createAudit(bot, options, req.user.username)
                            return res.redirect('/403')
                        }
                        res.render('ticketsstaff', { discordInfo: data, alerts: alertsJson, tickets: ticketResults })
                    }
                })
            })
        })
    });
    app.get(`/staff/advert/settings`, async function(req, res) {
        let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        getDiscordUser(bot, req, function(data) {
            bot.connection.query(`SELECT * FROM adverts`, function(err, adResults) {
                bot.connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, userResult) {
                    if(userResult[0]) {
                        if(userResult[0].perm <= 1) {
                            let options = {
                                action: 32,
                                string: `${req.user.username} (${req.user.id}) attempted to access the advert settings page.`
                            }
                            createAudit(bot, options, req.user.username)
                            return res.redirect('/403')
                        }
                        res.render('staffadvertise', { discordInfo: data, ads: adResults, alerts: alertsJson })
                    }
                })
            })
        })
    });
    app.get(`/staff/alert/settings`, async function(req, res) {
        let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        getDiscordUser(bot, req, function(data) {
            bot.connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, userResult) {
                if(userResult[0]) {
                    if(userResult[0].perm <= 1) {
                        let options = {
                            action: 32,
                            string: `${req.user.username} (${req.user.id}) attempted to access the alert settings page.`
                        }
                        createAudit(bot, options, req.user.username)
                        return res.redirect('/403')
                    }
                    res.render('alerts', { discordInfo: data, alerts: alertsJson })
                }
            })
        })
    });
    app.get(`/staff/bot/deny`, async function(req, res) {
        let alertsJson = await JSON.parse(fs.readFileSync('./src/json/alerts.json', "utf8"));
        if(!req.isAuthenticated()) return res.redirect('/notloggedin')
        getDiscordUser(bot, req, function(data) {
            bot.connection.query(`SELECT * FROM bots`, function(err, botResults) {
                bot.connection.query(`SELECT * FROM users WHERE userId = '${req.user.id}'`, function(err, userResult) {
                    if(userResult[0]) {
                        if(userResult[0].perm <= 0) {
                            let options = {
                                action: 32,
                                string: `${req.user.username} (${req.user.id}) attempted to access the bot deny page.`
                            }
                            createAudit(bot, options, req.user.username)
                            return res.redirect('/403')
                        }
                        res.render('deny', { discordInfo: data, botInfo: botResults, alerts: alertsJson })
                    }
                })
            })
        })
    });
}