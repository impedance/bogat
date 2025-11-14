export const MONEY_MINOR_FACTOR = 100
const DEFAULT_LOCALE = 'ru-RU'
const DEFAULT_CURRENCY = 'RUB'
const WHITESPACE_REGEX = /[\s\u00a0]/g
const DIGIT_REGEX = /\d/

export type MoneyInput = string | number

export interface FromMinorOptions {
  decimalSeparator?: string
  padFraction?: boolean
}

export interface FormatMoneyOptions extends Intl.NumberFormatOptions {
  locale?: string
}

interface MoneyParts {
  sign: number
  integerPart: string
  fractionalPart: string
}

function assertFiniteNumber(value: number, message: string) {
  if (!Number.isFinite(value)) {
    throw new Error(message)
  }
}

function assertMinorInteger(value: number) {
  assertFiniteNumber(value, 'Minor amount must be a finite number')

  if (!Number.isInteger(value)) {
    throw new Error('Minor amount must be an integer value')
  }
}

function normalizeRawInput(value: MoneyInput): string {
  if (typeof value === 'number') {
    assertFiniteNumber(value, 'Money input must be a finite number')
    return value.toString()
  }

  return value
}

function splitDecimalPortion(value: string) {
  const lastComma = value.lastIndexOf(',')
  const lastDot = value.lastIndexOf('.')
  const separatorIndex = Math.max(lastComma, lastDot)

  if (separatorIndex === -1) {
    return {
      integerPartRaw: value,
      fractionalRaw: ''
    }
  }

  return {
    integerPartRaw: value.slice(0, separatorIndex),
    fractionalRaw: value.slice(separatorIndex + 1)
  }
}

function parseMoneyParts(value: MoneyInput): MoneyParts {
  const raw = normalizeRawInput(value).trim()

  if (!raw) {
    throw new Error('Money input cannot be empty')
  }

  const compact = raw.replace(WHITESPACE_REGEX, '')
  const sign = compact.startsWith('-') ? -1 : 1
  const unsigned = compact.replace(/^[-+]/, '')
  const digitsAndSeparators = unsigned.replace(/[^0-9.,]/g, '')

  if (!DIGIT_REGEX.test(digitsAndSeparators)) {
    throw new Error('Money input must contain at least one digit')
  }

  const { integerPartRaw, fractionalRaw } = splitDecimalPortion(digitsAndSeparators)
  const integerPart = integerPartRaw.replace(/[^0-9]/g, '') || '0'
  const fractionalPart = fractionalRaw.replace(/[^0-9]/g, '')

  return { sign, integerPart, fractionalPart }
}

export function toMinor(value: MoneyInput): number {
  const { sign, integerPart, fractionalPart } = parseMoneyParts(value)
  const major = Number(integerPart)
  const fractionMinor = Number((fractionalPart + '00').slice(0, 2))
  return sign * (major * MONEY_MINOR_FACTOR + fractionMinor)
}

export function fromMinor(amountMinor: number, options: FromMinorOptions = {}): string {
  assertMinorInteger(amountMinor)

  const { decimalSeparator = '.', padFraction = true } = options
  const sign = amountMinor < 0 ? '-' : ''
  const abs = Math.abs(amountMinor)
  const major = Math.floor(abs / MONEY_MINOR_FACTOR)
  const fractionalMinor = abs % MONEY_MINOR_FACTOR
  const fraction = String(fractionalMinor).padStart(2, '0')

  if (!padFraction && fractionalMinor === 0) {
    return `${sign}${major}`
  }

  return `${sign}${major}${decimalSeparator}${fraction}`
}

export function formatMoney(amountMinor: number, options: FormatMoneyOptions = {}): string {
  assertMinorInteger(amountMinor)

  const {
    locale = DEFAULT_LOCALE,
    currency = DEFAULT_CURRENCY,
    style: styleOption,
    minimumFractionDigits: minDigits,
    maximumFractionDigits: maxDigits,
    signDisplay: signDisplayOption,
    ...rest
  } = options

  const style = styleOption ?? 'currency'
  const minimumFractionDigits = minDigits ?? 2
  const maximumFractionDigits = maxDigits ?? 2
  const signDisplay = signDisplayOption ?? 'auto'

  const formatterOptions: Intl.NumberFormatOptions = {
    style,
    minimumFractionDigits,
    maximumFractionDigits,
    signDisplay,
    ...rest
  }

  if (style === 'currency') {
    formatterOptions.currency = currency
  }

  const formatter = new Intl.NumberFormat(locale, formatterOptions)

  return formatter.format(amountMinor / MONEY_MINOR_FACTOR)
}

export function isValidMoneyInput(value: MoneyInput): boolean {
  try {
    toMinor(value)
    return true
  } catch {
    return false
  }
}

export function useMoney(defaultFormatOptions: FormatMoneyOptions = {}) {
  return {
    toMinor,
    fromMinor,
    formatMoney: (amountMinor: number, override?: FormatMoneyOptions) =>
      formatMoney(amountMinor, { ...defaultFormatOptions, ...override }),
    isValidMoneyInput
  }
}
