import { stat, writeFile } from 'fs/promises'
import path from 'path'

import * as core from '@actions/core'
import sharp from 'sharp'
import { glob } from 'glob'

import getConfig from './config.ts'

import {
  REPO_DIRECTORY,
  EXTENSION_TO_SHARP_FORMAT_MAPPING,
  FILE_EXTENSIONS_TO_PROCESS,
  MIN_PCT_CHANGE
} from './constants.ts'

const MAX_IMAGES_TO_COMMIT = 500

import type {
  ProcessedImage,
  ProcessedImageMetrics,
  ProcessedImagesResult
} from './types/ProcessedImage.d.ts'

const processImages = async (): Promise<ProcessedImagesResult> => {
  core.info(
    'To turn on DEBUG level logging for image-actions, see this reference: https://docs.github.com/en/actions/managing-workflow-runs/enabling-debug-logging'
  )
  core.debug('=== Sharp library info ===')
  core.debug(JSON.stringify(sharp.versions))
  core.debug(JSON.stringify(sharp.format))
  core.debug('=== Sharp library info ===')

  const config = await getConfig()
  if (!REPO_DIRECTORY) {
    throw new Error('REPO_DIRECTORY is not set')
  }
  const absoluteRepoDir = path.resolve(REPO_DIRECTORY)
  const globPaths = `${absoluteRepoDir}/**/*.{${FILE_EXTENSIONS_TO_PROCESS.join(
    ','
  )}}`

  const imagePaths = await glob(globPaths, {
    ignore: config.ignorePaths.map((p: string) =>
      path.resolve(REPO_DIRECTORY!, p)
    ),
    nodir: true,
    follow: false,
    dot: true
  })

  const optimisedImages: ProcessedImage[] = []
  const unoptimisedImages: ProcessedImage[] = []

  for (const imgPath of imagePaths) {
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

      // Remove the repository directory path to get relative name
      const name = path.relative(absoluteRepoDir, imgPath)
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
        // Only write if there was a worthwhile optimisation
        await writeFile(imgPath, data)

        // Add to optimisedImages array for reporting
        optimisedImages.push(processedImage)
      } else {
        // Add to unoptimisedImages array for reporting
        unoptimisedImages.push(processedImage)
      }
    } catch (e) {
      core.error(`Error processing ${imgPath}: ${e}`)
      continue
    }
  }

  // Sort optimised images by most significant improvements (highest byte savings first)
  const sortedOptimisedImages = optimisedImages.sort((a, b) => {
    const aSavings = a.beforeStats - a.afterStats
    const bSavings = b.beforeStats - b.afterStats
    return bSavings - aSavings
  })

  // Limit to MAX_IMAGES_TO_COMMIT for processing/committing
  const limitedOptimisedImages = sortedOptimisedImages.slice(0, MAX_IMAGES_TO_COMMIT)

  const metrics = await calculateOverallMetrics(limitedOptimisedImages)

  return {
    optimisedImages: limitedOptimisedImages,
    unoptimisedImages,
    metrics
  }
}

const calculateOverallMetrics = async (
  images: ProcessedImage[]
): Promise<ProcessedImageMetrics> => {
  let bytesBeforeCompression = 0
  let bytesAfterCompression = 0

  for await (const image of images) {
    if (image.compressionWasSignificant) {
      bytesBeforeCompression += image.beforeStats
      bytesAfterCompression += image.afterStats
    }
  }

  const bytesSaved = bytesBeforeCompression - bytesAfterCompression
  const percentChange =
    (bytesAfterCompression / bytesBeforeCompression) * 100 - 100

  return {
    bytesSaved,
    percentChange
  }
}

export default processImages
