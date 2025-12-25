<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { useMoney } from '~/app/composables/useMoney'

interface Props {
  modelValue?: string
  label?: string
  placeholder?: string
  disabled?: boolean
  quickAmounts?: number[]
  currencyLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: 'Сумма',
  placeholder: '0.00',
  disabled: false,
  quickAmounts: () => [500, 1000, 2500, 5000],
  currencyLabel: '₽'
})

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

const money = useMoney({ currency: 'RUB' })
const digitButtons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0']

const hasValue = ref(Boolean(props.modelValue))
const minorValue = ref(resolveMinor(props.modelValue))

function resolveMinor(value?: string | null) {
  if (!value) {
    return 0
  }

  try {
    return Math.abs(money.toMinor(value))
  } catch {
    return 0
  }
}

watch(
  () => props.modelValue,
  (next) => {
    if (!next) {
      hasValue.value = false
      minorValue.value = 0
      return
    }

    const parsed = resolveMinor(next)
    minorValue.value = parsed
    hasValue.value = true
  }
)

const maskedValue = computed(() => (hasValue.value ? money.fromMinor(minorValue.value) : ''))

const quickAmountOptions = computed(() =>
  props.quickAmounts.map((amount) => {
    const minor = Math.abs(money.toMinor(amount))
    return {
      minor,
      label: money.formatMoney(minor, { signDisplay: 'never' })
    }
  })
)

function emitValue() {
  emit('update:modelValue', hasValue.value ? money.fromMinor(minorValue.value) : '')
}

function setMinorFromDigits(rawDigits: string) {
  const digitsOnly = rawDigits.replace(/\D/g, '')

  if (!digitsOnly) {
    clearValue()
    return
  }

  const normalized = digitsOnly.replace(/^0+(?=\d)/, '') || '0'
  minorValue.value = Number(normalized)
  hasValue.value = true
  emitValue()
}

function appendDigit(digit: string) {
  if (props.disabled) {
    return
  }

  const base = hasValue.value ? minorValue.value.toString() : ''
  setMinorFromDigits(`${base}${digit}`)
}

function backspace() {
  if (props.disabled || !hasValue.value) {
    return
  }

  const current = minorValue.value.toString()
  const nextDigits = current.slice(0, -1)

  if (!nextDigits) {
    clearValue()
    return
  }

  setMinorFromDigits(nextDigits)
}

function clearValue() {
  hasValue.value = false
  minorValue.value = 0
  emitValue()
}

function applyQuickAmount(minor: number) {
  if (props.disabled) {
    return
  }

  const current = hasValue.value ? minorValue.value : 0
  minorValue.value = current + minor
  hasValue.value = true
  emitValue()
}

function handleInput(event: Event) {
  if (props.disabled) {
    return
  }

  const target = event.target as HTMLInputElement
  const raw = target.value

  if (!raw.trim()) {
    clearValue()
    return
  }

  try {
    const parsed = Math.abs(money.toMinor(raw))
    minorValue.value = parsed
    hasValue.value = true
    emitValue()
  } catch {
    target.value = maskedValue.value
  }
}
</script>

<template>
  <div class="space-y-2">
    <label class="block space-y-1 text-sm">
      <span class="text-slate-300">{{ label }}</span>
      <div class="relative">
        <input
          :value="maskedValue"
          type="text"
          inputmode="decimal"
          :placeholder="placeholder"
          class="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 pr-12 text-sm"
          :disabled="disabled"
          @input="handleInput"
        />
        <span
          class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs uppercase tracking-wide text-slate-500"
        >
          {{ currencyLabel }}
        </span>
      </div>
    </label>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="option in quickAmountOptions"
        :key="option.label"
        type="button"
        class="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-slate-500 disabled:opacity-50"
        :disabled="disabled"
        @click="applyQuickAmount(option.minor)"
      >
        +{{ option.label }}
      </button>
      <button
        type="button"
        class="rounded-full border border-rose-900 px-3 py-1 text-xs font-semibold text-rose-200 transition hover:border-rose-700 disabled:opacity-50"
        :disabled="disabled || !hasValue"
        @click="clearValue"
      >
        Сброс
      </button>
    </div>

    <div class="grid grid-cols-3 gap-2">
      <button
        v-for="digit in digitButtons"
        :key="digit"
        type="button"
        class="rounded border border-slate-800 bg-slate-900 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-600 disabled:opacity-50"
        :disabled="disabled"
        @click="appendDigit(digit)"
      >
        {{ digit }}
      </button>
      <button
        type="button"
        class="rounded border border-slate-800 bg-slate-900 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-600 disabled:opacity-50"
        :disabled="disabled || !hasValue"
        @click="backspace"
      >
        ⌫
      </button>
    </div>
  </div>
</template>
