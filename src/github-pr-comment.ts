import Octokit from '@octokit/rest'
import api from './github-api'
import githubEvent from './github-event'

const createComment = async (
  body: string
): Promise<Octokit.Response<Octokit.IssuesCreateCommentResponse>> => {
  const event = await githubEvent()
  const owner = event.repository.owner.login
  const repo = event.repository.name
  const number = event.number

  return api.issues.createComment({ owner, repo, number, body })
}

export default createComment
