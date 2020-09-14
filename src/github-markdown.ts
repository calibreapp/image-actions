import { filesize } from 'humanize'

const optimisedImages = (processedImages: ProcessedImage[]): string => {
  return processedImages
    .filter((image) => image.compressionWasSignificant)
    .map((image) => {
      const beforeSize = filesize(image.beforeStats)
      const afterSize = filesize(image.afterStats)
      const formattedPercentage = `${image.percentChange.toFixed(1)}%`

      return `| \`${image.name}\` | ${beforeSize} | ${afterSize} | ${formattedPercentage} |`
    })
    .join('\n')
}

const unoptimisedImages = (processedImages: ProcessedImage[]): string => {
  const nonOptimisable = processedImages.filter(
    (image) => !image.compressionWasSignificant
  )

  if (nonOptimisable.length > 0) {
    const items = nonOptimisable
      .map((image) => {
        return `* \`${image.name}\``
      })
      .join('\n')

    return `

<details>
<summary>Some images were already optimised</summary>

${items}
</details>`
  } else {
    return ''
  }
}

const generateMarkdownReport = (payload: ProcessedImagesResult): string => {
  return `
Images automagically compressed by [Calibre](https://calibreapp.com)'s [image-actions](https://github.com/marketplace/actions/image-actions) ✨

Compression reduced images by ${-payload.metrics.percentChange.toFixed(
    1
  )}%, saving ${filesize(payload.metrics.bytesSaved)}

| Filename | Before | After | Improvement |
| --- | --- | --- | --- |
${optimisedImages(payload.images)}
${unoptimisedImages(payload.images)}`
}

export default generateMarkdownReport
