import { beforeEach, afterEach, test, expect, vi } from 'vitest'
import { Octokit } from '@octokit/action'
import { context } from '@actions/github'
import getChangedImages from '../src/get-changed-images.ts'
import getConfig from '../src/config.ts'

vi.mock('@octokit/action')
vi.mock('@actions/github', () => ({
  context: {
    repo: {
      owner: 'testowner',
      repo: 'testrepo'
    },
    payload: {
      pull_request: {
        number: 123
      }
    }
  }
}))
vi.mock('../src/config.ts')

const mockListFiles = vi.fn()
const mockGetConfig = vi.fn()
const mockOctokit = {
  rest: {
    pulls: {
      listFiles: mockListFiles
    }
  }
}

beforeEach(() => {
  vi.clearAllMocks()

  // Reset the mocks before each test
  vi.mocked(Octokit).mockImplementation(() => mockOctokit)
  vi.mocked(getConfig).mockImplementation(mockGetConfig)

  // Set up default config
  mockGetConfig.mockResolvedValue({
    ignorePaths: ['node_modules/**']
  })

  // Set up environment variable
  process.env.GITHUB_WORKSPACE = '/test/workspace'
})

afterEach(() => {
  vi.restoreAllMocks()
})

test('returns changed image files from PR', async () => {
  const mockFiles = [
    { filename: 'src/image1.png', status: 'modified' },
    { filename: 'docs/image2.jpg', status: 'added' },
    { filename: 'assets/image3.webp', status: 'modified' },
    { filename: 'README.md', status: 'modified' }, // Non-image file
    { filename: 'old-image.jpeg', status: 'removed' }, // Removed file
    { filename: 'styles.css', status: 'added' } // Non-image file
  ]

  mockListFiles.mockResolvedValue({ data: mockFiles })

  const result = await getChangedImages()

  expect(mockListFiles).toHaveBeenCalledWith({
    owner: 'testowner',
    repo: 'testrepo',
    pull_number: 123
  })

  expect(result).toEqual([
    'src/image1.png',
    'docs/image2.jpg',
    'assets/image3.webp'
  ])
})

test('returns empty array when no image files changed', async () => {
  const mockFiles = [
    { filename: 'README.md', status: 'modified' },
    { filename: 'package.json', status: 'modified' },
    { filename: 'styles.css', status: 'added' }
  ]

  mockListFiles.mockResolvedValue({ data: mockFiles })

  const result = await getChangedImages()

  expect(result).toEqual([])
})

test('filters out removed image files', async () => {
  const mockFiles = [
    { filename: 'keep-this.png', status: 'modified' },
    { filename: 'remove-this.jpg', status: 'removed' },
    { filename: 'add-this.webp', status: 'added' }
  ]

  mockListFiles.mockResolvedValue({ data: mockFiles })

  const result = await getChangedImages()

  expect(result).toEqual(['keep-this.png', 'add-this.webp'])
})

test('handles supported image file extensions', async () => {
  const mockFiles = [
    { filename: 'image.png', status: 'modified' },
    { filename: 'photo.jpg', status: 'added' },
    { filename: 'picture.jpeg', status: 'modified' },
    { filename: 'graphic.webp', status: 'added' },
    { filename: 'icon.PNG', status: 'modified' }, // Uppercase extension
    { filename: 'banner.JPG', status: 'added' }, // Uppercase extension
    { filename: 'logo.gif', status: 'added' }, // Unsupported format
    { filename: 'avatar.svg', status: 'modified' } // Unsupported format
  ]

  mockListFiles.mockResolvedValue({ data: mockFiles })

  const result = await getChangedImages()

  expect(result).toEqual([
    'image.png',
    'photo.jpg',
    'picture.jpeg',
    'graphic.webp',
    'icon.PNG',
    'banner.JPG'
  ])
})

test('returns null when no PR context (for fallback)', async () => {
  // Mock context without pull_request to simulate scheduled/manual runs
  vi.mocked(context).payload = {}

  const result = await getChangedImages()

  expect(result).toBeNull()

  // Restore the original context for other tests
  vi.mocked(context).payload = {
    pull_request: {
      number: 123
    }
  }
})

test('handles GitHub API errors gracefully', async () => {
  mockListFiles.mockRejectedValue(new Error('GitHub API error'))

  const result = await getChangedImages()

  expect(result).toBeNull()
})

test('handles empty file list from API', async () => {
  mockListFiles.mockResolvedValue({ data: [] })

  const result = await getChangedImages()

  expect(result).toEqual([])
})

test('filters out images in ignored paths', async () => {
  const mockFiles = [
    { filename: 'src/image1.png', status: 'modified' },
    { filename: 'node_modules/package/icon.jpg', status: 'added' },
    { filename: 'assets/image3.webp', status: 'modified' },
    { filename: 'node_modules/lib/logo.png', status: 'modified' }
  ]

  mockListFiles.mockResolvedValue({ data: mockFiles })
  mockGetConfig.mockResolvedValue({
    ignorePaths: ['node_modules/**']
  })

  const result = await getChangedImages()

  expect(result).toEqual(['src/image1.png', 'assets/image3.webp'])
})

test('handles multiple ignore paths', async () => {
  const mockFiles = [
    { filename: 'src/image1.png', status: 'modified' },
    { filename: 'node_modules/package/icon.jpg', status: 'added' },
    { filename: 'temp/cache.webp', status: 'modified' },
    { filename: 'assets/image3.webp', status: 'modified' },
    { filename: 'build/optimized.png', status: 'added' }
  ]

  mockListFiles.mockResolvedValue({ data: mockFiles })
  mockGetConfig.mockResolvedValue({
    ignorePaths: ['node_modules/**', 'temp/**', 'build/**']
  })

  const result = await getChangedImages()

  expect(result).toEqual(['src/image1.png', 'assets/image3.webp'])
})

test('handles empty ignore paths', async () => {
  const mockFiles = [
    { filename: 'src/image1.png', status: 'modified' },
    { filename: 'node_modules/package/icon.jpg', status: 'added' },
    { filename: 'assets/image3.webp', status: 'modified' }
  ]

  mockListFiles.mockResolvedValue({ data: mockFiles })
  mockGetConfig.mockResolvedValue({
    ignorePaths: []
  })

  const result = await getChangedImages()

  expect(result).toEqual([
    'src/image1.png',
    'node_modules/package/icon.jpg',
    'assets/image3.webp'
  ])
})

test('ignores specific subdirectories correctly', async () => {
  const mockFiles = [
    { filename: 'docs/images/screenshot.png', status: 'modified' },
    { filename: 'docs/assets/logo.jpg', status: 'added' },
    { filename: 'src/assets/icon.webp', status: 'modified' },
    { filename: 'public/favicon.png', status: 'added' }
  ]

  mockListFiles.mockResolvedValue({ data: mockFiles })
  mockGetConfig.mockResolvedValue({
    ignorePaths: ['docs/assets/**']
  })

  const result = await getChangedImages()

  expect(result).toEqual([
    'docs/images/screenshot.png',
    'src/assets/icon.webp',
    'public/favicon.png'
  ])
})
