import os from 'os'
import path from 'path'
import { promises as fs } from 'fs'
import { beforeEach, afterEach, test, expect } from 'vitest'
import { findImages } from '../src/get-repository-images.ts'

let root
let repoDir

const touch = async relativePath => {
  const absolutePath = path.join(repoDir, relativePath)
  await fs.mkdir(path.dirname(absolutePath), { recursive: true })
  await fs.writeFile(absolutePath, '')
  return absolutePath
}

const relativeResults = async ignorePaths =>
  (await findImages(repoDir, ignorePaths))
    .map(imagePath => path.relative(repoDir, imagePath))
    .sort()

beforeEach(async () => {
  root = await fs.mkdtemp(path.join(os.tmpdir(), 'image-actions-'))
  repoDir = path.join(root, 'repo')
  await fs.mkdir(repoDir)
})

afterEach(async () => {
  await fs.rm(root, { recursive: true, force: true })
})

test('returns every supported image as an absolute path', async () => {
  const expected = [
    await touch('image.png'),
    await touch('docs/photo.jpg'),
    await touch('docs/deep/nested/picture.jpeg'),
    await touch('assets/graphic.webp'),
    await touch('assets/modern.avif')
  ]
  await touch('README.md')
  await touch('assets/logo.svg')
  await touch('assets/animation.gif')

  expect((await findImages(repoDir, [])).sort()).toEqual(expected.sort())
})

test('includes images in dot directories but not in .git', async () => {
  await touch('.github/images/preview.png')
  await touch('.hidden.jpg')
  await touch('docs/.assets/logo.png')
  await touch('.git/objects/blob.png')

  expect(await relativeResults([])).toEqual([
    '.github/images/preview.png',
    '.hidden.jpg',
    'docs/.assets/logo.png'
  ])
})

test('respects ignore paths, including dot files beneath them', async () => {
  await touch('src/image1.png')
  await touch('node_modules/package/icon.jpg')
  await touch('node_modules/.cache/thumb.png')
  await touch('temp/cache.webp')
  await touch('packages/app/node_modules/dep/logo.png')

  expect(await relativeResults(['node_modules/**', 'temp/**'])).toEqual([
    'packages/app/node_modules/dep/logo.png',
    'src/image1.png'
  ])
})

test('does not follow symlinks to files or directories', async () => {
  const outside = path.join(root, 'outside')
  await fs.mkdir(outside)
  await fs.writeFile(path.join(outside, 'private.png'), '')
  await touch('real.png')
  await fs.symlink(outside, path.join(repoDir, 'linked-directory'))
  await fs.symlink(
    path.join(outside, 'private.png'),
    path.join(repoDir, 'linked.png')
  )

  expect(await relativeResults([])).toEqual(['real.png'])
})

test('returns an empty list when there are no images', async () => {
  await touch('README.md')

  expect(await findImages(repoDir, [])).toEqual([])
})
