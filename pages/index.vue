<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted } from 'vue'

import { useMoney } from '~/app/composables/useMoney'
import type { AccountType } from '~/app/types/budget'
import { useAccountsStore } from '~/stores/accounts'
import { useCategoriesStore } from '~/stores/categories'
import { useTransactionsStore } from '~/stores/transactions'

const accountsStore = useAccountsStore()
const categoriesStore = useCategoriesStore()
const transactionsStore = useTransactionsStore()

const { activeAccounts, isLoading: isAccountsLoading } = storeToRefs(accountsStore)
const { activeCategories, isLoading: isCategoriesLoading } = storeToRefs(categoriesStore)
const {
  transactions,
  balanceByAccount,
  incomeTotal,
  expenseTotal,
  overallBalance,
  isLoading: isTransactionsLoading
} = storeToRefs(transactionsStore)

const money = useMoney({ currency: 'RUB' })

// AICODE-NOTE: Dashboard relies on Pinia selectors so numbers always match current transaction filters. [2025-11-18]
const hasAccounts = computed(() => activeAccounts.value.length > 0)
const hasCategories = computed(() => activeCategories.value.length > 0)
const hasTransactions = computed(() => transactions.value.length > 0)
const dashboardIsLoading = computed(
  () =>
    isAccountsLoading.value || isCategoriesLoading.value || isTransactionsLoading.value
)

const sortedAccounts = computed(() =>
  [...activeAccounts.value].sort((a, b) => a.name.localeCompare(b.name))
)

const netCashFlow = computed(() => incomeTotal.value - expenseTotal.value)

const readinessChecklist = computed(() => [
  { label: 'Счета настроены', done: hasAccounts.value, to: '/accounts' },
  { label: 'Категории активны', done: hasCategories.value, to: '/categories' },
  { label: 'Добавлены транзакции', done: hasTransactions.value, to: '/transactions' }
])

const emptyStates = computed(() => {
  const states: Array<{ title: string; description: string; to: string; action: string }> = []

  if (!hasAccounts.value) {
    states.push({
      title: 'Нет активных счетов',
      description: 'Создайте счёт, чтобы отслеживать наличные, карты или банки.',
      to: '/accounts',
      action: 'Добавить счёт'
    })
  }

  if (!hasCategories.value) {
    states.push({
      title: 'Нужны категории',
      description: 'Включите дефолтные категории или добавьте свои для расходов/доходов.',
      to: '/categories',
      action: 'Настроить категории'
    })
  }

  if (hasAccounts.value && hasCategories.value && !hasTransactions.value) {
    states.push({
      title: 'Добавьте первую транзакцию',
      description: 'После счета и категории зафиксируйте расход или доход, чтобы увидеть баланс.',
      to: '/transactions',
      action: 'Новая транзакция'
    })
  }

  return states
})

const accountTypeLabels: Record<AccountType, string> = {
  cash: 'Наличные',
  card: 'Карта',
  bank: 'Банк'
}

function formatAccountBalance(accountId: string) {
  const amount = balanceByAccount.value[accountId] ?? 0
  const formatted = money.formatMoney(Math.abs(amount), { signDisplay: 'never' })
  return amount >= 0 ? `+${formatted}` : `-${formatted}`
}

function formatDelta(amountMinor: number) {
  const formatted = money.formatMoney(Math.abs(amountMinor), { signDisplay: 'never' })
  return amountMinor >= 0 ? `+${formatted}` : `-${formatted}`
}

async function loadDashboard() {
  await Promise.all([
    accountsStore.fetchAccounts({ includeArchived: false }),
    categoriesStore.fetchCategories({ includeArchived: false }),
    transactionsStore.fetchTransactions(transactionsStore.filters)
  ])
}

