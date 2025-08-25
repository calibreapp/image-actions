import { test, expect } from 'vitest'
import markdown from '../src/github-markdown.ts'

const results = {
  optimisedImages: [
    {
      name: 'icon.png',
      path: '__tests__/test-images/icon.png',
      beforeStats: 8914,
      afterStats: 3361,
      percentChange: -62.29526587390622,
      compressionWasSignificant: true
    },
    {
      name: 'roo.jpg',
      path: '__tests__/test-images/roo.jpg',
      beforeStats: 485742,
      afterStats: 468895,
      percentChange: -3.592915258213452,
      compressionWasSignificant: true
    }
  ],
  unoptimisedImages: [
    {
      name: 'optimised-image.png',
      path: '__tests__/test-images/optimised-image.png',
      beforeStats: 3361,
      afterStats: 3361,
      percentChange: 0,
      compressionWasSignificant: false
    },
    {
      name: 'another-optimised-image.png',
      path: '__tests__/test-images/another-optimised-image.png',
      beforeStats: 3361,
      afterStats: 3361,
      percentChange: 0,
      compressionWasSignificant: false
    }
  ],
  metrics: {
    bytesSaved: 5553,
    percentChange: -62.29526587390622
  }
}

test('writes the markdown with diff report', async () => {
  const markdownResult = await markdown({
    processingResults: results,
    commitSha: 'a033d6f26da7f7856c150e7f1bf217f0f0cfd7e3'
  })

  expect(markdownResult).toMatchSnapshot()
})

test('writes the markdown without diff report', async () => {
  const markdownResult = await markdown({
    processingResults: results
  })

  expect(markdownResult).toMatchSnapshot()
})
