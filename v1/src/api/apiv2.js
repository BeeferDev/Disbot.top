const { json } = require("express");
const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { "429": "Too many requests, please try again in 15 minutes" }
});
const apiLimiter2 = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100
});

function convertData(obj, type) {
    if(obj == "prefix") {
        if(type == 1) return 'Customizable';
        if(type == 0) return 'Fixed';
    }
    if(obj == "cert") {
        if(type == 1) return 'Yes';
        if(type == 0) return 'No';
    }
    if(obj == "perms") {
        if(type == 0) return 'User'
        if(type == 1) return 'Reviewer'
        if(type == 2) return 'Administrator'
    }
}

module.exports = function(app, connection) {
    console.log(`[V2-API]: Launched`);

    app.post('/api/v2/bot/:botId/update', (req, res) => {
        let botId = req.params.botId;
        let auth = req.headers.authorization;
        let newServerCount = Number(req.body.serverCount);
        let newonlineStamp = Date.now();
        if(Number.isNaN(newServerCount)) return // console.log(`Test Output 6`);
        connection.query(`SELECT * FROM bots WHERE botId = '${botId}'`, (err, results) => {
            if(results[0]) {
                if(results[0].authToken == auth) {
                    var temp = Number(results[0].onlineStamp) + 300000;
                    // console.log(newonlineStamp, temp)
                    if(newonlineStamp > temp) {
                        if(Number.isInteger(newServerCount)) {
                            connection.query(`UPDATE bots SET serverCount = ${newServerCount}, onlineStamp = '${newonlineStamp}' WHERE botId = '${botId}'`, (err, result) => {
                                // res.send(`Bot server count updated.`);
                                let json_ = {
                                    status: "200 OK",
                                    error: "Server count updated.",
                                }
                                res.type('json').send(JSON.stringify(json_, null, 4) + '\n');
                            });
                        } else {
                            let json_ = {
                                status: "400 Bad Request",
                                error: "The server count supplied was not an integer.",
                            }
                            res.type('json').send(JSON.stringify(json_, null, 4) + '\n');
                        }
                    } else {
                        let json_ = {
                            status: "429 Too Many Requests",
                            error: "You can only make one request per 5 minutes.",
                        }
                        res.type('json').send(JSON.stringify(json_, null, 4) + '\n');
                    }
                } else {
                    let json_ = {
                        status: "401 Unauthorized",
                        error: "Invalid or incorrect bot token supplied.",
                    }
                    res.type('json').send(JSON.stringify(json_, null, 4) + '\n');
                }
            } else {
                let json_ = {
                    status: "404 Not Found",
                    error: "Bot not found on disbot.top",
                }
                res.type('json').send(JSON.stringify(json_, null, 4) + '\n');
            }
        });
    });

    app.get('/api/v2/bot/:botId/get', apiLimiter, (req, res) => {
        let botId = req.params.botId;
        connection.query(`SELECT * FROM bots WHERE botId = '${botId}'`, (err, results) => {
            if(!results[0]) return res.status(404).json({ "404": `Bot not found. invaild bot id: (${botId})`  })
            
            if(results[0]) {
        
                let json_ = {
                    id: results[0].botId,
                    username: results[0].botName,
                    creator: results[0].creatorName,
                    owners: results[0].otherOwners,
                    servers: results[0].serverCount || 0,
                    library: results[0].library,
                    votes: results[0].votes,
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
            }
        });
    });

    app.get('/api/v2/bot/:botId/votes/get', apiLimiter, (req, res) => {
        let botId = req.params.botId;
        connection.query(`SELECT * FROM votes WHERE botId = '${botId}'`, (err, results) => {
            if(!results[0]) return res.status(404).json({ "404": `Bot not found. invaild bot id: (${botId})`  })
            if(results[0]) {
                let daArray = [];
                results.forEach(element => {
                    daArray.push({voterId: element.userId, rating: element.rating, date: element.date});
                });
                res.status(200).type('json').send(JSON.stringify(daArray, null, 4) + '\n');
            }            
        });
    });
}