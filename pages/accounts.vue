<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted, reactive, ref } from 'vue'

import { useMoney } from '~/app/composables/useMoney'
import { accountPayloadSchema, type Account, type AccountType } from '~/app/types/budget'
import { useAccountsStore } from '~/stores/accounts'
import { useTransactionsStore } from '~/stores/transactions'

const accountsStore = useAccountsStore()
const transactionsStore = useTransactionsStore()

const { items: accounts, activeAccounts, isLoading } = storeToRefs(accountsStore)
const { balanceByAccount, isLoading: isTransactionsLoading } = storeToRefs(transactionsStore)

const money = useMoney({ currency: 'RUB' })

const form = reactive({
  name: '',
  type: 'cash' as AccountType
})
const editingId = ref<Account['id'] | null>(null)
const formError = ref<string | null>(null)
const isSubmitting = ref(false)
const busyAccountId = ref<string | null>(null)

const archivedAccounts = computed(() => accounts.value.filter((account) => account.archived))
const hasActiveAccounts = computed(() => activeAccounts.value.length > 0)

const accountTypeLabels: Record<AccountType, string> = {
  cash: 'Наличные',
  card: 'Карта',
  bank: 'Банк'
}

function resetForm() {
  form.name = ''
  form.type = 'cash'
  editingId.value = null
  formError.value = null
}

async function loadInitialData() {
  await Promise.all([
    accountsStore.fetchAccounts({ includeArchived: true }),
    transactionsStore.fetchTransactions()
  ])
}

function startEdit(account: Account) {
  editingId.value = account.id
  form.name = account.name
  form.type = account.type
}

async function submitAccount() {
  if (isSubmitting.value) return

  formError.value = null
  isSubmitting.value = true

  try {
    const parsed = accountPayloadSchema.safeParse({
      name: form.name.trim(),
      type: form.type,
      currency: 'RUB'
    })

    if (!parsed.success) {
      const [issue] = parsed.error.issues
      throw new Error(issue?.message ?? 'Проверьте корректность полей.')
    }

    if (editingId.value) {
      await accountsStore.updateAccount(editingId.value, parsed.data)
    } else {
      await accountsStore.createAccount(parsed.data)
    }

    resetForm()
  } catch (error) {
    formError.value =
      error instanceof Error ? error.message : 'Не удалось сохранить счёт. Попробуйте ещё раз.'
  } finally {
    isSubmitting.value = false
  }
}

async function toggleArchive(account: Account) {
  if (busyAccountId.value) return

  busyAccountId.value = account.id

  try {
    if (account.archived) {
      await accountsStore.unarchiveAccount(account.id)
    } else {
      await accountsStore.archiveAccount(account.id)
    }
  } finally {
    busyAccountId.value = null
  }
}

