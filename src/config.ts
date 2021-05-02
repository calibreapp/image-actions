import { promises as fsPromises } from 'fs'
const { readFile } = fsPromises
import yaml from 'js-yaml'
import { PngOptions, JpegOptions, WebpOptions } from 'sharp'

const {
  CONFIG_PATH,
  JPEG_QUALITY,
  JPEG_PROGRESSIVE,
  PNG_QUALITY,
  WEBP_QUALITY,
  IGNORE_PATHS,
  COMPRESS_ONLY
} = require('./constants')

interface SizeOptions {
  [key: string]: {
    width?: number
    height?: number
  }
}

interface Config {
  compressOnly: boolean
  jpeg: JpegOptions
  png: PngOptions
  webp: WebpOptions
  ignorePaths: string[]
  size: SizeOptions
}

// Deprecated configuration method
const getYamlConfig = async () => {
  try {
    const buffer = await readFile(CONFIG_PATH)
    return yaml.safeLoad(buffer.toString())
  } catch (err) {
    return undefined
  }
}

const getConfig = async () => {
  const defaultConfig: Config = {
    jpeg: { quality: JPEG_QUALITY, progressive: JPEG_PROGRESSIVE },
    png: { quality: PNG_QUALITY },
    webp: { quality: WEBP_QUALITY },
    ignorePaths: IGNORE_PATHS,
    compressOnly: COMPRESS_ONLY,
    size: {}
  }

  const ymlConfig = await getYamlConfig()
  const config = ymlConfig
    ? Object.assign(defaultConfig, ymlConfig)
    : defaultConfig

  if (ymlConfig) {
    console.error(
      '::warning:: Using image-actions.yml for configuration is deprecated. See https://github.com/calibreapp/image-actions for the latest configuration options.'
    )
  }

  console.log('->> Using config:', JSON.stringify(config))

  return config
}

export default getConfig
