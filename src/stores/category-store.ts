import { create } from 'zustand'
import { query, execute } from '@/lib/database'
import type { Category, NewCategory } from '@/types/category'

type CategoryState = {
  categories: Category[]
  isLoading: boolean
  error: string | null

  fetch: () => Promise<void>
  add: (category: NewCategory) => Promise<void>
  update: (id: string, data: Partial<Category>) => Promise<void>
  remove: (id: string) => Promise<void>
  getById: (id: string) => Category | undefined
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetch: async () => {
    set({ isLoading: true, error: null })
    try {
      const cats = await query<Category>('SELECT * FROM categories ORDER BY name ASC')
      set({
        categories: cats.map((c) => ({ ...c, is_default: Boolean(c.is_default) })),
        isLoading: false,
      })
    } catch (e) {
      set({ error: String(e), isLoading: false })
    }
  },

  add: async (category) => {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    await execute(
      `INSERT INTO categories (id, name, color, icon, is_default, created_at)
       VALUES (?, ?, ?, ?, 0, ?)`,
      [id, category.name, category.color, category.icon, now]
    )
    await get().fetch()
  },

  update: async (id, data) => {
    const fields: string[] = []
    const values: unknown[] = []

    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at' && key !== 'is_default') {
        fields.push(`${key} = ?`)
        values.push(value)
      }
    })

    values.push(id)
    await execute(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`, values)
    await get().fetch()
  },

  remove: async (id) => {
    const category = get().categories.find((c) => c.id === id)
    if (category?.is_default) {
      throw new Error('Cannot delete default category')
    }

    await execute('UPDATE subscriptions SET category_id = NULL WHERE category_id = ?', [id])
    await execute('DELETE FROM categories WHERE id = ?', [id])
    await get().fetch()
  },

  getById: (id) => get().categories.find((c) => c.id === id),
}))
