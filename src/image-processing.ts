import util from 'util'
import { promises as fsPromises } from 'fs'
const { stat, writeFile } = fsPromises
import path from 'path'
import sharp from 'sharp'

const glob = util.promisify(require('glob'))

import {
  REPO_DIRECTORY,
  EXTENSION_TO_SHARP_FORMAT_MAPPING,
  FILE_EXTENSIONS_TO_PROCESS
} from './constants'

import getConfig from './config'

const processImages = async (): Promise<ProcessedImagesResult> => {
  console.log(
    'To turn on DEBUG level logging for image-actions, see this reference: https://docs.github.com/en/actions/managing-workflow-runs/enabling-debug-logging'
  )
  console.log('::debug:: === Sharp library info ===')
  console.log('::debug::', sharp.versions)
  console.log('::debug::', sharp.format)
  console.log('::debug:: === Sharp library info ===')

  const config = await getConfig()

  const getMatchedPathsByGlobs = async (pattern: string) => {
    const imagePaths = await glob(pattern, {
      ignore: config.ignorePaths.map((p: string) =>
        path.resolve(REPO_DIRECTORY, p)
      ),
      nodir: true,
      follow: false,
      dot: true
    })

    return imagePaths;
  }

  const globPaths = `${REPO_DIRECTORY}/**/*.{${FILE_EXTENSIONS_TO_PROCESS.join(
    ','
  )}}`

  const imagePaths = await getMatchedPathsByGlobs(globPaths)

  /**
   * Get all files which requires resizing
   *  
   * Output: 
   * 
   * {
   *   "/tests/test-images/icon.png": {  width: 100, height: 200 } // Sizes can be defined in config file
   * }
  */ 
  const imagesToBeResized = await Object.keys(config.size).reduce(async (agg: any, pathProvided: string) => {
    const globPath = FILE_EXTENSIONS_TO_PROCESS.find(extension => pathProvided.includes(`.${extension}`)) ? pathProvided : `${pathProvided}/*.{${FILE_EXTENSIONS_TO_PROCESS.join(
      ','
    )}}`;

    const paths = await getMatchedPathsByGlobs(globPath);

    if (paths.length === 0) {
      return agg;
    }

    const imagePathWithSize = paths.reduce((agg: any, matchedPath: string) => ({
      ...agg,
      [matchedPath]: config.size[globPath]
    }), {})

    return {
      ...agg,
      ...imagePathWithSize
    }
  }, {})

  const optimisedImages: ProcessedImage[] = []
  const unoptimisedImages: ProcessedImage[] = []

  for await (const imgPath of imagePaths) {
    const extension = path.extname(imgPath)
    const sharpFormat = EXTENSION_TO_SHARP_FORMAT_MAPPING[extension]
    const options = config[sharpFormat]
    const beforeStats = (await stat(imgPath)).size

    const customSize = imagesToBeResized[imgPath];

    try {
      const { data, info } = await sharp(imgPath)
        .resize(customSize || {})
        .toFormat(sharpFormat, options)
        .toBuffer({ resolveWithObject: true })

      console.log(
        '    - Processing:',
        imgPath,
        `config=${JSON.stringify(options)}`,
        `output=${JSON.stringify(info)}`
      )

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
      console.error('::error:: ', e, imgPath)
      continue
    }
  }

  const metrics = await calculateOverallMetrics(optimisedImages)

  return {
    optimisedImages,
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
