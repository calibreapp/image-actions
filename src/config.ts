import * as core from '@actions/core'

import type { PngOptions, JpegOptions, WebpOptions, AvifOptions } from 'sharp'

import {
  JPEG_QUALITY,
  JPEG_PROGRESSIVE,
  PNG_QUALITY,
  WEBP_QUALITY,
  AVIF_QUALITY,
  IGNORE_PATHS,
  COMPRESS_ONLY,
  MIN_PCT_CHANGE,
  BASE_IMAGE
} from './constants.ts'

interface Config {
  compressOnly: boolean
  jpeg: JpegOptions
  png: PngOptions
  webp: WebpOptions
  avif: AvifOptions
  ignorePaths: string[]
  minPctChange: number
  baseImage: string
}

const getConfig = async () => {
  const config: Config = {
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
    avif: {
      quality: AVIF_QUALITY
    },
    ignorePaths: IGNORE_PATHS,
    compressOnly: COMPRESS_ONLY,
    minPctChange: MIN_PCT_CHANGE,
    baseImage: BASE_IMAGE
  }

  core.info(`Using config: ${JSON.stringify(config)}`)

  return config
}

export default getConfig
