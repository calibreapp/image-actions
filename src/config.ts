import { readFile } from 'fs/promises'

import * as core from '@actions/core'
import yaml from 'js-yaml'

import type { PngOptions, JpegOptions, WebpOptions } from 'sharp'

import {
  CONFIG_PATH,
  JPEG_QUALITY,
  JPEG_PROGRESSIVE,
  PNG_QUALITY,
  WEBP_QUALITY,
  IGNORE_PATHS,
  COMPRESS_ONLY,
  MIN_PCT_CHANGE
} from './constants.ts'

interface Config {
  compressOnly: boolean
  jpeg: JpegOptions
  png: PngOptions
  webp: WebpOptions
  ignorePaths: string[]
  minPctChange: number
}

// Deprecated configuration method
const getYamlConfig = async () => {
  try {
    const buffer = await readFile(CONFIG_PATH)
    return yaml.load(buffer.toString())
  } catch (err) {
    return undefined
  }
}

const getConfig = async () => {
  const defaultConfig: Config = {
    jpeg: {
      quality: JPEG_QUALITY,
      progressive: JPEG_PROGRESSIVE,
      chromaSubsampling: '4:4:4'
    },
    png: {
      quality: PNG_QUALITY,
      compressionLevel: 9
    },
    webp: {
      quality: WEBP_QUALITY,
      smartSubsample: true
    },
    ignorePaths: IGNORE_PATHS,
    compressOnly: COMPRESS_ONLY,
    minPctChange: MIN_PCT_CHANGE
  }

  const ymlConfig = await getYamlConfig()
  const config = ymlConfig
    ? Object.assign(defaultConfig, ymlConfig)
    : defaultConfig

  if (ymlConfig) {
    core.warning(
      'Using image-actions.yml for configuration is deprecated. See https://github.com/calibreapp/image-actions for the latest configuration options.'
    )
  }

  core.info(`Using config: ${JSON.stringify(config)}`)

  return config
}

export default getConfig
