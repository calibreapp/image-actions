import generateMarkdownReport from './github-markdown'
import processImages from './image-processing'
import createComment from './github-pr-comment'
import createCommit from './github-commit'
import getConfig from './config'

const run = async (): Promise<void> => {
  const config = await getConfig()

  console.log('->> Locating images…')

  const processingResults: ProcessedImagesResult = await processImages()

  // If nothing was optimised, bail out.
  if (!processingResults.optimisedImages.length) {
    console.log('::warning:: Nothing left to optimise. Stopping…')
    return
  }

  console.log('->> Generating markdown…')
  const markdown = await generateMarkdownReport(results)

  // Expose the markdown to an Action output
  // https://github.community/t/set-output-truncates-multiline-strings/16852
  const escapedMarkdown = markdown
    .replace(/\%/g, '%25')
    .replace(/\n/g, '%0A')
    .replace(/\r/g, '%0D')
  console.log('::set-output name=markdown::' + escapedMarkdown)

  // If compress only mode, then we're done
  if (config.compressOnly) {
    console.log('->> compressOnly was set. Stopping.')
    return
  }

  console.log('->> Committing files…')
  await createCommit(optimisedImages)

  console.log('->> Leaving comment on PR…')
  await createComment(markdown)

  return
}

export default run
