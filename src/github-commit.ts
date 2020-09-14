import Octokit from '@octokit/rest'
import { promises as fsPromises } from 'fs'
const { readFile } = fsPromises

import api from './github-api'
import githubEvent from './github-event'

interface ImageBlobsParams {
  owner: string
  repo: string
  images: ProcessedImage[]
}

interface ImageBlobResponse
  extends Omit<Octokit.GitCreateBlobResponse, 'url'> {}

// GitCreateBlobResponse
const convertToTreeBlobs = async ({
  owner,
  repo,
  images,
}: ImageBlobsParams): Promise<ImageBlobResponse[]> => {
  console.log('\t * ', 'Converting images to blobs…')
  const imageBlobs = []

  for await (const image of images) {
    const encodedImage = await readFile(image.path, { encoding: 'base64' })

    const blob = await api.git.createBlob({
      owner,
      repo,
      content: encodedImage,
      encoding: 'base64',
    })

    // We use image.name rather than image.path because it is the path inside the repo
    // rather than the path on disk (which is static/images/image.jpg rather than /github/workpace/static/images/image.jpg)
    imageBlobs.push({
      path: image.name,
      type: 'blob',
      mode: '100644',
      sha: blob.data.sha,
    })
  }

  return imageBlobs
}

const commitOptimisedImages = async (optimisedImages: ProcessedImage[]) => {
  const event = await githubEvent()
  const owner = event.repository.owner.login
  const repo = event.repository.name
  const mostRecentCommitSHA = event.pull_request.head.sha

  console.log('\t * ', 'Head SHA:', mostRecentCommitSHA)

  // Get the latest commit so we can then get the tree SHA
  const latestCommit = await api.git.getCommit({
    owner,
    repo,
    commit_sha: mostRecentCommitSHA,
  })

  const baseTree = latestCommit.data.tree.sha

  console.log('\t * ', 'Tree', baseTree)

  // Convert image paths to blob ready objects
  const treeBlobs = await convertToTreeBlobs({
    owner,
    repo,
    images: optimisedImages,
  })

  console.log('\t * ', 'Creating tree…', owner, repo, baseTree)

  // Create tree
  const newTree = await api.git.createTree({
    owner,
    repo,
    base_tree: baseTree,
    tree: treeBlobs,
  })

  console.log('\t * ', 'New tree:', newTree.data.sha)

  const commit = await api.git.createCommit({
    owner,
    repo,
    message: 'Optimised images with calibre/image-actions',
    tree: newTree.data.sha,
    parents: [mostRecentCommitSHA],
  })

  console.log(
    'Committed',
    commit.data.sha,
    'updating ref',
    event.pull_request.head.ref,
    '…'
  )

  // Update the pull request branch to point at the new commit
  await api.git.updateRef({
    owner,
    repo,
    ref: `heads/${event.pull_request.head.ref}`,
    sha: commit.data.sha,
  })
}

export default commitOptimisedImages
