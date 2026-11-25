import path from 'path'

const DIRECTORY_SUFFIX = '/**'

const ancestors = (relativePath: string): string[] => {
  const segments = relativePath.split('/')
  return segments.map((_, index) => segments.slice(0, index + 1).join('/'))
}

const isIgnored = (relativePath: string, ignorePaths: string[]): boolean =>
  ignorePaths.some(pattern => {
    if (path.posix.matchesGlob(relativePath, pattern)) {
      return true
    }

    if (!pattern.endsWith(DIRECTORY_SUFFIX)) {
      return false
    }

    const directoryPattern = pattern.slice(0, -DIRECTORY_SUFFIX.length)

    return ancestors(relativePath).some(directory =>
      path.posix.matchesGlob(directory, directoryPattern)
    )
  })

export default isIgnored
