import { defineStore } from 'pinia'

import {
  createCategory as createCategoryRepository,
  listCategories,
  setCategoryArchived,
  updateCategory as updateCategoryRepository,
  type ListCategoriesOptions
} from '~/app/repositories/categories'
import type { Category, CategoryPayload, CategoryType } from '~/app/types/budget'

interface CategoriesState {
  items: Category[]
  isLoading: boolean
  lastFetchOptions: ListCategoriesOptions
}

const DEFAULT_FETCH_OPTIONS: ListCategoriesOptions = {
  includeArchived: true
}

function resolveFetchOptions(options?: ListCategoriesOptions): ListCategoriesOptions {
  return {
    ...DEFAULT_FETCH_OPTIONS,
    ...options
  }
}

export const useCategoriesStore = defineStore('categories', {
  state: (): CategoriesState => ({
    items: [],
    isLoading: false,
    lastFetchOptions: { ...DEFAULT_FETCH_OPTIONS }
  }),
  getters: {
    activeCategories: (state) => state.items.filter((category) => !category.archived),
    categoriesByType: (state) =>
      state.items.reduce<Record<CategoryType, Category[]>>(
        (acc, category) => {
          if (!category.archived) {
            acc[category.type].push(category)
          }
          return acc
        },
        { income: [], expense: [] }
      ),
    incomeCategories(): Category[] {
      return this.categoriesByType.income
    },
    expenseCategories(): Category[] {
      return this.categoriesByType.expense
    },
    categoryMap: (state) =>
      state.items.reduce<Record<Category['id'], Category>>((map, category) => {
        map[category.id] = category
        return map
      }, {}),
    categoryById: (state) => (id: Category['id']) =>
      state.items.find((category) => category.id === id)
  },
  actions: {
    async fetchCategories(options?: ListCategoriesOptions) {
      const nextOptions = resolveFetchOptions(options ?? this.lastFetchOptions)
      this.isLoading = true

      try {
        this.items = await listCategories(nextOptions)
        this.lastFetchOptions = nextOptions
      } finally {
        this.isLoading = false
      }
    },
    async refresh() {
      await this.fetchCategories(this.lastFetchOptions)
    },
    async createCategory(payload: CategoryPayload) {
      await createCategoryRepository(payload)
      await this.refresh()
    },
    async updateCategory(id: Category['id'], payload: CategoryPayload) {
      await updateCategoryRepository(id, payload)
      await this.refresh()
    },
    async archiveCategory(id: Category['id']) {
      await setCategoryArchived(id, true)
      await this.refresh()
    },
    async unarchiveCategory(id: Category['id']) {
      await setCategoryArchived(id, false)
      await this.refresh()
    }
  }
})
