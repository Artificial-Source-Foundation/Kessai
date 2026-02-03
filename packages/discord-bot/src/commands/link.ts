import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  Colors,
  type SlashCommandOptionsOnlyBuilder,
} from 'discord.js'
import { existsSync } from 'fs'

export const data: SlashCommandOptionsOnlyBuilder = new SlashCommandBuilder()
  .setName('link')
  .setDescription('Check or update the Subby backup file path')
  .addStringOption((option) =>
    option
      .setName('path')
      .setDescription('New path to Subby backup file (leave empty to check current)')
      .setRequired(false)
  )

// Store the current path (in real app, this would be persisted)
let currentPath: string | null = null

export function setBackupPath(path: string): void {
  currentPath = path
}

export function getBackupPath(): string | null {
  return currentPath
}

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const newPath = interaction.options.getString('path')

  if (newPath) {
    // Validate the path
    const expandedPath = newPath.replace(/^~/, process.env.HOME || '')

    if (!existsSync(expandedPath)) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('❌ File Not Found')
            .setDescription(
              `Could not find file at: \`${newPath}\`\n\nMake sure you have exported your Subby data first.`
            )
            .setColor(Colors.Red),
        ],
        ephemeral: true,
      })
      return
    }

    setBackupPath(expandedPath)

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('✅ Backup Path Updated')
          .setDescription(`Now using: \`${newPath}\``)
          .setColor(Colors.Green),
      ],
      ephemeral: true,
    })
  } else {
    // Show current path
    const path = getBackupPath() || process.env.SUBBY_BACKUP_PATH || 'Not configured'

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('📁 Current Backup Path')
          .setDescription(`\`${path}\``)
          .addFields(
            {
              name: 'Default Paths',
              value:
                '**Linux:** `~/.local/share/subby/subby-backup.json`\n' +
                '**macOS:** `~/Library/Application Support/subby/subby-backup.json`\n' +
                '**Windows:** `%APPDATA%/subby/subby-backup.json`',
            },
            {
              name: 'Usage',
              value: 'Use `/link <path>` to set a custom backup file path.',
            }
          )
          .setColor(Colors.Blue),
      ],
      ephemeral: true,
    })
  }
}
