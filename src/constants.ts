import * as core from '@actions/core'

const GITHUB_EVENT_NAME = process.env['GITHUB_EVENT_NAME']
const GITHUB_SHA = process.env['GITHUB_SHA']
const GITHUB_REF = process.env['GITHUB_REF']
const GITHUB_REPOSITORY = process.env['GITHUB_REPOSITORY']

const REPO_DIRECTORY = process.env['GITHUB_WORKSPACE']

const JPEG_QUALITY = parseInt(core.getInput('jpegQuality')) || 85
const JPEG_PROGRESSIVE = core.getInput('jpegProgressive') === 'true'
const PNG_QUALITY = parseInt(core.getInput('pngQuality')) || 80
const WEBP_QUALITY = parseInt(core.getInput('webpQuality')) || 85
const AVIF_QUALITY = parseInt(core.getInput('avifQuality')) || 75

const IGNORE_PATHS = core.getInput('ignorePaths')
  ? core.getInput('ignorePaths').split(',')
  : ['node_modules/**']
const COMPRESS_ONLY = core.getInput('compressOnly') === 'true'
const MIN_PCT_CHANGE = parseFloat(core.getInput('minPctChange')) || 5

const COMMITTER = {
  name: 'Calibre',
  email: 'hello@calibreapp.com'
}

if (!REPO_DIRECTORY) {
  core.error('There is no GITHUB_WORKSPACE environment variable')
  process.exit(1)
}

const FILE_EXTENSIONS_TO_PROCESS = ['jpeg', 'jpg', 'png', 'webp', 'avif']

const EXTENSION_TO_SHARP_FORMAT_MAPPING: Record<string, string> = {
  '.png': 'png',
  '.jpeg': 'jpeg',
  '.jpg': 'jpeg',
  '.webp': 'webp',
  '.avif': 'avif'
}

export {
  GITHUB_EVENT_NAME,
  GITHUB_SHA,
  GITHUB_REF,
  GITHUB_REPOSITORY,
  REPO_DIRECTORY,
  FILE_EXTENSIONS_TO_PROCESS,
  EXTENSION_TO_SHARP_FORMAT_MAPPING,
  COMMITTER,
  JPEG_QUALITY,
  JPEG_PROGRESSIVE,
  PNG_QUALITY,
  WEBP_QUALITY,
  AVIF_QUALITY,
  IGNORE_PATHS,
  COMPRESS_ONLY,
  MIN_PCT_CHANGE
}
