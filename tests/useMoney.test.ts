import { describe, expect, it } from 'vitest'

import {
  formatMoney,
  fromMinor,
  isValidMoneyInput,
  MONEY_MINOR_FACTOR,
  toMinor,
  useMoney
} from '../app/composables/useMoney'

describe('toMinor', () => {
  it('parses decimal separators and trims whitespace', () => {
    expect(toMinor('19,99')).toBe(1999)
    expect(toMinor(' 19.99 ')).toBe(1999)
  })

  it('supports thousands separators and localized grouping', () => {
    expect(toMinor('1 234,56')).toBe(123456)
    expect(toMinor('1,234.56')).toBe(123456)
  })

  it('handles negative and partial values', () => {
    expect(toMinor('-0.01')).toBe(-1)
    expect(toMinor('-.5')).toBe(-50)
    expect(toMinor(12.34)).toBe(1234)
  })

  it('throws on invalid values', () => {
    expect(() => toMinor('')).toThrowError()
    expect(() => toMinor('abc')).toThrowError()
  })
})

describe('fromMinor', () => {
  it('converts to decimal string with default separator', () => {
    expect(fromMinor(1999)).toBe('19.99')
    expect(fromMinor(-1)).toBe('-0.01')
  })

  it('supports custom separator and optional fraction padding', () => {
    expect(fromMinor(500, { decimalSeparator: ',' })).toBe('5,00')
    expect(fromMinor(500, { padFraction: false })).toBe('5')
  })
})

describe('formatMoney', () => {
  it('formats RUB currency by default', () => {
    expect(formatMoney(1999)).toBe('19,99\u00a0₽')
  })

  it('allows overriding locale and currency', () => {
    expect(formatMoney(1999, { locale: 'en-US', currency: 'USD' })).toBe('$19.99')
  })
})

describe('isValidMoneyInput', () => {
  it('reflects parser readiness', () => {
    expect(isValidMoneyInput('19,99')).toBe(true)
    expect(isValidMoneyInput('abc')).toBe(false)
  })
})

describe('useMoney composable', () => {
  it('exposes shared helpers with optional default formatting', () => {
    const money = useMoney({ locale: 'en-US', currency: 'USD' })

    expect(money.toMinor('1.23')).toBe(123)
    expect(money.fromMinor(MONEY_MINOR_FACTOR)).toBe('1.00')
    expect(money.formatMoney(1950)).toBe('$19.50')
  })
})
