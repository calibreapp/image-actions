interface RepositoryReference {
  full_name?: string
}

interface PullRequestEventPayload {
  repository?: RepositoryReference
  pull_request?: {
    head?: { repo?: RepositoryReference | null }
    base?: { repo?: RepositoryReference | null }
    [key: string]: unknown
  }
}

const isForkPullRequest = (payload: PullRequestEventPayload): boolean => {
  const pullRequest = payload.pull_request

  if (!pullRequest) {
    return false
  }

  const headRepository = pullRequest.head?.repo?.full_name
  const baseRepository =
    pullRequest.base?.repo?.full_name ?? payload.repository?.full_name

  if (!headRepository || !baseRepository) {
    return true
  }

  return headRepository !== baseRepository
}

export default isForkPullRequest
