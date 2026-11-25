import { test, expect } from 'vitest'
import isForkPullRequest from '../src/is-fork-pull-request.ts'

const payload = (head, base = { full_name: 'calibreapp/site' }) => ({
  pull_request: { head: { repo: head }, base: { repo: base } }
})

test('is false without a pull request', () => {
  expect(isForkPullRequest({})).toBe(false)
})

test('is false when head and base are the same repository', () => {
  expect(isForkPullRequest(payload({ full_name: 'calibreapp/site' }))).toBe(
    false
  )
})

test('is true when the head is a different repository', () => {
  expect(isForkPullRequest(payload({ full_name: 'attacker/site' }))).toBe(true)
})

test('is true when the head repository has been deleted', () => {
  expect(isForkPullRequest(payload(null))).toBe(true)
})

test('falls back to the event repository when base is missing', () => {
  expect(
    isForkPullRequest({
      repository: { full_name: 'calibreapp/site' },
      pull_request: { head: { repo: { full_name: 'calibreapp/site' } } }
    })
  ).toBe(false)
})
