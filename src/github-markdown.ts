import { filesize } from 'humanize'
import crypto from 'crypto'
import { GITHUB_REPOSITORY } from './constants'
import githubEvent from './github-event'
import template from './template'
import getConfig from './config'

const generateImageView = (
  images: ProcessedImage[],
  prNumber?: number,
  commitSha?: string
): ProcessedImageView[] => {
  const imageViews = images.map(image => {
    return {
      ...image,
      formattedBeforeStats: filesize(image.beforeStats),
      formattedAfterStats: filesize(image.afterStats),
      formattedPercentChange: `${image.percentChange.toFixed(1)}%`,
      diffUrl:
        commitSha && prNumber
          ? generateDiffUrl(image, prNumber, commitSha)
          : null
    }
  })

  return imageViews
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
  const { number } = await githubEvent()
  const { compressOnly } = await getConfig()
  const { optimisedImages, unoptimisedImages, metrics } = processingResults

  const templateName: string =
    commitSha && !compressOnly
      ? 'inline-pr-comment-with-diff.md'
      : 'pr-comment.md'

  const markdown = await template(templateName, {
    overallPercentageSaved: -metrics.percentChange.toFixed(1),
    overallBytesSaved: filesize(metrics.bytesSaved),
    optimisedImages: generateImageView(optimisedImages, number, commitSha),
    unoptimisedImages: generateImageView(unoptimisedImages, number)
  })

  // Log markdown, so that it can be used for Action output
  // https://github.community/t/set-output-truncates-multiline-strings/16852
  const escapedMarkdown = markdown
    .replace(/\%/g, '%25')
    .replace(/\n/g, '%0A')
    .replace(/\r/g, '%0D')
  console.log('markdown=' + escapedMarkdown + ' >> $GITHUB_OUTPUT')

  return markdown
}

export default generateMarkdownReport
