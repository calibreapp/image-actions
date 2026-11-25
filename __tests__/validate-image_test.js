import os from 'os'
import path from 'path'
import { promises as fs } from 'fs'
import { beforeEach, afterEach, test, expect } from 'vitest'
import validateImage from '../src/validate-image.ts'
import { MAX_FILE_SIZE_BYTES } from '../src/constants.ts'

const EXAMPLE_IMAGE = `${process.cwd()}/__tests__/example-images/icon.png`

let directory

const copyExample = async name => {
  const destination = path.join(directory, name)
  await fs.copyFile(EXAMPLE_IMAGE, destination)
  return destination
}

beforeEach(async () => {
  directory = await fs.mkdtemp(path.join(os.tmpdir(), 'image-actions-'))
})

afterEach(async () => {
  await fs.rm(directory, { recursive: true, force: true })
})

test('accepts a regular file', async () => {
  expect(await validateImage(await copyExample('icon.png'))).toBeNull()
})

test('rejects symlinks', async () => {
  const link = path.join(directory, 'link.png')
  await fs.symlink(await copyExample('icon.png'), link)

  expect(await validateImage(link)).toBe('it is not a regular file')
})

test('rejects missing files', async () => {
  expect(await validateImage(path.join(directory, 'missing.png'))).toBe(
    'it is not a regular file'
  )
})

test('rejects files over the size limit', async () => {
  const image = await copyExample('huge.png')
  await fs.truncate(image, MAX_FILE_SIZE_BYTES + 1)

  expect(await validateImage(image)).toBe(
    `it is larger than ${MAX_FILE_SIZE_BYTES} bytes`
  )
})

test('rejects filenames with control characters', async () => {
  const image = await copyExample('a\n::warning::x.png')

  expect(await validateImage(image)).toBe(
    'the filename contains control characters'
  )
})
