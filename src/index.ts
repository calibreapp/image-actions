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

  if (config.compressOnly) {
    // Generate markdown report, so that it's exported to Action output
    console.log('->> Generating markdown…')
    await generateMarkdownReport({ processingResults: processingResults })
  } else {
    // Commit and comment on PR
    console.log('->> Committing files…')
    const commit = await createCommit(processingResults.optimisedImages)

    console.log('->> Generating markdown…')
    const markdown = await generateMarkdownReport({
      processingResults: processingResults,
      commitSha: commit.sha
    })

    console.log('->> Leaving comment on PR…')
    await createComment(markdown)
  }
}

export default run
