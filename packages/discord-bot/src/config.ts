import { z } from 'zod'
import { homedir } from 'os'
import { join } from 'path'

const envSchema = z.object({
  DISCORD_TOKEN: z.string().min(1, 'Discord token is required'),
  DISCORD_USER_ID: z.string().min(1, 'Discord user ID is required'),
  DISCORD_CHANNEL_ID: z.string().optional(),
  SUBBY_BACKUP_PATH: z.string().default(() => {
    // Default path based on OS
    const home = homedir()
    if (process.platform === 'darwin') {
      return join(home, 'Library/Application Support/subby/subby-backup.json')
    } else if (process.platform === 'win32') {
      return join(process.env.APPDATA || home, 'subby/subby-backup.json')
    }
    return join(home, '.local/share/subby/subby-backup.json')
  }),
  REMINDER_TIME: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .default('09:00'),
  TIMEZONE: z.string().default('UTC'),
})

function loadConfig() {
  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    console.error('Invalid configuration:')
    result.error.issues.forEach((issue) => {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`)
    })
    process.exit(1)
  }

  return result.data
}

export const config = loadConfig()

export type Config = z.infer<typeof envSchema>
