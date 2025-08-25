import crypto from 'crypto'
import * as core from '@actions/core'
import { context } from '@actions/github'
import { GITHUB_REPOSITORY } from './constants.ts'
import template from './template.ts'
import getConfig from './config.ts'
import type {
  ProcessedImage,
  ProcessedImageView
} from './types/ProcessedImage.d.ts'
import type { ActionSummaryReport } from './types/ActionReport.d.ts'

const MAX_IMAGES_DISPLAYED = 25

// Format file size using native Intl API
const formatFileSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']

  if (bytes === 0) return '0 B'

  const unitIndex = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = bytes / Math.pow(1024, unitIndex)

  // Use Intl.NumberFormat for proper number formatting with locale support
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: unitIndex === 0 ? 0 : 1,
    maximumFractionDigits: unitIndex === 0 ? 0 : 1
  })

  return `${formatter.format(size)} ${units[unitIndex]}`
}

const generateImageView = ({
  images,
  prNumber,
  commitSha,
  limitImages = false
}: {
  images: ProcessedImage[]
  prNumber?: number
  commitSha?: string
  limitImages?: boolean
}): ProcessedImageView[] => {
  const imageViews = images.map(image => {
    return {
      ...image,
      formattedBeforeStats: formatFileSize(image.beforeStats),
      formattedAfterStats: formatFileSize(image.afterStats),
      formattedPercentChange: `${image.percentChange.toFixed(1)}%`,
      diffUrl:
        commitSha && prNumber
          ? generateDiffUrl(image, prNumber, commitSha)
          : undefined
    }
  })

  return limitImages ? imageViews.slice(0, MAX_IMAGES_DISPLAYED) : imageViews
}

/*
  Return a URL that'll link to an image diff view
  /<org>/<repo>/pull/<pr id>/commits/<sha>?short_path=<first 7 of md5>#diff-<md5 of filepath>
*/
const generateDiffUrl = (
  image: ProcessedImage,
  prNumber: number,
  commitSha: string
): string => {
  const fileId = crypto.createHash('md5').update(image.name).digest('hex')
  const shortFileId = fileId.slice(0, 7)

  const url = `/${GITHUB_REPOSITORY}/pull/${prNumber}/commits/${commitSha}?short_path=${shortFileId}#diff-${fileId}`

  return url
}

const generateMarkdownReport = async ({
  processingResults,
  commitSha
}: ActionSummaryReport): Promise<string> => {
  const number = context.payload.pull_request?.number
  const { compressOnly } = await getConfig()
  const { optimisedImages, unoptimisedImages, metrics } = processingResults

  const templateName: string =
    commitSha && !compressOnly
      ? 'inline-pr-comment-with-diff.md'
      : 'pr-comment.md'

  const isPrComment = Boolean(commitSha && !compressOnly)
  const totalOptimisedCount = optimisedImages.length
  const displayedOptimisedImages = generateImageView({
    images: optimisedImages,
    prNumber: number,
    commitSha,
    limitImages: isPrComment
  })
  const showSummary = isPrComment && totalOptimisedCount > MAX_IMAGES_DISPLAYED

  const markdown = await template(templateName, {
    overallPercentageSaved: -metrics.percentChange.toFixed(1),
    overallBytesSaved: formatFileSize(metrics.bytesSaved),
    optimisedImages: displayedOptimisedImages,
    unoptimisedImages: generateImageView({ images: unoptimisedImages, prNumber: number }),
    showSummary,
    totalOptimisedCount
  })

  // Log markdown, so that it can be used for Action output
  core.setOutput('markdown', markdown)

  return markdown
}

export default generateMarkdownReport