function accountBalanceLabel(accountId: Account['id']) {
  const balance = balanceByAccount.value[accountId] ?? 0
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
          <p class="text-xs uppercase tracking-wide text-slate-500">Счета</p>
          <h2 class="text-2xl font-bold tracking-tight">Настройка списков и балансов</h2>
        </div>
        <p class="text-xs text-slate-500">Этап 2 — данные уже в Dexie</p>
      </div>
      <p class="text-sm text-slate-400">
        Создавайте счета для наличных/карт/банков, редактируйте их и переводите в архив, не теряя
        историю транзакций.
      </p>
    </header>

    <section class="grid gap-6 lg:grid-cols-[360px,1fr]">
      <div class="rounded-lg border border-slate-800 bg-surface-subtle/50 p-5">
        <div class="flex items-start justify-between gap-2">
          <div>
            <h3 class="text-lg font-semibold">
              {{ editingId ? 'Редактирование счета' : 'Новый счёт' }}
            </h3>
            <p class="text-sm text-slate-400">
              Название и тип валидируются, валюта фиксирована как RUB.
            </p>
          </div>
          <div v-if="isLoading" class="text-xs text-slate-500">Загрузка…</div>
        </div>

        <form class="mt-4 space-y-3" @submit.prevent="submitAccount">
          <label class="space-y-1 text-sm block">
            <span class="text-slate-300">Название</span>
            <input
              v-model="form.name"
              type="text"
              class="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm"
              placeholder="Напр., Кошелёк"
              required
            />
          </label>

          <label class="space-y-1 text-sm block">
            <span class="text-slate-300">Тип</span>
            <select
              v-model="form.type"
              class="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm"
            >
              <option value="cash">Наличные</option>
              <option value="card">Карта</option>
              <option value="bank">Банк</option>
            </select>
          </label>

          <div class="flex items-center gap-2 text-xs text-slate-500">
            <span class="rounded-full border border-slate-800 px-2 py-1">Валюта: RUB</span>
            <span class="rounded-full border border-slate-800 px-2 py-1">
              {{ activeAccounts.length }} активных
            </span>
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

      <div class="space-y-5 rounded-lg border border-slate-800 bg-surface-subtle/50 p-5">
        <div class="flex items-center justify-between gap-3">
          <div>
            <h3 class="text-lg font-semibold">Текущие счета</h3>
            <p class="text-sm text-slate-400">
              Балансы берутся из локальных транзакций; архив не удаляет историю.
            </p>
          </div>
          <div v-if="isTransactionsLoading" class="text-xs text-slate-500">Обновление…</div>
        </div>

        <div v-if="!hasActiveAccounts && !isLoading" class="rounded border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300">
          Пока нет счетов. Добавьте первый, чтобы фиксировать транзакции.
        </div>

        <ul v-else class="divide-y divide-slate-800" data-testid="accounts-list">
          <li
            v-for="account in activeAccounts"
            :key="account.id"
            class="flex items-start justify-between gap-3 py-3"
          >
            <div class="space-y-1">
              <p class="text-sm font-semibold text-slate-100">{{ account.name }}</p>
              <p class="text-xs text-slate-500">
                {{ accountTypeLabels[account.type] }} · Баланс:
                {{ accountBalanceLabel(account.id) }}
              </p>
            </div>
            <div class="flex gap-2">
              <button
                type="button"
                class="rounded border border-slate-700 px-2 py-1 text-xs font-semibold text-slate-200 transition hover:border-slate-500"
                @click="startEdit(account)"
              >
                Редактировать
              </button>
              <button
                type="button"
                class="rounded border border-slate-700 px-2 py-1 text-xs font-semibold text-amber-200 transition hover:border-amber-300"
                :disabled="busyAccountId === account.id"
                @click="toggleArchive(account)"
              >
                {{ busyAccountId === account.id ? '...' : 'В архив' }}
              </button>
            </div>
          </li>
        </ul>

        <div v-if="archivedAccounts.length" class="space-y-2">
          <div class="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
            <span class="h-px flex-1 bg-slate-800"></span>
            Архивированные
            <span class="h-px flex-1 bg-slate-800"></span>
          </div>

          <ul class="divide-y divide-slate-800 rounded border border-slate-800 bg-slate-900/50">
            <li
              v-for="account in archivedAccounts"
              :key="account.id"
              class="flex items-center justify-between gap-3 px-3 py-2 text-sm text-slate-300"
            >
              <div class="space-y-0.5">
                <p class="font-semibold text-slate-100">{{ account.name }}</p>
                <p class="text-xs text-slate-500">{{ accountTypeLabels[account.type] }}</p>
              </div>
              <button
                type="button"
                class="rounded border border-slate-700 px-2 py-1 text-xs font-semibold text-emerald-200 transition hover:border-emerald-400"
                :disabled="busyAccountId === account.id"
                @click="toggleArchive(account)"
              >
                {{ busyAccountId === account.id ? '...' : 'Вернуть' }}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </section>
</template>
