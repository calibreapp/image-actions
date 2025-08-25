import { readFile } from 'fs/promises'
import { Octokit } from '@octokit/action'
import { context } from '@actions/github'

import type { ProcessedImage } from './types/ProcessedImage.d.ts'

const api = new Octokit()

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

// GitCreateBlobResponse
const convertToTreeBlobs = async ({
  owner,
  repo,
  images
}: ImageBlobsParams): Promise<ImageBlobResponse[]> => {
  api.log.info('Converting images to blobs…')
  const imageBlobs = []

  for await (const image of images) {
    const encodedImage = await readFile(image.path, { encoding: 'base64' })

    const blob = await api.git.createBlob({
      owner,
      repo,
      content: encodedImage,
      encoding: 'base64'
    })

    // We use image.name rather than image.path because it is the path inside the repo
    // rather than the path on disk (which is static/images/image.jpg rather than /github/workpace/static/images/image.jpg)
    imageBlobs.push({
      path: image.name,
      type: 'blob' as const,
      mode: '100644' as const,
      sha: blob.data.sha
    })
  }

  return imageBlobs
}

const commitOptimisedImages = async (optimisedImages: ProcessedImage[]) => {
  const owner = context.repo.owner
  const repo = context.repo.repo
  const mostRecentCommitSHA = context.payload.pull_request?.head?.sha

  if (!mostRecentCommitSHA) {
    throw new Error('Pull request head SHA not found in context')
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

  const headRef = context.payload.pull_request?.head?.ref
  if (!headRef) {
    throw new Error('Pull request head ref not found in context')
  }

  api.log.info(`Committed ${commit.data.sha}, updating ref ${headRef}…`)

  // Update the pull request branch to point at the new commit
  await api.git.updateRef({
    owner,
    repo,
    ref: `heads/${headRef}`,
    sha: commit.data.sha
  })

  return commit.data
}

export default commitOptimisedImages
