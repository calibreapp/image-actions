import { readFile } from 'fs/promises'
import { Octokit } from '@octokit/action'
import { context } from '@actions/github'
import pThrottle from 'p-throttle'

import type { ProcessedImage } from './types/ProcessedImage.d.ts'

const api = new Octokit()

// Limit to 10 requests/10 seconds
// See https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28#about-secondary-rate-limits
const throttle = pThrottle({
  limit: 10,
  interval: 10000
})

interface ImageBlobsParams {
  owner: string
  repo: string
  images: ProcessedImage[]
}

interface ImageBlobResponse {
  path: string
  type: 'blob'
  mode: '100644'
  sha: string
}

const createBlobThrottled = throttle(
  async (owner: string, repo: string, content: string) => {
    return api.git.createBlob({
      owner,
      repo,
      content,
      encoding: 'base64'
    })
  }
)

// GitCreateBlobResponse
const convertToTreeBlobs = async ({
  owner,
  repo,
  images
}: ImageBlobsParams): Promise<ImageBlobResponse[]> => {
  api.log.info('Converting images to blobs…')
  const imageBlobs = []

  for await (const [index, image] of images.entries()) {
    const encodedImage = await readFile(image.path, { encoding: 'base64' })

    const blob = await createBlobThrottled(owner, repo, encodedImage)

    // We use image.name rather than image.path because it is the path inside the repo
    // rather than the path on disk (which is static/images/image.jpg rather than /github/workpace/static/images/image.jpg)
    imageBlobs.push({
      path: image.name,
      type: 'blob' as const,
      mode: '100644' as const,
      sha: blob.data.sha
    })

    api.log.info(
      `Created blob for ${image.name} (${index + 1}/${images.length})`
    )
  }

  return imageBlobs
}

const commitOptimisedImages = async (optimisedImages: ProcessedImage[]) => {
  const owner = context.repo.owner
  const repo = context.repo.repo

  // For pull requests, use the PR head SHA and ref
  // For workflow_dispatch and other events, use the current context
  const mostRecentCommitSHA = context.payload.pull_request?.head?.sha || context.sha

  if (!mostRecentCommitSHA) {
    throw new Error('Commit SHA not found in context')
  }

  api.log.info(`Head SHA: ${mostRecentCommitSHA}`)

  // Get the latest commit so we can then get the tree SHA
  const latestCommit = await api.git.getCommit({
    owner,
    repo,
    commit_sha: mostRecentCommitSHA
  })

  const baseTree = latestCommit.data.tree.sha

  api.log.info(`Tree: ${baseTree}`)

  // Convert image paths to blob ready objects
  const treeBlobs = await convertToTreeBlobs({
    owner,
    repo,
    images: optimisedImages
  })

  api.log.info(`Creating tree for ${owner}/${repo} with base ${baseTree}`)

  // Create tree
  const newTree = await api.git.createTree({
    owner,
    repo,
    base_tree: baseTree,
    tree: treeBlobs
  })

  api.log.info(`New tree: ${newTree.data.sha}`)

  const commit = await api.git.createCommit({
    owner,
    repo,
    message: 'Optimised images with calibre/image-actions',
    tree: newTree.data.sha,
    parents: [mostRecentCommitSHA]
  })

  // For pull requests, use the PR head ref
  // For workflow_dispatch and other events, extract the branch name from context.ref
  let headRef = context.payload.pull_request?.head?.ref
  if (!headRef) {
    // context.ref is in format "refs/heads/branch-name", extract just "branch-name"
    headRef = context.ref?.replace('refs/heads/', '')
    if (!headRef) {
      throw new Error('Branch ref not found in context')
    }
  }

  api.log.info(`Committed ${commit.data.sha}, updating ref ${headRef}…`)

  // Update the branch to point at the new commit
  await api.git.updateRef({
    owner,
    repo,
    ref: `heads/${headRef}`,
    sha: commit.data.sha
  })

  return commit.data
}

export default commitOptimisedImages
