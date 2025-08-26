import { stat, writeFile } from 'fs/promises'
import path from 'path'

import * as core from '@actions/core'
import sharp from 'sharp'

import getConfig from './config.ts'
import getChangedImages from './get-changed-images.ts'
import getRepositoryImages from './get-repository-images.ts'

import {
  REPO_DIRECTORY,
  EXTENSION_TO_SHARP_FORMAT_MAPPING,
  MIN_PCT_CHANGE
} from './constants.ts'

const MAX_IMAGES_TO_COMMIT = 500

import type {
  ProcessedImage,
  ProcessedImageMetrics,
  ProcessedImagesResult
} from './types/ProcessedImage.d.ts'

const discoverImages = async (): Promise<string[]> => {
  core.info('Locating images to process…')

  const changedImages = await getChangedImages()

  if (changedImages !== null) {
    core.info(`Found ${changedImages.length} changed images.`)
    if (changedImages.length === 0) {
      core.info('No new or updated images found.')
      return []
    }

    // Convert relative paths to absolute paths
    if (!REPO_DIRECTORY) {
      throw new Error('REPO_DIRECTORY is not set.')
    }
    const repoDir = path.resolve(REPO_DIRECTORY)
    return changedImages.map(relativePath =>
      path.resolve(repoDir, relativePath)
    )
  } else {
    core.info('Falling back to processing all images found in repository.')
    return await getRepositoryImages()
  }
}

const logSharpInfo = (): void => {
  core.info(
    'To turn on DEBUG level logging for image-actions, see this reference: https://docs.github.com/en/actions/managing-workflow-runs/enabling-debug-logging'
  )
  core.debug('=== Sharp library info ===')
  core.debug(JSON.stringify(sharp.versions))
  core.debug(JSON.stringify(sharp.format))
  core.debug('=== Sharp library info ===')
}

const processImage = async (
  imgPath: string,
  config: any
): Promise<ProcessedImage | null> => {
  const extension = path.extname(imgPath)
  const sharpFormat = EXTENSION_TO_SHARP_FORMAT_MAPPING[extension]
  const options = config[sharpFormat as keyof typeof config]
  const beforeStats = (await stat(imgPath)).size

  try {
    const { data, info } = await sharp(imgPath)
      .toFormat(sharpFormat as keyof sharp.FormatEnum, options as any)
      .toBuffer({ resolveWithObject: true })

    core.info(
      `Processing: ${imgPath} config=${JSON.stringify(options)} output=${JSON.stringify(info)}`
    )

    if (!REPO_DIRECTORY) {
      throw new Error('REPO_DIRECTORY is not set.')
    }
    const repoDir = path.resolve(REPO_DIRECTORY)
    const name = path.relative(repoDir, imgPath)
    const relativeImagePath = path.relative(process.cwd(), imgPath)
    const afterStats = info.size
    const percentChange = ((beforeStats - afterStats) / beforeStats) * 100
    const compressionWasSignificant = percentChange >= MIN_PCT_CHANGE

    const processedImage: ProcessedImage = {
      name,
      path: relativeImagePath,
      beforeStats,
      afterStats,
      percentChange,
      compressionWasSignificant
    }

    if (compressionWasSignificant) {
      await writeFile(imgPath, data)
    }

    return processedImage
  } catch (e) {
    core.error(`Error processing ${imgPath}: ${e}`)
    return null
  }
}

const processImages = async (): Promise<ProcessedImagesResult> => {
  logSharpInfo()

  const config = await getConfig()
  const imagePaths = await discoverImages()

  const optimisedImages: ProcessedImage[] = []
  const unoptimisedImages: ProcessedImage[] = []

  for (const imgPath of imagePaths) {
    const result = await processImage(imgPath, config)
    if (result) {
      if (result.compressionWasSignificant) {
        optimisedImages.push(result)
      } else {
        unoptimisedImages.push(result)
      }
    }
  }

  // Sort optimised images by most significant improvements (highest byte savings first)
  const sortedOptimisedImages = optimisedImages.sort((a, b) => {
    const aSavings = a.beforeStats - a.afterStats
    const bSavings = b.beforeStats - b.afterStats
    return bSavings - aSavings
  })

  // Limit to MAX_IMAGES_TO_COMMIT for processing/committing
  const limitedOptimisedImages = sortedOptimisedImages.slice(
    0,
    MAX_IMAGES_TO_COMMIT
  )

  const metrics = calculateOverallMetrics(limitedOptimisedImages)

  return {
    optimisedImages: limitedOptimisedImages,
    unoptimisedImages,
    metrics
  }
}

const calculateOverallMetrics = (
  images: ProcessedImage[]
): ProcessedImageMetrics => {
  let bytesBeforeCompression = 0
  let bytesAfterCompression = 0

  for (const image of images) {
    if (image.compressionWasSignificant) {
      bytesBeforeCompression += image.beforeStats
      bytesAfterCompression += image.afterStats
    }
  }

  const bytesSaved = bytesBeforeCompression - bytesAfterCompression
  const percentChange =
    bytesBeforeCompression > 0
      ? (bytesAfterCompression / bytesBeforeCompression) * 100 - 100
      : 0

  return {
    bytesSaved,
    percentChange
  }
}

export default processImages