onMounted(() => {
  void loadDashboard()
})
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-2">
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="text-xs uppercase tracking-wide text-slate-500">Дашборд</p>
          <h2 class="text-2xl font-bold tracking-tight">Браузерное MVP: контроль балансов</h2>
        </div>
        <span v-if="dashboardIsLoading" class="text-xs text-slate-500">Обновление данных…</span>
      </div>
      <p class="text-sm text-slate-400">
        Все агрегаты строятся по данным Dexie через selectors Pinia: общий баланс, остатки по
        счетам и статус настройки. Используйте карточки ниже, чтобы быстро перейти к нужному
        разделу.
      </p>
    </header>

    <AddToHomeBanner />

    <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-lg border border-slate-800 bg-surface-subtle/40 p-4">
        <p class="text-xs uppercase tracking-wide text-slate-500">Общий баланс</p>
        <p class="mt-2 text-2xl font-semibold">
          {{ money.formatMoney(overallBalance) }}
        </p>
        <p class="text-xs text-slate-500">Сумма активных счетов</p>
      </div>
      <div class="rounded-lg border border-indigo-900/60 bg-indigo-900/10 p-4">
        <p class="text-xs uppercase tracking-wide text-indigo-200">Чистый поток</p>
        <p class="mt-2 text-2xl font-semibold">
          {{ formatDelta(netCashFlow) }}
        </p>
        <p class="text-xs text-indigo-200">Доходы минус расходы</p>
      </div>
      <div class="rounded-lg border border-green-900/60 bg-green-900/10 p-4">
        <p class="text-xs uppercase tracking-wide text-green-500">Доходы</p>
        <p class="mt-2 text-2xl font-semibold text-green-200">
          {{ money.formatMoney(incomeTotal) }}
        </p>
        <p class="text-xs text-green-500">Подчиняются текущим фильтрам транзакций</p>
      </div>
      <div class="rounded-lg border border-rose-900/60 bg-rose-900/10 p-4">
        <p class="text-xs uppercase tracking-wide text-rose-400">Расходы</p>
        <p class="mt-2 text-2xl font-semibold text-rose-200">
          {{ money.formatMoney(expenseTotal) }}
        </p>
        <p class="text-xs text-rose-400">По тем же фильтрам, что и лента</p>
      </div>
    </section>

    <section class="grid gap-6 lg:grid-cols-[2fr,1fr]">
      <div class="rounded-lg border border-slate-800 bg-surface-subtle/50 p-5">
        <div class="flex items-center justify-between gap-4">
          <div>
            <h3 class="text-lg font-semibold">Активные счета</h3>
            <p class="text-sm text-slate-400">
              Остатки вычисляются реактивно из стора транзакций без дублирования в Dexie.
            </p>
          </div>
          <NuxtLink
            to="/accounts"
            class="text-xs font-semibold text-indigo-300 hover:text-indigo-200"
          >
            Управлять
          </NuxtLink>
        </div>

        <ul v-if="sortedAccounts.length" class="mt-4 divide-y divide-slate-800">
          <li v-for="account in sortedAccounts" :key="account.id" class="py-3">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-sm font-semibold text-slate-100">{{ account.name }}</p>
                <p class="text-xs text-slate-500">
                  {{ accountTypeLabels[account.type] }} · {{ account.createdAt.slice(0, 10) }}
                </p>
              </div>
              <span
                class="rounded-full px-3 py-1 text-sm font-semibold"
                :class="
                  (balanceByAccount[account.id] ?? 0) >= 0
                    ? 'bg-green-900/30 text-green-200'
                    : 'bg-rose-900/30 text-rose-200'
                "
              >
                {{ formatAccountBalance(account.id) }}
              </span>
            </div>
          </li>
        </ul>
        <div
          v-else
          class="mt-4 rounded border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300"
        >
          Пока нет активных счетов. Создайте первый, чтобы увидеть баланс.
        </div>
      </div>

      <div class="space-y-4">
        <div class="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
          <h3 class="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Статус настройки
          </h3>
          <ul class="mt-3 space-y-2 text-sm">
            <li
              v-for="item in readinessChecklist"
              :key="item.label"
              class="flex items-center justify-between gap-2 rounded border border-slate-800 px-3 py-2"
            >
              <span :class="item.done ? 'text-slate-100' : 'text-slate-400'">
                {{ item.label }}
              </span>
              <span
                v-if="item.done"
                class="text-xs font-semibold text-green-300"
              >
                Готово
              </span>
              <NuxtLink
                v-else
                :to="item.to"
                class="text-xs font-semibold text-indigo-300 hover:text-indigo-200"
              >
                Перейти
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div v-if="emptyStates.length" class="rounded-lg border border-slate-800 bg-surface-subtle/50">
          <div class="border-b border-slate-800 px-4 py-3">
            <h3 class="text-sm font-semibold text-slate-200">Первые шаги</h3>
            <p class="text-xs text-slate-500">CTA помогают довести базовую настройку до конца.</p>
          </div>
          <div class="divide-y divide-slate-800">
            <div v-for="state in emptyStates" :key="state.title" class="p-4">
              <p class="text-sm font-semibold text-slate-100">{{ state.title }}</p>
              <p class="text-xs text-slate-400">{{ state.description }}</p>
              <NuxtLink
                :to="state.to"
                class="mt-3 inline-flex items-center text-xs font-semibold text-indigo-300 hover:text-indigo-200"
              >
                {{ state.action }}
              </NuxtLink>
            </div>
          </div>
        </div>
        <div
          v-else
          class="rounded-lg border border-emerald-900/70 bg-emerald-900/10 px-4 py-3 text-sm text-emerald-100"
        >
          Все базовые сущности готовы — можно переходить к PWA/бэкап задачам Этапов 3–4.
        </div>
      </div>
    </section>

    <section class="rounded-lg border border-slate-800 bg-surface-subtle/50 p-5">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 class="text-lg font-semibold">Активность</h3>
          <p class="text-sm text-slate-400">
            {{ transactions.length }} операций в текущем срезе стора. Переходите к транзакциям,
            чтобы добавить новые или отфильтровать историю.
          </p>
        </div>
        <NuxtLink
          to="/transactions"
          class="rounded border border-indigo-500 px-3 py-2 text-sm font-semibold text-indigo-100 transition hover:bg-indigo-500/20"
        >
          Открыть транзакции
        </NuxtLink>
      </div>

      <dl class="mt-4 grid gap-4 sm:grid-cols-3">
        <div class="rounded border border-slate-800 bg-slate-900/60 p-4">
          <dt class="text-xs uppercase tracking-wide text-slate-500">Всего операций</dt>
          <dd class="mt-2 text-2xl font-semibold text-slate-100">{{ transactions.length }}</dd>
        </div>
        <div class="rounded border border-slate-800 bg-slate-900/60 p-4">
          <dt class="text-xs uppercase tracking-wide text-slate-500">Средний чек</dt>
          <dd class="mt-2 text-2xl font-semibold text-slate-100">
            {{
              transactions.length
                ? money.formatMoney(
                    Math.round((incomeTotal + expenseTotal) / transactions.length)
                  )
                : money.formatMoney(0)
            }}
          </dd>
        </div>
        <div class="rounded border border-slate-800 bg-slate-900/60 p-4">
          <dt class="text-xs uppercase tracking-wide text-slate-500">Чистый поток</dt>
          <dd class="mt-2 text-2xl font-semibold text-slate-100">
            {{ formatDelta(netCashFlow) }}
          </dd>
        </div>
      </dl>
    </section>
  </section>
</template>
