import generateMarkdownReport from './github-markdown.ts'
import processImages from './image-processing.ts'
import createComment from './github-pr-comment.ts'
import createCommit from './github-commit.ts'
import getConfig from './config.ts'
import { context } from '@actions/github'
import type { ProcessedImagesResult } from './types/ProcessedImage.d.ts'

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

    // Only create PR comment if we're in a pull_request context
    const isPullRequest = context.payload.pull_request?.number
    if (isPullRequest) {
      console.log('->> Leaving comment on PR…')
      await createComment(markdown)
    } else {
      console.log('->> Skipping PR comment (not in pull request context)…')
    }
  }
}

export default run
