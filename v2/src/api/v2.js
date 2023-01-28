const { bot } = require('../structures/Client.js'); const {convertData} = require('../helpers/stringconvert.js');
const express = require('express'); const fs = require('fs'); const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { "429": "Too many requests, please try again in 15 minutes" }
});

let router = express.Router();

router.get('/', apiLimiter, function(req, res) {
    res.status(200).type('json').send(JSON.stringify({ version: "V2", name: "Disbot API", url: "/api/v2" }, null, 4) + "\n")
});
router.get('/bot/:id/get', apiLimiter, (req, res) => {
    let botId = req.params.id;
    bot.connection.query(`SELECT * FROM bots WHERE botId = '${botId}'`, (err, results) => {    
        if(results[0]) {
            let jsonData = {
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
            res.status(200).type('json').send(JSON.stringify(jsonData, null, 4) + '\n');
        } else return res.status(404).json({ "404": `Bot not found. invaild bot id: (${botId})`  })
    });
});
router.get('/:id/votes/get', apiLimiter, (req, res) => {
    let botId = req.params.id;
    bot.connection.query(`SELECT * FROM votes WHERE botId = '${botId}'`, (err, results) => {
        if(results[0]) {
            let daArray = [];
            results.forEach(element => {
                daArray.push({voterId: element.userId, rating: element.rating, date: element.date});
            });
            res.status(200).type('json').send(JSON.stringify(daArray, null, 4) + '\n');
        } else return res.status(404).json({ "404": `Bot not found. invaild bot id: (${botId})`  })        
    });
});
router.post('/bot/:id/update', apiLimiter, (req, res) => {
    let botId = req.params.id;
    let auth = req.headers.authorization;
    let newServerCount = Number(req.body.serverCount);
    let newonlineStamp = Date.now();
    if(Number.isNaN(newServerCount)) return 
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