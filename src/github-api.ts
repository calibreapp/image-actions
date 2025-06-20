import { Octokit } from '@octokit/rest'

import { GITHUB_TOKEN, GITHUB_API_URL } from './constants'

const octokit = new Octokit({
  auth: `token ${GITHUB_TOKEN}`,
  baseUrl: `${GITHUB_API_URL}`
})

export default octokit
