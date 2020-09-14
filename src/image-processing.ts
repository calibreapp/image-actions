import util from 'util'
import { promises as fsPromises } from 'fs'
const { stat, writeFile } = fsPromises
import path from 'path'
import sharp from 'sharp'

const glob = util.promisify(require('glob'))

import {
  REPO_DIRECTORY,
  EXTENSION_TO_SHARP_FORMAT_MAPPING,
  FILE_EXTENSIONS_TO_PROCESS,
} from './constants'
import getConfig from './config'

const processImages = async (): Promise<ProcessedImagesResult> => {
  console.log('=== Sharp library info ===')
  console.log(sharp.versions)
  console.log(sharp.format)
  console.log('=== Sharp library info ===')

  const config = await getConfig()
  const globPaths = `${REPO_DIRECTORY}/**/*.{${FILE_EXTENSIONS_TO_PROCESS.join(
    ','
  )}}`

  const imagePaths = await glob(globPaths, {
    ignore: config.ignorePaths.map((p: string) =>
      path.resolve(REPO_DIRECTORY, p)
    ),
    onlyFiles: true,
  })

  const images: ProcessedImage[] = []

  for await (const imgPath of imagePaths) {
    const extension = path.extname(imgPath)
    const sharpFormat = EXTENSION_TO_SHARP_FORMAT_MAPPING[extension]
    const options = config[sharpFormat]
    const beforeStats = (await stat(imgPath)).size

    try {
      const { data, info } = await sharp(imgPath)
        .toFormat(sharpFormat, options)
        .toBuffer({ resolveWithObject: true })

      console.log(
        '    - Processing:',
        imgPath,
        `config=${JSON.stringify(options)}`,
        `output=${JSON.stringify(info)}`
      )

      await writeFile(imgPath, data)

      // Remove the /github/home/ path (including the slash)
      const name = imgPath.replace(REPO_DIRECTORY, '').replace(/\//, '')
      const afterStats = info.size
      const percentChange = (afterStats / beforeStats) * 100 - 100

      // Add a flag to tell if the optimisation was worthwhile
      const compressionWasSignificant = percentChange < -1

      const processedImage: ProcessedImage = {
        name,
        path: imgPath,
        beforeStats,
        afterStats,
        percentChange,
        compressionWasSignificant,
      }
      images.push(processedImage)
    } catch (e) {
      console.error('::error:: ', e, imgPath)
      continue
    }
  }

  const metrics = await calculateOverallMetrics(images)

  return {
    images,
    metrics,
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
    percentChange,
  }
}

export default processImages
