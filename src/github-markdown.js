const crypto = require("crypto");

const { filesize } = require("humanize");

const { GITHUB_REPOSITORY } = require("./constants");
const githubEvent = require("./github-event");

const optimisedImageLine = async ({ image, commitSha }) => {
  const beforeSize = filesize(image.beforeStats);
  const afterSize = filesize(image.afterStats);
  const formattedPercentage = `${image.percentChange.toFixed(1)}%`;
  const diffUrl = await generateDiffUrl({
    filePath: image.path,
    commitSha,
  });

  return `| \`${image.name}\` | ${beforeSize} | ${afterSize} | ${formattedPercentage} | [View diff](${diffUrl}) |`;
};

const optimisedImages = async ({ images, commitSha }) => {
  const promises = images
    .filter((image) => image.compressionWasSignificant)
    .map(async (image) => {
      const line = await optimisedImageLine({
        image,
        commitSha,
      });

      return line;
    });
  
  const lines = await Promise.all(promises)
  return lines.join("\n");
};

const unoptimisedImages = (processedImages) => {
  const nonOptimisable = processedImages.filter(
    (image) => !image.compressionWasSignificant
  );

  if (nonOptimisable.length > 0) {
    const items = nonOptimisable
      .map((image) => {
        return `* \`${image.name}\``;
      })
      .join("\n");

    return `

<details>
<summary>Some images were already optimised</summary>

${items}
</details>`;
  } else {
    return "";
  }
};

/*
  Return a URL that'll link to an image diff view
  /<org>/<repo>/pull/<pr id>/commits/<sha>?short_path=<first 7 of md5>#diff_<md5 of filepath>
*/
const generateDiffUrl = async ({ filePath, commitSha }) => {
  const { number } = await githubEvent();
  const fileId = crypto.createHash("md5").update(filePath).digest("hex");
  const shortFileId = fileId.slice(0, 7);

  const url = `/${GITHUB_REPOSITORY}/pull/${number}/${commitSha}?short_path=${shortFileId}#diff_${fileId}`;

  return url;
};

const generateMarkdownReport = async ({ images, metrics, commitSha }) => {
  return `
Images automagically compressed by [Calibre](https://calibreapp.com)'s [image-actions](https://github.com/marketplace/actions/image-actions) ✨

Compression reduced images by ${-metrics.percentChange.toFixed(
    1
  )}%, saving ${filesize(metrics.bytesSaved)}

| Filename | Before | After | Improvement | Visual comparison |
| --- | --- | --- | --- | --- |
${await optimisedImages({ images, commitSha })}
${unoptimisedImages(images)}`;
};

module.exports = generateMarkdownReport;
