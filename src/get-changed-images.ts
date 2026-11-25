import path from 'path'
import { Octokit } from '@octokit/action'
import { context } from '@actions/github'
import * as core from '@actions/core'

import { FILE_EXTENSIONS_TO_PROCESS } from './constants.ts'
import getConfig from './config.ts'
import isIgnored from './ignore.ts'
import { hasControlCharacters, sanitiseForLog } from './sanitise.ts'

const getChangedImages = async (): Promise<string[] | null> => {
  const pullNumber = context.payload.pull_request?.number

  if (pullNumber === undefined) {
    core.info('No pull request context found.')
    return null
  }

  const config = await getConfig()
  const api = new Octokit()
  const owner = context.repo.owner
  const repo = context.repo.repo

  core.info(`Fetching changed files for PR #${pullNumber}…`)

  const files = await api
    .paginate(api.rest.pulls.listFiles, {
      owner,
      repo,
      pull_number: pullNumber
    })
    .catch(error => {
      throw new Error(
        `Could not list changed files for PR #${pullNumber}: ${error instanceof Error ? error.message : String(error)}`
      )
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
      if (hasControlCharacters(filename)) {
        core.warning(
          `Skipping ${sanitiseForLog(filename)}: the filename contains control characters.`
        )
        return false
      }

      return !isIgnored(filename, config.ignorePaths)
    })

  core.info(
    `Found ${changedImages.length} images to process: ${changedImages.join(', ')}.`
  )

  return changedImages
}

export default getChangedImages
