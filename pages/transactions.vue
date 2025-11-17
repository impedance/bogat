<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted, reactive, ref, watch } from 'vue'

import { useMoney } from '~/app/composables/useMoney'
import { transactionPayloadSchema, type CategoryType } from '~/app/types/budget'
import { useAccountsStore } from '~/stores/accounts'
import { useCategoriesStore } from '~/stores/categories'
import { useTransactionsStore } from '~/stores/transactions'

const accountsStore = useAccountsStore()
const categoriesStore = useCategoriesStore()
const transactionsStore = useTransactionsStore()

const { activeAccounts, accountMap } = storeToRefs(accountsStore)
const { activeCategories, categoryMap } = storeToRefs(categoriesStore)
const {
  transactions,
  filters,
  isLoading: isTransactionsLoading,
  incomeTotal,
  expenseTotal,
  overallBalance
} = storeToRefs(transactionsStore)

const money = useMoney({ currency: 'RUB' })

const form = reactive({
  type: 'expense' as CategoryType,
  accountId: '',
  categoryId: '',
  amount: '',
  date: new Date().toISOString().slice(0, 10),
  note: ''
})
const formError = ref<string | null>(null)
const isSubmitting = ref(false)

const filterForm = reactive({
  accountId: '',
  categoryId: '',
  type: '',
  from: '',
  to: '',
  search: ''
})
const isApplyingFilters = ref(false)

const availableCategories = computed(() =>
  activeCategories.value.filter((category) => category.type === form.type)
)

function ensureDefaults() {
  if (!form.accountId && activeAccounts.value.length > 0) {
    form.accountId = activeAccounts.value[0].id
  }

  const currentCategory = availableCategories.value.find(
    (category) => category.id === form.categoryId
  )
  if (!currentCategory && availableCategories.value.length > 0) {
    form.categoryId = availableCategories.value[0].id
  }
}

function syncFiltersFromStore() {
  filterForm.accountId = filters.value.accountId ?? ''
  filterForm.categoryId = filters.value.categoryId ?? ''
  filterForm.type = filters.value.type ?? ''
  filterForm.from = filters.value.dateRange?.from ?? ''
  filterForm.to = filters.value.dateRange?.to ?? ''
  filterForm.search = filters.value.search ?? ''
}

async function loadInitialData() {
  await Promise.all([
    accountsStore.fetchAccounts({ includeArchived: false }),
    categoriesStore.fetchCategories({ includeArchived: false })
  ])

  ensureDefaults()
  await transactionsStore.fetchTransactions()
  syncFiltersFromStore()
}

async function submitTransaction() {
  if (isSubmitting.value) return

  formError.value = null
  isSubmitting.value = true

  try {
    const amountMinor = money.toMinor(form.amount)
    if (amountMinor <= 0) {
      throw new Error('Сумма должна быть больше нуля.')
    }

    const payload = {
      accountId: form.accountId,
      categoryId: form.categoryId,
      type: form.type,
      amountMinor,
      date: form.date,
      note: form.note.trim() || undefined
    }

    const parsed = transactionPayloadSchema.safeParse(payload)
    if (!parsed.success) {
      const [issue] = parsed.error.issues
      throw new Error(issue?.message ?? 'Проверьте корректность полей.')
    }

    await transactionsStore.createTransaction(parsed.data)
    form.amount = ''
    form.note = ''
    form.date = new Date().toISOString().slice(0, 10)
    ensureDefaults()
  } catch (error) {
    formError.value =
      error instanceof Error ? error.message : 'Не удалось сохранить транзакцию.'
  } finally {
    isSubmitting.value = false
  }
}

function buildDateRange() {
  if (!filterForm.from && !filterForm.to) {
    return undefined
  }

  return {
    from: filterForm.from || null,
    to: filterForm.to || null
  }
}

async function applyFilters() {
  if (isApplyingFilters.value) return
  isApplyingFilters.value = true

  try {
    await transactionsStore.setFilters({
      accountId: filterForm.accountId || undefined,
      categoryId: filterForm.categoryId || undefined,
      type: (filterForm.type || undefined) as CategoryType | undefined,
      dateRange: buildDateRange(),
      search: filterForm.search || undefined
    })
  } finally {
    isApplyingFilters.value = false
  }
}

async function resetFilters() {
  filterForm.accountId = ''
  filterForm.categoryId = ''
  filterForm.type = ''
  filterForm.from = ''
  filterForm.to = ''
  filterForm.search = ''
  await applyFilters()
}

