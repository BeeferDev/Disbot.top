const config = {
    discordInformation: {
        channels: {
            weblogs: "",
            sitelogs: "",
        },
        roles: {
            topOwner: "",
            developer: "",
            disbotuser: "",
            disbotreviewer: ""
        },
        tickets: {
            category: "",
            roles: [""]
        },
        Guild: "GUILD-ID"
    },
    botInformation: {
        token: "DISCORD-BOT-TOKEN",
        clientid: "APPLICATION-CLIENT-ID",
        clientsecret: "APPLICATION-CLIENT-SECRET",
        header: "Bot CHANGE-THIS-ONLY-WITH-DISCORD-BOT-TOKEN"
    },
    sqlInformation: {
        hostname: "localhost",
        username: "root",
        password: "",
        database: "disbot"
    },
    colors: {
        red: "#dc3545",
        green: "#93ff3d",
        orange: "#ec872e",
        blurple: "#738adb",
        discordGreyOne: "#2C2F33",
        discordGreyTwo: "#23272A"
    },
    baseURL: "http://localhost:3000",
    basePORT: 3000,
    consoleDebug: true
}

module.exports = config;