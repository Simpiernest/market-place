import { describe, it, expect } from 'vitest'

// Test utility functions
describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    it('formats numbers as currency', () => {
      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(amount)
      }

      expect(formatCurrency(100000)).toBe('$100,000.00')
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
    })
  })

  describe('validateEmail', () => {
    it('validates email addresses', () => {
      const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
      }

      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
    })
  })

  describe('truncateText', () => {
    it('truncates long text', () => {
      const truncateText = (text: string, maxLength: number) => {
        if (text.length <= maxLength) return text
        return text.slice(0, maxLength) + '...'
      }

      expect(truncateText('Short text', 20)).toBe('Short text')
      expect(truncateText('This is a very long text that needs truncation', 20)).toBe('This is a very long ...')
    })
  })
})
