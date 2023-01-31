import path from 'path'

import { ImageKind } from './enums'

const GITHUB_TOKEN =
  process.env['INPUT_GITHUBTOKEN'] || process.env['GITHUB_TOKEN']
const GITHUB_EVENT_NAME = process.env['GITHUB_EVENT_NAME']
const GITHUB_EVENT_PATH = process.env['GITHUB_EVENT_PATH']
const GITHUB_SHA = process.env['GITHUB_SHA']
const GITHUB_REF = process.env['GITHUB_REF']
const GITHUB_REPOSITORY = process.env['GITHUB_REPOSITORY']
const GITHUB_API_URL = process.env['GITHUB_API_URL']

const REPO_DIRECTORY = process.env['GITHUB_WORKSPACE']

const JPEG_QUALITY = parseInt(process.env['INPUT_JPEGQUALITY']) || 80
const PNG_QUALITY = parseInt(process.env['INPUT_PNGQUALITY']) || 80
const WEBP_QUALITY = parseInt(process.env['INPUT_WEBPQUALITY']) || 80
const IGNORE_PATHS = process.env['INPUT_IGNOREPATHS']
  ? process.env['INPUT_IGNOREPATHS'].split(',')
  : ['node_modules/**']
const COMPRESS_ONLY = process.env['INPUT_COMPRESSONLY'] === 'true'
const JPEG_PROGRESSIVE = process.env['INPUT_JPEGPROGRESSIVE'] === 'true'

const COMMITTER = {
  name: 'Calibre',
  email: 'hello@calibreapp.com'
}

if (!REPO_DIRECTORY) {
  console.log('::error:: There is no GITHUB_WORKSPACE environment variable')
  process.exit(1)
}

const CONFIG_PATH = path.join(
  REPO_DIRECTORY,
  '.github/calibre/image-actions.yml'
)

const FILE_EXTENSIONS_TO_PROCESS = ['jpeg', 'jpg', 'png', 'webp']

interface SharpExtensionFormat {
  [key: string]: ImageKind
}

const EXTENSION_TO_SHARP_FORMAT_MAPPING: SharpExtensionFormat = {
  '.png': ImageKind.Png,
  '.jpeg': ImageKind.Jpeg,
  '.jpg': ImageKind.Jpeg,
  '.webp': ImageKind.Webp
}

export {
  GITHUB_TOKEN,
  GITHUB_EVENT_NAME,
  GITHUB_EVENT_PATH,
  GITHUB_SHA,
  GITHUB_REF,
  GITHUB_REPOSITORY,
  GITHUB_API_URL,
  REPO_DIRECTORY,
  CONFIG_PATH,
  FILE_EXTENSIONS_TO_PROCESS,
  EXTENSION_TO_SHARP_FORMAT_MAPPING,
  COMMITTER,
  JPEG_QUALITY,
  JPEG_PROGRESSIVE,
  PNG_QUALITY,
  WEBP_QUALITY,
  IGNORE_PATHS,
  COMPRESS_ONLY
}
