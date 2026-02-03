import 'dotenv/config'
import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  Collection,
  type ChatInputCommandInteraction,
} from 'discord.js'
import cron from 'node-cron'
import { config } from './config.js'
import { BackupReader } from './services/backup-reader.js'
import { ReminderService } from './services/reminder-service.js'
import { buildReminderEmbed, buildErrorEmbed } from './services/embed-builder.js'

// Import commands
import * as upcomingCommand from './commands/upcoming.js'
import * as summaryCommand from './commands/summary.js'
import * as linkCommand from './commands/link.js'

// Initialize services
const backupReader = new BackupReader(config.SUBBY_BACKUP_PATH)
const reminderService = new ReminderService(backupReader)

// Command collection
const commands = new Collection<
  string,
  {
    data: { name: string; toJSON: () => unknown }
    execute: (
      interaction: ChatInputCommandInteraction,
      reminderService: ReminderService
    ) => Promise<void>
  }
>()

commands.set(upcomingCommand.data.name, upcomingCommand)
commands.set(summaryCommand.data.name, summaryCommand)
commands.set(linkCommand.data.name, linkCommand as typeof upcomingCommand)

// Create client
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
})

// Register slash commands
async function registerCommands(): Promise<void> {
  const rest = new REST().setToken(config.DISCORD_TOKEN)

  const commandData = [
    upcomingCommand.data.toJSON(),
    summaryCommand.data.toJSON(),
    linkCommand.data.toJSON(),
  ]

  try {
    console.log('Registering slash commands...')

    // Register globally (takes up to 1 hour to propagate)
    await rest.put(Routes.applicationCommands(client.user!.id), {
      body: commandData,
    })

    console.log('Slash commands registered successfully!')
  } catch (error) {
    console.error('Failed to register slash commands:', error)
  }
}

// Handle interactions
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return

  const command = commands.get(interaction.commandName)
  if (!command) return

  try {
    await command.execute(interaction, reminderService)
  } catch (error) {
    console.error(`Error executing command ${interaction.commandName}:`, error)

    const errorEmbed = buildErrorEmbed('An error occurred while executing this command.')

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ embeds: [errorEmbed], ephemeral: true })
    } else {
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true })
    }
  }
})

// Daily reminder function
async function sendDailyReminder(): Promise<void> {
  console.log('Checking for subscription reminders...')

  try {
    const data = await reminderService.getBackupData()
    if (!data) {
      console.warn('Could not read backup data for daily reminder')
      return
    }

    const payments = await reminderService.getPaymentsForReminder()

    if (payments.length === 0) {
      console.log('No payments due for reminder days')
      return
    }

    const embed = buildReminderEmbed(payments, data.settings.currency, data.categories)

    // Send to channel or DM
    if (config.DISCORD_CHANNEL_ID) {
      const channel = await client.channels.fetch(config.DISCORD_CHANNEL_ID)
      if (channel?.isTextBased() && 'send' in channel) {
        await channel.send({ embeds: [embed] })
        console.log(`Sent reminder to channel ${config.DISCORD_CHANNEL_ID}`)
      }
    } else {
      // Send DM
      const user = await client.users.fetch(config.DISCORD_USER_ID)
      await user.send({ embeds: [embed] })
      console.log(`Sent reminder DM to user ${config.DISCORD_USER_ID}`)
    }
  } catch (error) {
    console.error('Failed to send daily reminder:', error)
  }
}

// Client ready
client.once('ready', async () => {
  console.log(`Logged in as ${client.user?.tag}!`)

  // Register commands
  await registerCommands()

  // Set up daily reminder cron job
  const [hour, minute] = config.REMINDER_TIME.split(':')
  const cronExpression = `${minute} ${hour} * * *`

  cron.schedule(cronExpression, sendDailyReminder, {
    timezone: config.TIMEZONE,
  })

  console.log(`Daily reminders scheduled for ${config.REMINDER_TIME} (${config.TIMEZONE})`)
  console.log('Bot is ready!')
})

// Start the bot
client.login(config.DISCORD_TOKEN)
