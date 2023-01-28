function convertStrings(object, type) {
    switch(object) {
        case "code": {
            if(type == 0) return `<span style="color: #FFFFFF"><code>User</code></span>`
            if(type == 1) return `<span style="color: #bb4242"><code>Reviewer</code></span>`
            if(type == 2) return `<span style="color: #fd7777"><code>Administrator</code></span>`
        }
        case "noncode": {
            if(type == 0) return `<span style="color: #FFFFFF">User</span>`
            if(type == 1) return `<span style="color: #bb4242">Reviewer</span>`
            if(type == 2) return `<span style="color: #fd7777">Administrator</span>`
        }
        case "staffroles": {
            if(type == 0) return `User`
            if(type == 1) return `Reviewer`
            if(type == 2) return `Administrator`
        }
        case "status": {
            if(type == 0) return "No"
            if(type == 1) return "Yes"
        }
        case "ticketstatus": {
            if(type == 0) return `<span style="color: red">Closed</span>`
            if(type == 1) return `<span style="color: green">Open</span>`
        }
        case "punishstatus": {
            if(type == 0) return `<span style="color: #FFFFFF">No</span>`
            if(type == 1) return `<span style="color: #bb4242">Yes</span>` 
        }
        case "actions": {
            if(type == 1) return "Permission Change"
            if(type == 2) return "Bot Edit"
            if(type == 3) return "Bot Added"
            if(type == 4) return "Bot Vote"
            if(type == 5) return "Alert Update"
            if(type == 6) return "Report Created"
            if(type == 7) return "Bot Approved"
            if(type == 8) return "Bot Denied"
            if(type == 9) return "Ticket Created - Website"
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
            if(type == 29) return "Ticket Created - Discord"
            if(type == 30) return "Partner Add"
            if(type == 31) return "Partner Remove"
            if(type == 32) return "Unauthorized Access"
            if(type == 33) return "Authorized Access"
        }
    }
}
function convertData(object, type) {
    switch(object) {
        case "prefix": {
            if(type == 0) return "Fixed"
            if(type == 1) return "Customizable"
        }
        case "socials": {
            if(type == "null") {
                return 'Not set'
            } else return type
        }
        case "cert": {
            if(type == 0) return "No"
            if(type == 1) return "Yes"
        }
        case "permissions": {
            if(type == 0) return "User"
            if(type == 1) return "Reviewer"
            if(type == 2) return "Administrator"
        }
    }
}
exports.convertData = convertData
exports.convertStrings = convertStrings