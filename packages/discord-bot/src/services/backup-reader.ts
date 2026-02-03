import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { z } from 'zod'

// Subscription schema matching Subby's export format
const subscriptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.number(),
  currency: z.string(),
  billing_cycle: z.enum(['weekly', 'monthly', 'quarterly', 'yearly', 'custom']),
  billing_day: z.number().nullable(),
  next_payment_date: z.string().nullable(),
  category_id: z.string().nullable(),
  color: z.string().nullable(),
  logo_url: z.string().nullable(),
  notes: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
})

const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  icon: z.string(),
  is_default: z.boolean(),
  created_at: z.string(),
})

const settingsSchema = z.object({
  theme: z.enum(['dark', 'light', 'system']),
  currency: z.string(),
  notification_enabled: z.boolean(),
  notification_days_before: z.array(z.number()),
})

const backupSchema = z.object({
  version: z.string(),
  exportedAt: z.string(),
  subscriptions: z.array(subscriptionSchema),
  categories: z.array(categorySchema),
  payments: z.array(z.unknown()), // We don't need payments for reminders
  settings: settingsSchema,
})

export type Subscription = z.infer<typeof subscriptionSchema>
export type Category = z.infer<typeof categorySchema>
export type Settings = z.infer<typeof settingsSchema>
export type BackupData = z.infer<typeof backupSchema>

export class BackupReader {
  private backupPath: string
  private cachedData: BackupData | null = null
  private lastReadTime: number = 0
  private cacheTTL: number = 60000 // 1 minute cache

  constructor(backupPath: string) {
    this.backupPath = backupPath.replace(/^~/, process.env.HOME || '')
  }

  async read(): Promise<BackupData | null> {
    // Check cache
    if (this.cachedData && Date.now() - this.lastReadTime < this.cacheTTL) {
      return this.cachedData
    }

    // Check if file exists
    if (!existsSync(this.backupPath)) {
      console.warn(`Backup file not found: ${this.backupPath}`)
      return null
    }

    try {
      const content = await readFile(this.backupPath, 'utf-8')
      const json = JSON.parse(content)
      const result = backupSchema.safeParse(json)

      if (!result.success) {
        console.error('Invalid backup file format:', result.error.issues)
        return null
      }

      this.cachedData = result.data
      this.lastReadTime = Date.now()
      return result.data
    } catch (error) {
      console.error('Failed to read backup file:', error)
      return null
    }
  }

  getActiveSubscriptions(data: BackupData): Subscription[] {
    return data.subscriptions.filter((sub) => sub.is_active)
  }

  getCategoryById(data: BackupData, categoryId: string | null): Category | undefined {
    if (!categoryId) return undefined
    return data.categories.find((cat) => cat.id === categoryId)
  }

  clearCache(): void {
    this.cachedData = null
    this.lastReadTime = 0
  }
}
