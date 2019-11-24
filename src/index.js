const generateMarkdownReport = require("./github-markdown");
const processImages = require("./image-processing");
const createComment = require("./github-pr-comment");
const createCommit = require("./github-commit");

const { GITHUB_EVENT_NAME } = require("./constants");

const run = async () => {
  console.log("->> Locating images…");

  const results = await processImages();

  const optimisedImages = results.images.filter(
    img => img.compressionWasSignificant
  );

  // If nothing was optimised, bail out.
  if (!optimisedImages.length) {
    console.log("::warning::Nothing left to optimise. Stopping…");
    return;
  }

  if (GITHUB_EVENT_NAME == "pull_request" ) {
    console.log("->> Generating markdown…");
    const markdown = await generateMarkdownReport(results);

    console.log("->> Committing files…");
    await createCommit(optimisedImages);

    console.log("->> Leaving comment on PR…");
    await createComment(markdown);
  }

  return results;
};

module.exports = run;
