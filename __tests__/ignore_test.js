import { test, expect } from 'vitest'
import isIgnored from '../src/ignore.ts'

test('matches files beneath an ignored directory', () => {
  expect(isIgnored('node_modules/a/b.png', ['node_modules/**'])).toBe(true)
  expect(isIgnored('node_modules/.cache/b.png', ['node_modules/**'])).toBe(true)
  expect(isIgnored('node_modules', ['node_modules/**'])).toBe(true)
})

test('does not match unrelated or nested directories of the same name', () => {
  expect(isIgnored('src/a.png', ['node_modules/**'])).toBe(false)
  expect(isIgnored('node_modules_backup/a.png', ['node_modules/**'])).toBe(
    false
  )
  expect(
    isIgnored('packages/app/node_modules/a.png', ['node_modules/**'])
  ).toBe(false)
})

test('supports globstar prefixes and file patterns', () => {
  expect(
    isIgnored('packages/app/node_modules/a.png', ['**/node_modules/**'])
  ).toBe(true)
  expect(isIgnored('docs/assets/logo.jpg', ['docs/assets/**'])).toBe(true)
  expect(isIgnored('docs/images/logo.jpg', ['docs/assets/**'])).toBe(false)
  expect(isIgnored('static/hero.png', ['**/*.png'])).toBe(true)
  expect(isIgnored('static/hero.jpg', ['**/*.png'])).toBe(false)
})

test('matches nothing without patterns', () => {
  expect(isIgnored('src/a.png', [])).toBe(false)
})
