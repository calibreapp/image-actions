import path from 'path'
import { minimatch } from 'minimatch'
import { Octokit } from '@octokit/action'
import { context } from '@actions/github'
import * as core from '@actions/core'

import { FILE_EXTENSIONS_TO_PROCESS, REPO_DIRECTORY } from './constants.ts'
import getConfig from './config.ts'

const getChangedImages = async (): Promise<string[] | null> => {
  try {
    if (!context.payload.pull_request) {
      core.info('No pull request context found.')
      return null
    }

    const config = await getConfig()
    const api = new Octokit()
    const owner = context.repo.owner
    const repo = context.repo.repo
    const pullNumber = context.payload.pull_request.number

    core.info(`Fetching changed files for PR #${pullNumber}…`)

    const { data: files } = await api.rest.pulls.listFiles({
      owner,
      repo,
      pull_number: pullNumber
    })

    const changedImages = files
      .filter(file => {
        const ext = path.extname(file.filename).toLowerCase().slice(1)
        return (
          FILE_EXTENSIONS_TO_PROCESS.includes(ext) && file.status !== 'removed'
        )
      })
      .map(file => file.filename)
      .filter(filename => {
        const shouldIgnore = config.ignorePaths.some(ignorePath => {
          return minimatch(filename, ignorePath)
        })

        return !shouldIgnore
      })

    core.info(
      `Found ${changedImages.length} images to process: ${changedImages.join(', ')}.`
    )

    return changedImages
  } catch (error) {
    core.warning(
      `GitHub API Error: ${error instanceof Error ? error.message : String(error)}`
    )
    return null
  }
}

export default getChangedImages
