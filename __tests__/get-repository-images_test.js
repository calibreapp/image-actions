import { beforeEach, afterEach, test, expect, vi } from 'vitest'
import path from 'path'
import { glob } from 'glob'
import getRepositoryImages from '../src/get-repository-images.ts'
import getConfig from '../src/config.ts'

vi.mock('glob')
vi.mock('../src/config.ts')

const mockGlob = vi.fn()
const mockGetConfig = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()

  // Reset the mocks before each test
  vi.mocked(glob).mockImplementation(mockGlob)
  vi.mocked(getConfig).mockImplementation(mockGetConfig)

  // Set up default config
  mockGetConfig.mockResolvedValue({
    ignorePaths: ['node_modules/**']
  })

  // Use the actual GITHUB_WORKSPACE environment variable (set by npm test)
  // This ensures tests work in both local and Docker environments
})

afterEach(() => {
  vi.restoreAllMocks()
})

test('returns all image paths from repository', async () => {
  const workspace = path.resolve(process.env.GITHUB_WORKSPACE)
  const mockImagePaths = [
    `${workspace}/src/image1.png`,
    `${workspace}/docs/image2.jpg`,
    `${workspace}/assets/image3.webp`
  ]

  mockGlob.mockResolvedValue(mockImagePaths)

  const result = await getRepositoryImages()

  expect(mockGlob).toHaveBeenCalledWith(
    `${workspace}/**/*.{jpeg,jpg,png,webp}`,
    {
      ignore: [`${workspace}/node_modules/**`],
      nodir: true,
      follow: false,
      dot: true
    }
  )

  expect(result).toEqual(mockImagePaths)
})

test('respects ignore paths configuration', async () => {
  const workspace = path.resolve(process.env.GITHUB_WORKSPACE)
  const mockImagePaths = [
    `${workspace}/src/image1.png`,
    `${workspace}/assets/image3.webp`
  ]

  mockGlob.mockResolvedValue(mockImagePaths)
  mockGetConfig.mockResolvedValue({
    ignorePaths: ['node_modules/**', 'temp/**', 'build/**']
  })

  const result = await getRepositoryImages()

  expect(mockGlob).toHaveBeenCalledWith(
    `${workspace}/**/*.{jpeg,jpg,png,webp}`,
    {
      ignore: [
        `${workspace}/node_modules/**`,
        `${workspace}/temp/**`,
        `${workspace}/build/**`
      ],
      nodir: true,
      follow: false,
      dot: true
    }
  )

  expect(result).toEqual(mockImagePaths)
})

test('handles empty results', async () => {
  mockGlob.mockResolvedValue([])

  const result = await getRepositoryImages()

  expect(result).toEqual([])
})

test('handles empty ignore paths', async () => {
  const workspace = path.resolve(process.env.GITHUB_WORKSPACE)
  const mockImagePaths = [`${workspace}/image.png`]

  mockGlob.mockResolvedValue(mockImagePaths)
  mockGetConfig.mockResolvedValue({
    ignorePaths: []
  })

  const result = await getRepositoryImages()

  expect(mockGlob).toHaveBeenCalledWith(
    `${workspace}/**/*.{jpeg,jpg,png,webp}`,
    {
      ignore: [],
      nodir: true,
      follow: false,
      dot: true
    }
  )

  expect(result).toEqual(mockImagePaths)
})
