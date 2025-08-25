import { Octokit } from '@octokit/action'
import { context } from '@actions/github'

const api = new Octokit()

const createComment = async (body: string) => {
  const owner = context.repo.owner
  const repo = context.repo.repo
  const issue_number = context.payload.pull_request?.number

  if (!issue_number) {
    throw new Error('Pull request number not found in context')
  }

  return api.issues.createComment({ owner, repo, issue_number, body })
}

export default createComment
