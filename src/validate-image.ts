import { lstat } from 'fs/promises'

import { MAX_FILE_SIZE_BYTES } from './constants.ts'
import { hasControlCharacters } from './sanitise.ts'

const validateImage = async (imgPath: string): Promise<string | null> => {
  if (hasControlCharacters(imgPath)) {
    return 'the filename contains control characters'
  }

  const stats = await lstat(imgPath).catch(() => null)

  if (!stats?.isFile()) {
    return 'it is not a regular file'
  }

  if (stats.size > MAX_FILE_SIZE_BYTES) {
    return `it is larger than ${MAX_FILE_SIZE_BYTES} bytes`
  }

  return null
}

export default validateImage
