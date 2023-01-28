const { Client, Collection } = require('discord.js');const config = require('../configs/config.js');const { getDiscordUser } = require('./discordUser.js'); const { connection } = require('./Connection.js')
const discordModals = require('discord-modals');const { Modal, TextInputComponent, showModal } = require('discord-modals');
const express = require('express');const session = require('express-session');const bodyParser = require('body-parser');const passport = require('passport');const DiscordStrategy = require('passport-discord').Strategy;const axios = require('axios').default;const app = express();const fs = require('fs');
axios.defaults.baseURL = 'https://discord.com/api/v9'; axios.defaults.headers = { Authorization: config.botInformation.header, 'Content-Type': 'application/json' }; const scopes = ["identify","guilds"];const prompt = 'consent';

class disbotApplication extends Client {
    constructor() {
        super(
            {
                intents: [
                    "DIRECT_MESSAGES",
                    "DIRECT_MESSAGE_REACTIONS",
                    "DIRECT_MESSAGE_TYPING",
                    "GUILDS",
                    "GUILD_MEMBERS",
                    "GUILD_MESSAGES",
                    "GUILD_BANS",
                    "GUILD_EMOJIS_AND_STICKERS",
                    "GUILD_INTEGRATIONS",
                    "GUILD_INVITES",
                    "GUILD_MESSAGE_REACTIONS",
                    "GUILD_MESSAGE_TYPING",
                    "GUILD_PRESENCES",
                    "GUILD_SCHEDULED_EVENTS",
                    "GUILD_VOICE_STATES",
                    "GUILD_WEBHOOKS"
                ],
                partials: [
                    "CHANNEL",
                    "GUILD_MEMBER",
                    "MESSAGE",
                    "REACTION",
                    "USER"
                ],
                allowedMentions: {
                    parse: [
                        "roles", 
                        "users", 
                        "everyone"
                    ]
                }
            }
        )
        this.commands = new Collection()
        this.contextCommands = new Collection()
        this.numbers = {
            bots: 0,
            users: 0,
            events: 0,
            commands: 0,
            contextCommands: 0,
            routes: 0,
            tickets: 0,
            audits: 0,
            reports: 0,
            votes: 0,
            partners: 0
        }
        this.baseOpts = {
            url: config.baseURL,
            port: config.basePORT
        }
        this.config = config;
        this.connection = connection
        this.modalShow = function(modalObject, clientObject, interactionObject) {
            return showModal(modalObject, {
                client: clientObject,
                interaction: interactionObject
            })
        }
        this.createTextModal = function(options) {
            switch(options.questionAmount) {
                case 1: {
                    const modalTemplate = new Modal()
                        .setCustomId(options.modalOptions.customId)
                        .setTitle(options.modalOptions.title)
                        .addComponents([
                            new TextInputComponent()
                                .setCustomId(options.modalComponentOptions[0].customId)
                                .setLabel(options.modalComponentOptions[0].label)
                                .setStyle(options.modalComponentOptions[0].style)
                                .setMinLength(options.modalComponentOptions[0].minLength)
                                .setMaxLength(options.modalComponentOptions[0].maxLength)
                                .setPlaceholder(options.modalComponentOptions[0].placeholder)
                                .setRequired(options.modalComponentOptions[0].required)
                        ])
                    return modalTemplate
                }
                case 2: {
                    const modalTemplate = new Modal()
                        .setCustomId(options.modalOptions.customId)
                        .setTitle(options.modalOptions.title)
                        .addComponents([
                            new TextInputComponent()
                                .setCustomId(options.modalComponentOptions[0].customId)
                                .setLabel(options.modalComponentOptions[0].label)
                                .setStyle(options.modalComponentOptions[0].style)
                                .setMinLength(options.modalComponentOptions[0].minLength)
                                .setMaxLength(options.modalComponentOptions[0].maxLength)
                                .setPlaceholder(options.modalComponentOptions[0].placeholder)
                                .setRequired(options.modalComponentOptions[0].required),
                            new TextInputComponent()
                                .setCustomId(options.modalComponentOptions[1].customId)
                                .setLabel(options.modalComponentOptions[1].label)
                                .setStyle(options.modalComponentOptions[1].style)
                                .setMinLength(options.modalComponentOptions[1].minLength)
                                .setMaxLength(options.modalComponentOptions[1].maxLength)
                                .setPlaceholder(options.modalComponentOptions[1].placeholder)
                                .setRequired(options.modalComponentOptions[1].required)
                        ])
                    return modalTemplate
                }
                case 3: {
                    const modalTemplate = new Modal()
                        .setCustomId(options.modalOptions.customId)
                        .setTitle(options.modalOptions.title)
                        .addComponents([
                            new TextInputComponent()
                                .setCustomId(options.modalComponentOptions[0].customId)
                                .setLabel(options.modalComponentOptions[0].label)
                                .setStyle(options.modalComponentOptions[0].style)
                                .setMinLength(options.modalComponentOptions[0].minLength)
                                .setMaxLength(options.modalComponentOptions[0].maxLength)
                                .setPlaceholder(options.modalComponentOptions[0].placeholder)
                                .setRequired(options.modalComponentOptions[0].required),
                            new TextInputComponent()
                                .setCustomId(options.modalComponentOptions[1].customId)
                                .setLabel(options.modalComponentOptions[1].label)
                                .setStyle(options.modalComponentOptions[1].style)
                                .setMinLength(options.modalComponentOptions[1].minLength)
                                .setMaxLength(options.modalComponentOptions[1].maxLength)
                                .setPlaceholder(options.modalComponentOptions[1].placeholder)
                                .setRequired(options.modalComponentOptions[1].required),
                            new TextInputComponent()
                                .setCustomId(options.modalComponentOptions[2].customId)
                                .setLabel(options.modalComponentOptions[2].label)
                                .setStyle(options.modalComponentOptions[2].style)
                                .setMinLength(options.modalComponentOptions[2].minLength)
                                .setMaxLength(options.modalComponentOptions[2].maxLength)
                                .setPlaceholder(options.modalComponentOptions[2].placeholder)
                                .setRequired(options.modalComponentOptions[2].required)
                        ])
                    return modalTemplate
                }
                case 4: {
                    const modalTemplate = new Modal()
                        .setCustomId(options.modalOptions.customId)
                        .setTitle(options.modalOptions.title)
                        .addComponents([
                            new TextInputComponent()
                                .setCustomId(options.modalComponentOptions[0].customId)
                                .setLabel(options.modalComponentOptions[0].label)
                                .setStyle(options.modalComponentOptions[0].style)
                                .setMinLength(options.modalComponentOptions[0].minLength)
                                .setMaxLength(options.modalComponentOptions[0].maxLength)
                                .setPlaceholder(options.modalComponentOptions[0].placeholder)
                                .setRequired(options.modalComponentOptions[0].required),
                            new TextInputComponent()
                                .setCustomId(options.modalComponentOptions[1].customId)
                                .setLabel(options.modalComponentOptions[1].label)
                                .setStyle(options.modalComponentOptions[1].style)
                                .setMinLength(options.modalComponentOptions[1].minLength)
                                .setMaxLength(options.modalComponentOptions[1].maxLength)
                                .setPlaceholder(options.modalComponentOptions[1].placeholder)
                                .setRequired(options.modalComponentOptions[1].required),
                            new TextInputComponent()
                                .setCustomId(options.modalComponentOptions[2].customId)
                                .setLabel(options.modalComponentOptions[2].label)
                                .setStyle(options.modalComponentOptions[2].style)
                                .setMinLength(options.modalComponentOptions[2].minLength)
                                .setMaxLength(options.modalComponentOptions[2].maxLength)
                                .setPlaceholder(options.modalComponentOptions[2].placeholder)
                                .setRequired(options.modalComponentOptions[2].required),
                            new TextInputComponent()
                                .setCustomId(options.modalComponentOptions[3].customId)
                                .setLabel(options.modalComponentOptions[3].label)
                                .setStyle(options.modalComponentOptions[3].style)
                                .setMinLength(options.modalComponentOptions[3].minLength)
                                .setMaxLength(options.modalComponentOptions[3].maxLength)
                                .setPlaceholder(options.modalComponentOptions[3].placeholder)
                                .setRequired(options.modalComponentOptions[3].required)
                        ])
                    return modalTemplate
                }
                case 5: {
                    const modalTemplate = new Modal()
                        .setCustomId(options.modalOptions.customId)
                        .setTitle(options.modalOptions.title)
                        .addComponents([
                            new TextInputComponent()
                                .setCustomId(options.modalComponentOptions[0].customId)
                                .setLabel(options.modalComponentOptions[0].label)
                                .setStyle(options.modalComponentOptions[0].style)
                                .setMinLength(options.modalComponentOptions[0].minLength)
                                .setMaxLength(options.modalComponentOptions[0].maxLength)
                                .setPlaceholder(options.modalComponentOptions[0].placeholder)
                                .setRequired(options.modalComponentOptions[0].required),
                            new TextInputComponent()
                                .setCustomId(options.modalComponentOptions[1].customId)
                                .setLabel(options.modalComponentOptions[1].label)
                                .setStyle(options.modalComponentOptions[1].style)
                                .setMinLength(options.modalComponentOptions[1].minLength)
                                .setMaxLength(options.modalComponentOptions[1].maxLength)
                                .setPlaceholder(options.modalComponentOptions[1].placeholder)
                                .setRequired(options.modalComponentOptions[1].required),
                            new TextInputComponent()
                                .setCustomId(options.modalComponentOptions[2].customId)
                                .setLabel(options.modalComponentOptions[2].label)
                                .setStyle(options.modalComponentOptions[2].style)
                                .setMinLength(options.modalComponentOptions[2].minLength)
                                .setMaxLength(options.modalComponentOptions[2].maxLength)
                                .setPlaceholder(options.modalComponentOptions[2].placeholder)
                                .setRequired(options.modalComponentOptions[2].required),
                            new TextInputComponent()
                                .setCustomId(options.modalComponentOptions[3].customId)
                                .setLabel(options.modalComponentOptions[3].label)
                                .setStyle(options.modalComponentOptions[3].style)
                                .setMinLength(options.modalComponentOptions[3].minLength)
                                .setMaxLength(options.modalComponentOptions[3].maxLength)
                                .setPlaceholder(options.modalComponentOptions[3].placeholder)
                                .setRequired(options.modalComponentOptions[3].required),
                            new TextInputComponent()
                                .setCustomId(options.modalComponentOptions[4].customId)
                                .setLabel(options.modalComponentOptions[4].label)
                                .setStyle(options.modalComponentOptions[4].style)
                                .setMinLength(options.modalComponentOptions[4].minLength)
                                .setMaxLength(options.modalComponentOptions[4].maxLength)
                                .setPlaceholder(options.modalComponentOptions[4].placeholder)
                                .setRequired(options.modalComponentOptions[4].required)
                        ])
                    return modalTemplate
                }
            }
        }
        this.siteLogSend = function(embedObj) {
            let channel = this.channels.cache.get(this.config.discordInformation.channels.sitelogs)
            if(channel) {
                channel.send({ embeds: [embedObj] })
            }
        }
        this.webLogSend = function(embedObj) {
            let channel = this.channels.cache.get(this.config.discordInformation.channels.weblogs)
            if(channel) {
                channel.send({ embeds: [embedObj] })
            }
        }
        this.pingReviewer = function(channelId) {
            let guild = this.guilds.cache.get(this.config.discordInformation.Guild)
            let role = guild.roles.cache.get(this.config.discordInformation.roles.disbotreviewer)
            let channel = this.channels.cache.get(channelId)
            if(channel) {
                channel.send({ content: `${role}` })
            }
        }
        this.userSend = function(userObject, embedObject) {
            let user = this.users.cache.get(userObject)
            if(user) {
                try {
                    user.send({ embeds: [embedObject] })
                } catch (err) {}
            }
        }
        this.ticketSend = function(channelObj, embedObj) {
            let channel = this.channels.cache.find(chan => chan.name === `ticket-${channelObj}`)
            if(channel) {
                channel.send({ embeds: [embedObj] })
            }
        }
    }
}

