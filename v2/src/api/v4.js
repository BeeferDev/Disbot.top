const { bot } = require('../structures/Client.js'); const {convertData, convertStrings} = require('../helpers/stringconvert.js');
const express = require('express'); const fs = require('fs'); const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { "429": "Too many requests, please try again in 15 minutes." }
});
const apiLimiter2 = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: { "429": "Too many requests, please try again in 60 minutes." }
});

let router = express.Router();

router.get('/', apiLimiter, function(req, res) {
    res.status(200).type('json').send(JSON.stringify({ version: "V4", name: "Disbot API", url: "/api/v4" }, null, 4) + "\n")
});
router.get('/adverts/get', apiLimiter, function(req, res) {
    let adverts = []
    bot.connection.query(`SELECT * FROM adverts`, function(err, adResults) {
        if(adResults) {
            adResults.forEach(element => {
                let object = {
                    id: element.id,
                    title: element.title,
                    description: element.contact,
                    externalLink: element.extLink,
                    imageLink: element.imgLink,
                    expireDate: element.expireDate,
                    owner: element.owner
                }
                adverts.push(object)
            })
            res.status(200).type('json').send(JSON.stringify(adverts, null, 4) + "\n")
        } else {
            let json_ = {
                status: "404 Not Found",
                error: "Adverts not found on disbot.top",
            }
            res.status(404).type('json').send(JSON.stringify(json_, null, 4) + '\n');
        }
    })
});
router.get('/advert/:id/get', apiLimiter, function(req, res) {
    let id = req.params.id
    bot.connection.query(`SELECT * FROM adverts WHERE id = '${id}' OR owner = '${id}'`, function(err, adResult) {
        if(adResult[0]) {
            let jsonData = {
                id: adResult[0].id,
                title: adResult[0].title,
                description: adResult[0].contact,
                externalLink: adResult[0].extLink,
                imageLink: adResult[0].imgLink,
                expireDate: adResult[0].expireDate,
                owner: adResult[0].owner
            }
            res.status(200).type('json').send(JSON.stringify(jsonData, null, 4) + "\n")
        } else {
            let json_ = {
                status: "404 Not Found",
                error: "Advert not found on disbot.top",
            }
            res.status(404).type('json').send(JSON.stringify(json_, null, 4) + '\n');
        }
    })
});
router.get('/audit/:id/:option/get', apiLimiter, function(req, res) {
    let audit = req.params.id
    let auditOption = req.params.option
    let auth = req.headers.authorization
    if(auth == "QPNY76sgGCGJZCPVhNnUYhtn3egUYtLueFKbZ2tdjGwEj5ysnFSDRWNjHJvEqn4p") {
        if(auditOption == "type") {
            bot.connection.query(`SELECT * FROM auditlogs WHERE action_type = '${audit}' ORDER BY id DESC`, function(err, auditResult) {
                if(auditResult) {
                    let auditData = []
                    auditResult.forEach(element => {
                        let data = {
                            id: element.id,
                            action: {
                                id: element.action_type,
                                name: convertStrings('actions', element.action_type)
                            },
                            string: element.action_msg,
                            user: element.action_user,
                            date: element.action_date
                        }
                        auditData.push(data)
                    })
                    res.status(200).type('json').send(JSON.stringify(auditData, null, 4) + '\n');
                } else {
                    let json_ = {
                        status: "404 Not Found",
                        error: "No audits could be found with that action type.",
                    }
                    res.status(404).type('json').send(JSON.stringify(json_, null, 4) + '\n');
                }
            })
        }
        if(auditOption == "id") {
            bot.connection.query(`SELECT * FROM auditlogs WHERE id = '${audit}'`, function(err, auditResult) {
                if(auditResult[0]) {
                    let data = {
                        id: auditResult[0].id,
                        action: {
                            id: auditResult[0].action_type,
                            name: convertStrings('actions', auditResult[0].action_type)
                        },
                        string: auditResult[0].action_msg,
                        user: auditResult[0].action_user,
                        date: auditResult[0].action_date
                    }
                    res.status(200).type('json').send(JSON.stringify(data, null, 4) + '\n');
                } else {
                    let json_ = {
                        status: "404 Not Found",
                        error: "No audit could be found with that id.",
                    }
                    res.status(404).type('json').send(JSON.stringify(json_, null, 4) + '\n');
                }
            })
        }
    } else {
        let json_ = {
            status: "401 Unauthorized",
            error: "Invalid or incorrect secret supplied.",
        }
        res.status(401).type('json').send(JSON.stringify(json_, null, 4) + '\n');
    }
});
router.get('/report/:id/get', apiLimiter, function(req, res) {
    let id = req.params.id
    let auth = req.headers.authorization
    if(auth == "QPNY76sgGCGJZCPVhNnUYhtn3egUYtLueFKbZ2tdjGwEj5ysnFSDRWNjHJvEqn4p") {
        bot.connection.query(`SELECT * FROM reports WHERE id = '${id}'`, function(err, reportResult) {
            if(reportResult[0]) {
                let data = {
                    id: reportResult[0].id,
                    status: {
                        value: reportResult[0].active,
                        string: convertData('cert', reportResult[0].active)
                    },
                    user: {
                        id: reportResult[0].creatorId,
                        name: reportResult[0].creatorName
                    },
                    bot: reportResult[0].botId,
                    reason: reportResult[0].reason,
                    extrainfo: reportResult[0].addInfo,
                    date: reportResult[0].date
                }
                res.status(200).type('json').send(JSON.stringify(data, null, 4) + '\n');
            } else {
                let json_ = {
                    status: "404 Not Found",
                    error: "No report could be found with that id",
                }
                res.status(404).type('json').send(JSON.stringify(json_, null, 4) + '\n');
            }
        })
    } else {
        let json_ = {
            status: "401 Unauthorized",
            error: "Invalid or incorrect secret supplied.",
        }
        res.status(401).type('json').send(JSON.stringify(json_, null, 4) + '\n');
    }
});
router.get('/bot/:id/reports/get', apiLimiter, function(req, res) {
    let id = req.params.id
    let auth = req.headers.authorization
    let reportArray = []
    if(auth == "QPNY76sgGCGJZCPVhNnUYhtn3egUYtLueFKbZ2tdjGwEj5ysnFSDRWNjHJvEqn4p") {
        bot.connection.query(`SELECT * FROM reports WHERE botId = '${id}'`, function(err, reportResult) {
            if(reportResult) {
                reportResult.forEach(element => {
                    let data = {
                        id: element.id,
                        status: {
                            value: element.active,
                            string: convertData('cert', element.active)
                        },
                        user: {
                            id: element.creatorId,
                            name: element.creatorName
                        },
                        bot: element.botId,
                        reason: element.reason,
                        extrainfo: element.addInfo,
                        date: element.date
                    }
                    reportArray.push(data)
                })
                res.status(200).type('json').send(JSON.stringify(reportArray, null, 4) + '\n');
            } else {
                let json_ = {
                    status: "404 Not Found",
                    error: "No report could be found with that id",
                }
                res.status(404).type('json').send(JSON.stringify(json_, null, 4) + '\n');
            }
        })
    } else {
        let json_ = {
            status: "401 Unauthorized",
            error: "Invalid or incorrect secret supplied.",
        }
        res.status(401).type('json').send(JSON.stringify(json_, null, 4) + '\n');
    }
});
router.get('/bots', apiLimiter, function(req, res) {
    let botArray = []
    bot.connection.query(`SELECT * FROM bots`, function(err, results) {
        if(results) {
            results.forEach(element => {
                let tags = []
                if(element.tagFun) {
                    tags.push("Fun")
                } if(element.tagGames) {
                    tags.push("Games")
                } if(element.tagMusic) {
                    tags.push("Music")
                } if(element.tagEco) {
                    tags.push("Eco")
                } if(element.tagMod) {
                    tags.push("Mod")
                } if(element.tagAutomod) {
                    tags.push("Automod")
                } if(element.tagLeveling) {
                    tags.push("Levelling")
                } if(element.tagSocial) {
                    tags.push("Social")
                } if(element.tagUtility) {
                    tags.push("Utility")
                }
                
                let json_ = {
                    id: element.botId,
                    username: element.botName,
                    creator: element.creatorName,
                    owners: element.otherOwners,
                    servers: element.serverCount || 0,
                    library: element.library,
                    votes: element.votes,
                    tags: tags,
                    certified: convertData("cert", element.certified),
                    prefix: element.prefix,
                    prefixType: convertData("prefix", element.prefixChange),
                    avatar: element.botIcon,
                    websiteLink: element.websiteLink,
                    inviteLink: element.inviteUrl,
                    githubLink: element.GithubLink,
                    donateLink: element.donateLink,
                    short: element.shortDesc,
                    long: element.longDesc
                }
                botArray.push(json_)
            })
            res.status(200).type('json').send(JSON.stringify(botArray, null, 4) + '\n');
        } else {
            let json_ = {
                status: "404 Not Found",
                error: "No bots could be found.",
            }
            res.status(404).type('json').send(JSON.stringify(json_, null, 4) + '\n');
        }
    })
});
router.get('/users', apiLimiter, function(req, res) {
    let userArray = []
    bot.connection.query(`SELECT * FROM users`, function(err, results) {
        if(results) {
            results.forEach(element => {                
                let json_ = {
                    id: element.id,
                    user: {
                        id: element.userId,
                        name: element.userName,
                        icon: element.userIcon,
                        permission: convertStrings('staffroles', element.perm)
                    },
                    socials: {
                        discord: convertData('socials', element.discordSocial),
                        twitter: convertData('socials', element.twitterSocial),
                        github: convertData('socials', element.githubSocial)                
                    },
                    bio: element.bio
                }
                userArray.push(json_)
            })
            res.status(200).type('json').send(JSON.stringify(userArray, null, 4) + '\n');
        } else {
            let json_ = {
                status: "404 Not Found",
                error: "No users could be found.",
            }
            res.status(404).type('json').send(JSON.stringify(json_, null, 4) + '\n');
        }
    })
});
router.get('/bot/:id/changelogs/get', apiLimiter, function(req, res) {
    let id = req.params.id
    let changelogs = []
    bot.connection.query(`SELECT * FROM botchangelogs WHERE botId = '${id}'`, function(err, changeResult) {
        if(changeResult) {
            changeResult.forEach(element => {
                let data = {
                    id: element.id,
                    bot: element.botId,
                    user: element.userName,
                    changelog: {
                        title: element.change_title,
                        version: `V${element.change_version}`,
                        date: element.change_date,
                        details: element.change_details
                    }
                }
                changelogs.push(data)
            })
            res.status(200).type('json').send(JSON.stringify(changelogs, null, 4) + '\n');
        } else {
            let json_ = {
                status: "404 Not Found",
                error: "The bot has no changelogs posted.",
            }
            res.status(404).type('json').send(JSON.stringify(json_, null, 4) + '\n');
        }
    })
});
router.get('/bot/:id/get', apiLimiter, (req, res) => {
    let botId = req.params.id;
    let auth = req.headers.authorization;
    if(!auth) return res.status(400).type('json').send(JSON.stringify({ status: "400 Bad Request", error: "missing authorization.." }, null, 4) + '\n');
    
    bot.connection.query(`SELECT * FROM bots WHERE botId = '${botId}'`, (err, results) => {        
        if(results[0]) {
            bot.connection.query(`SELECT * FROM bots WHERE authToken = '${auth}'`, function(err, result) {
                if(result[0].authToken == auth) {
                    let tags = []
                    if(results[0].tagFun) {
                        tags.push("Fun")
                    } if(results[0].tagGames) {
                        tags.push("Games")
                    } if(results[0].tagMusic) {
                        tags.push("Music")
                    } if(results[0].tagEco) {
                        tags.push("Eco")
                    } if(results[0].tagMod) {
                        tags.push("Mod")
                    } if(results[0].tagAutomod) {
                        tags.push("Automod")
                    } if(results[0].tagLeveling) {
                        tags.push("Levelling")
                    } if(results[0].tagSocial) {
                        tags.push("Social")
                    } if(results[0].tagUtility) {
                        tags.push("Utility")
                    }
                    
                    let json_ = {
                        id: results[0].botId,
                        username: results[0].botName,
                        creator: results[0].creatorName,
                        owners: results[0].otherOwners,
                        servers: results[0].serverCount || 0,
                        library: results[0].library,
                        votes: results[0].votes,
                        tags: tags,
                        certified: convertData("cert", results[0].certified),
                        prefix: results[0].prefix,
                        prefixType: convertData("prefix", results[0].prefixChange),
                        avatar: results[0].botIcon,
                        websiteLink: results[0].websiteLink,
                        inviteLink: results[0].inviteUrl,
                        githubLink: results[0].GithubLink,
                        donateLink: results[0].donateLink,
                        short: results[0].shortDesc,
                        long: results[0].longDesc
                    }
                    res.status(200).type('json').send(JSON.stringify(json_, null, 4) + '\n');
                } else {
                    let json_ = {
                        status: "401 Unauthorized",
                        error: "Invalid or incorrect bot token supplied.",
                    }
                    res.status(401).type('json').send(JSON.stringify(json_, null, 4) + '\n');
                }
            });
        } else {
            let json_ = {
                status: "404 Not Found",
                error: "Bot not found on disbot.top",
            }
            res.status(404).type('json').send(JSON.stringify(json_, null, 4) + '\n');
        }
    });
});
router.get('/bot/:id/votes/get', apiLimiter, (req, res) => {
    let botId = req.params.id;
    let auth = req.headers.authorization;
    if(!auth) return res.status(400).type('json').send(JSON.stringify({ status: "400 Bad Request", error: "missing authorization.." }, null, 4) + '\n');
    
    bot.connection.query(`SELECT * FROM votes WHERE botId = '${botId}'`, (err, results) => {
        if(results[0]) {
            bot.connection.query(`SELECT * FROM bots WHERE authToken = '${auth}'`, function(err, result) {
                if(result[0].authToken == auth) {
                    let daArray = [];
                    results.forEach(element => {
                        daArray.push({voterId: element.userId, rating: element.rating, date: element.date});
                    });
                    res.status(200).type('json').send(JSON.stringify(daArray, null, 4) + '\n');
                } else {
                    let json_ = {
                        status: "401 Unauthorized",
                        error: "Invalid or incorrect bot api token supplied.",
                    }
                    res.status(401).type('json').send(JSON.stringify(json_, null, 4) + '\n');
                }
            });
        } else {
            let json_ = {
                status: "404 Not Found",
                error: "Bot not found on disbot.top",
            }
            res.status(404).type('json').send(JSON.stringify(json_, null, 4) + '\n');
        }
    });
});
router.get('/user/:id/get', apiLimiter, (req, res) => {
    let userId = req.params.id;
    let auth = req.headers.authorization;
    if(!auth) return res.status(400).type('json').send(JSON.stringify({ status: "400 Bad Request", error: "missing authorization.." }, null, 4) + '\n');
    
    bot.connection.query(`SELECT * FROM users WHERE userId = '${userId}'`, function(err, results) {
        if(results[0]) {
            bot.connection.query(`SELECT * FROM bots WHERE authToken = '${auth}'`, function(err, result) {
                if(result[0].authToken == auth) {
                    let json_ = {
                        user: {
                            id: results[0].userId,
                            username: results[0].userName,
                            avatar: results[0].userIcon,
                            permission: convertData("perms", results[0].perm),
                            blacklisted: convertData("staffactions", results[0].blacklisted),
                            postban: convertData("staffactions", results[0].postban),
                            bio: results[0].bio
                        },
                        socials: {
                            discord: results[0].discordSocial,
                            twitter: results[0].twitterSocial,
                            github: results[0].githubSocial
                        },
                    }
                    res.status(200).type('json').send(JSON.stringify(json_, null, 4) + '\n')
                } else {
                    let json_ = {
                        status: "401 Unauthorized",
                        error: "Invalid or incorrect bot api token supplied.",
                    }
                    res.status(401).type('json').send(JSON.stringify(json_, null, 4) + '\n');
                }
            });
        } else {
            let json_ = {
                status: "404 Not Found",
                error: "User not found on disbot.top.",
            }
            res.status(404).type('json').send(JSON.stringify(json_, null, 4) + '\n');
        }
    })
});
router.get('/ticket/:id/get', apiLimiter, function(req, res) {
    let id = req.params.id
    let auth = req.headers.authorization
    if(auth == "QPNY76sgGCGJZCPVhNnUYhtn3egUYtLueFKbZ2tdjGwEj5ysnFSDRWNjHJvEqn4p") {
        bot.connection.query(`SELECT * FROM contacts WHERE id = '${id}'`, function(err, ticketResult) {
            if(ticketResult[0]) {
                bot.connection.query(`SELECT * FROM contactcomments WHERE contactId = '${ticketResult[0].id}'`, function(err, commentResult) {
                    if(commentResult) {
                        let comments = []
                        commentResult.forEach(element => {
                            let commentData = {
                                id: element.id,
                                ticketid: element.contactId,
                                user: {
                                    id: element.userId,
                                    string: element.userName
                                },
                                createDate: element.createDate,
                                comment: element.comment
                            }
                            comments.push(commentData)
                        })
                        let data = {
                            id: ticketResult[0].id,
                            user: {
                                id: ticketResult[0].userId,
                                name: ticketResult[0].userName
                            },
                            status: {
                                id: ticketResult[0].active,
                                name: convertData('cert', ticketResult[0].active)
                            },
                            lastUpdated: ticketResult[0].lastUpdated,
                            createDate: ticketResult[0].createDate,
                            openComment: ticketResult[0].openComment,
                            comments: comments
                        }
                        res.status(200).type('json').send(JSON.stringify(data, null, 4) + '\n');
                    }
                })
            } else {
                let json_ = {
                    status: "404 Not Found",
                    error: "No ticket could be found with that id",
                }
                res.status(404).type('json').send(JSON.stringify(json_, null, 4) + '\n');
            }
        })
    } else {
        let json_ = {
            status: "401 Unauthorized",
            error: "Invalid or incorrect secret supplied.",
        }
        res.status(401).type('json').send(JSON.stringify(json_, null, 4) + '\n');
    }
});
router.get('/tickets', apiLimiter2, function(req, res) {
    let auth = req.headers.authorization
    let ticketArray = []
    if(auth == "QPNY76sgGCGJZCPVhNnUYhtn3egUYtLueFKbZ2tdjGwEj5ysnFSDRWNjHJvEqn4p") {
        bot.connection.query(`SELECT * FROM contacts`, function(err, tickResults) {
            if(tickResults) {
                tickResults.forEach(element => {
                    let tickData = {
                        id: element.id,
                        user: {
                            id: element.userId,
                            name: element.userName
                        },
                        status: {
                            id: element.active,
                            name: convertData('cert', element.active)
                        },
                        lastUpdated: element.lastUpdated,
                        createDate: element.createDate,
                        openComment: element.openComment
                    }
                    ticketArray.push(tickData)
                })
                res.status(200).type('json').send(JSON.stringify(ticketArray, null, 4) + '\n');
            } else {
                let json_ = {
                    status: "404 Not Found",
                    error: "No tickets could be found",
                }
                res.status(404).type('json').send(JSON.stringify(json_, null, 4) + '\n');
            }
        })
    } else {
        let json_ = {
            status: "401 Unauthorized",
            error: "Invalid or incorrect secret supplied.",
        }
        res.status(401).type('json').send(JSON.stringify(json_, null, 4) + '\n');
    }
});
router.post('/bot/:id/update', apiLimiter, (req, res) => {
    let botId = req.params.id;
    let auth = req.headers.authorization;
    let newServerCount = Number(req.body.serverCount);
    let newonlineStamp = Date.now();
    if(Number.isNaN(newServerCount)) return // console.log(`Test Output 6`);
    bot.connection.query(`SELECT * FROM bots WHERE botId = '${botId}'`, (err, results) => {
        if(results[0]) {
            if(results[0].authToken == auth) {
                var temp = Number(results[0].onlineStamp) + 300000;
                if(newonlineStamp > temp) {
                    if(Number.isInteger(newServerCount)) {
                        bot.connection.query(`UPDATE bots SET serverCount = ${newServerCount}, onlineStamp = '${newonlineStamp}' WHERE botId = '${botId}'`, (err, result) => {
                            let json_ = {
                                status: "200 OK",
                                error: "Server count updated.",
                            }
                            res.status(200).type('json').send(JSON.stringify(json_, null, 4) + '\n');
                        });
                    } else {
                        let json_ = {
                            status: "400 Bad Request",
                            error: "The server count supplied was not an integer.",
                        }
                        res.status(400).type('json').send(JSON.stringify(json_, null, 4) + '\n');
                    }
                } else {
                    let json_ = {
                        status: "429 Too Many Requests",
                        error: "You can only make one request per 5 minutes.",
                    }
                    res.status(429).type('json').send(JSON.stringify(json_, null, 4) + '\n');
                }
            } else {
                let json_ = {
                    status: "401 Unauthorized",
                    error: "Invalid or incorrect bot token supplied.",
                }
                res.status(401).type('json').send(JSON.stringify(json_, null, 4) + '\n');
            }
        } else {
            let json_ = {
                status: "404 Not Found",
                error: "Bot not found on disbot.top",
            }
            res.status(404).type('json').send(JSON.stringify(json_, null, 4) + '\n');
        }
    });
});

module.exports = router;