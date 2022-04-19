const client = require('../index')
const Discord = require('discord.js')

client.on('ready', () => {
    Object.assign(Discord.TextChannel.prototype, {
        sendM(txt, ...components) {
            return this.send(typeof txt == 'object' ? {embeds: [txt], components} : {content: txt, components})
        }
    })
    const ch = client.channels.cache.get('911684828246728704')
    let embed = new Discord.MessageEmbed().setTimestamp().setColor('BLUE'),
    row = new Discord.MessageActionRow().addComponents(new Discord.MessageButton().setStyle('PRIMARY').setLabel('Support').setCustomId('support'), new Discord.MessageButton().setStyle('PRIMARY').setLabel('Scholars Support').setCustomId('scholars'))
    embed.setTitle('Press a button to open a ticket.')
    // ch.sendM(embed, row)
})

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return
    const send = (txt, ephemeral, ...components) => interaction.reply(typeof txt == 'object' ? {embeds: [txt], components, ephemeral} : {content: txt, components, ephemeral})
    let embed = new Discord.MessageEmbed().setTimestamp().setColor('BLUE'),
        row = new Discord.MessageActionRow().addComponents(new Discord.MessageButton().setStyle('PRIMARY').setLabel('Support').setCustomId('support'), new Discord.MessageButton().setStyle('PRIMARY').setLabel('Scholars Support').setCustomId('scholars')),
        permis = interaction.channel.permissionOverwrites.cache.find((a) => a.type == 'member')

    function createTicket(msg) {
        row = new Discord.MessageActionRow().addComponents(new Discord.MessageButton().setLabel('Close Ticket').setStyle('PRIMARY').setCustomId('close'), new Discord.MessageButton().setCustomId('delete').setLabel('Delete ticket').setStyle('DANGER'))
        interaction.guild.channels
            .create('ticket-' + interaction.user.tag, {
                permissionOverwrites: [
                    {
                        id: interaction.user.id,
                        allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES']
                    },
                    {
                        id: interaction.guild.roles.everyone,
                        deny: ['VIEW_CHANNEL']
                    },
                    {
                        id: '868256646252613662',
                        allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES']
                    },
                    {
                        id: '868328584916385812',
                        allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES']
                    }
                ],
                reason: 'New ticket'
            })
            .then(async (c) => {
                embed.setDescription('Your ticket has been created: <#' + c + '>')
                await interaction.reply({embeds: [embed], ephemeral: true})
                c.sendM(embed.setTitle('New ticket').setDescription('A new ' + msg + ' ticket has been created.'), row)
            })
    }
    const hasTicket = interaction.guild.channels.cache.find(a => a.name.includes('ticket-' + interaction.user.username.toLowerCase()))
    if (interaction.customId == 'support') {
        if (hasTicket) return send('You already have a ticket opened: ' + hasTicket.toString(), true)
        interaction.member.roles.add('911696777793658961').catch(() => '')
        createTicket('support')
    }
    if (interaction.customId == 'scholars') {
        if (hasTicket) return send('You already have a ticket opened: ' + hasTicket.toString(), true)
        if (!interaction.member.roles.cache.has('868330857658740767')) return send("You don't have the Scholar role", true)
        interaction.member.roles.add('911696712299606067').catch((_) => '')
        createTicket('scholar')
    }
    if (interaction.customId == 'close') {
        embed.setTitle('Closed').setDescription('The ticket has been closed.').setColor('YELLOW')
        let row = new Discord.MessageActionRow().addComponents(
            new Discord.MessageButton().setCustomId('reopen').setLabel('Re-open ticket').setStyle('SUCCESS'),
            new Discord.MessageButton().setCustomId('delete').setLabel('Delete ticket').setStyle('DANGER'))
        interaction.channel.permissionOverwrites
            .edit(permis.id, {
                VIEW_CHANNEL: false
            })
            .then(() => {
                interaction.reply({
                    embeds: [embed],
                    components: [row]
                })
            })
    }
    if (interaction.customId == 'delete') {
        embed.setColor('GREEN').setDescription('Deleting ticket...').setTitle('The ticket will be deleted soon.').setColor('BLUE')
        row = new Discord.MessageActionRow().addComponents(new Discord.MessageButton().setCustomId('reopen').setLabel('Open the ticket again').setDisabled(true).setStyle('SUCCESS'), new Discord.MessageButton().setCustomId('ticket-delete').setDisabled(true).setLabel('Delete ticket').setStyle('DANGER'))
        await interaction.update({embeds: [embed], components: [row]})
        setTimeout(() => (interaction.channel ? interaction.channel.delete().catch(() => send("I don't have permissions!")) : 1), 5000)
    }
    if (interaction.customId == 'reopen') {
        interaction.channel.permissionOverwrites
            .edit(permis.id, {
                VIEW_CHANNEL: true
            })
            .then(async () => {
                embed.setColor('GREEN')
                .setDescription('The ticket has been re-opened.')
                .setTitle('Success!')
                row = new Discord.MessageActionRow().addComponents(new Discord.MessageButton().setCustomId('reopen').setLabel('Re-open ticket').setDisabled(true).setStyle('SUCCESS'), new Discord.MessageButton().setCustomId('delete').setLabel('Delete ticket').setStyle('DANGER'))
                await interaction.update({embeds: [embed], components: [row]})
            })
    }
})