const bot = new disbotApplication()

function init() {
    discordModals(bot);
    require('./Numbers.js')(bot);
    
    app.use(express.static('public'));
    app.use(bodyParser.urlencoded({ extended: false }));
    app.set('view engine', 'ejs');
    app.use(session({ secret: "keyboard cat", resave: false, saveUninitialized: false, cookie: { maxAge: 253402300000000} }));
    app.use(passport.initialize());
    app.use(passport.session());
    
    passport.serializeUser(function(user, done) { done(null, user) });
    passport.deserializeUser(function(obj, done) { done(null, obj) });
    passport.use(new DiscordStrategy({clientID: bot.config.botInformation.clientid,clientSecret: bot.config.botInformation.clientsecret,callbackURL: `${bot.baseOpts.url}/auth/discord/callback`,scope: scopes,prompt: prompt,},function(accessToken, refreshToken, profile, done) {process.nextTick(function() {return done(null, profile)});}));
    
    app.listen(bot.baseOpts.port, function() {console.log(`| [Port]: ${bot.baseOpts.port} |`);});
    
    require('../../routes/index.js')(app, bot, axios)
    require('../../routes/api.js')(app, bot)
    require('../../routes/bot.js')(app, bot)
    require('../../routes/user.js')(app, bot)
    require('../../routes/list.js')(app, bot)
    require('../../routes/staff.js')(app, bot)
    require('../../routes/ticket.js')(app, bot)
    require('../../routes/backend.js')(app, bot, axios)
    
    fs.readdir('./src/commands', function(err, files) {
        files.forEach(element => {
            if(element.endsWith('.js')) {
                let command = require(`../commands/${element}`)
                bot.commands.set(command.data.name, command)
                if(config.consoleDebug) {
                    console.log(`| [Slash Commands]: ${element} loaded. |`)
                }
                bot.numbers.commands++
            }
        })
    })
    fs.readdir('./src/commands/Context', function(err, files) {
        files.forEach(element => {
            if(element.endsWith('.js')) {
                let command = require(`../commands/Context/${element}`)
                bot.contextCommands.set(command.data.name, command)
                if(config.consoleDebug) {
                    console.log(`| [Context Commands]: ${element} loaded. |`)
                }
                bot.numbers.contextCommands++
            }
        })
    })
    fs.readdir('./src/events', function(err, files) {
        files.forEach(element => {
            if(element.endsWith('.js')) {
                let event = require(`../events/${element}`)
                event.run(bot)
                if(config.consoleDebug) {
                    console.log(`| [Events]: ${element} loaded. |`)
                }
                bot.numbers.events++
            }
        })
    })
    bot.login(bot.config.botInformation.token)
    app.use(function (req, res, next) {
        if(res.status(404)) {
            getDiscordUser(bot, req, async function(data){
                res.render('404', { discordInfo: data });
            });
        }
    });
    process.on('unhandledRejection', (err) => { 
        console.log('ERROR: \n\n', err.stack)
    });
}

exports.bot = bot;
exports.load = init;