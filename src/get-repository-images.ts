import path from 'path'
import { glob } from 'fs/promises'
import * as core from '@actions/core'

import getConfig from './config.ts'
import { REPO_DIRECTORY, FILE_EXTENSIONS_TO_PROCESS } from './constants.ts'

const IMAGE_FILES = `*.{${FILE_EXTENSIONS_TO_PROCESS.join(',')}}`
const IMAGE_PATTERNS = [
  `**/${IMAGE_FILES}`,
  `**/.${IMAGE_FILES}`,
  `**/.*/**/${IMAGE_FILES}`
]

const findImages = async (
  repoDir: string,
  ignorePaths: string[]
): Promise<string[]> => {
  const images: string[] = []
  const entries = glob(IMAGE_PATTERNS, {
    cwd: repoDir,
    exclude: ['.git/**', ...ignorePaths],
    withFileTypes: true
  })

  for await (const entry of entries) {
    if (entry.isFile()) {
      images.push(path.join(entry.parentPath, entry.name))
    }
  }

  return images
}

const getRepositoryImages = async (): Promise<string[]> => {
  const config = await getConfig()

  if (!REPO_DIRECTORY) {
    throw new Error('REPO_DIRECTORY is not set.')
  }

  core.info('Scanning repository for images…')

  const imagePaths = await findImages(
    path.resolve(REPO_DIRECTORY),
    config.ignorePaths
  )

  core.info(`Found ${imagePaths.length} images in repository.`)

  return imagePaths
}

export { findImages }
export default getRepositoryImages
