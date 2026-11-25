import * as core from '@actions/core'
import { context } from '@actions/github'
import { GITHUB_EVENT_NAME, COMPRESS_ONLY } from './src/constants.ts'

import run from './src/index.ts'
import isForkPullRequest from './src/is-fork-pull-request.ts'

const main = async () => {
  if (!COMPRESS_ONLY) {
    // Bail out if the event that executed the action wasn’t a pull_request
    if (GITHUB_EVENT_NAME !== 'pull_request') {
      core.error('This action only runs for pushes to PRs')
      process.exitCode = 78
      return
    }

    // Bail out if the pull_request event wasn't synchronize or opened
    if (
      context.payload.action !== 'synchronize' &&
      context.payload.action !== 'opened'
    ) {
      core.error(
        `Check run has action ${context.payload.action}. Wants: synchronize or opened`
      )
      return
    }

    if (isForkPullRequest(context.payload)) {
      core.warning(
        'This pull request comes from a forked repository, so optimised images cannot be committed to it. Skipping. Use compressOnly to process images from forks.'
      )
      return
    }
  }

  await run()
}

main().catch(error => {
  core.setFailed(error instanceof Error ? error.message : String(error))
})
