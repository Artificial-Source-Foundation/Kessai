import { useEffect } from 'react'
import { useCategoryStore } from '@/stores/category-store'

export function useCategories() {
  const { categories, isLoading, error, fetch, add, update, remove, getById } = useCategoryStore()

  useEffect(() => {
    fetch()
  }, [fetch])

  const defaultCategories = categories.filter((c) => c.is_default)
  const customCategories = categories.filter((c) => !c.is_default)

  return {
    categories,
    defaultCategories,
    customCategories,
    isLoading,
    error,
    add,
    update,
    remove,
    getById,
    refresh: fetch,
  }
}
