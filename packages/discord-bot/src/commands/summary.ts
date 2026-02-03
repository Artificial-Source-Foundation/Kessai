import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  type SlashCommandOptionsOnlyBuilder,
} from 'discord.js'
import type { ReminderService } from '../services/reminder-service.js'
import { buildSummaryEmbed, buildErrorEmbed } from '../services/embed-builder.js'

export const data: SlashCommandOptionsOnlyBuilder = new SlashCommandBuilder()
  .setName('summary')
  .setDescription('Show monthly subscription summary and spending breakdown')

export async function execute(
  interaction: ChatInputCommandInteraction,
  reminderService: ReminderService
): Promise<void> {
  await interaction.deferReply()

  try {
    const backupData = await reminderService.getBackupData()
    if (!backupData) {
      await interaction.editReply({
        embeds: [
          buildErrorEmbed(
            'Could not read Subby backup file. Make sure the path is correct and you have exported your data.'
          ),
        ],
      })
      return
    }

    const { total, currency, subscriptions } = await reminderService.getMonthlySummary()
    const embed = buildSummaryEmbed(total, currency, subscriptions, backupData.categories)

    await interaction.editReply({ embeds: [embed] })
  } catch (error) {
    console.error('Error in /summary command:', error)
    await interaction.editReply({
      embeds: [buildErrorEmbed('An error occurred while generating the summary.')],
    })
  }
}
