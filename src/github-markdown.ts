import { filesize } from 'humanize'
import crypto from 'crypto'
import { GITHUB_REPOSITORY } from './constants'
import githubEvent from './github-event'
import template from './template'
import getConfig from './config'

const generateImageView = async (
  images: ProcessedImage[],
  commitSha?: string
): Promise<ProcessedImageView[]> => {
  const promises = images.map(async image => {
    return {
      ...image,
      formattedBeforeStats: filesize(image.beforeStats),
      formattedAfterStats: filesize(image.afterStats),
      formattedPercentChange: `${image.percentChange.toFixed(1)}%`,
      diffUrl: commitSha ? await generateDiffUrl(image, commitSha) : null
    }
  })

  return Promise.all(promises)
}

/*
  Return a URL that'll link to an image diff view
  /<org>/<repo>/pull/<pr id>/commits/<sha>?short_path=<first 7 of md5>#diff-<md5 of filepath>
*/
const generateDiffUrl = async (image: ProcessedImage, commitSha: string) => {
  const { number } = await githubEvent()
  const fileId = crypto.createHash('md5').update(image.path).digest('hex')
  const shortFileId = fileId.slice(0, 7)

  const url = `/${GITHUB_REPOSITORY}/pull/${number}/${commitSha}?short_path=${shortFileId}#diff-${fileId}`

  return url
}

const generateMarkdownReport = async ({
  processingResults,
  commitSha
}: ActionSummaryReport): Promise<string> => {
  const { compressOnly } = await getConfig()
  const { optimisedImages, unoptimisedImages, metrics } = processingResults

  const templateName: string =
    commitSha && !compressOnly
      ? 'inline-pr-comment-with-diff.md'
      : 'pr-comment.md'

  const markdown = await template(templateName, {
    overallPercentageSaved: -metrics.percentChange.toFixed(1),
    overallBytesSaved: filesize(metrics.bytesSaved),
    optimisedImages: await generateImageView(optimisedImages, commitSha),
    unoptimisedImages: await generateImageView(unoptimisedImages)
  })

  // Log markdown, so that it can be used for Action output
  // https://github.community/t/set-output-truncates-multiline-strings/16852
  const escapedMarkdown = markdown
    .replace(/\%/g, '%25')
    .replace(/\n/g, '%0A')
    .replace(/\r/g, '%0D')
  console.log('::set-output name=markdown::' + escapedMarkdown)

  return markdown
}

export default generateMarkdownReport
