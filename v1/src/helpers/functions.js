function convertStrings(obj, type) {
    if(obj == "code") {
        if(type == 0) return `<span style="color: #FFFFFF"><code>User</code></span>`
        if(type == 1) return `<span style="color: #bb4242"><code>Reviewer</code></span>`
        if(type == 2) return `<span style="color: #fd7777"><code>Administrator</code></span>`
    }
    if(obj == "noncode") {
        if(type == 0) return `<span style="color: #FFFFFF">User</span>`
        if(type == 1) return `<span style="color: #bb4242">Reviewer</span>`
        if(type == 2) return `<span style="color: #fd7777">Administrator</span>`
    }
    if(obj == "staff") {
        if(type == 0) return `User`
        if(type == 1) return `Reviewer`
        if(type == 2) return `Administrator`
    }
    if(obj == "status") {
        if(type == 0) return "No"
        if(type == 1) return "Yes"
    }
    if(obj == "blacklisted") {
        if(type == 0) return `<span style="color: #FFFFFF">No</span>`
        if(type == 1) return `<span style="color: #bb4242">Yes</span>` 
    }
    if(obj == "pban") {
        if(type == 0) return `<span style="color: #FFFFFF">No</span>`
        if(type == 1) return `<span style="color: #bb4242">Yes</span>` 
    }
    if(obj == "actions") {
        if(type == 1) return "Permission Change"
        if(type == 2) return "Bot Edit"
        if(type == 3) return "Bot Added"
        if(type == 4) return "Bot Vote"
        if(type == 5) return "Alert Update"
        if(type == 6) return "Report Created"
        if(type == 7) return "Bot Approved"
        if(type == 8) return "Bot Denied"
        if(type == 9) return "Ticket Created"
        if(type == 10) return "Report Complete"
        if(type == 11) return "Bot Deleted"
        if(type == 12) return "Votes Boosted"
        if(type == 13) return "Votes Unboosted"
        if(type == 14) return "Bot Status"
        if(type == 15) return "Changelog Created"
        if(type == 16) return "Changelog Deleted"
        if(type == 17) return "Ticket Comment"
        if(type == 18) return "Endpoint Created"
        if(type == 19) return "Endpoint Deleted"
        if(type == 20) return "User Edited"
        if(type == 21) return "Blacklist Add"
        if(type == 22) return "Blacklist Remove"
        if(type == 23) return "Post Ban Add"
        if(type == 24) return "Post Ban Remove" 
        if(type == 25) return "Social Update"
        if(type == 26) return "Token Regeneration"
        if(type == 27) return "Advertise Created"
        if(type == 28) return "Advertise Removed"        
    }
    if(obj == "ticketstatus") {
        if(type == 0) return `<span style="color: red">Closed</span>`
        if(type == 1) return `<span style="color: green">Open</span>`
    }
}

function audit(con, action, str, user) {
    let date = new Date()
    con.query(`INSERT INTO auditlogs (action_type,action_msg,action_user,action_date) VALUES (${action},'${str}','${user}','${date.toLocaleString()}')`, function(err, result) {
        if(err) console.log(err)
    })
}

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

module.exports = {
    convertStrings,
    makeid,
    audit,
}