function formatAmount(amountMinor: number, type: CategoryType) {
  const formatted = money.formatMoney(Math.abs(amountMinor), {
    signDisplay: 'never'
  })
  return type === 'income' ? `+${formatted}` : `-${formatted}`
}

const hasEntities = computed(
  () => activeAccounts.value.length > 0 && activeCategories.value.length > 0
)

watch(
  () => [form.type, activeAccounts.value.length, activeCategories.value.length],
  () => ensureDefaults()
)

onMounted(() => {
  void loadInitialData()
})
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-2">
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="text-sm uppercase tracking-wide text-slate-500">Транзакции</p>
          <h2 class="text-2xl font-bold tracking-tight">Лента, формы и фильтры</h2>
        </div>
        <p class="text-xs text-slate-500">Этап 2 — старт UI</p>
      </div>
      <p class="text-sm text-slate-400">
        Добавляйте доходы и расходы, фильтруйте по счёту/категории/типу и ищите по заметке.
        Суммы сохраняются в копейках через общие money-хелперы.
      </p>
    </header>

    <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-lg border border-slate-800 bg-surface-subtle/40 p-4">
        <p class="text-xs uppercase tracking-wide text-slate-500">Общий баланс</p>
        <p class="mt-2 text-2xl font-semibold">
          {{ money.formatMoney(overallBalance) }}
        </p>
      </div>
      <div class="rounded-lg border border-green-900/60 bg-green-900/10 p-4">
        <p class="text-xs uppercase tracking-wide text-green-500">Доходы</p>
        <p class="mt-2 text-xl font-semibold text-green-300">
          {{ money.formatMoney(incomeTotal) }}
        </p>
      </div>
      <div class="rounded-lg border border-rose-900/60 bg-rose-900/10 p-4">
        <p class="text-xs uppercase tracking-wide text-rose-400">Расходы</p>
        <p class="mt-2 text-xl font-semibold text-rose-300">
          {{ money.formatMoney(expenseTotal) }}
        </p>
      </div>
      <div class="rounded-lg border border-slate-800 bg-surface-subtle/40 p-4">
        <p class="text-xs uppercase tracking-wide text-slate-500">Операций</p>
        <p class="mt-2 text-2xl font-semibold">{{ transactions.length }}</p>
      </div>
    </section>

    <section class="grid gap-6 lg:grid-cols-[360px,1fr]">
      <div class="space-y-6">
        <div class="rounded-lg border border-slate-800 bg-surface-subtle/50 p-5">
          <h3 class="text-lg font-semibold">Новая транзакция</h3>
          <p class="mt-1 text-sm text-slate-400">
            Все поля валидируются, суммы проходят через `toMinor`.
          </p>

          <div v-if="!hasEntities" class="mt-3 rounded border border-amber-500/60 bg-amber-500/10 p-3 text-sm text-amber-200">
            Нет доступных счетов или категорий. Добавьте их перед созданием транзакции.
          </div>

          <form class="mt-4 space-y-3" @submit.prevent="submitTransaction">
            <div class="grid grid-cols-2 gap-3">
              <label class="space-y-1 text-sm">
                <span class="text-slate-300">Тип</span>
                <select
                  v-model="form.type"
                  class="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm"
                >
                  <option value="expense">Расход</option>
                  <option value="income">Доход</option>
                </select>
              </label>
              <label class="space-y-1 text-sm">
                <span class="text-slate-300">Счёт</span>
                <select
                  v-model="form.accountId"
                  class="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm"
                  :disabled="!activeAccounts.length"
                >
                  <option v-for="account in activeAccounts" :key="account.id" :value="account.id">
                    {{ account.name }}
                  </option>
                </select>
              </label>
            </div>

            <label class="space-y-1 text-sm block">
              <span class="text-slate-300">Категория</span>
              <select
                v-model="form.categoryId"
                class="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm"
                :disabled="!availableCategories.length"
              >
                <option
                  v-for="category in availableCategories"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.name }}
                </option>
              </select>
            </label>

            <div class="grid grid-cols-2 gap-3">
              <label class="space-y-1 text-sm">
                <span class="text-slate-300">Сумма</span>
                <input
                  v-model="form.amount"
                  type="text"
                  inputmode="decimal"
                  placeholder="0.00"
                  class="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm"
                  required
                />
              </label>
              <label class="space-y-1 text-sm">
                <span class="text-slate-300">Дата</span>
                <input
                  v-model="form.date"
                  type="date"
                  class="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm"
                  required
                />
              </label>
            </div>

            <label class="space-y-1 text-sm block">
              <span class="text-slate-300">Заметка</span>
              <textarea
                v-model="form.note"
                rows="2"
                class="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm"
                placeholder="Опционально"
              ></textarea>
            </label>

            <div v-if="formError" class="rounded border border-rose-500/60 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
              {{ formError }}
            </div>

            <button
              type="submit"
              class="flex w-full items-center justify-center rounded bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-700"
              :disabled="isSubmitting || !hasEntities"
            >
              <span v-if="isSubmitting">Сохраняем...</span>
              <span v-else>Сохранить</span>
            </button>
          </form>
        </div>

        <div class="rounded-lg border border-slate-800 bg-surface-subtle/50 p-5">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold">Фильтры и поиск</h3>
              <p class="text-sm text-slate-400">Применяются к локальным данным Dexie.</p>
            </div>
            <div v-if="isTransactionsLoading" class="text-xs text-slate-500">Обновление…</div>
          </div>

          <form class="mt-4 space-y-3" @submit.prevent="applyFilters">
            <div class="grid grid-cols-2 gap-3">
              <label class="space-y-1 text-sm">
                <span class="text-slate-300">Счёт</span>
                <select
                  v-model="filterForm.accountId"
                  class="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm"
                >
                  <option value="">Все</option>
                  <option v-for="account in activeAccounts" :key="account.id" :value="account.id">
                    {{ account.name }}
                  </option>
                </select>
              </label>
              <label class="space-y-1 text-sm">
                <span class="text-slate-300">Категория</span>
                <select
                  v-model="filterForm.categoryId"
                  class="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm"
                >
                  <option value="">Все</option>
                  <option v-for="category in activeCategories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
              </label>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <label class="space-y-1 text-sm">
                <span class="text-slate-300">Тип</span>
                <select
                  v-model="filterForm.type"
                  class="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm"
                >
                  <option value="">Все</option>
                  <option value="income">Доход</option>
                  <option value="expense">Расход</option>
                </select>
              </label>
              <label class="space-y-1 text-sm">
                <span class="text-slate-300">Поиск по заметке</span>
                <input
                  v-model="filterForm.search"
                  type="search"
                  placeholder="Напр. кофе"
                  class="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm"
                />
              </label>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <label class="space-y-1 text-sm">
                <span class="text-slate-300">Дата с</span>
                <input
                  v-model="filterForm.from"
                  type="date"
                  class="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm"
                />
              </label>
              <label class="space-y-1 text-sm">
                <span class="text-slate-300">Дата по</span>
                <input
                  v-model="filterForm.to"
                  type="date"
                  class="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm"
                />
              </label>
            </div>

            <div class="flex gap-2">
              <button
                type="submit"
                class="flex-1 rounded bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
                :disabled="isApplyingFilters"
              >
                {{ isApplyingFilters ? 'Применяем…' : 'Применить' }}
              </button>
              <button
                type="button"
                class="flex-1 rounded border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500"
                @click="resetFilters"
              >
                Сбросить
              </button>
            </div>
          </form>
        </div>
      </div>

      <div class="rounded-lg border border-slate-800 bg-surface-subtle/50 p-5">
        <div class="mb-3 flex items-center justify-between gap-3">
          <div>
            <h3 class="text-lg font-semibold">Лента операций</h3>
            <p class="text-sm text-slate-400">Сортировка по дате и времени создания.</p>
          </div>
          <div v-if="isTransactionsLoading" class="text-xs text-slate-500">Обновление…</div>
        </div>

        <div v-if="!transactions.length && !isTransactionsLoading" class="rounded border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300">
          Пока нет записей. Добавьте первую транзакцию.
        </div>

        <ul v-else class="divide-y divide-slate-800">
          <li v-for="transaction in transactions" :key="transaction.id" class="py-3">
            <div class="flex items-start justify-between gap-4">
              <div class="space-y-1">
                <p class="text-sm font-semibold text-slate-100">
                  {{ categoryMap[transaction.categoryId]?.name ?? 'Категория' }}
                </p>
                <p class="text-xs text-slate-500">
                  {{ accountMap[transaction.accountId]?.name ?? 'Счёт' }} · {{ transaction.date }}
                </p>
                <p v-if="transaction.note" class="text-sm text-slate-300">
                  {{ transaction.note }}
                </p>
              </div>
              <div
                class="shrink-0 rounded-full px-3 py-1 text-sm font-semibold"
                :class="transaction.type === 'income' ? 'bg-green-900/40 text-green-200' : 'bg-rose-900/40 text-rose-200'"
              >
                {{ formatAmount(transaction.amountMinor, transaction.type) }}
              </div>
            </div>
          </li>
        </ul>
      </div>
    </section>
  </section>
</template>
