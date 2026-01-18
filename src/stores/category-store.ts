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

    // Create optimistic category object
    const newCategory: Category = {
      id,
      name: category.name,
      color: category.color,
      icon: category.icon,
      is_default: false,
      created_at: now,
    }

    // Optimistically add to state (sorted by name)
    set((state) => ({
      categories: [...state.categories, newCategory].sort((a, b) => a.name.localeCompare(b.name)),
    }))

    try {
      await execute(
        `INSERT INTO categories (id, name, color, icon, is_default, created_at)
         VALUES (?, ?, ?, ?, 0, ?)`,
        [id, category.name, category.color, category.icon, now]
      )
    } catch (error) {
      // Rollback on error
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
      }))
      console.error('Failed to add category:', error)
      throw error
    }
  },

  update: async (id, data) => {
    // Store previous state for rollback
    const previousCategories = get().categories
    const category = previousCategories.find((c) => c.id === id)
    if (!category) return

    // Optimistically update state
    set((state) => ({
      categories: state.categories
        .map((c) => (c.id === id ? { ...c, ...data } : c))
        .sort((a, b) => a.name.localeCompare(b.name)),
    }))

    const fields: string[] = []
    const values: unknown[] = []

    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at' && key !== 'is_default') {
        fields.push(`${key} = ?`)
        values.push(value)
      }
    })

    values.push(id)

    try {
      await execute(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`, values)
    } catch (error) {
      // Rollback on error
      set({ categories: previousCategories })
      console.error('Failed to update category:', error)
      throw error
    }
  },

  remove: async (id) => {
    const category = get().categories.find((c) => c.id === id)
    if (category?.is_default) {
      throw new Error('Cannot delete default category')
    }

    // Store previous state for rollback
    const previousCategories = get().categories

    // Optimistically remove from state
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    }))

    try {
      await execute('UPDATE subscriptions SET category_id = NULL WHERE category_id = ?', [id])
      await execute('DELETE FROM categories WHERE id = ?', [id])
    } catch (error) {
      // Rollback on error
      set({ categories: previousCategories })
      console.error('Failed to remove category:', error)
      throw error
    }
  },

  getById: (id) => get().categories.find((c) => c.id === id),
}))
