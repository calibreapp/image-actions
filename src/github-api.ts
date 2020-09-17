import Octokit from '@octokit/rest'

import { GITHUB_TOKEN } from './constants'

const octokit = new Octokit({ auth: `token ${GITHUB_TOKEN}` })

export default octokit
