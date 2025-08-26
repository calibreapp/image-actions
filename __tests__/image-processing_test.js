import path from 'path'
import { promises as fs } from 'fs'
import { beforeEach, afterEach, test, expect, vi } from 'vitest'
import imageProcessing from '../src/image-processing.ts'
import getRepositoryImages from '../src/get-repository-images.ts'

// Mock the getRepositoryImages function
vi.mock('../src/get-repository-images.ts', () => ({
  default: vi.fn()
}))

// Mock getChangedImages to return null (fallback to repository scan)
vi.mock('../src/get-changed-images.ts', () => ({
  default: vi.fn(() => null)
}))

const EXAMPLE_IMAGES_DIR = `${process.cwd()}/__tests__/example-images`
const TMP_TEST_IMAGES_DIR = `${process.cwd()}/__tests__/test-images`

const EXAMPLE_IMAGES = [
  'roo.webp',
  'roo.jpg',
  'icon.png',
  'optimised-image.png'
]

beforeEach(async () => {
  // Clean up any existing test-images directory first
  try {
    await fs.rm(TMP_TEST_IMAGES_DIR, { recursive: true, force: true })
  } catch (e) {
    // noop
  }

  try {
    await fs.mkdir(TMP_TEST_IMAGES_DIR, { recursive: true })
  } catch (e) {
    // noop
  }

  // Copy in reference images
  for await (const image of EXAMPLE_IMAGES) {
    try {
      await fs.copyFile(
        path.join(EXAMPLE_IMAGES_DIR, image),
        path.join(TMP_TEST_IMAGES_DIR, image)
      )
    } catch (e) {
      console.error(`Failed to copy ${image}:`, e.message)
      console.error(`Source: ${path.join(EXAMPLE_IMAGES_DIR, image)}`)
      console.error(`Dest: ${path.join(TMP_TEST_IMAGES_DIR, image)}`)
      throw e
    }
  }

  const testImagePaths = EXAMPLE_IMAGES.map(image =>
    path.join(TMP_TEST_IMAGES_DIR, image)
  )
  vi.mocked(getRepositoryImages).mockResolvedValue(testImagePaths)
})

afterEach(async () => {
  try {
    await fs.rm(TMP_TEST_IMAGES_DIR, { recursive: true, force: true })
  } catch (e) {
    console.warn('afterEach error:', e.message)
  }

  vi.clearAllMocks()
})

test('returns metrics for images', async () => {
  const results = await imageProcessing()

  expect(results.metrics).toEqual({
    bytesSaved: expect.any(Number),
    percentChange: expect.any(Number)
  })
})

test('returns the correct number of optimised/untouched images', async () => {
  const results = await imageProcessing()

  expect(results.optimisedImages).toHaveLength(3)
  expect(results.unoptimisedImages).toHaveLength(1)
})

test('returns images with stats', async () => {
  const results = await imageProcessing()

  // Find the icon.png image from the results (order may vary)
  const iconImage = results.optimisedImages.find(img => img.name === 'icon.png')

  expect(iconImage).toEqual({
    afterStats: expect.any(Number),
    beforeStats: expect.any(Number),
    compressionWasSignificant: true,
    name: 'icon.png',
    path: '__tests__/test-images/icon.png',
    percentChange: expect.any(Number)
  })
})

test('calls getRepositoryImages when no changed images found', async () => {
  await imageProcessing()

  expect(getRepositoryImages).toHaveBeenCalledOnce()
})
