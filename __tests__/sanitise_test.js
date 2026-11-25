import { test, expect } from 'vitest'
import {
  hasControlCharacters,
  sanitiseForLog,
  escapeMarkdown
} from '../src/sanitise.ts'

const REPLACEMENT = String.fromCharCode(0xfffd)
const LINE_SEPARATOR = String.fromCharCode(0x2028)
const NULL_CHARACTER = String.fromCharCode(0)

test('detects control characters and line separators', () => {
  expect(hasControlCharacters('images/photo.png')).toBe(false)
  expect(hasControlCharacters('images/фото 1.png')).toBe(false)
  expect(hasControlCharacters('a\nb.png')).toBe(true)
  expect(hasControlCharacters('a\rb.png')).toBe(true)
  expect(hasControlCharacters(`a${NULL_CHARACTER}b.png`)).toBe(true)
  expect(hasControlCharacters(`a${LINE_SEPARATOR}b.png`)).toBe(true)
})

test('replaces control characters for logging', () => {
  expect(sanitiseForLog('a\n::warning::x\r.png')).toBe(
    `a${REPLACEMENT}::warning::x${REPLACEMENT}.png`
  )
})

test('leaves ordinary paths untouched when escaping markdown', () => {
  expect(escapeMarkdown('static/images/hero-2x.png')).toBe(
    'static/images/hero-2x.png'
  )
  expect(escapeMarkdown('фото/写真 1.png')).toBe('фото/写真 1.png')
})

test('encodes markdown and HTML syntax as entities', () => {
  expect(escapeMarkdown('a|b_c.png')).toBe('a&#124;b&#95;c.png')
  expect(escapeMarkdown('<b>&.png')).toBe('&#60;b&#62;&#38;.png')
  expect(escapeMarkdown('a\nb.png')).toBe(`a${REPLACEMENT}b.png`)
})
