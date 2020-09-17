const results = {
  images: [
    {
      name: 'icon.png',
      path: '__tests__/test-images/icon.png',
      beforeStats: 8914,
      afterStats: 3361,
      percentChange: -62.29526587390622,
      compressionWasSignificant: true
    },
    {
      name: 'optimised-image.png',
      path: '__tests__/test-images/optimised-image.png',
      beforeStats: 3361,
      afterStats: 3361,
      percentChange: 0,
      compressionWasSignificant: false
    },
    {
      name: 'roo.jpg',
      path: '__tests__/test-images/roo.jpg',
      beforeStats: 468895,
      afterStats: 485742,
      percentChange: 3.592915258213452,
      compressionWasSignificant: false
    }
  ],
  metrics: {
    bytesSaved: 5553,
    percentChange: -62.29526587390622
  }
}

const markdown = require('../dist/github-markdown').default

const referenceMarkdown = `
Images automagically compressed by [Calibre](https://calibreapp.com)'s [image-actions](https://github.com/marketplace/actions/image-actions) ✨

Compression reduced images by 62.3%, saving 5.42 KB

| Filename | Before | After | Improvement | Visual comparison |
| --- | --- | --- | --- | --- |
| \`icon.png\` | 8.71 KB | 3.28 KB | -62.3% | [View](/calibreapp/image-actions-test-repo/pull/3/a033d6f26da7f7856c150e7f1bf217f0f0cfd7e3?short_path=edafe76#diff-edafe76b3f31282efe3ceb54732aa48d) |


<details>
<summary>Some images were already optimised</summary>

* \`optimised-image.png\`
* \`roo.jpg\`
</details>`

test('writes the markdown', async () => {
  const markdownResult = await markdown({
    images: results.images,
    metrics: results.metrics,
    commitSha: 'a033d6f26da7f7856c150e7f1bf217f0f0cfd7e3'
  })

  expect(markdownResult).toEqual(referenceMarkdown)
})
