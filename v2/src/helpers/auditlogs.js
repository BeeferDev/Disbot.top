function createAudit(bot, options, user) {
    // let options = {
    //     action: 1,
    //     string: ``
    // }

    let date = new Date().toLocaleString()
    bot.connection.query(`INSERT INTO auditlogs (action_type,action_msg,action_user,action_date) VALUES (${options.action},'${options.string}','${user}','${date}')`, function(err, result) {
        if(err) console.log(err)
    })
}
module.exports = createAudit