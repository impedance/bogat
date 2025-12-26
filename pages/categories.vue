<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted, reactive, ref } from 'vue'

import { useMoney } from '~/app/composables/useMoney'
import { categoryPayloadSchema, type Category, type CategoryType } from '~/app/types/budget'
import { useCategoriesStore } from '~/stores/categories'
import { useTransactionsStore } from '~/stores/transactions'

const categoriesStore = useCategoriesStore()
const transactionsStore = useTransactionsStore()

const { items: categories, categoriesByType, isLoading } = storeToRefs(categoriesStore)
const { balanceByCategory, isLoading: isTransactionsLoading } = storeToRefs(transactionsStore)

const money = useMoney({ currency: 'RUB' })

const form = reactive({
  name: '',
  type: 'expense' as CategoryType
})
const editingId = ref<Category['id'] | null>(null)
const formError = ref<string | null>(null)
const isSubmitting = ref(false)
const busyCategoryId = ref<string | null>(null)

const archivedCategories = computed(() => categories.value.filter((category) => category.archived))
const expenseCategories = computed(() => categoriesByType.value.expense)
const incomeCategories = computed(() => categoriesByType.value.income)
const hasActiveCategories = computed(
  () => expenseCategories.value.length + incomeCategories.value.length > 0
)

const categoryTypeLabels: Record<CategoryType, string> = {
  expense: 'Расход',
  income: 'Доход'
}

function resetForm() {
  form.name = ''
  form.type = 'expense'
  editingId.value = null
  formError.value = null
}

async function loadInitialData() {
  await Promise.all([
    categoriesStore.fetchCategories({ includeArchived: true }),
    transactionsStore.fetchTransactions()
  ])
}

function startEdit(category: Category) {
  editingId.value = category.id
  form.name = category.name
  form.type = category.type
}

async function submitCategory() {
  if (isSubmitting.value) return

  formError.value = null
  isSubmitting.value = true

  try {
    const parsed = categoryPayloadSchema.safeParse({
      name: form.name.trim(),
      type: form.type
    })

    if (!parsed.success) {
      const [issue] = parsed.error.issues
      throw new Error(issue?.message ?? 'Проверьте корректность полей.')
    }

    if (editingId.value) {
      await categoriesStore.updateCategory(editingId.value, parsed.data)
    } else {
      await categoriesStore.createCategory(parsed.data)
    }

    resetForm()
  } catch (error) {
    formError.value =
      error instanceof Error
        ? error.message
        : 'Не удалось сохранить категорию. Попробуйте ещё раз.'
  } finally {
    isSubmitting.value = false
  }
}

async function toggleArchive(category: Category) {
  if (busyCategoryId.value) return

  busyCategoryId.value = category.id

  try {
    if (category.archived) {
      await categoriesStore.unarchiveCategory(category.id)
    } else {
      await categoriesStore.archiveCategory(category.id)
    }
  } finally {
    busyCategoryId.value = null
  }
}

function categoryBalanceLabel(categoryId: Category['id']) {
  const balance = balanceByCategory.value[categoryId] ?? 0
  const formatted = money.formatMoney(Math.abs(balance), { signDisplay: 'never' })
  return balance >= 0 ? `+${formatted}` : `-${formatted}`
}

