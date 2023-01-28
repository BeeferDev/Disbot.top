module.exports = (bot) => {
    bot.connection.query(`SELECT * FROM bots`, function(err, results) {
        results.forEach(element => {
            bot.numbers.bots++
        })
    })
    bot.connection.query(`SELECT * FROM users`, function(err, results) {
        results.forEach(element => {
            bot.numbers.users++
        })
    })
    bot.connection.query(`SELECT * FROM reports`, function(err, results) {
        results.forEach(element => {
            bot.numbers.reports++
        })
    })
    bot.connection.query(`SELECT * FROM auditlogs`, function(err, results) {
        results.forEach(element => {
            bot.numbers.audits++
        })
    })
    bot.connection.query(`SELECT * FROM contacts`, function(err, results) {
        results.forEach(element => {
            bot.numbers.tickets++
        })
    })
    bot.connection.query(`SELECT * FROM votes`, function(err, results) {
        results.forEach(element => {
            bot.numbers.votes++
        })
    })
    bot.connection.query(`SELECT * FROM partners`, function(err, results) {
        results.forEach(element => {
            bot.numbers.partners++
        })
    })
}