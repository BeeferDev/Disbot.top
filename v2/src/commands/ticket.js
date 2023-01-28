module.exports.data = {
    name: "ticket",
    description: "Create a support ticket. Cross-connection to website/discord."
}, module.exports.run = async (bot, interaction) => {
    let options = {
        questionAmount: 1,
        modalOptions: {
            customId: "modal-tickets",
            title: "Ticket Creation"
        },
        modalComponentOptions: [
            {
                customId: "question-1",
                label: "How may we help you today?",
                style: "LONG",
                minLength: 4,
                maxLength: 1024,
                placeholder: "Please give as much details as possible. Thanks!",
                required: true
            }
        ]
    }
    let modal = bot.createTextModal(options)
    bot.modalShow(modal, bot, interaction)
}