onMounted(() => {
  void loadInitialData()
})
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-2">
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="text-xs uppercase tracking-wide text-slate-500">Категории</p>
          <h2 class="text-2xl font-bold tracking-tight">Доходы и расходы в одном месте</h2>
        </div>
        <p class="text-xs text-slate-500">Этап 2 — подключаем формы</p>
      </div>
      <p class="text-sm text-slate-400">
        Добавляйте свои категории, редактируйте названия и архивируйте ненужные. Архив не влияет на
        историю транзакций.
      </p>
    </header>

    <section class="grid gap-6 lg:grid-cols-[360px,1fr]">
      <div class="rounded-lg border border-slate-800 bg-surface-subtle/50 p-5">
        <div class="flex items-start justify-between gap-2">
          <div>
            <h3 class="text-lg font-semibold">
              {{ editingId ? 'Редактирование категории' : 'Новая категория' }}
            </h3>
            <p class="text-sm text-slate-400">Поддерживаются типы доход/расход.</p>
          </div>
          <div v-if="isLoading" class="text-xs text-slate-500">Загрузка…</div>
        </div>

        <form class="mt-4 space-y-3" @submit.prevent="submitCategory">
          <label class="space-y-1 text-sm block">
            <span class="text-slate-300">Название</span>
            <input
              v-model="form.name"
              type="text"
              class="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm"
              placeholder="Напр., Кафе"
              required
            />
          </label>

          <label class="space-y-1 text-sm block">
            <span class="text-slate-300">Тип</span>
            <select
              v-model="form.type"
              class="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm"
            >
              <option value="expense">Расход</option>
              <option value="income">Доход</option>
            </select>
          </label>

          <div class="flex items-center gap-2 text-xs text-slate-500">
            <span class="rounded-full border border-slate-800 px-2 py-1">Активных: {{ expenseCategories.length + incomeCategories.length }}</span>
            <span class="rounded-full border border-slate-800 px-2 py-1">Архив: {{ archivedCategories.length }}</span>
          </div>

          <div
            v-if="formError"
            class="rounded border border-rose-500/60 bg-rose-500/10 px-3 py-2 text-sm text-rose-100"
          >
            {{ formError }}
          </div>

          <div class="flex gap-2">
            <button
              type="submit"
              class="flex-1 rounded bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-700"
              :disabled="isSubmitting"
            >
              <span v-if="isSubmitting">Сохраняем…</span>
              <span v-else>{{ editingId ? 'Обновить' : 'Сохранить' }}</span>
            </button>
            <button
              v-if="editingId"
              type="button"
              class="flex-1 rounded border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500"
              @click="resetForm"
            >
              Сбросить
            </button>
          </div>
        </form>
      </div>

      <div class="space-y-6 rounded-lg border border-slate-800 bg-surface-subtle/50 p-5">
        <div class="flex items-center justify-between gap-3">
          <div>
            <h3 class="text-lg font-semibold">Текущие категории</h3>
            <p class="text-sm text-slate-400">
              Доступные в формах транзакций. Отдельно по расходам и доходам.
            </p>
          </div>
          <div v-if="isTransactionsLoading" class="text-xs text-slate-500">Обновление…</div>
        </div>

        <div v-if="!hasActiveCategories && !isLoading" class="rounded border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300">
          Пока нет активных категорий. Добавьте хотя бы одну для расходов и доходов.
        </div>

        <div v-else class="grid gap-4 md:grid-cols-2" data-testid="categories-list">
          <div class="space-y-2 rounded border border-slate-800 bg-slate-900/50 p-3">
            <div class="flex items-center justify-between text-sm">
              <p class="font-semibold text-slate-100">Расходы</p>
              <p class="text-xs text-slate-500">{{ expenseCategories.length }} шт.</p>
            </div>
            <ul class="divide-y divide-slate-800">
              <li
                v-for="category in expenseCategories"
                :key="category.id"
                class="flex items-start justify-between gap-3 py-2"
              >
                <div class="space-y-0.5">
                  <div class="flex items-center gap-2">
                    <p class="text-sm font-semibold text-slate-100">{{ category.name }}</p>
                    <span
                      v-if="category.isDefault"
                      class="rounded-full border border-slate-700 px-2 py-0.5 text-[11px] uppercase tracking-wide text-slate-400"
                    >
                      Default
                    </span>
                  </div>
                  <p class="text-xs text-slate-500">
                    Баланс: {{ categoryBalanceLabel(category.id) }}
                  </p>
                </div>
                <div class="flex gap-2">
                  <button
                    type="button"
                    class="rounded border border-slate-700 px-2 py-1 text-xs font-semibold text-slate-200 transition hover:border-slate-500"
                    @click="startEdit(category)"
                  >
                    Редактировать
                  </button>
                  <button
                    type="button"
                    class="rounded border border-slate-700 px-2 py-1 text-xs font-semibold text-amber-200 transition hover:border-amber-300"
                    :disabled="busyCategoryId === category.id"
                    @click="toggleArchive(category)"
                  >
                    {{ busyCategoryId === category.id ? '...' : 'В архив' }}
                  </button>
                </div>
              </li>
            </ul>
          </div>

          <div class="space-y-2 rounded border border-slate-800 bg-slate-900/50 p-3">
            <div class="flex items-center justify-between text-sm">
              <p class="font-semibold text-slate-100">Доходы</p>
              <p class="text-xs text-slate-500">{{ incomeCategories.length }} шт.</p>
            </div>
            <ul class="divide-y divide-slate-800">
              <li
                v-for="category in incomeCategories"
                :key="category.id"
                class="flex items-start justify-between gap-3 py-2"
              >
                <div class="space-y-0.5">
                  <div class="flex items-center gap-2">
                    <p class="text-sm font-semibold text-slate-100">{{ category.name }}</p>
                    <span
                      v-if="category.isDefault"
                      class="rounded-full border border-slate-700 px-2 py-0.5 text-[11px] uppercase tracking-wide text-slate-400"
                    >
                      Default
                    </span>
                  </div>
                  <p class="text-xs text-slate-500">
                    Баланс: {{ categoryBalanceLabel(category.id) }}
                  </p>
                </div>
                <div class="flex gap-2">
                  <button
                    type="button"
                    class="rounded border border-slate-700 px-2 py-1 text-xs font-semibold text-slate-200 transition hover:border-slate-500"
                    @click="startEdit(category)"
                  >
                    Редактировать
                  </button>
                  <button
                    type="button"
                    class="rounded border border-slate-700 px-2 py-1 text-xs font-semibold text-amber-200 transition hover:border-amber-300"
                    :disabled="busyCategoryId === category.id"
                    @click="toggleArchive(category)"
                  >
                    {{ busyCategoryId === category.id ? '...' : 'В архив' }}
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div v-if="archivedCategories.length" class="space-y-2">
          <div class="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
            <span class="h-px flex-1 bg-slate-800"></span>
            Архивированные
            <span class="h-px flex-1 bg-slate-800"></span>
          </div>

          <ul class="divide-y divide-slate-800 rounded border border-slate-800 bg-slate-900/50">
            <li
              v-for="category in archivedCategories"
              :key="category.id"
              class="flex items-center justify-between gap-3 px-3 py-2 text-sm text-slate-300"
            >
              <div class="space-y-0.5">
                <p class="font-semibold text-slate-100">{{ category.name }}</p>
                <p class="text-xs text-slate-500">{{ categoryTypeLabels[category.type] }}</p>
              </div>
              <button
                type="button"
                class="rounded border border-slate-700 px-2 py-1 text-xs font-semibold text-emerald-200 transition hover:border-emerald-400"
                :disabled="busyCategoryId === category.id"
                @click="toggleArchive(category)"
              >
                {{ busyCategoryId === category.id ? '...' : 'Вернуть' }}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </section>
</template>
