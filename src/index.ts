import generateMarkdownReport from './github-markdown'
import processImages from './image-processing'
import createComment from './github-pr-comment'
import createCommit from './github-commit'

const run = async (): Promise<void> => {
  console.log('->> Locating images…')

  const results: ProcessedImagesResult = await processImages()

  const optimisedImages = results.images.filter(
    (img) => img.compressionWasSignificant
  )

  // If nothing was optimised, bail out.
  if (!optimisedImages.length) {
    console.log('::warning:: Nothing left to optimise. Stopping…')
    return
  }

  console.log('->> Generating markdown…')
  const markdown = await generateMarkdownReport(results)

  console.log('->> Committing files…')
  await createCommit(optimisedImages)

  console.log('->> Leaving comment on PR…')
  await createComment(markdown)

  return
}

export default run
