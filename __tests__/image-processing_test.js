const path = require('path')
const fs = require('fs').promises

const EXAMPLE_IMAGES_DIR = `${process.cwd()}/__tests__/example-images`
const TMP_TEST_IMAGES_DIR = `${process.cwd()}/__tests__/test-images`

const EXAMPLE_IMAGES = [
  'roo.webp',
  'roo.jpg',
  'icon.png',
  'optimised-image.png'
]

beforeEach(async () => {
  try {
    await fs.mkdir(TMP_TEST_IMAGES_DIR)
  } catch (e) {
    console.log(TMP_TEST_IMAGES_DIR, 'already exists')
  }

  // Copy in reference images for stats
  for await (const image of EXAMPLE_IMAGES) {
    await fs.copyFile(
      path.join(EXAMPLE_IMAGES_DIR, image),
      path.join(TMP_TEST_IMAGES_DIR, image)
    )
  }
})

afterEach(async () => {
  for await (const image of EXAMPLE_IMAGES) {
    await fs.unlink(path.join(TMP_TEST_IMAGES_DIR, image))
  }
  await fs.rmdir(TMP_TEST_IMAGES_DIR)
})

const imageProcessing = require('../dist/image-processing').default

test('returns metrics for images', async () => {
  const results = await imageProcessing()

  expect(results.metrics).toEqual({
    bytesSaved: expect.any(Number),
    percentChange: expect.any(Number)
  })
})

test('returns images with stats', async () => {
  const results = await imageProcessing()

  expect(results.images).toEqual([
    {
      afterStats: expect.any(Number),
      beforeStats: expect.any(Number),
      compressionWasSignificant: true,
      name: 'icon.png',
      path: '__tests__/test-images/icon.png',
      percentChange: expect.any(Number)
    },
    {
      afterStats: expect.any(Number),
      beforeStats: expect.any(Number),
      compressionWasSignificant: false,
      name: 'optimised-image.png',
      path: '__tests__/test-images/optimised-image.png',
      percentChange: expect.any(Number)
    },
    {
      afterStats: expect.any(Number),
      beforeStats: expect.any(Number),
      compressionWasSignificant: false,
      name: 'roo.jpg',
      path: '__tests__/test-images/roo.jpg',
      percentChange: expect.any(Number)
    },
    {
      afterStats: expect.any(Number),
      beforeStats: expect.any(Number),
      compressionWasSignificant: true,
      name: 'roo.webp',
      path: '__tests__/test-images/roo.webp',
      percentChange: expect.any(Number)
    }
  ])
})
