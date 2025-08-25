#!/usr/bin/env node --experimental-strip-types

import * as core from '@actions/core'
import { context } from '@actions/github'
import {
  GITHUB_EVENT_NAME,
  COMPRESS_ONLY
} from './src/constants.ts'

import run from './src/index.ts'

const main = async () => {
  if (!COMPRESS_ONLY) {
    // Bail out if the event that executed the action wasn’t a pull_request
    if (GITHUB_EVENT_NAME !== 'pull_request') {
      core.error('This action only runs for pushes to PRs')
      process.exit(78)
    }

    // Bail out if the pull_request event wasn't synchronize or opened
    if (context.payload.action !== 'synchronize' && context.payload.action !== 'opened') {
      core.error(
        `Check run has action ${context.payload.action}. Wants: synchronize or opened`
      )
      process.exit(0)
    }
  }

  await run()
}

main()
