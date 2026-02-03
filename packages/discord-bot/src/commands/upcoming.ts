import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  type SlashCommandOptionsOnlyBuilder,
} from 'discord.js'
import type { ReminderService } from '../services/reminder-service.js'
import { buildUpcomingEmbed, buildErrorEmbed } from '../services/embed-builder.js'

export const data: SlashCommandOptionsOnlyBuilder = new SlashCommandBuilder()
  .setName('upcoming')
  .setDescription('Show upcoming subscription payments')
  .addIntegerOption((option) =>
    option
      .setName('days')
      .setDescription('Number of days to look ahead (default: 7)')
      .setMinValue(1)
      .setMaxValue(30)
      .setRequired(false)
  )

export async function execute(
  interaction: ChatInputCommandInteraction,
  reminderService: ReminderService
): Promise<void> {
  await interaction.deferReply()

  const days = interaction.options.getInteger('days') ?? 7

  try {
    const data = await reminderService.getBackupData()
    if (!data) {
      await interaction.editReply({
        embeds: [
          buildErrorEmbed(
            'Could not read Subby backup file. Make sure the path is correct and you have exported your data.'
          ),
        ],
      })
      return
    }

    const payments = await reminderService.getUpcomingPayments(days)
    const embed = buildUpcomingEmbed(payments, data.settings.currency, data.categories)

    embed.setFooter({ text: `Showing payments for the next ${days} days` })

    await interaction.editReply({ embeds: [embed] })
  } catch (error) {
    console.error('Error in /upcoming command:', error)
    await interaction.editReply({
      embeds: [buildErrorEmbed('An error occurred while fetching upcoming payments.')],
    })
  }
}
