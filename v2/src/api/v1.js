const { bot } = require('../structures/Client.js'); const {convertData} = require('../helpers/stringconvert.js');
const express = require('express'); const fs = require('fs'); const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { "429": "Too many requests, please try again in 15 minutes" }
});

let router = express.Router();

router.get('/', apiLimiter, function(req, res) {
    res.status(200).type('json').send(JSON.stringify({ version: "V1", name: "Disbot API", url: "/api/v1" }, null, 4) + "\n")
});
router.get('/bot/:id/get', apiLimiter, function(req, res) {
    let botid = req.params.id
    bot.connection.query(`SELECT * FROM bots WHERE botId = '${botid}'`, function(err, botResult) {
        if(botResult[0]) {
            let jsonData = {
                bot: {
                    id: botResult[0].botId,
                    username: botResult[0].botName,
                    avatar: botResult[0].avatar
                },
                creator: {
                    id: botResult[0].creatorId,
                    username: botResult[0].creatorName
                },
                servers: botResult[0].serverCount,
                library: botResult[0].library,
                votes: botResult[0].votes,
                certified: convertData("cert", botResult[0].certified),
                prefix: botResult[0].prefix,
                prefixType: convertData('prefix', botResult[0].prefixChange),
                socials: {
                    website: botResult[0].websiteLink,
                    invite: botResult[0].inviteUrl,
                    github: botResult[0].githubLink,
                    donate: botResult[0].donateLink
                },
                descriptions: {
                    short: botResult[0].shortDesc,
                    long: botResult[0].longDesc
                }
            }
            res.status(200).send(JSON.stringify(jsonData, null, 4) + '\n')
        } else res.status(404).send(JSON.stringify({ error: `Disbot couldn't find a bot with that id. (${botid})` }))
    })
});
router.post('/bot/botupdate/:id', apiLimiter, function(req, res) {
    let botId = req.params.id;
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
                            // if (err) console.log(err);
                            // console.log(`Test Output`);
                        });
                    } else {
                        // console.log(`Test Output 2`);
                    }
                } else {
                    // console.log(`Test Output 3`);
                }
            } else {
                // console.log(`Test Output 4`);
            }
        } else {
            // console.log(`Test Output 5`);
        }
    });
});
module.exports = router;